import React, { useState } from 'react';
import { PRODUCTS, getLiveProductPrice } from '../data/products';
import { Product, CategoryType, PurityType, ActiveView } from '../types';

interface CatalogViewProps {
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
  onAddToCart?: (product: Product, purity: PurityType, quantity: number) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onSelectProduct,
  onToggleWishlist,
  wishlistIds,
  onNavigate,
  goldRate,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPurity, setSelectedPurity] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(850000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const categories: (CategoryType | 'All')[] = [
    'All',
    'Chokers',
    'Long Necklaces (Haaram)',
    'Layered Necklaces',
    'Earrings',
    'Bangles & Bracelets',
    'Bridal Trousseau'
  ];

  const purities: (PurityType | 'All')[] = ['All', '22K', '18K', '14K'];

  // Filtering with Live Price
  let filtered = PRODUCTS.filter((p) => {
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedPurity !== 'All' && p.purity !== selectedPurity) return false;
    const price = getLiveProductPrice(p, goldRate);
    if (price > maxPrice) return false;
    return true;
  });

  // Sorting
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => getLiveProductPrice(a, goldRate) - getLiveProductPrice(b, goldRate));
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => getLiveProductPrice(b, goldRate) - getLiveProductPrice(a, goldRate));
  } else if (sortBy === 'weight-asc') {
    filtered.sort((a, b) => a.weightGrams - b.weightGrams);
  } else if (sortBy === 'weight-desc') {
    filtered.sort((a, b) => b.weightGrams - a.weightGrams);
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#524346]" aria-label="Breadcrumbs">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline focus:outline-none">
          Home
        </button>
        <span>/</span>
        <span className="text-[#370617] font-semibold">Gold Jewellery Catalogue</span>
      </nav>

      {/* Category Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#d7c1c4] pb-6 gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.22em] text-[#B88A44] font-semibold font-sans">
            SOUTH INDIAN 22K GOLD
          </span>
          <h1 className="font-serif-display text-3xl md:text-4xl text-[#370617] font-bold">
            Gold Necklaces & Jewellery
          </h1>
          <p className="font-sans text-xs text-[#370617]/80 mt-1 flex items-center gap-2">
            <span>Showing {filtered.length} 100% BIS Hallmarked gold creations.</span>
            <span className="bg-[#FAF6F0] text-[#B88A44] border border-[#b88a44]/30 px-2 py-0.5 rounded text-[11px] font-medium hidden sm:inline-block">
              Calculated @ ₹{goldRate.toLocaleString()}/g Live
            </span>
          </p>
        </div>

        {/* Controls: Mobile Filter Toggle + Skeleton Toggle + Sort */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden min-h-[44px] px-4 py-2 bg-[#FAF6F0] border border-[#370617] text-[#370617] rounded-lg text-xs font-sans font-bold flex items-center gap-2 focus:ring-2 focus:ring-[#370617]"
            aria-expanded={mobileFilterOpen}
            aria-label="Toggle Filter Options"
          >
            <span className="material-symbols-outlined text-sm">tune</span>
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Filter & Refine'}</span>
          </button>

          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`min-h-[44px] text-xs font-sans px-3.5 py-2 rounded-lg border transition-colors flex items-center gap-1.5 focus:ring-2 focus:ring-[#370617] ${
              showSkeleton
                ? 'bg-[#370617] text-white border-[#370617]'
                : 'bg-white text-[#370617] border-[#d7c1c4] hover:bg-[#f2e5e6]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_carousel</span>
            <span>{showSkeleton ? 'Show Products' : 'Skeleton View'}</span>
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs font-sans text-[#370617] uppercase tracking-wider font-semibold whitespace-nowrap">
              Sort By:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#d7c1c4] text-xs font-sans text-[#370617] rounded-lg px-3 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-[#370617]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="weight-asc">Weight: Low to High</option>
              <option value="weight-desc">Weight: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop: Block, Mobile: Collapsible) */}
        <aside 
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:block lg:col-span-1 bg-[#ffffff] p-5 rounded-2xl border border-[#d7c1c4] space-y-6 h-fit shadow-sm`}
        >
          <div className="flex justify-between items-center border-b border-[#f2e5e6] pb-3">
            <h2 className="font-serif-display text-lg text-[#370617] font-bold">
              Filter Collection
            </h2>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPurity('All');
                setMaxPrice(850000);
              }}
              className="text-xs font-sans text-[#B88A44] hover:underline font-semibold focus:outline-none"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <span className="block text-xs font-sans uppercase tracking-wider text-[#370617] font-semibold">
              Category
            </span>
            <div className="space-y-1">
              {categories.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center space-x-3 text-xs font-sans text-[#370617] hover:text-[#B88A44] cursor-pointer py-1 min-h-[36px]"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="w-4 h-4 accent-[#370617]"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Gold Purity Filter */}
          <div className="space-y-2 border-t border-[#f2e5e6] pt-4">
            <span className="block text-xs font-sans uppercase tracking-wider text-[#370617] font-semibold">
              Gold Purity
            </span>
            <div className="grid grid-cols-2 gap-2">
              {purities.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPurity(p)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors min-h-[40px] ${
                    selectedPurity === p
                      ? 'bg-[#370617] text-white border-[#370617]'
                      : 'bg-white border-[#d7c1c4] text-[#370617] hover:bg-[#f2e5e6]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 border-t border-[#f2e5e6] pt-4">
            <div className="flex justify-between items-center text-xs font-sans">
              <label htmlFor="price-slider" className="uppercase tracking-wider text-[#370617] font-semibold">Max Price</label>
              <span className="font-data font-bold text-[#370617]">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              id="price-slider"
              type="range"
              min="50000"
              max="850000"
              step="25000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#370617] min-h-[30px]"
            />
          </div>

          {/* Trust Seal Pill */}
          <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#b88a44]/30 text-center space-y-1">
            <span className="material-symbols-outlined text-[#B88A44] text-2xl">verified</span>
            <span className="block font-serif-display text-xs text-[#370617] font-bold">100% BIS Hallmarked</span>
            <span className="block font-sans text-[11px] text-[#524346]">Laser stamped purity guaranteed</span>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-[#d7c1c4] p-4 space-y-3">
                  <div className="aspect-square skeleton rounded-lg" />
                  <div className="h-3 skeleton rounded w-1/3" />
                  <div className="h-5 skeleton rounded w-3/4" />
                  <div className="h-4 skeleton rounded w-1/2" />
                  <div className="h-9 skeleton rounded w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-[#d7c1c4] text-center space-y-3 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-[#370617]/50">search_off</span>
              <h3 className="font-serif-display text-xl font-bold text-[#370617]">
                No matching creations found
              </h3>
              <p className="font-sans text-xs text-[#524346]">
                Try adjusting your purity filters or price range threshold.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPurity('All');
                  setMaxPrice(850000);
                }}
                className="bg-[#370617] text-white text-xs font-sans uppercase tracking-widest font-semibold px-6 py-3 rounded-lg mt-2 min-h-[44px]"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const livePrice = getLiveProductPrice(product, goldRate);

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-[#ffffff] rounded-2xl border border-[#d7c1c4] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#fef0f1] p-4">
                      <img
                        src={product.images.main}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-[#370617] text-[#FAF6F0] text-[10px] font-data uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {product.purityBadge}
                      </span>

                      {/* Heart Wishlist Toggle Button - Touch Target Min 44px */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#370617] hover:bg-white shadow-md transition-all focus:ring-2 focus:ring-[#370617] focus:outline-none"
                        aria-label={isWishlisted ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <span 
                          className="material-symbols-outlined text-lg"
                          data-weight={isWishlisted ? "fill" : undefined}
                          style={{ color: isWishlisted ? '#ba1a1a' : undefined }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-[10px] font-sans uppercase tracking-widest text-[#370617]/70 font-bold">
                          {product.category}
                        </span>
                        <h3 className="font-serif-display text-base font-bold text-[#370617] group-hover:text-[#B88A44] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>

                      <div className="flex justify-between items-baseline pt-2 border-t border-[#f2e5e6]">
                        <div>
                          <span className="text-[10px] font-sans text-[#370617]/70 block font-medium">Gross Weight</span>
                          <span className="font-data text-xs text-[#370617] font-semibold">
                            {product.weightGrams} g
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-sans text-[#370617]/70 block font-medium">Estimated Total</span>
                          <span className="font-data text-base font-bold text-[#370617]">
                            ₹{livePrice.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProduct(product);
                          }}
                          className="flex-1 bg-[#fef0f1] hover:bg-[#370617] text-[#370617] hover:text-white py-2.5 min-h-[44px] rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-colors duration-200"
                        >
                          View Details
                        </button>
                        {onAddToCart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product, product.purity, 1);
                            }}
                            className="bg-[#370617] hover:bg-[#521b2b] text-white px-3 py-2.5 min-h-[44px] rounded-lg font-sans text-xs uppercase tracking-wider font-bold transition-colors duration-200 flex items-center justify-center gap-1 shrink-0"
                            aria-label={`Add ${product.name} to Bag`}
                            title="Add to Shopping Bag"
                          >
                            <span className="material-symbols-outlined text-base">shopping_bag</span>
                            <span className="hidden sm:inline text-[11px]">Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Bar */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#d7c1c4] text-xs font-sans text-[#370617]">
            <span>Showing 1-{filtered.length} of {filtered.length} items</span>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1.5 rounded border border-[#d7c1c4] text-[#370617]/40 opacity-50 cursor-not-allowed">
                Prev
              </button>
              <button className="px-3 py-1.5 rounded bg-[#370617] text-white font-bold">1</button>
              <button disabled className="px-3 py-1.5 rounded border border-[#d7c1c4] text-[#370617]/40 opacity-50 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
