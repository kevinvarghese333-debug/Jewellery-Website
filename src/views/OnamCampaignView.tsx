import React, { useState, useEffect } from 'react';
import { ActiveView, OnamCoupon } from '../types';
import { generateOnamCoupon, getCouponByMobile, calculateEffectiveMakingChargeDiscount } from '../data/campaignData';
import { TermsModal } from '../components/TermsModal';

interface OnamCampaignViewProps {
  onNavigate: (view: ActiveView) => void;
}

export const OnamCampaignView: React.FC<OnamCampaignViewProps> = ({ onNavigate }) => {
  const [sourceParam, setSourceParam] = useState<string>('QR Code');
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  
  // Interactive making charge calculator state on voucher screen
  const [testMakingCharge, setTestMakingCharge] = useState<number>(10000);
  
  // Flow states: 'hero' | 'mobile_input' | 'otp_verify' | 'animating_reveal' | 'coupon_result' | 'lookup_input' | 'lookup_otp'
  const [flowState, setFlowState] = useState<
    'hero' | 'mobile_input' | 'otp_verify' | 'animating_reveal' | 'coupon_result' | 'lookup_input' | 'lookup_otp'
  >('hero');

  // Input states
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(30);

  // Raffle spin state
  const [raffleValue, setRaffleValue] = useState<number>(5000);
  const [raffleStepMessage, setRaffleStepMessage] = useState<string>('Spinning Golden Raffle Drum...');

  // Result state
  const [activeCoupon, setActiveCoupon] = useState<OnamCoupon | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Read URL query parameter ?source=... if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const src = params.get('source');
      if (src) {
        setSourceParam(src);
      }
    }
  }, []);

  // Raffle Ticker Effect during animating_reveal
  useEffect(() => {
    let interval: any;
    let timeout1: any;
    let timeout2: any;

    if (flowState === 'animating_reveal') {
      const tiers = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];
      setRaffleStepMessage(`Drawing Golden Raffle Ticket for ${userName || 'you'}...`);

      interval = setInterval(() => {
        const randTier = tiers[Math.floor(Math.random() * tiers.length)];
        setRaffleValue(randTier);
      }, 70);

      timeout1 = setTimeout(() => {
        setRaffleStepMessage('Matching Onam Festive Discount Pool...');
      }, 1200);

      timeout2 = setTimeout(() => {
        setRaffleStepMessage('Locking in your Exclusive Store Voucher!');
      }, 2300);
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [flowState, userName]);

  // OTP Countdown timer
  useEffect(() => {
    let timer: any;
    if (flowState === 'otp_verify' || flowState === 'lookup_otp') {
      if (resendCountdown > 0) {
        timer = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
      }
    }
    return () => clearInterval(timer);
  }, [flowState, resendCountdown]);

  // Handle OTP Digit change
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) {
      val = val.slice(-1);
    }
    const updated = [...otpDigits];
    updated[index] = val;
    setOtpDigits(updated);

    // Auto move focus to next box
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Quick fill test OTP
  const handleQuickFillOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
  };

  // Submit Mobile -> Go to OTP
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!userEmail.trim() || !userEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    if (mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!agreedTerms) {
      alert('Please agree to the campaign Terms & Conditions and Privacy Policy.');
      return;
    }

    setResendCountdown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setFlowState('otp_verify');
  };

  // Verify OTP -> Trigger 3.2s Raffle Drum animation -> Display coupon
  const handleVerifyOtp = () => {
    const codeStr = otpDigits.join('');
    if (codeStr.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    setOtpError('');
    setFlowState('animating_reveal');

    // Generate or retrieve coupon with Name and Email
    const coupon = generateOnamCoupon(mobileNumber, sourceParam, userName, userEmail);

    // 3.2s premium raffle drum reveal delay
    setTimeout(() => {
      setActiveCoupon(coupon);
      setFlowState('coupon_result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3200);
  };

  // Existing Coupon Lookup
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setResendCountdown(30);
    setOtpDigits(['', '', '', '', '', '']);
    setFlowState('lookup_otp');
  };

  const handleLookupVerify = () => {
    const codeStr = otpDigits.join('');
    if (codeStr.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    const found = getCouponByMobile(mobileNumber);
    if (!found) {
      alert('No existing Onam surprise found for this mobile number. You can generate a new one now!');
      setFlowState('mobile_input');
      return;
    }

    setFlowState('animating_reveal');
    setTimeout(() => {
      setActiveCoupon(found);
      setFlowState('coupon_result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  // Copy share link
  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="bg-[#070A0D] text-[#ECEAE2] min-h-screen font-sans -mx-4 md:-mx-12 -mt-6 pb-20 selection:bg-[#C7E24E] selection:text-[#070A0D]">
      {/* Kasavu / Heritage Ribbon Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] w-full" />

      {/* Top Header Banner */}
      <div className="bg-[#20221C] border-b border-[#4E4C4B]/40 px-4 md:px-12 py-3 flex justify-between items-center text-xs font-sans">
        <div className="flex items-center gap-2 text-[#ECEAE2]/80">
          <span className="w-2 h-2 rounded-full bg-[#C7E24E] animate-ping" />
          <span className="font-medium tracking-wide">KAVITHA JEWELLERY • ONAM FESTIVE SURPRISE 2026</span>
          {sourceParam && (
            <span className="hidden sm:inline-block bg-[#070A0D] px-2 py-0.5 rounded text-[10px] text-[#C7E24E] border border-[#C7E24E]/30 uppercase tracking-widest font-data">
              Source: {sourceParam}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsTermsOpen(true)}
            className="text-[11px] font-sans text-[#B88A44] hover:text-[#C7E24E] flex items-center gap-1 transition-colors font-semibold"
          >
            <span className="material-symbols-outlined text-xs">gavel</span>
            <span>Terms & Conditions</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
          <button
            onClick={() => onNavigate('staff-redemption')}
            className="text-[11px] font-sans text-[#ECEAE2]/70 hover:text-[#C7E24E] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">storefront</span>
            <span className="hidden sm:inline">Store Staff Portal</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
          <button
            onClick={() => onNavigate('campaign-admin')}
            className="text-[11px] font-sans text-[#ECEAE2]/70 hover:text-[#C7E24E] flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">analytics</span>
            <span className="hidden sm:inline">Campaign Admin</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
          <button
            onClick={() => onNavigate('home')}
            className="text-[11px] font-sans text-[#C7E24E] font-semibold hover:underline flex items-center gap-1"
          >
            <span>Jewellery Store</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 space-y-16">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        {flowState === 'hero' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#20221C] border border-[#C7E24E]/30 text-[#C7E24E] px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Exclusive Kerala Onam Celebration</span>
              </div>

              <h1 className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#ECEAE2] leading-[1.1] tracking-tight">
                WHAT'S YOUR <br />
                <span className="bg-gradient-to-r from-[#ECEAE2] via-[#C7E24E] to-[#B88A44] bg-clip-text text-transparent">
                  ONAM SURPRISE?
                </span>
              </h1>

              <p className="font-sans text-base sm:text-lg text-[#ECEAE2]/80 font-light max-w-xl leading-relaxed">
                This Onam, Kavitha Jewellery has a little surprise waiting for you.
              </p>

              {/* Discount Range Spotlight Banner */}
              <div className="bg-[#20221C] p-6 rounded-2xl border border-[#B88A44]/40 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C7E24E]/5 rounded-full blur-2xl pointer-events-none" />
                <span className="block text-xs uppercase tracking-[0.2em] text-[#B88A44] font-semibold">
                  GUARANTEED STORE DISCOUNT
                </span>
                <div className="font-serif-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#C7E24E] mt-1 tracking-tight">
                  ₹50 – ₹50,000
                </div>
                <p className="font-sans text-xs text-[#ECEAE2]/70 mt-2">
                  Reveal your surprise. Redeem it at Kavitha Jewellery from <strong>15 August to 30 September 2026</strong>.
                </p>
              </div>

              {/* Main CTA & Microcopy */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setFlowState('mobile_input')}
                  className="w-full sm:w-auto bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] font-sans font-bold text-sm uppercase tracking-[0.18em] px-8 py-4 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined text-xl">card_giftcard</span>
                  <span>REVEAL MY SURPRISE</span>
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-sans text-[#ECEAE2]/60 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#C7E24E]">timer</span>
                    Takes less than 30 seconds.
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#C7E24E]">verified_user</span>
                    Official Onam promotion by Kavitha Jewellery
                  </span>
                </div>
                <p className="text-[11px] font-sans text-[#ECEAE2]/50 italic">
                  * No payment required to participate.
                </p>
              </div>
            </div>

            {/* Right Editorial Visual Artwork (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#B88A44]/40 bg-[#20221C] p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80"
                  alt="Kavitha Jewellery Onam Heritage Gold"
                  className="w-full h-[420px] object-cover rounded-xl brightness-90 hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Onam Pookalam Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#070A0D]/90 backdrop-blur-md p-4 rounded-xl border border-[#C7E24E]/30 text-xs font-sans space-y-1">
                  <div className="flex items-center gap-2 text-[#C7E24E] font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base">nest_eco_leaf</span>
                    <span>Tradition Meets Modernity</span>
                  </div>
                  <p className="text-[#ECEAE2]/80 text-[11px] leading-relaxed">
                    Inspired by traditional Kasavu gold weaving and Kerala pookalam geometry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PARTICIPATION MODAL / STEP 1: PARTICIPANT DETAILS */}
        {/* ========================================================= */}
        {flowState === 'mobile_input' && (
          <div className="max-w-md mx-auto bg-[#20221C] p-8 rounded-2xl border border-[#C7E24E]/40 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7E24E] font-bold">STEP 1 OF 2</span>
                <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2]">
                  Enter Details to Reveal
                </h2>
              </div>
              <button
                onClick={() => setFlowState('hero')}
                className="text-[#ECEAE2]/60 hover:text-white p-1"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleMobileSubmit} className="space-y-4 font-sans text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[#ECEAE2]/80 font-medium">
                  Full Name <span className="text-[#C7E24E]">*</span>
                </label>
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2.5 focus-within:border-[#C7E24E]">
                  <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">person</span>
                  <input
                    type="text"
                    placeholder="e.g. Anjali Menon"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#ECEAE2] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[#ECEAE2]/80 font-medium">
                  Email Address <span className="text-[#C7E24E]">*</span>
                </label>
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2.5 focus-within:border-[#C7E24E]">
                  <span className="material-symbols-outlined text-[#B88A44] mr-2 text-lg">mail</span>
                  <input
                    type="email"
                    placeholder="e.g. anjali@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#ECEAE2] focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-[#ECEAE2]/80 font-medium">
                  10-Digit Mobile Number <span className="text-[#C7E24E]">*</span>
                </label>
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl overflow-hidden focus-within:border-[#C7E24E]">
                  <span className="px-3 text-[#ECEAE2]/60 font-data font-bold border-r border-[#4E4C4B] text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent p-2.5 text-xs font-data font-bold text-[#ECEAE2] focus:outline-none tracking-widest"
                    required
                  />
                </div>
                <p className="text-[10px] text-[#ECEAE2]/50">
                  Your details will be used to issue and verify your Onam surprise coupon.
                </p>
              </div>

              {/* T&C Checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-0.5 accent-[#C7E24E] w-4 h-4 rounded"
                />
                <span className="text-[11px] text-[#ECEAE2]/70 leading-normal group-hover:text-[#ECEAE2]">
                  I agree to the campaign <strong className="text-[#ECEAE2] underline">Terms & Conditions</strong> and <strong className="text-[#ECEAE2] underline">Privacy Policy</strong>.
                </span>
              </label>

              <button
                type="submit"
                className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3.5 rounded-xl font-bold uppercase tracking-[0.18em] shadow-lg transition-all text-xs flex items-center justify-center gap-2 mt-2"
              >
                <span className="material-symbols-outlined text-lg">casino</span>
                <span>PROCEED TO RAFFLE REVEAL</span>
              </button>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* STEP 2: OTP VERIFICATION SCREEN */}
        {/* ========================================================= */}
        {flowState === 'otp_verify' && (
          <div className="max-w-md mx-auto bg-[#20221C] p-8 rounded-2xl border border-[#C7E24E]/40 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C7E24E] font-bold">STEP 2 OF 2</span>
                <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2]">
                  Verify your number
                </h2>
              </div>
              <button
                onClick={() => setFlowState('mobile_input')}
                className="text-[#ECEAE2]/60 hover:text-white text-xs underline"
              >
                Edit Number
              </button>
            </div>

            <p className="font-sans text-xs text-[#ECEAE2]/80 leading-relaxed">
              We've sent a 6-digit OTP to <strong className="text-[#C7E24E] font-data">+91 {mobileNumber}</strong>.
            </p>

            {/* Quick Demo Fill Helper Tip */}
            <div className="bg-[#070A0D] p-3 rounded-lg border border-[#B88A44]/30 flex justify-between items-center text-[11px] font-sans">
              <span className="text-[#ECEAE2]/70">⚡ Testing demo code: 123456</span>
              <button
                type="button"
                onClick={handleQuickFillOtp}
                className="text-[#C7E24E] font-bold underline hover:text-white"
              >
                Auto-fill OTP
              </button>
            </div>

            {/* OTP Input Boxes */}
            <div className="flex justify-between gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-11 h-13 text-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl font-data text-xl font-bold text-[#C7E24E] focus:border-[#C7E24E] focus:outline-none"
                />
              ))}
            </div>

            {otpError && (
              <p className="text-xs text-[#ff6b6b] font-medium text-center">{otpError}</p>
            )}

            <button
              onClick={handleVerifyOtp}
              className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3.5 rounded-xl font-bold uppercase tracking-[0.18em] shadow-lg transition-all text-xs flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">lock_open</span>
              <span>VERIFY & REVEAL</span>
            </button>

            <div className="flex justify-between items-center text-xs font-sans text-[#ECEAE2]/60 pt-2">
              <span>Didn't receive SMS?</span>
              {resendCountdown > 0 ? (
                <span className="font-data text-[#B88A44]">Resend in {resendCountdown}s</span>
              ) : (
                <button
                  onClick={() => setResendCountdown(30)}
                  className="text-[#C7E24E] font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SURPRISE REVEAL ANIMATION - RAFFLE DRUM EXPERIENCE */}
        {/* ========================================================= */}
        {flowState === 'animating_reveal' && (
          <div className="max-w-xl mx-auto py-12 px-6 text-center space-y-8 animate-fadeIn">
            {/* Spinning Golden Raffle Drum & Sacred Pookalam Ring */}
            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              {/* Outer Golden Glow & Particle Pulse */}
              <div className="absolute inset-0 rounded-full bg-[#C7E24E]/10 animate-ping duration-1000 blur-xl" />
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#C7E24E] animate-spin duration-3000" />
              <div className="absolute inset-3 rounded-full border-2 border-[#B88A44] animate-pulse" />
              <div className="absolute inset-6 rounded-full border border-[#C7E24E]/40" />
              
              {/* Spinning Ticket Display Slot */}
              <div className="w-32 h-32 rounded-full bg-[#20221C] border-2 border-[#C7E24E] flex flex-col items-center justify-center text-[#C7E24E] shadow-2xl relative z-10 overflow-hidden px-2">
                <span className="material-symbols-outlined text-xl animate-bounce text-[#B88A44]">casino</span>
                <span className="text-[9px] font-sans font-bold uppercase tracking-widest text-[#ECEAE2]/60 mt-0.5">
                  RAFFLE TICKET
                </span>
                <span className="font-serif-display text-2xl font-extrabold text-[#C7E24E] font-data tracking-tight animate-pulse">
                  ₹{raffleValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-[#20221C] p-6 rounded-2xl border border-[#C7E24E]/30 max-w-md mx-auto shadow-xl">
              <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#C7E24E] font-bold block">
                OFFICIAL KAVITHA ONAM RAFFLE
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2] tracking-wide">
                {raffleStepMessage}
              </h2>
              <p className="font-sans text-xs text-[#ECEAE2]/70">
                Participant: <strong className="text-[#C7E24E]">{userName || 'Valued Guest'}</strong> ({userEmail || mobileNumber})
              </p>
              
              {/* Animated Progress Bar */}
              <div className="w-full bg-[#070A0D] h-2 rounded-full overflow-hidden border border-[#4E4C4B]/40 mt-3">
                <div className="bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] h-full animate-pulse w-full" />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* COUPON REVEAL RESULT VOUCHER */}
        {/* ========================================================= */}
        {flowState === 'coupon_result' && activeCoupon && (
          <div className="max-w-xl mx-auto space-y-8 animate-fadeIn">
            {/* Digital Voucher Card */}
            <div className="bg-[#20221C] border-2 border-[#C7E24E] rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
              {/* Decorative Corner Ribbon */}
              <div className="absolute top-0 right-0 bg-[#C7E24E] text-[#070A0D] font-data text-[10px] uppercase font-bold px-4 py-1 rounded-bl-xl tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>OFFICIAL RAFFLE VOUCHER</span>
              </div>

              <div className="text-center space-y-2 border-b border-[#4E4C4B]/40 pb-6 pt-2">
                <span className="text-xs uppercase tracking-[0.25em] text-[#B88A44] font-semibold block">
                  CONGRATULATIONS! YOUR ONAM SURPRISE IS
                </span>
                <div className="font-serif-display text-5xl md:text-6xl font-extrabold text-[#C7E24E] tracking-tight">
                  ₹{activeCoupon.discountAmount.toLocaleString()} OFF
                </div>
                <p className="font-sans text-xs text-[#ECEAE2]/80 max-w-sm mx-auto">
                  Won by <strong>{activeCoupon.userName || userName || 'Valued Guest'}</strong> via Kavitha Onam Raffle Draw!
                </p>
              </div>

              {/* Unique Coupon Code Display */}
              <div className="bg-[#070A0D] p-5 rounded-2xl border border-[#4E4C4B] text-center space-y-2">
                <span className="text-[10px] font-sans uppercase tracking-widest text-[#ECEAE2]/60 block">
                  UNIQUE COUPON CODE
                </span>
                <span className="font-data text-2xl md:text-3xl font-extrabold text-[#ECEAE2] tracking-[0.2em] select-all">
                  {activeCoupon.code}
                </span>
                <div className="flex justify-center items-center gap-2 text-xs font-sans text-[#B88A44]">
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span>Valid from {activeCoupon.validFrom} to {activeCoupon.validUntil}</span>
                </div>
              </div>

              {/* 50% Making Charge Discount Rule Callout Badge */}
              <div className="bg-[#070A0D] p-4 rounded-xl border border-[#C7E24E]/50 space-y-2 text-xs font-sans">
                <div className="flex items-center gap-1.5 text-[#C7E24E] font-bold uppercase tracking-wider text-[11px]">
                  <span className="material-symbols-outlined text-base">info</span>
                  <span>REDEMPTION RULE & CAPPING NOTICE</span>
                </div>
                <p className="text-[#ECEAE2] leading-relaxed">
                  Coupons are redeemable <strong>ONLY on making charges</strong> on eligible jewellery purchases, capped at <strong>50% of eligible making charges</strong>.
                </p>
                
                {/* Interactive Making Charges Calculator Tool */}
                <div className="bg-[#141618] p-3 rounded-lg border border-[#4E4C4B]/40 space-y-2 pt-2 mt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-[#B88A44] font-bold">Estimate Your Savings Calculator:</span>
                    <span className="text-[#ECEAE2]/60">Type Estimated Making Charge (₹)</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="text-[#C7E24E] font-bold text-xs">₹</span>
                    <input
                      type="number"
                      value={testMakingCharge}
                      onChange={(e) => setTestMakingCharge(Number(e.target.value) || 0)}
                      className="bg-[#070A0D] border border-[#4E4C4B] px-2.5 py-1.5 rounded-lg text-xs font-data text-[#ECEAE2] font-bold w-32 focus:outline-none focus:border-[#C7E24E]"
                    />
                    <div className="text-right flex-1">
                      <span className="text-[10px] text-[#ECEAE2]/60 block">Effective Savings:</span>
                      <span className="font-data text-sm font-extrabold text-[#C7E24E]">
                        ₹{calculateEffectiveMakingChargeDiscount(activeCoupon.discountAmount, testMakingCharge).actualDiscountGranted.toLocaleString()} OFF
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Participant Details Badge */}
              <div className="bg-[#070A0D]/60 p-4 rounded-xl border border-[#4E4C4B]/40 space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[#ECEAE2]/60">Participant Name:</span>
                  <span className="font-semibold text-[#ECEAE2]">{activeCoupon.userName || userName || 'Guest'}</span>
                </div>
                {(activeCoupon.userEmail || userEmail) && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#ECEAE2]/60">Registered Email:</span>
                    <span className="font-semibold text-[#ECEAE2]">{activeCoupon.userEmail || userEmail}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#ECEAE2]/60">Mobile Number:</span>
                  <span className="font-data font-bold text-[#C7E24E]">+91 {activeCoupon.mobile}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#4E4C4B]/30">
                  <span className="text-[#ECEAE2]/60">Status:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[10px] ${
                    activeCoupon.status === 'UNUSED' ? 'bg-[#C7E24E]/20 text-[#C7E24E] border border-[#C7E24E]/30' : 'bg-[#ff6b6b]/20 text-[#ff6b6b]'
                  }`}>
                    {activeCoupon.status}
                  </span>
                </div>
              </div>

              {/* Store Location Notice */}
              <div className="bg-[#141618] p-4 rounded-xl border border-[#B88A44]/30 space-y-1 text-xs font-sans">
                <div className="flex items-center gap-1.5 text-[#B88A44] font-bold">
                  <span className="material-symbols-outlined text-base">storefront</span>
                  <span>Redeemable At Showroom:</span>
                </div>
                <p className="text-[#ECEAE2] font-semibold text-xs">
                  Kavitha Jewellery, Kavitha Shopping complex, Devasomnada, Cherai
                </p>
                <p className="text-[11px] text-[#ECEAE2]/60">
                  Email: <a href="mailto:kavithajewelleryandtextiles@gmail.com" className="underline text-[#C7E24E]">kavithajewelleryandtextiles@gmail.com</a>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => alert(`Coupon ${activeCoupon.code} for ${activeCoupon.userName || 'Guest'} saved to your session!`)}
                  className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-3 rounded-xl font-sans font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>SAVE MY COUPON</span>
                </button>

                <button
                  onClick={() => onNavigate('catalog')}
                  className="bg-[#070A0D] hover:bg-[#1a1f26] text-[#ECEAE2] border border-[#4E4C4B] py-3 rounded-xl font-sans font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">shopping_bag</span>
                  <span>BROWSE JEWELLERY</span>
                </button>
              </div>
            </div>

            {/* Redemption Instructions */}
            <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B]/40 space-y-4">
              <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
                How to redeem
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs">
                <div className="flex items-start gap-3 bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40">
                  <span className="font-data font-bold text-[#C7E24E] text-base">01</span>
                  <div>
                    <strong className="block text-[#ECEAE2]">Visit a Showroom</strong>
                    <span className="text-[#ECEAE2]/60">Visit any participating Kavitha Jewellery showroom.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40">
                  <span className="font-data font-bold text-[#C7E24E] text-base">02</span>
                  <div>
                    <strong className="block text-[#ECEAE2]">Show Your Coupon</strong>
                    <span className="text-[#ECEAE2]/60">Show your digital coupon code {activeCoupon.code}.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40">
                  <span className="font-data font-bold text-[#C7E24E] text-base">03</span>
                  <div>
                    <strong className="block text-[#ECEAE2]">Verify & Redeem</strong>
                    <span className="text-[#ECEAE2]/60">Our showroom staff verifies and redeems it instantly.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40">
                  <span className="font-data font-bold text-[#C7E24E] text-base">04</span>
                  <div>
                    <strong className="block text-[#ECEAE2]">Enjoy Onam Shopping</strong>
                    <span className="text-[#ECEAE2]/60">Enjoy festive savings on 22K gold & bridal collections.</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-sans text-[#ECEAE2]/50 italic pt-2">
                * Terms, eligibility and minimum purchase requirements may apply.
              </p>
            </div>

            {/* Share Section */}
            <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B]/40 space-y-4 text-center">
              <div>
                <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
                  Share the Onam surprise
                </h3>
                <p className="font-sans text-xs text-[#ECEAE2]/70 mt-1">
                  Onam is better when it's shared. Invite your family and friends!
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 font-sans text-xs">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    "What's your Onam surprise? Reveal yours from Kavitha Jewellery: " + window.location.href
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-[#070A0D] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={handleCopyLink}
                  className="bg-[#070A0D] hover:bg-[#1a1f26] text-[#ECEAE2] border border-[#4E4C4B] px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  onClick={() => alert("Opening Instagram Share...")}
                  className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">photo_camera</span>
                  <span>Instagram</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* EXISTING COUPON LOOKUP SECTION */}
        {/* ========================================================= */}
        {flowState !== 'coupon_result' && (
          <div className="bg-[#20221C] p-8 rounded-2xl border border-[#4E4C4B]/40 space-y-6 max-w-xl mx-auto text-center">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-[#B88A44] font-semibold">
                RETRIEVE VOUCHER
              </span>
              <h2 className="font-serif-display text-2xl font-bold text-[#ECEAE2] mt-1">
                Already revealed your surprise?
              </h2>
              <p className="font-sans text-xs text-[#ECEAE2]/70 mt-1">
                Check your coupon by entering your registered mobile number.
              </p>
            </div>

            {flowState === 'lookup_input' ? (
              <form onSubmit={handleLookupSubmit} className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl overflow-hidden focus-within:border-[#C7E24E]">
                  <span className="px-4 text-[#ECEAE2]/60 font-data text-xs font-bold border-r border-[#4E4C4B]">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent p-3 text-xs font-data font-bold text-[#ECEAE2] focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#070A0D] hover:bg-[#1a1f26] text-[#C7E24E] border border-[#C7E24E]/40 py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-bold transition-all"
                >
                  CHECK MY SURPRISE
                </button>
              </form>
            ) : flowState === 'lookup_otp' ? (
              <div className="space-y-4 max-w-md mx-auto text-left font-sans text-xs">
                <p className="text-[#ECEAE2]/80">
                  Enter 6-digit OTP sent to <strong className="text-[#C7E24E] font-data">+91 {mobileNumber}</strong>:
                </p>

                <div className="flex justify-between gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl font-data text-lg font-bold text-[#C7E24E] focus:border-[#C7E24E] focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleLookupVerify}
                    className="flex-1 bg-[#C7E24E] text-[#070A0D] py-3 rounded-xl font-bold uppercase tracking-widest text-xs"
                  >
                    VERIFY & SHOW COUPON
                  </button>
                  <button
                    onClick={handleQuickFillOtp}
                    className="bg-[#070A0D] text-[#ECEAE2] border border-[#4E4C4B] px-3 rounded-xl text-[10px]"
                  >
                    Auto Fill (123456)
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setFlowState('lookup_input')}
                className="bg-[#070A0D] hover:bg-[#1a1f26] text-[#C7E24E] border border-[#C7E24E]/40 px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-widest font-semibold transition-all"
              >
                CHECK MY SURPRISE
              </button>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* BRAND STATEMENT & FOOTER */}
        {/* ========================================================= */}
        <div className="border-t border-[#4E4C4B]/40 pt-12 space-y-8 font-sans text-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <span className="font-serif-display text-2xl font-bold text-[#ECEAE2] block">
                KAVITHA JEWELLERY
              </span>
              <p className="text-[#ECEAE2]/60 mt-1 max-w-md leading-relaxed">
                Celebrating Onam with something special for you. Pure 22K/916 BIS Hallmarked gold craftsmanship.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-[#ECEAE2]/80 font-medium">
              <button onClick={() => onNavigate('locations')} className="hover:text-[#C7E24E]">
                Showrooms & Locations
              </button>
              <span>•</span>
              <button onClick={() => alert('Campaign Hotline: +91 98765 43210')} className="hover:text-[#C7E24E]">
                Contact Us
              </button>
              <span>•</span>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C7E24E]">
                Instagram
              </a>
              <span>•</span>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="hover:text-[#C7E24E]">
                WhatsApp
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-[#ECEAE2]/50 border-t border-[#4E4C4B]/20 pt-6 text-[11px] gap-4">
            <div>
              © 2026 Kavitha Jewellery. Campaign validity: <strong>15 August – 30 September 2026</strong>.
            </div>

            <div className="flex gap-4">
              <button onClick={() => setIsTermsOpen(true)} className="hover:underline font-bold text-[#C7E24E]">
                Official Terms & Conditions (v1)
              </button>
              <button onClick={() => alert('Privacy Policy: Mobile numbers are strictly used for campaign verification and customer communication.')} className="hover:underline">
                Privacy Policy
              </button>
              <button onClick={() => onNavigate('locations')} className="hover:underline">
                Participating Stores
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Terms & Conditions Modal */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
};
