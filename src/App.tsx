import React, { useState, useEffect } from 'react';
import { ActiveView, Product, CartItem, PurityType, UserProfile } from './types';
import { PRODUCTS, CURRENT_GOLD_RATE_22K, calculatePriceBreakdown } from './data/products';
import { HeaderNav } from './components/HeaderNav';
import { Footer } from './components/Footer';
import { GoldRateCalculatorModal } from './components/GoldRateCalculatorModal';
import { SearchModal } from './components/SearchModal';
import { AppointmentModal } from './components/AppointmentModal';
import { UserLoginModal } from './components/UserLoginModal';
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

export function App() {
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

  const [goldRate, setGoldRateState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kavitha_live_gold_rate');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return CURRENT_GOLD_RATE_22K;
  });

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
          console.warn('Error fetching cloud wishlist:', e);
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
    setGoldRateState(rate);
    try {
      localStorage.setItem('kavitha_live_gold_rate', String(rate));
    } catch (e) {
      console.error(e);
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
      } else if (view === 'home') {
        window.history.pushState(null, '', window.location.pathname);
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
  const handleAddToCart = (product: Product, purity: PurityType = '22K', quantity: number = 1) => {
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
    setActiveView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    try {
      sessionStorage.removeItem('kavitha_shopping_cart');
    } catch (e) {
      console.error(e);
    }
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) =>
      prev.includes(product.id)
        ? prev.filter((id) => id !== product.id)
        : [...prev, product.id]
    );
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
          />
        )}

        {activeView === 'catalog' && (
          <CatalogView
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
    </div>
  );
}

export default App;
