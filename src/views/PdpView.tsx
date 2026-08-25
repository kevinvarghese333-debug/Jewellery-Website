import React, { useState, useEffect } from 'react';
import { Product, PurityType, ActiveView, UserProfile } from '../types';
import { calculatePriceBreakdown } from '../data/products';
import { getProductReviews } from '../data/reviewsData';
import { ProductReviewsSection } from '../components/ProductReviewsSection';

interface PdpViewProps {
  product: Product;
  onAddToCart: (product: Product, purity: PurityType, quantity: number) => void;
  onOpenAppointmentModal: (product: Product) => void;
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
  currentUser?: UserProfile | null;
  onOpenAuthModal?: (tab?: 'login' | 'register' | 'profile' | 'orders') => void;
}

export const PdpView: React.FC<PdpViewProps> = ({
  product,
  onAddToCart,
  onOpenAppointmentModal,
  onNavigate,
  goldRate,
  onToggleWishlist,
  isWishlisted,
  currentUser,
  onOpenAuthModal,
}) => {
  const [selectedPurity, setSelectedPurity] = useState<PurityType>(product.purity);
  const [activeImageKey, setActiveImageKey] = useState<keyof Product['images']>('main');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'breakdown' | 'shipping'>('breakdown');
  const [priceLockSeconds, setPriceLockSeconds] = useState<number>(900); // 15 mins

  // Interactive Hover-to-Zoom & Inspection Loupe State
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);

  const initialReviews = getProductReviews(product.id);
  const avgRating = initialReviews.length > 0 
    ? (initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length).toFixed(1) 
    : '5.0';
  const totalReviewsCount = initialReviews.length;

  // 15-minute price lock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPriceLockSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut for closing lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    };
    if (isLightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const breakdown = calculatePriceBreakdown(product.weightGrams, selectedPurity, goldRate);

  const imagesList = [
    { key: 'main' as const, label: 'Front View', url: product.images.main },
    ...(product.images.angle ? [{ key: 'angle' as const, label: 'Angle View', url: product.images.angle }] : []),
    ...(product.images.clasp ? [{ key: 'clasp' as const, label: 'Clasp Detail', url: product.images.clasp }] : []),
    ...(product.images.worn ? [{ key: 'worn' as const, label: 'Model Worn', url: product.images.worn }] : []),
  ];

  const currentImageUrl = product.images[activeImageKey] || product.images.main;

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#847375]">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('catalog')} className="hover:text-[#370617] hover:underline">
          {product.category}
        </button>
        <span>/</span>
        <span className="text-[#370617] font-semibold truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Hero Image with Interactive Hover-to-Zoom */}
          <div
            className="relative aspect-square bg-[#ffffff] rounded-2xl border border-[#d7c1c4] overflow-hidden shadow-md cursor-crosshair group select-none"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setIsLightboxOpen(true)}
            title="Click to open Fullscreen Inspection"
          >
            {/* Base and Zoomed Image Container */}
            <div className="w-full h-full overflow-hidden p-6 flex items-center justify-center">
              <img
                src={currentImageUrl}
                alt={product.name}
                className={`w-full h-full object-cover rounded-xl transition-transform ease-out pointer-events-none ${
                  isZooming ? 'scale-[2.4] duration-75' : 'scale-100 duration-300'
                }`}
                style={{
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
              />
            </div>

            {/* Subtle Crosshair Reticle Lens (Visible on Hover) */}
            {isZooming && (
              <div
                className="absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full border-2 border-[#B88A44]/80 shadow-[0_0_20px_rgba(184,138,68,0.4)] backdrop-brightness-110 hidden md:block"
                style={{
                  left: `${zoomPosition.x}%`,
                  top: `${zoomPosition.y}%`,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#B88A44]/80"></div>
                </div>
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
              <span className="bg-[#370617] text-white font-data text-xs px-3 py-1 rounded font-bold shadow-sm">
                {selectedPurity} / 916 Hallmark
              </span>
              {product.isBestseller && (
                <span className="bg-[#B88A44] text-white font-sans text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
                  Bestseller
                </span>
              )}
            </div>

            {/* Top Right: Fullscreen Expansion Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#370617] p-2 rounded-full border border-[#d7c1c4] shadow-sm hover:scale-110 transition-all z-10 flex items-center justify-center"
              aria-label="Expand high-resolution view"
              title="Expand high-resolution view"
            >
              <span className="material-symbols-outlined text-lg text-[#370617]">fullscreen</span>
            </button>

            {/* Bottom Left: Loupe Status Badge */}
            <div className="absolute bottom-4 left-4 bg-[#370617]/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-sans text-[#FAF6F0] flex items-center gap-1.5 shadow-sm pointer-events-none transition-all z-10">
              <span className="material-symbols-outlined text-sm text-[#D4AF6A] animate-pulse">
                {isZooming ? 'search' : 'zoom_in'}
              </span>
              <span className="font-medium text-[11px]">
                {isZooming ? '2.4× Heritage Macro Zoom' : 'Hover to Inspect Craftsmanship'}
              </span>
            </div>

            {/* Bottom Right: Hallmarking Certified Badge */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#d7c1c4] text-xs font-sans text-[#370617] flex items-center gap-1 shadow-sm pointer-events-none z-10">
              <span className="material-symbols-outlined text-sm text-[#B88A44]">verified</span>
              <span>100% Certified Gold</span>
            </div>
          </div>

          {/* Gallery Thumbnails */}
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {imagesList.map((img) => (
              <button
                key={img.key}
                onClick={() => setActiveImageKey(img.key)}
                className={`relative aspect-square rounded-lg border-2 overflow-hidden bg-white p-1 transition-all ${
                  activeImageKey === img.key
                    ? 'border-[#370617] ring-2 ring-[#370617]/20 scale-105'
                    : 'border-[#d7c1c4] hover:border-[#847375]'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover rounded" />
                <span className="block text-[9px] font-sans text-center text-[#524346] truncate mt-0.5">
                  {img.label}
                </span>
              </button>
            ))}

            {/* Video Consultation Box */}
            <button
              onClick={() => onOpenAppointmentModal(product)}
              className="relative aspect-square rounded-lg border border-dashed border-[#B88A44] bg-[#FAF6F0] p-2 flex flex-col items-center justify-center text-center hover:bg-[#f2e5e6] transition-colors"
            >
              <span className="material-symbols-outlined text-xl text-[#B88A44]">videocam</span>
              <span className="text-[10px] font-sans font-bold text-[#370617] mt-1">
                Live Video Call
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Pricing & Breakdown Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#d7c1c4] shadow-md space-y-6 sticky top-24">
            <div>
              <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-semibold font-sans">
                {product.category}
              </span>
              <h1 className="font-serif-display text-2xl md:text-3xl font-bold text-[#370617] mt-1">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-sans text-[#524346]">
                <a
                  href="#pdp-reviews-section"
                  className="flex items-center gap-1 bg-[#FAF6F0] px-2.5 py-1 rounded-md border border-[#b88a44]/30 text-[#B88A44] font-bold hover:underline"
                >
                  <span className="material-symbols-outlined text-sm text-[#B88A44]">star</span>
                  <span>{avgRating} / 5.0</span>
                  <span className="text-[#847375] font-normal text-[11px]">({totalReviewsCount} Verified Reviews)</span>
                </a>
                <span>•</span>
                <span className="font-data bg-[#f2e5e6] px-2 py-0.5 rounded text-[#370617] font-semibold">
                  SKU: KVG-2026-{product.id.slice(0, 6).toUpperCase()}
                </span>
                <span>•</span>
                <span className="text-[#1F7A52] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#1F7A52] inline-block animate-pulse"></span>
                  In Stock
                </span>
              </div>
            </div>

            {/* Price Lock Banner */}
            <div className="bg-[#FAF6F0] p-3 rounded-lg border border-[#b88a44]/30 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#B88A44]">lock_clock</span>
                <span className="font-sans text-[#370617] font-medium">Live Gold Price Lock</span>
              </div>
              <span className="font-data font-bold text-[#370617] bg-white px-2 py-1 rounded border border-[#d7c1c4]">
                ⏱ {formatTime(priceLockSeconds)}
              </span>
            </div>

            {/* Pricing Summary */}
            <div className="border-t border-b border-[#f2e5e6] py-4 space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-sans text-[#847375] uppercase tracking-wider font-semibold">
                  Estimated Price
                </span>
                <span className="font-data text-2xl md:text-3xl font-bold text-[#370617]">
                  ₹{breakdown.total.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] font-sans text-[#847375]">
                Includes 3% GST (₹{breakdown.gst.toLocaleString()}), BIS hallmarking (₹45), & insured courier.
              </p>
            </div>

            {/* Purity & Weight Selectors */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-sans uppercase tracking-wider text-[#370617] font-semibold mb-2">
                  Select Purity Standard
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['22K', '18K'] as PurityType[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPurity(p)}
                      className={`py-2.5 px-3 rounded-lg border text-xs font-sans font-bold flex justify-between items-center transition-all ${
                        selectedPurity === p
                          ? 'bg-[#370617] text-white border-[#370617] shadow-sm'
                          : 'bg-white text-[#524346] border-[#d7c1c4] hover:bg-[#f2e5e6]'
                      }`}
                    >
                      <span>{p} Hallmarked</span>
                      <span className="font-data text-[11px]">
                        {p === '22K' ? '916 Fine' : '750 Fine'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-sans">
                <div className="bg-[#fef0f1] p-3 rounded-lg border border-[#d7c1c4]">
                  <span className="block text-[#847375] uppercase tracking-wider text-[10px]">Gross Weight</span>
                  <span className="font-data text-sm font-bold text-[#370617]">{product.weightGrams} grams</span>
                </div>
                <div className="bg-[#fef0f1] p-3 rounded-lg border border-[#d7c1c4]">
                  <span className="block text-[#847375] uppercase tracking-wider text-[10px]">Chain / Size</span>
                  <span className="font-sans text-xs font-bold text-[#370617] truncate block">{product.size || 'Standard'}</span>
                </div>
              </div>
            </div>

            {/* Quantity Counter */}
            <div className="flex items-center gap-4">
              <label htmlFor="pdp-quantity" className="text-xs font-sans text-[#370617] uppercase tracking-wider font-semibold">Quantity:</label>
              <div className="flex items-center border border-[#d7c1c4] rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#370617] hover:bg-[#f2e5e6] focus:outline-none focus:ring-2 focus:ring-[#370617]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span id="pdp-quantity" className="px-4 py-2 font-data text-sm font-bold text-[#370617]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-bold text-[#370617] hover:bg-[#f2e5e6] focus:outline-none focus:ring-2 focus:ring-[#370617]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => onAddToCart(product, selectedPurity, quantity)}
                  className="flex-1 bg-[#370617] hover:bg-[#521b2b] text-white py-3.5 min-h-[48px] rounded-lg font-sans text-xs uppercase tracking-[0.18em] font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#370617]"
                >
                  <span className="material-symbols-outlined text-lg">shopping_bag</span>
                  <span>Add To Shopping Bag</span>
                </button>
                {onToggleWishlist && (
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className={`px-4 py-3.5 min-h-[48px] rounded-lg border transition-all flex items-center justify-center ${
                      isWishlisted
                        ? 'bg-[#ba1a1a]/10 border-[#ba1a1a] text-[#ba1a1a]'
                        : 'bg-white border-[#d7c1c4] text-[#847375] hover:text-[#ba1a1a] hover:border-[#ba1a1a]'
                    }`}
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <span className="material-symbols-outlined text-xl" data-weight={isWishlisted ? 'fill' : undefined}>
                      favorite
                    </span>
                  </button>
                )}
              </div>

              <button
                onClick={() => onOpenAppointmentModal(product)}
                className="w-full bg-[#FAF6F0] hover:bg-[#f2e5e6] text-[#370617] border border-[#B88A44] py-3.5 min-h-[48px] rounded-lg font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#370617]"
              >
                <span className="material-symbols-outlined text-lg text-[#B88A44]">videocam</span>
                <span>Inspect on Live Video Call</span>
              </button>
            </div>

            {/* Tabbed Info Accordion */}
            <div className="border-t border-[#f2e5e6] pt-4 space-y-3">
              <div className="flex border-b border-[#d7c1c4] text-xs font-sans">
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`py-2 px-3 font-semibold ${
                    activeTab === 'breakdown'
                      ? 'border-b-2 border-[#370617] text-[#370617]'
                      : 'text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  Price Breakdown
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`py-2 px-3 font-semibold ${
                    activeTab === 'details'
                      ? 'border-b-2 border-[#370617] text-[#370617]'
                      : 'text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  Craft & Story
                </button>
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`py-2 px-3 font-semibold ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-[#370617] text-[#370617]'
                      : 'text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  Insured Delivery
                </button>
              </div>

              {activeTab === 'breakdown' && (
                <div className="bg-[#fef0f1] p-4 rounded-lg space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-[#524346]">
                    <span>Raw Gold ({product.weightGrams}g @ ₹{goldRate.toLocaleString()}/g)</span>
                    <span className="font-data font-semibold">₹{breakdown.goldValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#524346]">
                    <span>Craftsmanship & Making Charges (8%)</span>
                    <span className="font-data font-semibold">₹{breakdown.makingCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#524346]">
                    <span>Wastage Charge (2%)</span>
                    <span className="font-data font-semibold">₹{breakdown.wastage.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#524346]">
                    <span>BIS Hallmarking Stamp</span>
                    <span className="font-data font-semibold">₹{breakdown.bisHallmarking.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#524346]">
                    <span>GST (3%)</span>
                    <span className="font-data font-semibold">₹{breakdown.gst.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-[#d7c1c4] pt-2 flex justify-between font-bold text-[#370617]">
                    <span>Total Estimated Price</span>
                    <span className="font-data">₹{breakdown.total.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {activeTab === 'details' && (
                <p className="font-sans text-xs text-[#524346] leading-relaxed p-1">
                  {product.description} Hand-carved in pure {selectedPurity} gold with South Indian traditional temple motif engraving.
                </p>
              )}

              {activeTab === 'shipping' && (
                <div className="space-y-1.5 text-xs text-[#524346] p-1 font-sans">
                  <p>• Fully insured door-step delivery across 18,000+ PIN codes in India.</p>
                  <p>• Delivered in tamper-evident velvet security box with serial numbers.</p>
                  <p>• 100% money-back guarantee against weight discrepancies.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Star Rating System */}
      <ProductReviewsSection
        productId={product.id}
        productName={product.name}
        currentUser={currentUser}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* Sticky Mobile Bottom CTA Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-[#fff8f7] border-t border-[#d7c1c4] shadow-2xl z-40 flex items-center justify-between gap-3">
        <div>
          <span className="block text-[10px] font-sans text-[#370617]/70 uppercase tracking-wider font-semibold">Total Price</span>
          <span className="font-data font-bold text-lg text-[#370617]">
            ₹{breakdown.total.toLocaleString()}
          </span>
        </div>
        <button
          onClick={() => onAddToCart(product, selectedPurity, quantity)}
          className="flex-1 bg-[#370617] text-white py-3 px-4 min-h-[48px] rounded-lg font-sans text-xs uppercase tracking-widest font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-base">shopping_bag</span>
          <span>Add To Bag</span>
        </button>
      </div>

      {/* Fullscreen High-Resolution Lightbox Inspection Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#070A0D]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div
            className="flex items-center justify-between text-white max-w-7xl w-full mx-auto pb-4 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-[#B88A44] text-white text-xs font-bold px-3 py-1 rounded">
                {selectedPurity} BIS Hallmark
              </span>
              <div>
                <h3 className="font-serif-display font-bold text-lg text-[#FAF6F0] truncate max-w-md">
                  {product.name}
                </h3>
                <p className="text-[11px] font-sans text-[#A89C92]">
                  High-Precision Master Craftsmanship Inspection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-white/10 rounded-lg p-1 border border-white/15 text-xs">
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.max(1, z - 0.5))}
                  className="px-2.5 py-1 text-white hover:bg-white/20 rounded transition-colors flex items-center gap-1"
                  title="Zoom Out"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="px-2 font-data text-white font-bold">{lightboxZoom.toFixed(1)}×</span>
                <button
                  type="button"
                  onClick={() => setLightboxZoom((z) => Math.min(4, z + 0.5))}
                  className="px-2.5 py-1 text-white hover:bg-white/20 rounded transition-colors flex items-center gap-1"
                  title="Zoom In"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxZoom(1)}
                  className="ml-1 px-2 py-1 text-[#D4AF6A] hover:bg-white/20 rounded font-semibold text-[10px] uppercase"
                >
                  Reset
                </button>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Close fullscreen inspection"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          </div>

          {/* Main Zoomable Image Viewport */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden my-4 relative select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative max-w-4xl max-h-[70vh] flex items-center justify-center cursor-zoom-in transition-transform duration-200"
              style={{
                transform: `scale(${lightboxZoom})`,
              }}
              onClick={() => setLightboxZoom((z) => (z >= 2.5 ? 1 : z + 0.75))}
            >
              <img
                src={currentImageUrl}
                alt={product.name}
                className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Bottom Thumbnails Strip */}
          <div
            className="max-w-xl mx-auto flex items-center justify-center gap-3 pt-3 border-t border-white/10 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {imagesList.map((img) => (
              <button
                key={img.key}
                onClick={() => {
                  setActiveImageKey(img.key);
                  setLightboxZoom(1);
                }}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white ${
                  activeImageKey === img.key
                    ? 'border-[#C7E24E] ring-2 ring-[#C7E24E]/50 scale-105'
                    : 'border-white/20 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
