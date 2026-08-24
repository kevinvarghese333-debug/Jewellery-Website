import React, { useState } from 'react';
import { ActiveView, OnamCoupon } from '../types';
import { getCouponByCode, redeemCouponInStore, calculateEffectiveMakingChargeDiscount } from '../data/campaignData';
import { Logo } from '../components/Logo';

interface StaffRedemptionViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const StaffRedemptionView: React.FC<StaffRedemptionViewProps> = ({ onNavigate }) => {
  const [searchInput, setSearchInput] = useState<string>('KJ-ONAM-7F29');
  const [searchedCoupon, setSearchedCoupon] = useState<OnamCoupon | null>(null);
  const [searchError, setSearchError] = useState<string>('');
  const [selectedStore, setSelectedStore] = useState<string>('Kavitha Jewellery, Cherai');
  
  // Invoice details for 50% making charges capping calculation
  const [invoiceMakingCharges, setInvoiceMakingCharges] = useState<number>(15000);
  const [invoiceGoldValue, setInvoiceGoldValue] = useState<number>(120000);

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [redemptionResult, setRedemptionResult] = useState<{ success: boolean; message: string } | null>(null);

  const STORES = [
    'Kavitha Jewellery, Cherai',
    'Kochi Showroom',
    'Thrissur Showroom',
    'Kottayam Showroom',
    'Kozhikode Showroom',
    'Thiruvananthapuram Showroom',
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    setRedemptionResult(null);

    if (!searchInput.trim()) {
      setSearchError('Please enter a coupon code.');
      return;
    }

    const found = getCouponByCode(searchInput);
    if (!found) {
      setSearchError(`Coupon code "${searchInput}" was not found in the campaign database.`);
      setSearchedCoupon(null);
    } else {
      setSearchedCoupon(found);
    }
  };

  const handleConfirmRedeem = () => {
    if (!searchedCoupon) return;
    
    const result = redeemCouponInStore(searchedCoupon.code, selectedStore);
    setShowConfirmModal(false);
    setRedemptionResult({
      success: result.success,
      message: result.message,
    });

    if (result.coupon) {
      setSearchedCoupon(result.coupon);
    }
  };

  // Calculate discount using 50% capping rule
  const discountCalc = searchedCoupon 
    ? calculateEffectiveMakingChargeDiscount(searchedCoupon.discountAmount, invoiceMakingCharges)
    : null;

  return (
    <div className="bg-[#070A0D] text-[#ECEAE2] min-h-screen font-sans -mx-4 md:-mx-12 -mt-6 pb-20 selection:bg-[#C7E24E] selection:text-[#070A0D]">
      {/* Kasavu ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] w-full" />

      {/* Top Staff Navigation Header */}
      <div className="bg-[#20221C] border-b border-[#4E4C4B]/40 px-4 md:px-12 py-3 flex justify-between items-center text-xs">
        <div className="flex items-center gap-3">
          <Logo variant="mark-only" size="sm" />
          <span className="font-bold tracking-wider uppercase text-[#C7E24E]">
            SHOWROOM STAFF COUPON REDEMPTION PORTAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('campaign-admin')}
            className="text-xs text-[#ECEAE2]/80 hover:text-[#C7E24E] flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            <span>Admin Control</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
          <button
            onClick={() => onNavigate('onam-campaign')}
            className="text-xs text-[#ECEAE2]/80 hover:text-[#C7E24E] flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Campaign Landing</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pt-10 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 border-b border-[#4E4C4B]/40 pb-6">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#B88A44] font-semibold">
            KAVITHA JEWELLERY ONAM 2026
          </span>
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#ECEAE2]">
            Staff Voucher Verification & Billing
          </h1>
          <p className="font-sans text-xs text-[#ECEAE2]/70 max-w-md mx-auto">
            Scan or enter the customer's Onam Surprise coupon code to calculate the 50% making charge discount cap and mark as REDEEMED.
          </p>
        </div>

