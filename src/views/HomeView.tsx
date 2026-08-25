import React from 'react';
import { PRODUCTS, ASSET_IMAGES, getLiveProductPrice } from '../data/products';
import { Product, ActiveView } from '../types';
import { DiamondRule } from '../components/DiamondRule';

interface HomeViewProps {
  onNavigate: (view: ActiveView) => void;
  onSelectProduct: (product: Product) => void;
  onOpenAppointmentModal: (product?: Product) => void;
  goldRate: number;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
  onAddToCart?: (product: Product) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectProduct,
  onOpenAppointmentModal,
  goldRate,
  onToggleWishlist,
  wishlistIds = [],
  onAddToCart,
}) => {
  const bestsellers = PRODUCTS.filter(p => p.isBestseller);
  const newArrivals = PRODUCTS.filter(p => p.isNewArrival || !p.isBestseller).slice(0, 4);

  return (
    <div className="space-y-16 animate-fadeIn pb-12">
      {/* 1. Hero Section */}
      <section className="relative min-h-[540px] md:min-h-[620px] rounded-2xl overflow-hidden shadow-2xl flex items-center bg-[#1C1410]">
        <img
          src={ASSET_IMAGES.hero}
          alt="Kavitha Jewellery Heritage Model"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65 mix-blend-luminosity scale-105 transition-transform duration-1000 hover:scale-100"
        />
        {/* Gradient Overlay for WCAG AA readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1C1410] via-[#370617]/80 to-transparent" />

        <div className="relative z-10 max-w-2xl px-8 md:px-16 text-white space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#B88A44]/20 backdrop-blur-md border border-[#B88A44]/40 px-3.5 py-1 rounded-full text-[#D4AF6A] text-xs font-brand uppercase tracking-[0.2em] font-semibold">
            <span>◆</span>
            <span>EST. 1992 • KERALA</span>
          </div>

          <h1 className="font-serif-display text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-[#FAF6F0] tracking-tight">
            Crafted for Today. <br />
            <span className="italic font-normal text-[#D4AF6A]">Cherished for Generations</span>
          </h1>

          <div className="space-y-2">
            <p className="font-brand text-sm md:text-base text-[#FAF6F0] leading-relaxed max-w-xl font-medium">
              South India's premier destination for Timeless gold jewellery, crafted with uncompromising purity and care for every important moment.
            </p>
            <p className="font-brand text-xs md:text-sm text-[#D9CFC4] leading-relaxed max-w-lg font-normal">
              Since 1992, crafted with certified purity, timeless design, and a commitment to doing things right.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-[#B88A44] hover:bg-[#7e5714] text-white px-7 py-3.5 rounded-md font-sans text-xs uppercase tracking-[0.18em] font-bold shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore Collections</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>

            <button
              onClick={() => onOpenAppointmentModal()}
              className="bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-[#FAF6F0] border border-[#d7c1c4]/40 backdrop-blur-md px-6 py-3.5 rounded-md font-sans text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-200"
            >
              Book Video Call
            </button>
          </div>

          {/* Quick Stats Pill */}
          <div className="pt-6 border-t border-[#d7c1c4]/20 grid grid-cols-3 gap-4 text-left max-w-md">
            <div>
              <span className="font-data font-bold text-lg text-[#D4AF6A]">22K / 916</span>
              <span className="block text-[10px] text-[#A89C92] uppercase tracking-wider font-sans">BIS Hallmark</span>
            </div>
            <div>
              <span className="font-data font-bold text-lg text-[#D4AF6A]">100%</span>
              <span className="block text-[10px] text-[#A89C92] uppercase tracking-wider font-sans">Buyback Guarantee</span>
            </div>
            <div>
              <span className="font-data font-bold text-lg text-[#D4AF6A]">₹{goldRate.toLocaleString()}</span>
              <span className="block text-[10px] text-[#A89C92] uppercase tracking-wider font-sans">Live Gold Rate /g</span>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Onam Festive Surprise Promo Banner (Mobile & Desktop High Conversion) */}
      <section 
        onClick={() => onNavigate('onam-campaign')}
        className="bg-gradient-to-r from-[#1C1410] via-[#370617] to-[#2b0312] border-2 border-[#B88A44] rounded-2xl p-6 md:p-8 text-white shadow-xl cursor-pointer hover:border-[#C7E24E] transition-all relative overflow-hidden group"
      >
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-[#B88A44]/20 rounded-full blur-2xl group-hover:bg-[#C7E24E]/20 transition-colors" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#C7E24E] text-[#370617] px-3 py-1 rounded-full text-[10px] font-sans uppercase tracking-widest font-extrabold">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>FESTIVE ONAM BUMPER SURPRISE 2026</span>
            </div>
            <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-[#FAF6F0]">
              Unlock Guaranteed Gold Discounts <br className="hidden sm:inline" />
              <span className="text-[#C7E24E] italic font-normal">₹50 to ₹50,000 Off Making Charges</span>
            </h2>
            <p className="font-sans text-xs text-[#F0EBE4] max-w-xl font-light leading-relaxed">
              Spin the Kavitha Golden Raffle drum! Enter your mobile number to draw your instant digital voucher code redeemable at any Kavitha Jewellery showroom.
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate('onam-campaign');
            }}
            className="w-full md:w-auto bg-[#C7E24E] hover:bg-[#b0cb3e] text-[#370617] px-6 py-3.5 min-h-[48px] rounded-xl font-sans text-xs uppercase tracking-widest font-extrabold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <span>Claim Your Onam Voucher</span>
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* 2. Section Header: Shop By Category Bento Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-semibold font-sans">
            CURATED SELECTIONS
          </span>
          <h2 className="font-serif-display text-3xl md:text-4xl text-[#370617] font-bold">
            Explore Heritage Categories
          </h2>
          <DiamondRule align="center" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Large Feature: Bridal Trousseau */}
          <div 
            onClick={() => onNavigate('catalog')}
            className="md:col-span-2 relative min-h-[340px] rounded-xl overflow-hidden group cursor-pointer border border-[#d7c1c4] shadow-md"
          >
            <img
              src={ASSET_IMAGES.bridalCategory}
              alt="Bridal Trousseau Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/90 via-[#370617]/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="inline-block bg-[#B88A44] text-white text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                Masterpiece Series
              </span>
              <h3 className="font-serif-display text-2xl md:text-3xl font-bold text-[#FAF6F0]">
                Bridal Trousseau & Haaram
              </h3>
              <p className="font-sans text-xs text-[#F0EBE4] max-w-sm font-light">
                Grand multi-layered necklaces, Tanjore motif Haarams, and heirloom bridal gold sets.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-sans uppercase tracking-widest text-[#D4AF6A] font-semibold pt-1 group-hover:underline">
                View Collection <span className="material-symbols-outlined text-sm">chevron_right</span>
              </span>
            </div>
          </div>

          {/* Category: Necklaces & Chokers */}
          <div 
            onClick={() => onNavigate('catalog')}
            className="relative min-h-[340px] rounded-xl overflow-hidden group cursor-pointer border border-[#d7c1c4] shadow-md"
          >
            <img
              src={ASSET_IMAGES.necklacesCategory}
              alt="Gold Necklaces & Chokers"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <h3 className="font-serif-display text-xl font-bold text-[#FAF6F0]">
                Chokers & Layered Chains
              </h3>
              <p className="font-sans text-xs text-[#F0EBE4] font-light">
                From temple antique chokers to modern layered 22K chains.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-sans uppercase tracking-widest text-[#D4AF6A] font-semibold pt-1 group-hover:underline">
                Shop Chokers <span className="material-symbols-outlined text-sm">chevron_right</span>
              </span>
            </div>
          </div>

          {/* Category: Heritage Earrings & Jhumkas */}
          <div 
            onClick={() => onNavigate('catalog')}
            className="relative min-h-[340px] rounded-xl overflow-hidden group cursor-pointer border border-[#d7c1c4] shadow-md"
          >
            <img
              src={ASSET_IMAGES.earringsCategory}
              alt="Heritage Earrings & Jhumkas"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/90 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <h3 className="font-serif-display text-xl font-bold text-[#FAF6F0]">
                Temple Earrings & Jhumkas
              </h3>
              <p className="font-sans text-xs text-[#F0EBE4] font-light">
                Intricate umbrella filigree with dangling micro-gold pearls.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-sans uppercase tracking-widest text-[#D4AF6A] font-semibold pt-1 group-hover:underline">
                Shop Earrings <span className="material-symbols-outlined text-sm">chevron_right</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Bestsellers Section */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#d7c1c4] pb-4 gap-2">
          <div>
            <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-semibold font-sans">
              MOST COVETED CREATIONS
            </span>
            <h2 className="font-serif-display text-3xl text-[#370617] font-bold">
              Bestselling Heritage Pieces
            </h2>
          </div>
          <button
            onClick={() => onNavigate('catalog')}
            className="text-xs font-sans uppercase tracking-widest font-bold text-[#370617] hover:text-[#B88A44] transition-colors flex items-center gap-1"
          >
            <span>View All Products ({PRODUCTS.length})</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestsellers.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="bg-[#ffffff] rounded-xl border border-[#d7c1c4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-square overflow-hidden bg-[#fef0f1] p-4">
                <img
                  src={product.images.main}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#370617] text-[#FAF6F0] text-[10px] font-data uppercase tracking-widest font-bold px-2 py-1 rounded">
                  {product.purityBadge}
                </span>
                {product.isBestseller && (
                  <span className="absolute top-3 right-12 bg-[#B88A44] text-white text-[10px] uppercase font-sans tracking-widest font-bold px-2 py-1 rounded shadow-sm">
                    Bestseller
                  </span>
                )}
                {onToggleWishlist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(product);
                    }}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      wishlistIds.includes(product.id)
                        ? 'bg-[#ba1a1a] text-white shadow-md'
                        : 'bg-white/90 text-[#847375] hover:text-[#ba1a1a] shadow-sm hover:scale-110'
                    }`}
                    title={wishlistIds.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label={wishlistIds.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <span
                      className="material-symbols-outlined text-base leading-none"
                      data-weight={wishlistIds.includes(product.id) ? 'fill' : undefined}
                    >
                      favorite
                    </span>
                  </button>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#847375] font-semibold">
                    {product.category}
                  </span>
                  <h3 className="font-serif-display text-lg font-bold text-[#370617] group-hover:text-[#B88A44] transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </div>

                <div className="flex justify-between items-baseline pt-2 border-t border-[#f2e5e6]">
                  <div>
                    <span className="text-[10px] font-sans text-[#370617]/70 block font-medium">Gross Weight</span>
                    <span className="font-data text-xs text-[#370617] font-semibold">
                      {product.weightGrams} grams
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-sans text-[#370617]/70 block font-medium">Estimated Total</span>
                    <span className="font-data text-base font-bold text-[#370617]">
                      ₹{getLiveProductPrice(product, goldRate).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProduct(product);
                  }}
                  className="w-full bg-[#fef0f1] group-hover:bg-[#370617] text-[#370617] group-hover:text-white py-2.5 rounded font-sans text-xs uppercase tracking-widest font-semibold transition-colors duration-200 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  <span>View Details & Breakdown</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Craftsmanship & Authenticity Certificate Frame Banner */}
      <section className="certificate-frame bg-[#FAF6F0] rounded-xl p-8 md:p-12 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="inline-block bg-[#370617] text-[#D4AF6A] text-[10px] font-sans uppercase tracking-[0.2em] font-bold px-2.5 py-1 rounded">
              SEAL OF AUTHENTICITY
            </span>
            <h2 className="font-serif-display text-3xl md:text-4xl font-bold text-[#370617]">
              The Kavitha Heritage Standard
            </h2>
            <p className="font-sans text-xs md:text-sm text-[#524346] leading-relaxed">
              Every single piece of jewellery leaving our atelier undergoes 6-stage purity testing and carries the official 6-digit HUID BIS Hallmark seal alongside an individual certificate of weight and gold purity.
            </p>

            <ul className="space-y-2.5 font-sans text-xs text-[#370617] pt-2">
              <li className="flex items-center gap-2">
                <span className="text-[#B88A44]">◆</span>
                <span><strong>100% BIS 22K/916 Hallmarked</strong> purity tested with laser precision.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#B88A44]">◆</span>
                <span><strong>Transparent Valuation:</strong> Exact itemized breakdown of gold weight, making, & taxes.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#B88A44]">◆</span>
                <span><strong>Lifetime Exchange & Buyback Guarantee</strong> at prevailing bullion market rates.</span>
              </li>
            </ul>

            <div className="pt-4">
              <button
                onClick={() => onOpenAppointmentModal()}
                className="bg-[#370617] text-white px-6 py-3 rounded font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors"
              >
                Schedule Store Authentication Inspection
              </button>
            </div>
          </div>

          <div className="relative h-72 md:h-80 rounded-lg overflow-hidden border border-[#b88a44]/30 shadow-inner">
            <img
              src={ASSET_IMAGES.artisanHands}
              alt="Master Craftsman inspecting gold purity"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1410]/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-[#ffffff]/90 backdrop-blur-md p-3 rounded border border-[#b88a44]/40 flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#B88A44] text-xl">workspace_premium</span>
                <div>
                  <span className="font-serif-display font-bold text-[#370617] block">Master Artisan Atelier</span>
                  <span className="text-[10px] text-[#524346] font-sans">T. Nagar, Chennai</span>
                </div>
              </div>
              <span className="font-data text-[11px] font-bold text-[#370617]">22K / 916</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
