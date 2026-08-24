import React, { useState, useEffect } from 'react';
import { Product, PurityType, ActiveView } from '../types';
import { calculatePriceBreakdown } from '../data/products';
import { ProductReviewsSection } from '../components/ProductReviewsSection';

interface PdpViewProps {
  product: Product;
  onAddToCart: (product: Product, purity: PurityType, quantity: number) => void;
  onOpenAppointmentModal: (product: Product) => void;
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
}

export const PdpView: React.FC<PdpViewProps> = ({
  product,
  onAddToCart,
  onOpenAppointmentModal,
  onNavigate,
  goldRate,
}) => {
  const [selectedPurity, setSelectedPurity] = useState<PurityType>(product.purity);
  const [activeImageKey, setActiveImageKey] = useState<keyof Product['images']>('main');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'breakdown' | 'shipping'>('breakdown');
  const [priceLockSeconds, setPriceLockSeconds] = useState<number>(900); // 15 mins

  // 15-minute price lock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPriceLockSeconds((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          {/* Main Hero Image */}
          <div className="relative aspect-square bg-[#ffffff] rounded-2xl border border-[#d7c1c4] overflow-hidden p-6 shadow-md">
            <img
              src={currentImageUrl}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl transition-all duration-300"
            />

            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-[#370617] text-white font-data text-xs px-3 py-1 rounded font-bold shadow-sm">
                {selectedPurity} / 916 Hallmark
              </span>
              {product.isBestseller && (
                <span className="bg-[#B88A44] text-white font-sans text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded font-bold">
                  Bestseller
                </span>
              )}
            </div>

            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#d7c1c4] text-xs font-sans text-[#370617] flex items-center gap-1 shadow-sm">
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
                  <span>4.9 / 5.0</span>
                  <span className="text-[#847375] font-normal text-[11px]">(Verified Reviews)</span>
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
              <button
                onClick={() => onAddToCart(product, selectedPurity, quantity)}
                className="w-full bg-[#370617] hover:bg-[#521b2b] text-white py-3.5 min-h-[48px] rounded-lg font-sans text-xs uppercase tracking-[0.18em] font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#370617]"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                <span>Add To Shopping Bag</span>
              </button>

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
      <ProductReviewsSection productId={product.id} productName={product.name} />

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
    </div>
  );
};