        {/* Store Location Selection */}
        <div className="bg-[#20221C] p-4 rounded-xl border border-[#4E4C4B]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-[#C7E24E]">
            Active Showroom Branch:
          </span>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-[#070A0D] border border-[#4E4C4B] text-[#ECEAE2] rounded-lg px-3 py-2 focus:outline-none focus:border-[#C7E24E] text-xs font-sans"
          >
            {STORES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-4 shadow-xl">
          <label className="block text-xs font-sans uppercase tracking-widest text-[#ECEAE2]/80 font-bold">
            Enter or Scan Coupon Code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. KJ-ONAM-7F29"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              className="flex-1 bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-4 py-3 font-data text-lg font-bold text-[#C7E24E] tracking-widest focus:outline-none focus:border-[#C7E24E]"
            />
            <button
              type="submit"
              className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-6 py-3 rounded-xl font-sans text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">search</span>
              <span>VERIFY</span>
            </button>
          </div>

          {/* Quick Demo Code helper buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-sans text-[#ECEAE2]/60">
            <span>Quick Samples:</span>
            <button
              type="button"
              onClick={() => { setSearchInput('KJ-ONAM-7F29'); setSearchError(''); setSearchedCoupon(getCouponByCode('KJ-ONAM-7F29') || null); }}
              className="text-[#C7E24E] underline hover:text-white font-data"
            >
              KJ-ONAM-7F29 (₹5,000 Unused)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setSearchInput('KJ-ONAM-9K42'); setSearchError(''); setSearchedCoupon(getCouponByCode('KJ-ONAM-9K42') || null); }}
              className="text-[#B88A44] underline hover:text-white font-data"
            >
              KJ-ONAM-9K42 (Redeemed)
            </button>
          </div>
        </form>

        {searchError && (
          <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/40 p-4 rounded-xl text-xs font-sans text-[#ff6b6b] text-center font-semibold">
            {searchError}
          </div>
        )}

        {/* Verification Card Output */}
        {searchedCoupon && (
          <div className="bg-[#20221C] border-2 border-[#C7E24E] rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-start border-b border-[#4E4C4B]/40 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-data text-[#C7E24E] font-bold">
                  COUPON VERIFICATION DETAILS
                </span>
                <h3 className="font-data text-2xl font-bold text-[#ECEAE2] tracking-wider mt-0.5">
                  {searchedCoupon.code}
                </h3>
              </div>

              <span className={`px-3 py-1 rounded font-bold uppercase tracking-widest text-xs ${
                searchedCoupon.status === 'UNUSED' 
                  ? 'bg-[#C7E24E] text-[#070A0D]' 
                  : 'bg-[#ff6b6b] text-white'
              }`}>
                {searchedCoupon.status === 'UNUSED' ? 'COUPON VALID' : 'ALREADY REDEEMED'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B]">
                <span className="text-[#ECEAE2]/60 uppercase tracking-wider text-[10px] block">Customer Name & Contact</span>
                <span className="font-sans text-sm font-bold text-[#ECEAE2] block">
                  {searchedCoupon.userName || 'Guest Participant'}
                </span>
                <span className="font-data text-xs text-[#C7E24E] block mt-0.5">
                  +91 {searchedCoupon.mobile}
                </span>
                {searchedCoupon.userEmail && (
                  <span className="text-[11px] text-[#ECEAE2]/60 block truncate">
                    {searchedCoupon.userEmail}
                  </span>
                )}
              </div>

              <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B]">
                <span className="text-[#ECEAE2]/60 uppercase tracking-wider text-[10px] block">Coupon Nominal Value</span>
                <span className="font-serif-display text-2xl font-bold text-[#C7E24E]">
                  ₹{searchedCoupon.discountAmount.toLocaleString()} OFF
                </span>
              </div>
            </div>

            {/* ========================================================= */}
            {/* INVOICE BILLING CALCULATOR (50% Making Charge Cap) */}
            {/* ========================================================= */}
            {searchedCoupon.status === 'UNUSED' && discountCalc && (
              <div className="bg-[#070A0D] p-5 rounded-xl border border-[#C7E24E]/50 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#C7E24E] font-bold uppercase tracking-wider text-[11px]">
                    INVOICE DISCOUNT CALCULATOR (50% MAKING CHARGE CAPPING RULE)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div>
                    <label className="block text-[#ECEAE2]/70 text-[11px] mb-1">
                      Invoice Jewellery Gold Value (₹)
                    </label>
                    <input
                      type="number"
                      value={invoiceGoldValue}
                      onChange={(e) => setInvoiceGoldValue(Number(e.target.value) || 0)}
                      className="w-full bg-[#141618] border border-[#4E4C4B] p-2 rounded-lg font-data font-bold text-[#ECEAE2]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#C7E24E] font-bold text-[11px] mb-1">
                      Eligible Making Charges Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={invoiceMakingCharges}
                      onChange={(e) => setInvoiceMakingCharges(Number(e.target.value) || 0)}
                      className="w-full bg-[#141618] border border-[#C7E24E] p-2 rounded-lg font-data font-bold text-[#C7E24E]"
                    />
                  </div>
                </div>

                {/* Calculation Output Table */}
                <div className="bg-[#141618] p-4 rounded-lg border border-[#4E4C4B]/40 space-y-2 text-xs font-sans">
                  <div className="flex justify-between">
                    <span className="text-[#ECEAE2]/70">50% Making Charge Threshold:</span>
                    <span className="font-data font-semibold text-[#ECEAE2]">
                      ₹{discountCalc.maxAllowedDiscount50Percent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#4E4C4B]/30 pt-1.5 font-bold">
                    <span className="text-[#C7E24E]">Actual Discount Applied on Bill:</span>
                    <span className="font-data text-base text-[#C7E24E]">
                      - ₹{discountCalc.actualDiscountGranted.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-[#4E4C4B]/30 pt-1.5 text-xs text-[#ECEAE2]">
                    <span>Net Payable Amount (Excl. Taxes):</span>
                    <span className="font-data font-bold text-white text-sm">
                      ₹{Math.max(0, invoiceGoldValue + invoiceMakingCharges - discountCalc.actualDiscountGranted).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* If Redeemed, show Timestamp & Store */}
            {searchedCoupon.status === 'REDEEMED' && (
              <div className="bg-[#ff6b6b]/10 border border-[#ff6b6b]/40 p-4 rounded-xl space-y-1 text-xs font-sans">
                <div className="flex items-center gap-2 text-[#ff6b6b] font-bold uppercase">
                  <span className="material-symbols-outlined text-sm">block</span>
                  <span>Coupon Cannot Be Reused</span>
                </div>
                <p className="text-[#ECEAE2]/80 text-[11px]">
                  Redeemed on: <strong className="font-data text-white">{searchedCoupon.redeemedAt}</strong>
                </p>
                <p className="text-[#ECEAE2]/80 text-[11px]">
                  Branch: <strong className="text-white">{searchedCoupon.redeemedStore}</strong>
                </p>
              </div>
            )}

            {/* Redemption Result Banner */}
            {redemptionResult && (
              <div className={`p-4 rounded-xl border text-xs font-sans font-semibold text-center ${
                redemptionResult.success ? 'bg-[#C7E24E]/20 text-[#C7E24E] border-[#C7E24E]' : 'bg-[#ff6b6b]/20 text-[#ff6b6b] border-[#ff6b6b]'
              }`}>
                {redemptionResult.message}
              </div>
            )}

            {/* CTA to Redeem */}
            {searchedCoupon.status === 'UNUSED' && discountCalc && (
              <button
                onClick={() => setShowConfirmModal(true)}
                className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-4 rounded-xl font-sans text-sm uppercase tracking-[0.18em] font-extrabold shadow-xl transition-all"
              >
                APPLY ₹{discountCalc.actualDiscountGranted.toLocaleString()} DISCOUNT & REDEEM
              </button>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && searchedCoupon && discountCalc && (
          <div className="fixed inset-0 bg-[#070A0D]/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#20221C] border border-[#C7E24E] p-6 rounded-2xl max-w-md w-full space-y-5 text-center shadow-2xl">
              <span className="material-symbols-outlined text-4xl text-[#C7E24E]">
                verified_user
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#ECEAE2]">
                Confirm Store Redemption
              </h3>
              <div className="font-sans text-xs text-[#ECEAE2]/80 space-y-2 bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B] text-left">
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <strong className="text-white">{searchedCoupon.userName || 'Guest'}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Coupon Code:</span>
                  <strong className="font-data text-[#C7E24E]">{searchedCoupon.code}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Coupon Value:</span>
                  <strong>₹{searchedCoupon.discountAmount.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Invoice Making Charge:</span>
                  <strong>₹{invoiceMakingCharges.toLocaleString()}</strong>
                </div>
                <div className="flex justify-between text-[#C7E24E] font-bold border-t border-[#4E4C4B]/40 pt-1.5">
                  <span>Applied Discount (50% Cap):</span>
                  <span>₹{discountCalc.actualDiscountGranted.toLocaleString()} OFF</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-[#ff6b6b]">
                * This action will permanently mark coupon {searchedCoupon.code} as REDEEMED.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-[#070A0D] hover:bg-[#1a1f26] text-[#ECEAE2] border border-[#4E4C4B] py-3 rounded-xl font-bold text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  className="flex-1 bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3 rounded-xl font-bold text-xs uppercase"
                >
                  CONFIRM REDEEM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
