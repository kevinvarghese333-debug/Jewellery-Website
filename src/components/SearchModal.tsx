import React, { useState } from 'react';
import { PRODUCTS, getLiveProductPrice } from '../data/products';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  goldRate?: number;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  goldRate,
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filteredProducts = query.trim()
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase()) ||
        p.purity.toLowerCase().includes(query.toLowerCase())
      )
    : PRODUCTS.slice(0, 4); // featured initial suggestions

  return (
    <div 
      className="fixed inset-0 bg-[#1C1410]/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalogue"
    >
      <div className="bg-[#fff8f7] border border-[#d7c1c4] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-fadeIn">
        {/* Search Bar Input */}
        <div className="p-4 border-b border-[#d7c1c4] flex items-center gap-3 bg-white">
          <label htmlFor="search-catalogue-input" className="sr-only">Search Catalogue</label>
          <span className="material-symbols-outlined text-[#370617]/70 text-2xl">search</span>
          <input
            id="search-catalogue-input"
            type="text"
            autoFocus
            placeholder="Search gold chokers, haarams, jhumkas, bridal sets..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full font-sans text-sm text-[#370617] bg-transparent focus:outline-none placeholder-[#370617]/50 py-1"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-[#370617] hover:text-[#B88A44] text-xs font-sans uppercase tracking-wider font-bold min-h-[36px] px-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="text-[#370617] hover:bg-[#f2e5e6] min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors focus:ring-2 focus:ring-[#370617] focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Results Container */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] font-sans uppercase tracking-widest font-semibold text-[#370617]">
              {query.trim() ? `Search Results (${filteredProducts.length})` : 'Popular Suggestions'}
            </span>
            <span className="text-xs text-[#B88A44] font-sans font-semibold">100% BIS 22K Hallmarked</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-10 text-[#524346] font-sans text-xs">
              No matching gold jewellery pieces found for "{query}".
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.map((p) => {
                const livePrice = getLiveProductPrice(p, goldRate);

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectProduct(p);
                      onClose();
                    }}
                    className="bg-white p-3 rounded-xl border border-[#d7c1c4] hover:border-[#370617] hover:shadow-md transition-all cursor-pointer flex gap-3 items-center group min-h-[64px]"
                  >
                    <img
                      src={p.images.main}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded-lg bg-[#fef0f1] group-hover:scale-105 transition-transform"
                    />
                    <div className="overflow-hidden">
                      <span className="inline-block text-[9px] bg-[#370617] text-white px-2 py-0.5 rounded font-data font-semibold mb-0.5">
                        {p.purityBadge}
                      </span>
                      <h3 className="font-serif-display text-xs text-[#370617] font-bold truncate group-hover:text-[#B88A44] transition-colors">
                        {p.name}
                      </h3>
                      <p className="font-data text-xs text-[#370617] mt-0.5 font-bold">
                        ₹{livePrice.toLocaleString()} • {p.weightGrams}g
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
