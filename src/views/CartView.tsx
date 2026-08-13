import React, { useState } from 'react';
import { CartItem, ActiveView } from '../types';
import { calculatePriceBreakdown } from '../data/products';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart?: () => void;
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  goldRate,
}) => {
  const [giftNotes, setGiftNotes] = useState<{ [id: string]: string }>({});
  const [showGiftInput, setShowGiftInput] = useState<{ [id: string]: boolean }>({});
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponNotice, setCouponNotice] = useState<string>('');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'success'>('cart');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeightGrams = cart.reduce((sum, item) => sum + (item.product.weightGrams * item.quantity), 0);

  // Calculate totals across cart
  const totalGoldValue = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.goldValue * item.quantity);
  }, 0);

  const totalMakingCharges = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.makingCharges * item.quantity);
  }, 0);

  const totalTaxes = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.gst * item.quantity);
  }, 0);

  const subtotalBeforeDiscount = cart.reduce((sum, item) => {
    const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
    return sum + (bd.total * item.quantity);
  }, 0);

  const finalGrandTotal = Math.max(0, subtotalBeforeDiscount - appliedDiscount);

  // Apply Promo Coupon Handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    if (clean.includes('ONAM-50000') || clean === 'ONAM50K') {
      const discount = Math.min(50000, totalMakingCharges * 0.5);
      setAppliedDiscount(discount);
      setCouponNotice(`✓ Festive Voucher Applied! ₹${discount.toLocaleString()} discount on making charges.`);
    } else if (clean.includes('ONAM-25000') || clean === 'ONAM25K') {
      const discount = Math.min(25000, totalMakingCharges * 0.5);
      setAppliedDiscount(discount);
      setCouponNotice(`✓ Festive Voucher Applied! ₹${discount.toLocaleString()} discount on making charges.`);
    } else if (clean.includes('ONAM-5000') || clean === 'ONAM5K') {
      const discount = Math.min(5000, totalMakingCharges * 0.5);
      setAppliedDiscount(discount);
      setCouponNotice(`✓ Festive Voucher Applied! ₹${discount.toLocaleString()} discount on making charges.`);
    } else if (clean.includes('ONAM') || clean === 'FESTIVE1000') {
      const discount = Math.min(1000, totalMakingCharges * 0.5);
      setAppliedDiscount(discount);
      setCouponNotice(`✓ Onam Discount Code Applied! ₹${discount.toLocaleString()} off.`);
    } else {
      setAppliedDiscount(0);
      setCouponNotice('⚠️ Invalid or expired voucher code. Try "ONAM5K" or enter your raffle code.');
    }
  };

  const handleCheckoutSuccess = () => {
    setCheckoutStep('success');
    if (onClearCart) {
      onClearCart();
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 animate-fadeIn">
        <div className="w-16 h-16 bg-[#FAF6F0] border border-[#B88A44] text-[#B88A44] rounded-full flex items-center justify-center mx-auto shadow-md">
          <span className="material-symbols-outlined text-3xl">verified</span>
        </div>
        <h2 className="font-serif-display text-3xl font-bold text-[#370617]">
          Order Confirmed & Secured
        </h2>
        <p className="font-sans text-xs text-[#524346] leading-relaxed max-w-md mx-auto">
          Your order <strong className="text-[#370617] font-data">#KVG-2026-98214</strong> has been placed. You will receive an SMS and WhatsApp notification with live GPS tracking from our insured bullion logistics partner.
        </p>

        <div className="bg-white p-5 rounded-xl border border-[#d7c1c4] space-y-3 text-xs font-sans text-left shadow-sm">
          <div className="flex justify-between border-b border-[#f2e5e6] pb-2">
            <span className="text-[#847375]">Total Amount Paid</span>
            <span className="font-data font-bold text-[#370617]">₹{finalGrandTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-b border-[#f2e5e6] pb-2">
            <span className="text-[#847375]">Insured Transit Courier</span>
            <span className="text-[#1F7A52] font-semibold">Free Express Courier</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#847375]">Authenticity Certificate</span>
            <span className="text-[#370617] font-semibold">100% BIS 22K Hallmarked</span>
          </div>
        </div>

        <button
          onClick={() => {
            setCheckoutStep('cart');
            onNavigate('catalog');
          }}
          className="bg-[#370617] text-white px-8 py-3.5 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors min-h-[44px]"
        >
          Explore Catalogue Collections
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4 animate-fadeIn">
        <div className="w-16 h-16 bg-[#f2e5e6] text-[#370617] rounded-full flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl">shopping_bag</span>
        </div>
        <h2 className="font-serif-display text-2xl font-bold text-[#370617]">
          Your Shopping Bag is Empty
        </h2>
        <p className="font-sans text-xs text-[#524346] max-w-sm mx-auto">
          Explore our certified 22K/916 gold chokers, haarams, bangles, and bridal collections.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="bg-[#370617] text-white px-8 py-3.5 rounded-lg font-sans text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors min-h-[44px] shadow"
        >
          Explore Gold Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs font-sans text-[#847375]" aria-label="Breadcrumbs">
        <button onClick={() => onNavigate('home')} className="hover:text-[#370617] hover:underline focus:outline-none">
          Home
        </button>
        <span>/</span>
        <span className="text-[#370617] font-semibold">Shopping Bag ({totalItems})</span>
      </nav>

      {/* Title & Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-[#d7c1c4] pb-4 gap-2">
        <div>
          <span className="text-[10px] font-sans uppercase tracking-widest text-[#B88A44] font-bold">
            SESSION SAVED SHOPPING BAG
          </span>
          <h1 className="font-serif-display text-3xl md:text-4xl text-[#370617] font-bold">
            Your Shopping Bag ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
          </h1>
          <p className="font-sans text-xs text-[#524346] mt-1 flex items-center gap-2">
            <span>Total Gross Weight: <strong className="font-data text-[#370617]">{totalWeightGrams.toFixed(2)}g</strong></span>
            <span>•</span>
            <span className="text-[#1F7A52] font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">lock</span>
              Cart items persist for active session
            </span>
          </p>
        </div>

        {onClearCart && cart.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-xs font-sans text-[#ba1a1a] hover:underline flex items-center gap-1 font-semibold focus:outline-none py-1"
          >
            <span className="material-symbols-outlined text-sm">delete_sweep</span>
            <span>Clear Shopping Bag</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const bd = calculatePriceBreakdown(item.product.weightGrams, item.selectedPurity, goldRate);
            const itemTotal = bd.total * item.quantity;

            return (
              <div
                key={`${item.product.id}-${item.selectedPurity}`}
                className="bg-white p-5 rounded-2xl border border-[#d7c1c4] shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <img
                    src={item.product.images.main}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-xl bg-[#fef0f1] border border-[#d7c1c4] shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="inline-block bg-[#370617] text-white text-[9px] font-data px-2 py-0.5 rounded font-bold">
                      {item.selectedPurity} / 916 BIS Hallmark
                    </span>
                    <h2 className="font-serif-display text-base font-bold text-[#370617]">
                      {item.product.name}
                    </h2>
                    <p className="font-sans text-xs text-[#524346]">
                      Gross Weight: <strong className="font-data">{item.product.weightGrams}g</strong>
                    </p>

                    {/* Gift note checkbox */}
                    <button
                      onClick={() =>
                        setShowGiftInput((prev) => ({ ...prev, [item.product.id]: !prev[item.product.id] }))
                      }
                      className="text-[11px] font-sans text-[#B88A44] hover:underline flex items-center gap-1 pt-1"
                    >
                      <span className="material-symbols-outlined text-xs">card_giftcard</span>
                      <span>Add Gift Message or Engraving Request</span>
                    </button>

                    {showGiftInput[item.product.id] && (
                      <input
                        type="text"
                        placeholder="e.g. Happy Wedding Ananya - From Mom & Dad"
                        value={giftNotes[item.product.id] || ''}
                        onChange={(e) =>
                          setGiftNotes((prev) => ({ ...prev, [item.product.id]: e.target.value }))
                        }
                        className="mt-2 w-full bg-[#FAF6F0] border border-[#d7c1c4] text-xs p-2 rounded focus:outline-none focus:border-[#370617]"
                      />
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col justify-between items-end w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-[#f2e5e6] gap-3">
                  <div className="text-right">
                    <span className="font-data text-lg font-bold text-[#370617] block">
                      ₹{itemTotal.toLocaleString()}
                    </span>
                    <span className="block text-[10px] font-sans text-[#847375]">
                      ₹{bd.total.toLocaleString()} × {item.quantity}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#d7c1c4] rounded-lg bg-white overflow-hidden shadow-sm">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center text-base font-bold text-[#370617] hover:bg-[#f2e5e6] focus:outline-none focus:ring-2 focus:ring-[#370617]"
                        aria-label={`Reduce quantity of ${item.product.name}`}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-data text-xs font-bold text-[#370617]">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center text-base font-bold text-[#370617] hover:bg-[#f2e5e6] focus:outline-none focus:ring-2 focus:ring-[#370617]"
                        aria-label={`Increase quantity of ${item.product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-[#370617]/70 hover:text-[#ba1a1a] hover:bg-[#f2e5e6] rounded-full transition-colors focus:ring-2 focus:ring-[#ba1a1a]"
                      aria-label={`Remove ${item.product.name} from cart`}
                      title="Remove item"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary & Coupon Box (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#d7c1c4] shadow-md space-y-5">
            <h2 className="font-serif-display text-xl font-bold text-[#370617] border-b border-[#f2e5e6] pb-3">
              Order Summary
            </h2>

            {/* Price breakdown */}
            <div className="space-y-2.5 font-sans text-xs">
              <div className="flex justify-between text-[#524346]">
                <span>22K Gold Subtotal</span>
                <span className="font-data font-semibold">₹{totalGoldValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#524346]">
                <span>Making Charges (VA)</span>
                <span className="font-data font-semibold">₹{totalMakingCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#524346]">
                <span>Taxes & GST (3%)</span>
                <span className="font-data font-semibold">₹{totalTaxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[#524346]">
                <span>Insured Doorstep Courier</span>
                <span className="text-[#1F7A52] font-semibold">FREE (Covered)</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-[#1F7A52] font-bold border-t border-dashed border-[#d7c1c4] pt-2">
                  <span>Festive Voucher Discount</span>
                  <span className="font-data">- ₹{appliedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="border-t border-[#d7c1c4] pt-3 flex justify-between items-baseline font-bold text-[#370617]">
                <span className="font-serif-display text-base">Grand Total</span>
                <span className="font-data text-2xl">₹{finalGrandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 border-t border-[#f2e5e6] pt-4">
              <label htmlFor="cart-coupon" className="block text-xs font-sans font-bold text-[#370617]">
                Have an Onam Raffle Coupon?
              </label>
              <div className="flex gap-2">
                <input
                  id="cart-coupon"
                  type="text"
                  placeholder="e.g. ONAM5K"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-[#FAF6F0] border border-[#d7c1c4] rounded-lg px-3 py-2 text-xs font-data font-bold text-[#370617] uppercase focus:outline-none focus:border-[#370617]"
                />
                <button
                  type="submit"
                  className="bg-[#370617] text-white px-4 py-2 rounded-lg font-sans text-xs uppercase font-bold hover:bg-[#521b2b] transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponNotice && (
                <p className="text-[11px] text-[#370617] bg-[#FAF6F0] p-2 rounded border border-[#b88a44]/30">
                  {couponNotice}
                </p>
              )}
            </form>

            <button
              onClick={handleCheckoutSuccess}
              className="w-full bg-[#370617] hover:bg-[#521b2b] text-white py-3.5 rounded-lg font-sans text-xs uppercase tracking-[0.18em] font-bold shadow-lg transition-all duration-200 min-h-[48px]"
            >
              PROCEED TO SECURE CHECKOUT
            </button>

            <div className="bg-[#FAF6F0] p-4 rounded-xl border border-[#b88a44]/30 space-y-2 text-xs font-sans text-[#524346]">
              <div className="flex items-center gap-2 text-[#370617] font-semibold">
                <span className="material-symbols-outlined text-[#B88A44]">verified</span>
                <span>Kavitha Guarantee Included</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                • 100% BIS 22K Hallmarked stamp & individual assay certificate.<br />
                • Tamper-evident velvet vault box with live transit insurance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
