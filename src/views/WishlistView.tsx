import React from 'react';
import { PRODUCTS, getLiveProductPrice } from '../data/products';
import { Product, ActiveView, UserProfile } from '../types';
import { getStoredUserProfile } from '../data/userSession';

interface WishlistViewProps {
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigate: (view: ActiveView) => void;
  goldRate?: number;
  onOpenAuthModal?: () => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onNavigate,
  goldRate,
  onOpenAuthModal,
}) => {
  const wishlistedProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  const currentUser: UserProfile | null = getStoredUserProfile();

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#524346]" aria-label="Breadcrumbs">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline focus:outline-none">
          Home
        </button>
        <span>/</span>
        <span className="text-[#370617] font-semibold">Your Saved Wishlist ({wishlistedProducts.length})</span>
      </nav>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#d7c1c4] pb-4 gap-3">
        <div>
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#B88A44] font-bold">
            CURATED PERSONAL COLLECTION
          </span>
          <h1 className="font-serif-display text-3xl md:text-4xl text-[#370617] font-bold">
            Saved Wishlist Pieces
          </h1>
          <p className="font-sans text-xs text-[#524346] mt-1">
            Keep track of your favorite gold chokers, haarams, and bridal jewelry creations.
          </p>
        </div>

        {/* Cloud Sync Status Indicator */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <div className="bg-[#1F7A52]/10 border border-[#1F7A52]/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-[#1F7A52] font-semibold">
              <span className="material-symbols-outlined text-sm">cloud_done</span>
              <span>Saved to Firebase ({currentUser.name.split(' ')[0]})</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="bg-[#370617] text-[#FAF6F0] hover:bg-[#521b2b] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-[#C7E24E]">cloud_upload</span>
              <span>Sign In to Save Across Devices</span>
            </button>
          )}
        </div>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4">
          <span className="material-symbols-outlined text-5xl text-[#370617]/40">favorite_border</span>
          <h2 className="font-serif-display text-2xl font-bold text-[#370617]">
            Your Wishlist is Empty
          </h2>
          <p className="font-sans text-xs text-[#524346]">
            Browse our catalogue and click the heart icon to save items for later.
          </p>
          <button
            onClick={() => onNavigate('catalog')}
            className="bg-[#370617] text-white px-6 py-3 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors min-h-[44px]"
          >
            Explore Gold Catalogue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistedProducts.map((product) => {
            const livePrice = getLiveProductPrice(product, goldRate);

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#d7c1c4] overflow-hidden shadow-sm hover:shadow-md transition-all p-4 space-y-4 flex flex-col justify-between"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-[#fef0f1]">
                  <img
                    src={product.images.main}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => onToggleWishlist(product)}
                    className="absolute top-2 right-2 min-w-[44px] min-h-[44px] bg-white/90 rounded-full text-[#ba1a1a] hover:bg-white shadow-md flex items-center justify-center focus:ring-2 focus:ring-[#ba1a1a] focus:outline-none"
                    aria-label={`Remove ${product.name} from Wishlist`}
                    title="Remove from Wishlist"
                  >
                    <span className="material-symbols-outlined text-xl" data-weight="fill">
                      favorite
                    </span>
                  </button>
                  <span className="absolute top-2 left-2 bg-[#370617] text-white font-data text-[10px] px-2.5 py-1 rounded-md font-bold">
                    {product.purityBadge}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#370617]/70 font-bold">
                    {product.category}
                  </span>
                  <h2 className="font-serif-display text-base font-bold text-[#370617] truncate">
                    {product.name}
                  </h2>
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#f2e5e6]">
                    <span className="font-data text-xs text-[#370617] font-semibold">{product.weightGrams}g</span>
                    <span className="font-data text-base font-bold text-[#370617]">
                      ₹{livePrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-[#370617] text-white py-3 min-h-[44px] rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors flex items-center justify-center gap-2 focus:ring-2 focus:ring-[#370617]"
                >
                  <span className="material-symbols-outlined text-lg">shopping_bag</span>
                  <span>Move To Shopping Bag</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
