import React, { useState, useEffect } from 'react';
import { ActiveView, Product, CartItem, PurityType, UserProfile } from './types';
import { PRODUCTS, CURRENT_GOLD_RATE_22K, calculatePriceBreakdown } from './data/products';
import { HeaderNav } from './components/HeaderNav';
import { Footer } from './components/Footer';
import { GoldRateCalculatorModal } from './components/GoldRateCalculatorModal';
import { SearchModal } from './components/SearchModal';
import { AppointmentModal } from './components/AppointmentModal';
import { UserLoginModal } from './components/UserLoginModal';
import { ToastContainer } from './components/ToastContainer';
import { ToastProvider, useToast } from './context/ToastContext';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { PdpView } from './views/PdpView';
import { CartView } from './views/CartView';
import { WishlistView } from './views/WishlistView';
import { LocationsView } from './views/LocationsView';
import { OnamCampaignView } from './views/OnamCampaignView';
import { StaffRedemptionView } from './views/StaffRedemptionView';
import { AdminCampaignView } from './views/AdminCampaignView';
import { 
  initAuthListener, 
  syncWishlistToFirestore, 
  fetchWishlistFromFirestore 
} from './data/firebaseAuthService';
import { getStoredUserProfile } from './data/userSession';
import { 
  subscribeToGoldRates, 
  getLocalCachedGoldRate, 
  updateLiveBullionRatesInFirestore 
} from './data/storeConfigService';

