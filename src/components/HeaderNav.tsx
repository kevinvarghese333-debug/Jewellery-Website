import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveView } from '../types';

interface HeaderNavProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  cartCount: number;
  cartTotal?: number;
  wishlistCount: number;
  goldRate: number;
  onOpenSearch?: () => void;
  onOpenGoldCalc?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeView,
  setActiveView,
  cartCount,
  cartTotal = 0,
  wishlistCount,
  goldRate,
  onOpenSearch,
  onOpenGoldCalc,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);

  // Loyalty Points Calculation: Base welcome points + 1 point per ₹100 spent in cart
  const BASE_WELCOME_POINTS = 250;
  const cartPoints = Math.floor(cartTotal / 100);
  const totalPoints = BASE_WELCOME_POINTS + cartPoints;

  return (
    <>
      {/* 1. Announcement Bar / Mobile High-Visibility Banner */}
      <div className="bg-[#f2e5e6] w-full py-2 px-3 sm:px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-[#370617] border-b border-[#d7c1c4] z-50 text-xs font-sans gap-2 md:gap-0">
        <div className="flex items-center justify-between w-full md:w-auto">
          <button
            onClick={() => setActiveView('onam-campaign')}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 bg-[#370617] text-[#C7E24E] px-3 py-1.5 rounded-full font-extrabold uppercase tracking-wider text-[11px] hover:bg-[#521b2b] transition-all shadow-sm focus:ring-2 focus:ring-[#370617]"
          >
            <span className="material-symbols-outlined text-xs animate-pulse">auto_awesome</span>
            <span>🌼 ONAM SURPRISE: REVEAL ₹50 - ₹50,000 →</span>
          </button>
          <span className="hidden md:inline text-[#d7c1c4] ml-3">|</span>
          <span className="hidden md:flex items-center gap-1 font-medium text-xs">
            <span className="material-symbols-outlined text-sm">verified</span>
            100% BIS Hallmarked Jewellery
          </span>
        </div>

        <div className="flex items-center justify-center space-x-3 w-full md:w-auto">
          <button 
            onClick={onOpenGoldCalc}
            className="flex items-center gap-1 hover:text-[#6B1F2A] transition-colors font-medium bg-[#ffffff]/70 px-2.5 py-1 rounded border border-[#b88a44]/30 min-h-[32px]"
            title="Click to view Gold Rate Calculator"
          >
            <span className="material-symbols-outlined text-xs text-[#B88A44]">trending_up</span>
            <span>Gold Rate (22K): <strong className="font-data text-[#370617]">₹{goldRate.toLocaleString()}/gm</strong></span>
            <span className="text-[10px] text-[#7e5714] underline ml-1 font-bold">Calc</span>
          </button>
          <span className="text-[#d7c1c4]">|</span>
          <span className="text-[#524346] text-[10px] sm:text-[11px]">Updated at 10:30 AM</span>
        </div>
      </div>

      {/* 2. Sticky Top Navigation Bar */}
      <header className="bg-[#fff8f7]/95 backdrop-blur-md text-[#370617] top-0 sticky border-b border-[#d7c1c4] shadow-sm z-40 transition-all duration-300">
        <div className="flex justify-between items-center w-full px-4 md:px-12 py-2.5 max-w-7xl mx-auto">
          {/* Mobile Menu Toggle - Min 44px Touch Target */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-[#370617] hover:bg-[#f2e5e6] rounded-lg transition-colors focus:ring-2 focus:ring-[#370617] focus:outline-none"
          >
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          {/* Logo */}
          <button 
            onClick={() => setActiveView('home')} 
            className="text-left focus:outline-none focus:ring-2 focus:ring-[#370617] rounded-lg p-1"
            aria-label="Kavitha Jewellery Home"
          >
            <Logo variant="horizontal" size="md" />
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8" aria-label="Main Navigation">
            <button 
              onClick={() => setActiveView('onam-campaign')}
              className={`font-sans text-xs uppercase tracking-widest transition-all duration-200 py-1.5 flex items-center gap-1 focus:ring-2 focus:ring-[#370617] rounded px-1 ${
                activeView === 'onam-campaign' 
                  ? 'text-[#370617] border-b-2 border-[#370617] font-bold' 
                  : 'text-[#B88A44] font-bold hover:text-[#370617]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">card_giftcard</span>
              <span>Onam Surprise</span>
            </button>

            <button 
              onClick={() => setActiveView('catalog')}
              className={`font-sans text-xs uppercase tracking-widest transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1 ${
                activeView === 'catalog' 
                  ? 'text-[#370617] border-b-2 border-[#370617] font-semibold' 
                  : 'text-[#370617]/80 hover:text-[#370617]'
              }`}
            >
              Gold Catalogue
            </button>

            <button 
              onClick={() => setActiveView('catalog')}
              className="font-sans text-xs uppercase tracking-widest text-[#370617]/80 hover:text-[#370617] transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1"
            >
              Earrings
            </button>

            <button 
              onClick={() => setActiveView('catalog')}
              className="font-sans text-xs uppercase tracking-widest text-[#370617]/80 hover:text-[#370617] transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1"
            >
              Necklaces
            </button>

            <button 
              onClick={() => setActiveView('catalog')}
              className="font-sans text-xs uppercase tracking-widest text-[#370617]/80 hover:text-[#370617] transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1"
            >
              Bangles
            </button>

            <button 
              onClick={() => setActiveView('home')}
              className="font-sans text-xs uppercase tracking-widest text-[#370617]/80 hover:text-[#370617] transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1"
            >
              Bridal Trousseau
            </button>

            <button 
              onClick={() => setActiveView('locations')}
              className="font-sans text-xs uppercase tracking-widest text-[#370617]/80 hover:text-[#370617] transition-all duration-200 py-1.5 focus:ring-2 focus:ring-[#370617] rounded px-1"
            >
              Showrooms
            </button>
          </nav>

          {/* Action Icons - Min 44px Touch Targets */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Loyalty Points Tracker Badge */}
            <button
              onClick={() => setShowLoyaltyModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-[#370617] to-[#521b2b] text-[#FAF6F0] px-2.5 sm:px-3 py-1 rounded-full border border-[#B88A44]/40 hover:border-[#C7E24E] transition-all focus:ring-2 focus:ring-[#370617] focus:outline-none shadow-sm group min-h-[40px]"
              title="Kavitha Loyalty Rewards Tracker"
              aria-label={`Loyalty Points: ${totalPoints.toLocaleString()} points`}
            >
              <span className="material-symbols-outlined text-base text-[#C7E24E] group-hover:scale-110 transition-transform">
                stars
              </span>
              <div className="text-left font-sans leading-tight">
                <span className="text-[9px] uppercase tracking-wider text-[#C7E24E] font-extrabold block">
                  REWARDS
                </span>
                <span className="text-xs font-data font-bold text-[#FAF6F0]">
                  {totalPoints.toLocaleString()} <span className="text-[10px] text-[#C7E24E]">pts</span>
                </span>
              </div>
            </button>

            <button 
              onClick={onOpenSearch}
              aria-label="Search Catalogue" 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#370617] hover:bg-[#f2e5e6] rounded-full transition-all focus:ring-2 focus:ring-[#370617] focus:outline-none"
              title="Search Catalogue"
            >
              <span className="material-symbols-outlined text-xl">search</span>
            </button>

            <button 
              onClick={() => setActiveView('locations')}
              aria-label="Showroom Locator" 
              className="min-w-[44px] min-h-[44px] items-center justify-center text-[#370617] hover:bg-[#f2e5e6] rounded-full transition-all hidden sm:flex focus:ring-2 focus:ring-[#370617] focus:outline-none"
              title="Showroom Locator"
            >
              <span className="material-symbols-outlined text-xl">location_on</span>
            </button>

            <button 
              onClick={() => setActiveView('wishlist')}
              aria-label={`Wishlist (${wishlistCount} items)`} 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#370617] hover:bg-[#f2e5e6] rounded-full transition-all relative focus:ring-2 focus:ring-[#370617] focus:outline-none"
              title="Saved Wishlist"
            >
              <span className="material-symbols-outlined text-xl">favorite</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#B88A44] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveView('cart')}
              aria-label={`Shopping Bag (${cartCount} items)`} 
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#370617] hover:bg-[#f2e5e6] rounded-full transition-all relative focus:ring-2 focus:ring-[#370617] focus:outline-none"
              title="Shopping Bag"
            >
              <span className="material-symbols-outlined text-xl" data-weight={cartCount > 0 ? "fill" : undefined}>
                shopping_bag
              </span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#ba1a1a] text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#fff8f7] border-b border-[#d7c1c4] px-6 py-5 space-y-3 font-sans text-sm animate-fadeIn shadow-lg">
            {/* Mobile Loyalty Rewards Row */}
            <button
              onClick={() => { setShowLoyaltyModal(true); setMobileMenuOpen(false); }}
              className="w-full bg-[#370617] text-[#FAF6F0] p-3 rounded-xl flex items-center justify-between border border-[#B88A44]/40"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#C7E24E]">stars</span>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-[#C7E24E] block">Loyalty Rewards</span>
                  <span className="text-xs font-sans text-white">Earn points on cart items</span>
                </div>
              </div>
              <span className="font-data font-bold text-sm text-[#C7E24E]">{totalPoints.toLocaleString()} PTS</span>
            </button>

            <button 
              onClick={() => { setActiveView('home'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-left py-2.5 font-bold text-[#370617] border-b border-[#f2e5e6]"
            >
              <span className="material-symbols-outlined text-lg">home</span>
              <span>Home</span>
            </button>

            <button 
              onClick={() => { setActiveView('catalog'); setMobileMenuOpen(false); }}
              className="flex items-center justify-between w-full text-left py-2.5 text-[#370617] font-semibold border-b border-[#f2e5e6]"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">grid_view</span>
                <span>Gold Jewellery Catalogue</span>
              </span>
              <span className="text-xs bg-[#370617] text-white px-2 py-0.5 rounded font-data">22K / 916</span>
            </button>

            <button 
              onClick={() => { setActiveView('onam-campaign'); setMobileMenuOpen(false); }}
              className="flex items-center justify-between w-full text-left p-3 bg-gradient-to-r from-[#370617] to-[#521b2b] text-[#C7E24E] font-bold rounded-xl shadow-md border border-[#C7E24E]/30 my-2 focus:ring-2 focus:ring-[#C7E24E]"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[#C7E24E]">card_giftcard</span>
                <span className="text-xs uppercase tracking-wider">Onam Surprise Offer (₹50k)</span>
              </span>
              <span className="text-[10px] bg-[#C7E24E] text-[#370617] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold">REVEAL</span>
            </button>

            <button 
              onClick={() => { onOpenGoldCalc?.(); setMobileMenuOpen(false); }}
              className="flex items-center justify-between w-full text-left py-2.5 text-[#370617] border-b border-[#f2e5e6]"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-[#B88A44]">trending_up</span>
                <span>Gold Rate Estimator</span>
              </span>
              <span className="font-data font-bold text-xs text-[#370617]">₹{goldRate.toLocaleString()}/g</span>
            </button>

            <button 
              onClick={() => { setActiveView('locations'); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full text-left py-2.5 text-[#370617] border-b border-[#f2e5e6]"
            >
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span>Flagship Showroom Locator</span>
            </button>

            <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => { setActiveView('staff-redemption'); setMobileMenuOpen(false); }}
                className="bg-[#f2e5e6] text-[#370617] font-semibold py-2 px-3 rounded text-center"
              >
                Staff Portal
              </button>
              <button 
                onClick={() => { setActiveView('campaign-admin'); setMobileMenuOpen(false); }}
                className="bg-[#FAF6F0] text-[#370617] border border-[#b88a44]/40 font-semibold py-2 px-3 rounded text-center"
              >
                Admin Panel
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Floating Quick-Access Badge for Onam Campaign */}
      {activeView !== 'onam-campaign' && (
        <button
          onClick={() => setActiveView('onam-campaign')}
          className="lg:hidden fixed bottom-16 right-3 bg-[#370617] text-[#C7E24E] border-2 border-[#C7E24E] px-3 py-2 rounded-full font-extrabold text-[11px] shadow-2xl flex items-center gap-1.5 z-40 active:scale-95 transition-all animate-bounce"
          aria-label="Open Onam Campaign Offer"
        >
          <span className="material-symbols-outlined text-sm">auto_awesome</span>
          <span>Onam Offer (₹50K)</span>
        </button>
      )}

      {/* Interactive Loyalty Points Breakdown Modal */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#fff8f7] border-2 border-[#B88A44] rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoyaltyModal(false)}
              className="absolute top-4 right-4 text-[#370617]/60 hover:text-[#370617] min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-[#f2e5e6] transition-colors"
              aria-label="Close Rewards Modal"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 bg-[#370617] text-[#C7E24E] rounded-2xl mx-auto flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-3xl">stars</span>
              </div>
              <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-[#B88A44] font-extrabold block">
                KAVITHA SOVEREIGN CLUB
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#370617]">
                Your Loyalty Points Tracker
              </h3>
            </div>

            {/* Points Display Card */}
            <div className="bg-gradient-to-br from-[#370617] via-[#521b2b] to-[#370617] text-[#FAF6F0] p-5 rounded-2xl border border-[#C7E24E]/40 shadow-inner text-center space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold block">
                TOTAL ACCUMULATED POINTS
              </span>
              <div className="font-data text-4xl font-extrabold text-[#C7E24E]">
                {totalPoints.toLocaleString()} <span className="text-lg text-white font-normal">PTS</span>
              </div>
              <p className="text-xs text-[#FAF6F0]/80 font-sans">
                Equivalent value: <strong className="text-[#C7E24E]">₹{totalPoints.toLocaleString()} Off</strong> future making charges!
              </p>
            </div>

            {/* Cart Earnings Breakdown */}
            <div className="bg-white p-4 rounded-xl border border-[#d7c1c4] space-y-2 text-xs font-sans">
              <div className="flex justify-between items-center text-[#524346] border-b border-[#f2e5e6] pb-2">
                <span>Welcome Signup Bonus</span>
                <span className="font-data font-bold text-[#370617]">+{BASE_WELCOME_POINTS} pts</span>
              </div>
              <div className="flex justify-between items-center text-[#524346]">
                <span>Points Earned From Cart (10 pts per ₹1,000)</span>
                <span className="font-data font-bold text-[#1F7A52]">+{cartPoints.toLocaleString()} pts</span>
              </div>
              {cartTotal > 0 ? (
                <p className="text-[11px] text-[#1F7A52] bg-[#FAF6F0] p-2 rounded border border-[#b88a44]/30 font-medium pt-2">
                  ✓ Active Cart Subtotal: <strong className="font-data">₹{cartTotal.toLocaleString()}</strong>. Awarding +10 pts for every ₹1,000 in your shopping bag!
                </p>
              ) : (
                <p className="text-[11px] text-[#847375] italic pt-1">
                  Add 22K gold items to your cart to instantly earn +10 points per ₹1,000 spent!
                </p>
              )}
            </div>

            {/* Tier Progress */}
            <div className="space-y-1.5 font-sans text-xs">
              <div className="flex justify-between font-bold text-[#370617]">
                <span>Current Member Tier</span>
                <span className="text-[#B88A44]">
                  {totalPoints >= 5000 ? '👑 Royal Heritage VIP' : totalPoints >= 1000 ? '💎 Diamond Elite Member' : '✨ Gold Sovereign Member'}
                </span>
              </div>
              <div className="w-full bg-[#f2e5e6] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#370617] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (totalPoints / 5000) * 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowLoyaltyModal(false);
                  setActiveView('cart');
                }}
                className="flex-1 bg-[#370617] hover:bg-[#521b2b] text-white py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-all shadow"
              >
                View Shopping Bag
              </button>
              <button
                onClick={() => setShowLoyaltyModal(false)}
                className="px-4 bg-[#f2e5e6] hover:bg-[#d7c1c4] text-[#370617] py-3 rounded-xl font-sans text-xs uppercase font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
