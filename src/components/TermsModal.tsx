import React from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#20221C] border border-[#C7E24E]/40 text-[#ECEAE2] w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden font-sans">
        
        {/* Header Bar */}
        <div className="bg-[#070A0D] border-b border-[#4E4C4B] px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#C7E24E] text-xl">gavel</span>
            <div>
              <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">
                Official Campaign Terms & Conditions
              </h3>
              <p className="text-[11px] text-[#B88A44] font-data">
                Kavitha Jewellery Onam Surprise 2026 • Version v1 (Last Updated: 14th Aug 2026)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#20221C] border border-[#4E4C4B] hover:border-[#C7E24E] text-[#ECEAE2] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Terms Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#ECEAE2]/85 leading-relaxed font-sans">
          
          {/* Headline Summary Box */}
          <div className="bg-[#070A0D] border border-[#C7E24E]/50 p-4 rounded-xl space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C7E24E] block">
              ONAM SURPRISE AT A GLANCE
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-medium text-[#ECEAE2]">
              <div>• <strong>Coupons:</strong> ₹50 to ₹50,000</div>
              <div>• <strong>Validity:</strong> 15 August – 30 September 2026</div>
              <div>• <strong>Limit:</strong> One participant → One coupon</div>
              <div>• <strong>Invoice Limit:</strong> One invoice → One coupon (No clubbing)</div>
              <div>• <strong>Scope:</strong> Applicable ONLY to eligible making charges</div>
              <div>• <strong>Capping:</strong> Max discount = Lower of Coupon or 50% Making Charges</div>
            </div>
          </div>

          <article className="space-y-6 divide-y divide-[#4E4C4B]/30">
            
            {/* Section 1 */}
            <section className="space-y-2 pt-2">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">1. Campaign</h4>
              <p>1.1. The <strong>Kavitha Jewellery Onam Surprise 2026</strong> ("Campaign") is a promotional campaign conducted by <strong>Kavitha Jewellery</strong>.</p>
              <p>1.2. The Campaign provides eligible participants with an Onam Surprise store discount of a value determined by the Campaign, ranging from <strong>₹50 to ₹50,000</strong>, subject to these Terms & Conditions.</p>
              <p>1.3. The Campaign is intended to celebrate the Onam season and provide customers with a promotional benefit when shopping at participating Kavitha Jewellery showrooms.</p>
              <p>1.4. The Campaign does not provide cash prizes. Any benefit issued under the Campaign is a <strong>store discount applicable only in accordance with these Terms & Conditions</strong>.</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">2. Campaign Period</h4>
              <p>2.1. The Campaign will commence on <strong>15 August 2026</strong> and will remain open until <strong>30 September 2026</strong>, unless modified, suspended or discontinued in accordance with these Terms & Conditions.</p>
              <p>2.2. Coupons issued under the Campaign will be valid for redemption only between: <strong>15 August 2026 and 30 September 2026</strong>, both dates inclusive.</p>
              <p>2.3. Any coupon not redeemed by the expiry date will automatically expire and will have no further value.</p>
            </section>

            {/* Section 3 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">3. Eligibility</h4>
              <p>3.1. Participation is open to individuals who are aged 18 years or above, residents of India, provide a valid Indian mobile number, complete mobile OTP verification, and accept these Terms & Conditions.</p>
              <p>3.2. Each eligible mobile number may participate <strong>once during the Campaign Period</strong>.</p>
              <p>3.3. Employees, directors, representatives and immediate family members of Kavitha Jewellery may be excluded from participation.</p>
            </section>

            {/* Section 4 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">4. Participation</h4>
              <p>4.1. Eligible individuals may participate by accessing the official Campaign link or scanning an authorised Campaign QR code.</p>
              <p>4.3. <strong>No purchase is required to participate.</strong></p>
              <p>4.5. A participant may not create or use multiple accounts, mobile numbers, or identities for obtaining multiple benefits.</p>
            </section>

            {/* Section 5 & 6 CAPPING RULE */}
            <section className="space-y-3 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">5 & 6. Onam Surprise Coupon & Discount Calculation Rule</h4>
              <p>5.1. Upon successful participation, the participant receives an Onam Surprise Coupon ranging from <strong>₹50 to ₹50,000</strong>.</p>
              <p>6.1. The Onam Surprise Coupon is applicable <strong>ONLY against eligible making charges</strong> on eligible jewellery purchases.</p>
              <p>6.2. The coupon <strong>CANNOT</strong> be applied against gold value, precious metal value, gemstone/diamond value, GST, hallmarking charges, or delivery fees.</p>
              
              <div className="bg-[#070A0D] p-4 rounded-xl border border-[#B88A44] space-y-2 text-[#ECEAE2]">
                <p className="font-bold text-[#C7E24E]">6.3. Capping Formula:</p>
                <p className="font-data text-sm font-bold text-[#ECEAE2] bg-[#20221C] p-2 rounded text-center border border-[#4E4C4B]">
                  Actual Discount = Lower of (Coupon Value) or (50% × Eligible Making Charges)
                </p>
                <p className="text-[11px] text-[#ECEAE2]/80">
                  Example: If you have a ₹5,000 coupon:
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-data bg-[#141618] p-2.5 rounded border border-[#4E4C4B]/40">
                  <div>Making Charge: ₹20,000 → <strong>Discount: ₹5,000</strong></div>
                  <div>Making Charge: ₹10,000 → <strong>Discount: ₹5,000</strong></div>
                  <div>Making Charge: ₹8,000 → <strong>Discount: ₹4,000</strong> (50% cap)</div>
                  <div>Making Charge: ₹6,000 → <strong>Discount: ₹3,000</strong> (50% cap)</div>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">7. One Coupon Per Purchase</h4>
              <p>7.1. <strong>Only one Onam Surprise Coupon may be redeemed against a single purchase or invoice.</strong></p>
              <p>7.2. Multiple Onam Surprise Coupons <strong>cannot be clubbed, combined or accumulated</strong> for a single purchase or invoice.</p>
              <p>7.4. The coupon cannot be split across multiple invoices.</p>
            </section>

            {/* Section 8 & 9 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">8 & 9. Coupon Transfer, Cash Value & Redemption Window</h4>
              <p>8.2. Coupons cannot be exchanged for cash, converted into store credit, sold, or transferred.</p>
              <p>9.1. Redemption window: <strong>15 August 2026 to 30 September 2026</strong> at participating Kavitha Jewellery showrooms.</p>
            </section>

            {/* Section 10-15 */}
            <section className="space-y-2 pt-4">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">10-15. Showrooms, Process & Eligible Products</h4>
              <p>11.1. Customers must present the valid Onam Surprise Coupon and registered mobile number at the showroom.</p>
              <p>12.1. Coupons cannot be combined with other promotional discounts or offers unless expressly stated by Kavitha Jewellery.</p>
              <p>14.3. GST and statutory levies apply as per law on the final invoice.</p>
            </section>

            {/* Section 16-28 */}
            <section className="space-y-2 pt-4 pb-2">
              <h4 className="font-serif-display text-base font-bold text-[#C7E24E]">16-28. Administration, Privacy & Support</h4>
              <p>16.2. In the event of any dispute or ambiguity, the decision of <strong>Kavitha Jewellery shall be final and binding</strong>.</p>
              <p>26. <strong>Customer Support Contact:</strong></p>
              <div className="bg-[#070A0D] p-3 rounded-lg border border-[#4E4C4B] space-y-1 text-[11px]">
                <p><strong>Kavitha Jewellery Customer Support</strong></p>
                <p>Email: <a href="mailto:kavithajewelleryandtextiles@gmail.com" className="text-[#C7E24E] underline">kavithajewelleryandtextiles@gmail.com</a></p>
                <p>Helpline: +91 98765 43210</p>
                <p>Address: Kavitha Shopping complex, Devasomnada, Cherai, Ernakulam, Kerala 683514</p>
              </div>
            </section>

          </article>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#070A0D] border-t border-[#4E4C4B] px-6 py-3 flex justify-between items-center text-xs">
          <span className="text-[#ECEAE2]/60 text-[11px]">
            By participating, you agree to these Official Campaign Rules.
          </span>
          <button
            onClick={onClose}
            className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-6 py-2 rounded-xl font-bold uppercase tracking-wider transition-all"
          >
            I UNDERSTAND
          </button>
        </div>

      </div>
    </div>
  );
};