function AppContent() {
  const { notifyAddToCart, notifyWishlistToggle, notifyGoldRateUpdate, notifyInfo } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUserProfile());
  const getInitialView = (): ActiveView => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      const params = new URLSearchParams(window.location.search);

      // Check /admin or #admin or ?view=admin or ?admin
      if (path === '/admin' || hash === 'admin' || params.get('view') === 'admin' || params.has('admin')) {
        return 'campaign-admin';
      }
      // Check /staff or #staff or ?view=staff
      if (path === '/staff' || hash === 'staff' || params.get('view') === 'staff' || params.has('staff')) {
        return 'staff-redemption';
      }
      // Check /onam or #onam or ?campaign or ?source
      if (path === '/onam' || hash === 'onam' || params.get('source') || params.get('campaign') || params.get('view') === 'onam') {
        return 'onam-campaign';
      }
      // Check /earrings or /earring or #earrings or #earring
      if (path === '/earrings' || path === '/earring' || hash === 'earrings' || hash === 'earring' || params.get('view') === 'earrings' || params.has('earrings') || params.has('earring')) {
        return 'earrings';
      }
      // Check /necklaces or /necklace or #necklaces or #necklace
      if (path === '/necklaces' || path === '/necklace' || hash === 'necklaces' || hash === 'necklace' || params.get('view') === 'necklaces' || params.has('necklaces') || params.has('necklace')) {
        return 'necklaces';
      }
      // Check /bangles or /bangle or #bangles or #bangle
      if (path === '/bangles' || path === '/bangle' || hash === 'bangles' || hash === 'bangle' || params.get('view') === 'bangles' || params.has('bangles') || params.has('bangle')) {
        return 'bangles';
      }
      // Check /bridal or #bridal or #trousseau
      if (path === '/bridal' || hash === 'bridal' || hash === 'trousseau' || params.get('view') === 'bridal' || params.has('bridal')) {
        return 'bridal';
      }
      // Check /catalog or #catalog
      if (path === '/catalog' || hash === 'catalog' || params.get('view') === 'catalog' || params.has('catalog')) {
        return 'catalog';
      }
      // Check /locations or #locations
      if (path === '/locations' || hash === 'locations' || params.get('view') === 'locations') {
        return 'locations';
      }
      // Check /wishlist or #wishlist
      if (path === '/wishlist' || hash === 'wishlist' || params.get('view') === 'wishlist') {
        return 'wishlist';
      }
      // Check /cart or #cart
      if (path === '/cart' || hash === 'cart' || params.get('view') === 'cart') {
        return 'cart';
      }
    }
    return 'home';
  };

  const [activeView, setActiveView] = useState<ActiveView>(getInitialView);

  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  
  // Session persistence for cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('kavitha_shopping_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error loading cart from sessionStorage:', e);
      }
    }
    return [
      {
        product: PRODUCTS[0],
        quantity: 1,
        selectedPurity: '22K',
      },
    ];
  });

  // Wishlist state with local & cloud sync
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kavitha_local_wishlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch (e) {
        console.error('Error loading wishlist from localStorage:', e);
      }
    }
    return [PRODUCTS[1].id, PRODUCTS[2].id];
  });

  const [goldRate, setGoldRateState] = useState<number>(() => getLocalCachedGoldRate());

  // Real-time synchronization of bullion gold rates from Firestore
  useEffect(() => {
    const unsubscribe = subscribeToGoldRates((rates) => {
      if (rates.rate22k && rates.rate22k >= 5000) {
        setGoldRateState(rates.rate22k);
      }
    });
    return () => unsubscribe();
  }, []);

  // Modals
  const [isGoldCalcOpen, setIsGoldCalcOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);
  const [userAuthInitialTab, setUserAuthInitialTab] = useState<'profile' | 'orders' | 'vouchers'>('profile');
  const [appointmentProduct, setAppointmentProduct] = useState<Product | null>(null);

  // Sync cart changes to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('kavitha_shopping_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to sessionStorage:', e);
    }
  }, [cart]);

  // Sync wishlist to localStorage & Firestore
  useEffect(() => {
    try {
      localStorage.setItem('kavitha_local_wishlist', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }

    if (currentUser?.uid) {
      syncWishlistToFirestore(currentUser.uid, wishlistIds);
    }
  }, [wishlistIds, currentUser?.uid]);

  // Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = initAuthListener(async (user) => {
      setCurrentUser(user);
      if (user?.uid) {
        // Fetch cloud wishlist and merge
        try {
          const cloudWishlist = await fetchWishlistFromFirestore(user.uid);
          if (cloudWishlist && cloudWishlist.length > 0) {
            setWishlistIds((prev) => Array.from(new Set([...prev, ...cloudWishlist])));
          }
        } catch (e) {
          console.error('Error merging cloud wishlist:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to browser navigation (back/forward or hash change)
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveView(getInitialView());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const setGoldRate = (rate: number) => {
    const oldRate = goldRate;
    setGoldRateState(rate);
    updateLiveBullionRatesInFirestore(rate).catch((e) => {
      console.error('Firestore rate update error:', e);
    });
    if (oldRate !== rate) {
      notifyGoldRateUpdate(rate, oldRate);
    }
  };

  // Navigation handler
  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      if (view === 'campaign-admin') {
        window.history.pushState(null, '', '#admin');
      } else if (view === 'staff-redemption') {
        window.history.pushState(null, '', '#staff');
      } else if (view === 'onam-campaign') {
        window.history.pushState(null, '', '#onam');
      } else if (view === 'earrings') {
        window.history.pushState(null, '', '#earrings');
      } else if (view === 'necklaces') {
        window.history.pushState(null, '', '#necklaces');
      } else if (view === 'bangles') {
        window.history.pushState(null, '', '#bangles');
      } else if (view === 'bridal') {
        window.history.pushState(null, '', '#bridal');
      } else if (view === 'catalog') {
        window.history.pushState(null, '', '#catalog');
      } else if (view === 'locations') {
        window.history.pushState(null, '', '#locations');
      } else if (view === 'wishlist') {
        window.history.pushState(null, '', '#wishlist');
      } else if (view === 'cart') {
        window.history.pushState(null, '', '#cart');
      } else if (view === 'home') {
        window.history.pushState(null, '', window.location.pathname.split('#')[0]);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Product for PDP View
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveView('pdp');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add to Cart
  const handleAddToCart = (product: Product, purity: PurityType = '22K', quantity: number = 1, shouldNavigate: boolean = false) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedPurity === purity
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, selectedPurity: purity, quantity }];
      }
    });

    // Fire global rich toast
    notifyAddToCart(product, purity, quantity, goldRate);

    if (shouldNavigate) {
      setActiveView('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Remove Cart Item
  const handleRemoveItem = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    if (item) {
      notifyInfo('Item Removed', `${item.product.name} was removed from your bag.`);
    }
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    try {
      sessionStorage.removeItem('kavitha_shopping_cart');
    } catch (e) {
      console.error(e);
    }
    notifyInfo('Bag Cleared', 'All items have been removed from your shopping bag.');
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      const updated = exists
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id];
      notifyWishlistToggle(product, !exists);
      return updated;
    });
  };

  // Open Appointment modal
  const handleOpenAppointmentModal = (product?: Product) => {
    setAppointmentProduct(product || null);
    setIsAppointmentOpen(true);
  };

  // Open User Auth Modal
  const handleOpenAuthModal = (tab: 'profile' | 'orders' | 'vouchers' = 'profile') => {
    setUserAuthInitialTab(tab);
    setIsUserAuthOpen(true);
  };

  // Calculate cart subtotal for loyalty points tracking
  const cartTotal = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.total * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f7] text-[#201a1b] selection:bg-[#370617] selection:text-[#FAF6F0]">
      {/* Top Header & Sticky Navigation (Hidden on standalone admin portal) */}
      {activeView !== 'campaign-admin' && (
        <HeaderNav
          activeView={activeView}
          setActiveView={handleNavigate}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
          cartTotal={cartTotal}
          wishlistCount={wishlistIds.length}
          goldRate={goldRate}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenGoldCalc={() => setIsGoldCalcOpen(true)}
        />
      )}

      {/* Main View Container */}
      <main className={`flex-grow w-full ${
        activeView === 'onam-campaign' || activeView === 'staff-redemption' || activeView === 'campaign-admin'
          ? ''
          : 'max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-6'
      }`}>
        {activeView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectProduct={handleSelectProduct}
            onOpenAppointmentModal={handleOpenAppointmentModal}
            goldRate={goldRate}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'catalog' && (
          <CatalogView
            categorySlug="catalog"
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'earrings' && (
          <CatalogView
            categorySlug="earrings"
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'necklaces' && (
          <CatalogView
            categorySlug="necklaces"
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'bangles' && (
          <CatalogView
            categorySlug="bangles"
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'bridal' && (
          <CatalogView
            categorySlug="bridal"
            onSelectProduct={handleSelectProduct}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'pdp' && (
          <PdpView
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onOpenAppointmentModal={handleOpenAppointmentModal}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlistIds.includes(selectedProduct.id)}
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {activeView === 'cart' && (
          <CartView
            cart={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onOpenAuthModal={() => handleOpenAuthModal('orders')}
          />
        )}

        {activeView === 'wishlist' && (
          <WishlistView
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, p.purity, 1)}
            onNavigate={handleNavigate}
            goldRate={goldRate}
            onOpenAuthModal={() => handleOpenAuthModal('profile')}
          />
        )}

        {activeView === 'locations' && (
          <LocationsView
            onNavigate={handleNavigate}
            onOpenAppointmentModal={() => handleOpenAppointmentModal()}
          />
        )}

        {activeView === 'onam-campaign' && (
          <OnamCampaignView onNavigate={handleNavigate} />
        )}

        {activeView === 'staff-redemption' && (
          <StaffRedemptionView onNavigate={handleNavigate} />
        )}

        {activeView === 'campaign-admin' && (
          <AdminCampaignView onNavigate={handleNavigate} goldRate={goldRate} setGoldRate={setGoldRate} />
        )}
      </main>

      {/* Footer (Hidden on standalone admin portal) */}
      {activeView !== 'campaign-admin' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Global Modals */}
      <GoldRateCalculatorModal
        isOpen={isGoldCalcOpen}
        onClose={() => setIsGoldCalcOpen(false)}
        goldRate={goldRate}
        setGoldRate={setGoldRate}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={handleSelectProduct}
        goldRate={goldRate}
      />

      <AppointmentModal
        isOpen={isAppointmentOpen}
        onClose={() => setIsAppointmentOpen(false)}
        selectedProduct={appointmentProduct}
      />

      <UserLoginModal
        isOpen={isUserAuthOpen}
        onClose={() => setIsUserAuthOpen(false)}
        onNavigate={handleNavigate}
        onUserChange={(u) => setCurrentUser(u)}
        wishlistCount={wishlistIds.length}
        initialTab={userAuthInitialTab}
      />

      {/* Global Toast Notification Overlay */}
      <ToastContainer onNavigate={handleNavigate} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
