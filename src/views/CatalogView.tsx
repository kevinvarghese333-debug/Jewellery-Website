import React, { useState, useEffect } from 'react';
import { getLiveProductPrice, CATEGORY_METAS, CategoryMeta } from '../data/products';
import { getAllProducts } from '../data/productStore';
import { Product, CategoryType, PurityType, ActiveView } from '../types';

interface CatalogViewProps {
  categorySlug?: 'catalog' | 'earrings' | 'necklaces' | 'bangles' | 'bridal';
  onSelectProduct: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
  onAddToCart?: (product: Product, purity: PurityType, quantity: number) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  categorySlug = 'catalog',
  onSelectProduct,
  onToggleWishlist,
  wishlistIds,
  onNavigate,
  goldRate,
  onAddToCart,
}) => {
  const currentMeta: CategoryMeta = CATEGORY_METAS[categorySlug] || CATEGORY_METAS.catalog;

  const [productsList, setProductsList] = useState<Product[]>(() => getAllProducts());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPurity, setSelectedPurity] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Sync products when catalog changes or custom products are added
  useEffect(() => {
    const handleProductsUpdate = () => {
      setProductsList(getAllProducts());
    };
    window.addEventListener('kavitha_products_updated', handleProductsUpdate);
    return () => {
      window.removeEventListener('kavitha_products_updated', handleProductsUpdate);
    };
  }, []);

  // Reset category filters when slug changes
  useEffect(() => {
    setSelectedCategory('All');
    setSelectedPurity('All');
    setMaxPrice(3000000);
    setMobileFilterOpen(false);
  }, [categorySlug]);

  const availableCategories: (CategoryType | 'All')[] = [
    'All',
    ...currentMeta.filterCategories,
  ];

  const purities: (PurityType | 'All')[] = ['All', '22K', '18K', '14K'];

  // Filtering with Live Price
  let filtered = productsList.filter((p) => {
    // 1. Must match current page's parent category scope
    if (categorySlug !== 'catalog') {
      if (!currentMeta.filterCategories.includes(p.category)) {
        return false;
      }
    }
    // 2. Specific category sub-filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    // 3. Purity filter
    if (selectedPurity !== 'All' && p.purity !== selectedPurity) {
      return false;
    }
    // 4. Price threshold
    const price = getLiveProductPrice(p, goldRate);
    if (price > maxPrice) {
      return false;
    }
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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#524346] flex-wrap" aria-label="Breadcrumbs">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline focus:outline-none py-1">
          Home
        </button>
        <span className="text-[#d7c1c4]">/</span>
        <button 
          onClick={() => onNavigate('catalog')} 
          className={`hover:text-[#370617] py-1 ${categorySlug === 'catalog' ? 'text-[#370617] font-bold' : 'text-[#524346] hover:underline'}`}
        >
          Gold Catalogue
        </button>
        {categorySlug !== 'catalog' && (
          <>
            <span className="text-[#d7c1c4]">/</span>
            <span className="text-[#370617] font-bold py-1">{currentMeta.name}</span>
          </>
        )}
      </nav>

      {/* 2. Category Hero Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-r from-[#1C1410] via-[#370617] to-[#25030f] text-white p-6 sm:p-8 md:p-10 border border-[#B88A44]/40">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none">
          <img 
            src={currentMeta.heroImage} 
            alt={currentMeta.name}
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-[#B88A44]/25 text-[#D4AF6A] border border-[#B88A44]/40 px-3 py-1 rounded-full text-[10px] sm:text-xs font-brand uppercase tracking-[0.18em] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF6A] animate-ping" />
            <span>{currentMeta.subtitle}</span>
          </div>

          <h1 className="font-serif-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#FAF6F0] leading-tight">
            {currentMeta.name}
          </h1>

          <p className="font-brand text-xs sm:text-sm text-[#F0EBE4] leading-relaxed max-w-xl font-normal">
            {currentMeta.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-sans text-[#D9CFC4]">
            <span className="bg-[#ffffff]/10 px-2.5 py-1 rounded-md border border-[#ffffff]/20 font-medium">
              ✓ 100% BIS Hallmarked (916/750)
            </span>
            <span className="bg-[#ffffff]/10 px-2.5 py-1 rounded-md border border-[#ffffff]/20 font-medium">
              ✓ Live Bullion Pricing: ₹{goldRate.toLocaleString()}/g
            </span>
            <span className="bg-[#ffffff]/10 px-2.5 py-1 rounded-md border border-[#ffffff]/20 font-medium">
              ✓ Insured Pan-India Transit
            </span>
          </div>
        </div>
      </div>

      {/* 3. Category Quick-Navigation Strip (Direct Tabs for Instant Category Switching) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs font-sans">
        <button
          onClick={() => onNavigate('catalog')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all min-h-[38px] ${
            categorySlug === 'catalog'
              ? 'bg-[#370617] text-white shadow-sm'
              : 'bg-white text-[#370617] border border-[#d7c1c4] hover:bg-[#f2e5e6]'
          }`}
        >
          All Jewellery ({productsList.length})
        </button>

        <button
          onClick={() => onNavigate('earrings')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all min-h-[38px] ${
            categorySlug === 'earrings'
              ? 'bg-[#370617] text-white shadow-sm'
              : 'bg-white text-[#370617] border border-[#d7c1c4] hover:bg-[#f2e5e6]'
          }`}
        >
          Earrings ({productsList.filter(p => p.category === 'Earrings').length})
        </button>

        <button
          onClick={() => onNavigate('necklaces')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all min-h-[38px] ${
            categorySlug === 'necklaces'
              ? 'bg-[#370617] text-white shadow-sm'
              : 'bg-white text-[#370617] border border-[#d7c1c4] hover:bg-[#f2e5e6]'
          }`}
        >
          Necklaces & Haarams ({productsList.filter(p => ['Chokers', 'Long Necklaces (Haaram)', 'Layered Necklaces'].includes(p.category)).length})
        </button>

        <button
          onClick={() => onNavigate('bangles')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all min-h-[38px] ${
            categorySlug === 'bangles'
              ? 'bg-[#370617] text-white shadow-sm'
              : 'bg-white text-[#370617] border border-[#d7c1c4] hover:bg-[#f2e5e6]'
          }`}
        >
          Bangles & Kadas ({productsList.filter(p => p.category === 'Bangles & Bracelets').length})
        </button>

        <button
          onClick={() => onNavigate('bridal')}
          className={`px-4 py-2 rounded-full whitespace-nowrap font-bold transition-all min-h-[38px] ${
            categorySlug === 'bridal'
              ? 'bg-[#370617] text-white shadow-sm'
              : 'bg-white text-[#370617] border border-[#d7c1c4] hover:bg-[#f2e5e6]'
          }`}
        >
          Bridal Trousseau ({productsList.filter(p => p.category === 'Bridal Trousseau').length})
        </button>
      </div>

      {/* 4. Controls Header: Result Count + Mobile Filter Toggle + Sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#d7c1c4] pb-4 gap-3">
        <div className="text-xs font-sans text-[#370617]">
          <span className="font-bold text-sm text-[#370617]">
            {filtered.length} {filtered.length === 1 ? 'Design' : 'Designs'} Available
          </span>
          <span className="text-[#524346] ml-2">
            • Live updated with ₹{goldRate.toLocaleString()}/g
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden min-h-[42px] px-3.5 py-1.5 bg-[#FAF6F0] border border-[#370617] text-[#370617] rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 shadow-2xs"
            aria-expanded={mobileFilterOpen}
          >
            <span className="material-symbols-outlined text-base">tune</span>
            <span>{mobileFilterOpen ? 'Close Filters' : 'Filter & Sort'}</span>
          </button>

          {/* Skeleton View Toggle */}
          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`min-h-[42px] text-xs font-sans px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 ${
              showSkeleton
                ? 'bg-[#370617] text-white border-[#370617]'
                : 'bg-white text-[#370617] border-[#d7c1c4] hover:bg-[#f2e5e6]'
            }`}
          >
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span className="hidden sm:inline">{showSkeleton ? 'Show Grid' : 'Skeleton'}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="catalog-sort-select" className="text-[11px] font-sans text-[#370617] uppercase tracking-wider font-semibold whitespace-nowrap hidden sm:inline">
              Sort:
            </label>
            <select
              id="catalog-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#d7c1c4] text-xs font-sans text-[#370617] font-semibold rounded-lg px-2.5 min-h-[42px] focus:outline-none focus:ring-2 focus:ring-[#370617]"
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

      {/* 5. Main Content: Sidebar Filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Sidebar Filters (Desktop: Normal, Mobile: Modal / Expandable Sheet) */}
        <aside
          className={`${
            mobileFilterOpen ? 'block' : 'hidden'
          } lg:block lg:col-span-1 bg-[#ffffff] p-5 rounded-2xl border border-[#d7c1c4] space-y-6 shadow-sm sticky top-24 z-30`}
        >
          <div className="flex justify-between items-center border-b border-[#f2e5e6] pb-3">
            <h2 className="font-serif-display text-base sm:text-lg text-[#370617] font-bold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-[#B88A44]">filter_list</span>
              <span>Filter Collection</span>
            </h2>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPurity('All');
                setMaxPrice(3000000);
              }}
              className="text-xs font-sans text-[#B88A44] hover:underline font-semibold"
            >
              Reset
            </button>
          </div>

          {/* Sub-Category Filter */}
          {availableCategories.length > 2 && (
            <div className="space-y-2">
              <span className="block text-xs font-sans uppercase tracking-wider text-[#370617] font-bold">
                Sub-Category
              </span>
              <div className="space-y-1">
                {availableCategories.map((cat) => (
                  <label
                    key={cat}
                    className="flex items-center space-x-3 text-xs font-sans text-[#370617] hover:text-[#B88A44] cursor-pointer py-1 min-h-[32px]"
                  >
                    <input
                      type="radio"
                      name="catalog-subcategory"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 accent-[#370617]"
                    />
                    <span className={selectedCategory === cat ? 'font-bold text-[#370617]' : ''}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Gold Purity Filter */}
          <div className="space-y-2 border-t border-[#f2e5e6] pt-4">
            <span className="block text-xs font-sans uppercase tracking-wider text-[#370617] font-bold">
              Gold Purity
            </span>
            <div className="grid grid-cols-2 gap-2">
              {purities.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPurity(p)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors min-h-[38px] ${
                    selectedPurity === p
                      ? 'bg-[#370617] text-white border-[#370617]'
                      : 'bg-white border-[#d7c1c4] text-[#370617] hover:bg-[#f2e5e6]'
                  }`}
                >
                  {p === 'All' ? 'All Purities' : `${p} Gold`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 border-t border-[#f2e5e6] pt-4">
            <div className="flex justify-between items-center text-xs font-sans">
              <label htmlFor="catalog-price-slider" className="uppercase tracking-wider text-[#370617] font-bold">
                Max Price
              </label>
              <span className="font-data font-bold text-[#370617] text-xs sm:text-sm">
                ₹{maxPrice.toLocaleString()}
              </span>
            </div>
            <input
              id="catalog-price-slider"
              type="range"
              min="50000"
              max="3000000"
              step="25000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-[#370617] min-h-[30px]"
            />
            <div className="flex justify-between text-[10px] text-[#847375] font-data">
              <span>₹50,000</span>
              <span>₹30,00,000</span>
            </div>
          </div>

          {/* Hallmarking Trust Badge */}
          <div className="bg-[#FAF6F0] p-3.5 rounded-xl border border-[#B88A44]/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-[#B88A44]">
              <span className="material-symbols-outlined text-lg">verified</span>
              <span className="font-brand font-bold text-xs text-[#370617]">BIS Hallmark Assured</span>
            </div>
            <p className="font-sans text-[11px] text-[#524346] leading-tight">
              Laser engraved with 6-digit HUID code & authentic assay purity.
            </p>
          </div>

          {mobileFilterOpen && (
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="lg:hidden w-full bg-[#370617] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Apply Filters ({filtered.length} Items)
            </button>
          )}
        </aside>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          {showSkeleton ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#d7c1c4] text-center space-y-4 shadow-sm">
              <span className="material-symbols-outlined text-5xl text-[#370617]/40">diamond</span>
              <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#370617]">
                No creations match your current filters
              </h3>
              <p className="font-sans text-xs text-[#524346] max-w-md mx-auto">
                Try widening your price range threshold or choosing "All" purity and sub-categories.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedPurity('All');
                  setMaxPrice(3000000);
                }}
                className="bg-[#370617] text-white text-xs font-sans uppercase tracking-widest font-semibold px-6 py-3 rounded-xl min-h-[44px] hover:bg-[#521b2b] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const livePrice = getLiveProductPrice(product, goldRate);

                return (
                  <div
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="bg-[#ffffff] rounded-2xl border border-[#d7c1c4] overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square overflow-hidden bg-[#FAF6F0] p-3.5 sm:p-4">
                      <img
                        src={product.images.main}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Purity Badge */}
                      <span className="absolute top-3 left-3 bg-[#370617] text-[#FAF6F0] text-[10px] font-data uppercase tracking-widest font-bold px-2.5 py-1 rounded-md shadow-sm">
                        {product.purityBadge}
                      </span>

                      {/* Bestseller / New Arrival Pill */}
                      {product.isBestseller && (
                        <span className="absolute bottom-3 left-3 bg-[#B88A44] text-white text-[9px] font-brand uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-sm">
                          ★ Bestseller
                        </span>
                      )}
                      {product.isNewArrival && !product.isBestseller && (
                        <span className="absolute bottom-3 left-3 bg-[#10B981] text-white text-[9px] font-brand uppercase tracking-wider font-extrabold px-2 py-0.5 rounded shadow-sm">
                          New Design
                        </span>
                      )}

                      {/* Heart Wishlist Toggle Button - Min 44px Touch Target */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 min-w-[44px] min-h-[44px] rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center text-[#370617] hover:bg-white shadow-md transition-all focus:ring-2 focus:ring-[#370617] focus:outline-none"
                        aria-label={isWishlisted ? `Remove ${product.name} from Wishlist` : `Add ${product.name} to Wishlist`}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <span 
                          className="material-symbols-outlined text-xl"
                          data-weight={isWishlisted ? "fill" : undefined}
                          style={{ color: isWishlisted ? '#ba1a1a' : '#370617' }}
                        >
                          favorite
                        </span>
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 sm:p-5 space-y-3 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-sans uppercase tracking-widest text-[#847375] font-bold">
                          <span>{product.category}</span>
                          <span>{product.purity}</span>
                        </div>
                        <h3 className="font-serif-display text-base font-bold text-[#370617] group-hover:text-[#B88A44] transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="font-sans text-[11px] text-[#524346] line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      {/* Weight & Live Dynamic Price */}
                      <div className="pt-2 border-t border-[#f2e5e6] space-y-2">
                        <div className="flex justify-between items-baseline">
                          <div>
                            <span className="text-[10px] font-sans text-[#847375] block font-medium">Gross Weight</span>
                            <span className="font-data text-xs text-[#370617] font-bold">
                              {product.weightGrams} g
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-sans text-[#847375] block font-medium">Live Total</span>
                            <span className="font-data text-base sm:text-lg font-bold text-[#370617]">
                              ₹{livePrice.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProduct(product);
                            }}
                            className="flex-1 bg-[#fef0f1] hover:bg-[#370617] text-[#370617] hover:text-white py-2.5 min-h-[44px] rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-colors duration-200 text-center"
                          >
                            View Details
                          </button>
                          {onAddToCart && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(product, product.purity, 1);
                              }}
                              className="bg-[#370617] hover:bg-[#521b2b] text-white px-3.5 py-2.5 min-h-[44px] rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-colors duration-200 flex items-center justify-center gap-1.5 shrink-0"
                              aria-label={`Add ${product.name} to Bag`}
                              title="Add to Shopping Bag"
                            >
                              <span className="material-symbols-outlined text-base">shopping_bag</span>
                              <span className="text-[11px] font-bold">Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#d7c1c4] text-xs font-sans text-[#370617]">
            <span>Showing 1-{filtered.length} of {filtered.length} designs</span>
            <div className="flex items-center gap-1">
              <button disabled className="px-3 py-1.5 rounded-lg border border-[#d7c1c4] text-[#370617]/40 opacity-50 cursor-not-allowed">
                Prev
              </button>
              <button className="px-3 py-1.5 rounded-lg bg-[#370617] text-white font-bold">1</button>
              <button disabled className="px-3 py-1.5 rounded-lg border border-[#d7c1c4] text-[#370617]/40 opacity-50 cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
