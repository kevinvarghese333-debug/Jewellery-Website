import React, { useState } from 'react';
import { ActiveView, Product, CartItem, PurityType } from './types';
import { PRODUCTS, CURRENT_GOLD_RATE_22K, calculatePriceBreakdown } from './data/products';
import { HeaderNav } from './components/HeaderNav';
import { Footer } from './components/Footer';
import { GoldRateCalculatorModal } from './components/GoldRateCalculatorModal';
import { SearchModal } from './components/SearchModal';
import { AppointmentModal } from './components/AppointmentModal';
import { HomeView } from './views/HomeView';
import { CatalogView } from './views/CatalogView';
import { PdpView } from './views/PdpView';
import { CartView } from './views/CartView';
import { WishlistView } from './views/WishlistView';
import { LocationsView } from './views/LocationsView';
import { OnamCampaignView } from './views/OnamCampaignView';
import { StaffRedemptionView } from './views/StaffRedemptionView';
import { AdminCampaignView } from './views/AdminCampaignView';

export function App() {
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('source') || params.get('campaign')) {
        return 'onam-campaign';
      }
    }
    return 'home';
  });
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

  const [cartToast, setCartToast] = useState<string | null>(null);

  // Sync cart changes to sessionStorage
  React.useEffect(() => {
    try {
      sessionStorage.setItem('kavitha_shopping_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart to sessionStorage:', e);
    }
  }, [cart]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([PRODUCTS[1].id, PRODUCTS[2].id]);
  const [goldRate, setGoldRateState] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kavitha_live_gold_rate');
      if (saved && !isNaN(Number(saved))) return Number(saved);
    }
    return CURRENT_GOLD_RATE_22K;
  });

  const setGoldRate = (rate: number) => {
    setGoldRateState(rate);
    try {
      localStorage.setItem('kavitha_live_gold_rate', String(rate));
    } catch (e) {
      console.error(e);
    }
  };

  // Modals
  const [isGoldCalcOpen, setIsGoldCalcOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [appointmentProduct, setAppointmentProduct] = useState<Product | null>(null);

  // Navigation handler
  const handleNavigate = (view: ActiveView) => {
    setActiveView(view);
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

  // Calculate cart subtotal for loyalty points tracking
  const cartTotal = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.total * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fff8f7] text-[#201a1b] selection:bg-[#370617] selection:text-[#FAF6F0]">
      {/* Top Header & Sticky Navigation */}
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

      {/* Main View Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-12 pt-6">
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
          />
        )}

        {activeView === 'wishlist' && (
          <WishlistView
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={(p) => handleAddToCart(p, p.purity, 1)}
            onNavigate={handleNavigate}
            goldRate={goldRate}
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

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

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
    </div>
  );
}

export default App;
