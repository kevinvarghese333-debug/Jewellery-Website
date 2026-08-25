import React, { useState, useEffect } from 'react';
import { calculatePriceBreakdown, CURRENT_GOLD_RATE_22K, getGoldRateForPurity } from '../data/products';
import { PurityType } from '../types';

interface GoldRateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  goldRate: number;
  setGoldRate: (rate: number) => void;
}

export const GoldRateCalculatorModal: React.FC<GoldRateCalculatorModalProps> = ({
  isOpen,
  onClose,
  goldRate,
  setGoldRate,
}) => {
  const [weight, setWeight] = useState<number>(10);
  const [purity, setPurity] = useState<PurityType>('22K');
  const [customRateInput, setCustomRateInput] = useState<number>(goldRate);
  const [appliedNotice, setAppliedNotice] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && goldRate > 0) {
      setCustomRateInput(goldRate);
    }
  }, [isOpen, goldRate]);

  if (!isOpen) return null;

  const rate18k = getGoldRateForPurity('18K', customRateInput);
  const rate14k = getGoldRateForPurity('14K', customRateInput);
  const breakdown = calculatePriceBreakdown(weight, purity, customRateInput);

  const handleApplyCustomRate = () => {
    if (customRateInput >= 5000) {
      setGoldRate(customRateInput);
      setAppliedNotice(true);
      setTimeout(() => {
        setAppliedNotice(false);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1C1410]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#fff8f7] border border-[#d7c1c4] rounded-lg max-w-lg w-full p-6 shadow-2xl relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#847375] hover:text-[#370617] p-1 transition-colors"
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 border-b border-[#d7c1c4] pb-3">
          <span className="material-symbols-outlined text-[#B88A44] text-2xl">calculate</span>
          <div>
            <h3 className="font-serif-display text-xl text-[#370617] font-bold">
              Real-Time Gold Estimator
            </h3>
            <p className="font-sans text-xs text-[#524346]">
              Calculate live value based on daily market bullion benchmarks for 22K, 18K, and 14K gold.
            </p>
          </div>
        </div>

        {/* Live Rates Display */}
        <div className="grid grid-cols-3 gap-2 mb-5 text-center">
          <div className="bg-[#fef0f1] p-2.5 rounded-lg border border-[#d7c1c4] flex flex-col justify-between">
            <span className="block text-[10px] font-brand uppercase tracking-wider text-[#847375] font-bold">
              22K Standard (916)
            </span>
            <span className="font-data font-bold text-sm sm:text-base text-[#370617] my-0.5">
              ₹{customRateInput.toLocaleString()}/g
            </span>
            <span className="text-[9.5px] font-data text-[#875E26] font-semibold">
              8g (Pavan): ₹{(customRateInput * 8).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#fef0f1] p-2.5 rounded-lg border border-[#d7c1c4] flex flex-col justify-between">
            <span className="block text-[10px] font-brand uppercase tracking-wider text-[#847375] font-bold">
              18K Fine (750)
            </span>
            <span className="font-data font-bold text-sm sm:text-base text-[#370617] my-0.5">
              ₹{rate18k.toLocaleString()}/g
            </span>
            <span className="text-[9.5px] font-data text-[#875E26] font-semibold">
              8g: ₹{(rate18k * 8).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#fef0f1] p-2.5 rounded-lg border border-[#d7c1c4] flex flex-col justify-between">
            <span className="block text-[10px] font-brand uppercase tracking-wider text-[#847375] font-bold">
              14K Everyday (585)
            </span>
            <span className="font-data font-bold text-sm sm:text-base text-[#370617] my-0.5">
              ₹{rate14k.toLocaleString()}/g
            </span>
            <span className="text-[9.5px] font-data text-[#875E26] font-semibold">
              8g: ₹{(rate14k * 8).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Calculator Form */}
        <div className="space-y-4">
          <div>
            <label htmlFor="jewellery-weight-input" className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#370617] mb-1">
              Jewellery Gross Weight (Grams)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="jewellery-weight-input"
                type="number"
                min="0.5"
                max="500"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded-lg px-3 py-2 font-data text-sm text-[#370617] focus:outline-none focus:ring-2 focus:ring-[#370617] min-h-[44px]"
              />
              <div className="flex gap-1">
                {[8, 16, 32, 50].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeight(w)}
                    className={`px-2.5 py-2 min-h-[44px] text-xs rounded-lg border transition-colors font-bold ${
                      weight === w
                        ? 'bg-[#370617] text-white border-[#370617]'
                        : 'bg-white border-[#d7c1c4] text-[#370617] hover:bg-[#f2e5e6]'
                    }`}
                  >
                    {w}g
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-sans uppercase tracking-wider font-semibold text-[#370617] mb-1">
              Gold Purity Tag
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['22K', '18K', '14K'] as PurityType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurity(p)}
                  className={`py-2.5 min-h-[44px] text-xs font-bold rounded-lg border transition-colors ${
                    purity === p
                      ? 'bg-[#370617] text-white border-[#370617]'
                      : 'bg-white border-[#d7c1c4] text-[#370617] hover:bg-[#f2e5e6]'
                  }`}
                >
                  {p} {p === '22K' ? '(916)' : p === '18K' ? '(750)' : '(585)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="bullion-rate-input" className="text-xs font-sans uppercase tracking-wider font-semibold text-[#370617]">
                Update 22K Bullion Gold Rate (₹/g)
              </label>
              <button
                type="button"
                onClick={() => setCustomRateInput(CURRENT_GOLD_RATE_22K)}
                className="text-xs text-[#B88A44] hover:underline font-semibold"
              >
                Reset Default (₹15,010)
              </button>
            </div>
            <div className="flex gap-2">
              <input
                id="bullion-rate-input"
                type="number"
                value={customRateInput}
                onChange={(e) => setCustomRateInput(parseInt(e.target.value) || 0)}
                className="w-full bg-[#ffffff] border border-[#d7c1c4] rounded-lg px-3 py-2 font-data text-xs text-[#370617] focus:outline-none focus:ring-2 focus:ring-[#370617] min-h-[44px]"
              />
              <button
                type="button"
                onClick={handleApplyCustomRate}
                className={`${
                  appliedNotice ? 'bg-[#10B981]' : 'bg-[#B88A44] hover:bg-[#7e5714]'
                } text-white px-4 py-2 min-h-[44px] rounded-lg text-xs font-sans uppercase tracking-wider font-bold transition-all whitespace-nowrap focus:ring-2 focus:ring-[#370617]`}
              >
                {appliedNotice ? '✓ Applied Live!' : 'Apply to Store'}
              </button>
            </div>
          </div>
        </div>

        {/* Estimation Breakdown Card */}
        <div className="mt-5 bg-[#FAF6F0] p-4 rounded border border-[#b88a44]/30 space-y-2">
          <span className="block text-xs uppercase tracking-widest text-[#B88A44] font-semibold border-b border-[#b88a44]/20 pb-1 mb-2">
            Estimated Price Breakdown ({weight}g @ {purity})
          </span>
          <div className="flex justify-between text-xs text-[#524346]">
            <span>Raw Gold Value ({weight}g × ₹{purity === '22K' ? customRateInput.toLocaleString() : purity === '18K' ? rate18k.toLocaleString() : rate14k.toLocaleString()})</span>
            <span className="font-data font-semibold">₹{breakdown.goldValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#524346]">
            <span>Craftsmanship & Making (8%)</span>
            <span className="font-data">₹{breakdown.makingCharges.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#524346]">
            <span>Wastage Charge (2%)</span>
            <span className="font-data">₹{breakdown.wastage.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#524346]">
            <span>BIS Hallmarking Charge</span>
            <span className="font-data">₹{breakdown.bisHallmarking.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs text-[#524346]">
            <span>GST Tax (3%)</span>
            <span className="font-data">₹{breakdown.gst.toLocaleString()}</span>
          </div>
          <div className="border-t border-[#d7c1c4] pt-2 mt-2 flex justify-between items-center">
            <span className="font-serif-display text-sm text-[#370617] font-bold">Total Estimated Value ({purity})</span>
            <span className="font-data text-base font-bold text-[#370617]">
              ₹{breakdown.total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#370617] text-white px-5 py-2 rounded text-xs uppercase tracking-widest font-semibold hover:bg-[#521b2b] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
