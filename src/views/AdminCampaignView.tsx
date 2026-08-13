import React, { useState } from 'react';
import { ActiveView, OnamCoupon } from '../types';
import { 
  getStoredCoupons, 
  getCampaignMetrics, 
  getCouponPoolConfig, 
  saveCouponPoolConfig, 
  CouponPoolConfig,
  calculateEffectiveMakingChargeDiscount,
  generateOnamCoupon,
  saveStoredCoupons
} from '../data/campaignData';
import { AdminLogin } from '../components/AdminLogin';

interface AdminCampaignViewProps {
  onNavigate: (view: ActiveView) => void;
  goldRate: number;
  setGoldRate: (rate: number) => void;
}

export const AdminCampaignView: React.FC<AdminCampaignViewProps> = ({ 
  onNavigate, 
  goldRate, 
  setGoldRate 
}) => {
  // Admin authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('kavitha_admin_authenticated') === 'true' ||
             localStorage.getItem('kavitha_admin_remember') === 'true';
    }
    return false;
  });

  // Dashboard Data states
  const [coupons, setCoupons] = useState<OnamCoupon[]>(getStoredCoupons());
  const [metrics, setMetrics] = useState(getCampaignMetrics());
  const [poolConfig, setPoolConfig] = useState<CouponPoolConfig>(getCouponPoolConfig());
  
  // Gold Rate & Silver Rate input state
  const [newGoldRate, setNewGoldRate] = useState<number>(goldRate);
  const [silverRate, setSilverRate] = useState<number>(98);
  const [rateUpdatedNotice, setRateUpdatedNotice] = useState<boolean>(false);

  // Campaign Rules & Config states
  const [campaignStatus, setCampaignStatus] = useState<'LIVE' | 'PAUSED' | 'UPCOMING'>('LIVE');
  const [startDate, setStartDate] = useState<string>('2026-08-15');
  const [endDate, setEndDate] = useState<string>('2026-09-30');
  const [otpMode, setOtpMode] = useState<'SIMULATED' | 'STRICT'>('SIMULATED');
  const [maxPerPhone, setMaxPerPhone] = useState<number>(1);
  const [configNotice, setConfigNotice] = useState<string>('');

  // Making Charge Simulator state
  const [simMakingCharge, setSimMakingCharge] = useState<number>(12000);
  const [simCouponVal, setSimCouponVal] = useState<number>(5000);

  // Manual Voucher Generator state
  const [manualMobile, setManualMobile] = useState<string>('');
  const [manualName, setManualName] = useState<string>('');
  const [manualDiscount, setManualDiscount] = useState<number>(5000);
  const [manualSource, setManualSource] = useState<string>('store-vip');
  const [manualNotice, setManualNotice] = useState<string>('');

  // Editable Quotas
  const [q50k, setQ50k] = useState<number>(poolConfig.max50k);
  const [q25k, setQ25k] = useState<number>(poolConfig.max25k);
  const [q10k, setQ10k] = useState<number>(poolConfig.max10k);
  const [q5k, setQ5k] = useState<number>(poolConfig.max5k);
  const [q2500, setQ2500] = useState<number>(poolConfig.max2500);

  // Table Filters & Search
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kavitha_admin_authenticated');
    localStorage.removeItem('kavitha_admin_remember');
  };

  // Update Live Store Rates
  const handleUpdateGoldRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoldRate > 0) {
      setGoldRate(newGoldRate);
      setRateUpdatedNotice(true);
      setTimeout(() => setRateUpdatedNotice(false), 4000);
    }
  };

  // Save Campaign Quotas Config
  const handleSaveQuotas = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CouponPoolConfig = {
      max50k: q50k,
      max25k: q25k,
      max10k: q10k,
      max5k: q5k,
      max2500: q2500
    };
    setPoolConfig(updated);
    saveCouponPoolConfig(updated);
    setConfigNotice('✓ Campaign quota pool limits updated successfully!');
    setTimeout(() => setConfigNotice(''), 4000);
  };

  // Issue Manual Voucher Override
  const handleIssueManualVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = manualMobile.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    const created = generateOnamCoupon(cleanPhone, manualSource, manualName || 'VIP Customer');
    
    // Override value if customized
    const currentAll = getStoredCoupons();
    const targetIndex = currentAll.findIndex(c => c.code === created.code);
    if (targetIndex > -1) {
      currentAll[targetIndex].discountAmount = manualDiscount;
      saveStoredCoupons(currentAll);
    }

    setCoupons(getStoredCoupons());
    setManualNotice(`✓ Manual Voucher ${created.code} worth ₹${manualDiscount.toLocaleString()} issued to +91 ${cleanPhone}!`);
    setManualMobile('');
    setManualName('');
    setTimeout(() => setManualNotice(''), 5000);
  };

  // Export Customer CSV
  const handleExportCSV = () => {
    const headers = ['Coupon Code', 'Name', 'Mobile', 'Email', 'Discount Value (INR)', 'Status', 'Source', 'Issued At', 'Redeemed At', 'Redeemed Store'];
    const rows = coupons.map(c => [
      `"${c.code}"`,
      `"${c.userName || ''}"`,
      `"${c.mobile}"`,
      `"${c.userEmail || ''}"`,
      c.discountAmount,
      `"${c.status}"`,
      `"${c.source}"`,
      `"${c.issuedAt}"`,
      `"${c.redeemedAt || ''}"`,
      `"${c.redeemedStore || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kavitha_onam_participants_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate Issued vs Remaining counts
  const issued50k = coupons.filter((c) => c.discountAmount === 50000).length;
  const issued25k = coupons.filter((c) => c.discountAmount === 25000).length;
  const issued10k = coupons.filter((c) => c.discountAmount === 10000).length;
  const issued5k = coupons.filter((c) => c.discountAmount === 5000).length;
  const issued2500 = coupons.filter((c) => c.discountAmount === 2500).length;
  const issuedLowTier = coupons.filter((c) => c.discountAmount <= 1000).length;

  // Filtered coupons table
  const filteredCoupons = coupons.filter((c) => {
    if (filterSource !== 'ALL' && c.source !== filterSource) return false;
    if (filterStatus !== 'ALL' && c.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCode = c.code.toLowerCase().includes(q);
      const matchMobile = c.mobile.includes(q);
      const matchName = c.userName?.toLowerCase().includes(q);
      const matchEmail = c.userEmail?.toLowerCase().includes(q);
      if (!matchCode && !matchMobile && !matchName && !matchEmail) return false;
    }
    return true;
  });

  // Calculate sim breakdown
  const simResult = calculateEffectiveMakingChargeDiscount(simCouponVal, simMakingCharge);

  // =========================================================================
  // ADMIN LOGIN COMPONENT (If not authenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <AdminLogin
        onSuccess={() => setIsAuthenticated(true)}
        onCancel={() => onNavigate('home')}
      />
    );
  }

  // =========================================================================
  // MAIN ADMIN DASHBOARD & CAMPAIGN CONTROLS (When Authenticated)
  // =========================================================================
  return (
    <div className="bg-[#070A0D] text-[#ECEAE2] min-h-screen font-sans -mx-4 md:-mx-12 -mt-6 pb-20 selection:bg-[#C7E24E] selection:text-[#070A0D]">
      {/* Kasavu Ribbon */}
      <div className="h-1.5 bg-gradient-to-r from-[#B88A44] via-[#C7E24E] to-[#B88A44] w-full" />

      {/* Admin Header */}
      <div className="bg-[#20221C] border-b border-[#4E4C4B]/40 px-4 md:px-12 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#C7E24E]">admin_panel_settings</span>
          <span className="font-bold tracking-wider uppercase text-[#C7E24E]">
            ADMIN DASHBOARD • KAVITHA JEWELLERY ONAM 2026
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('staff-redemption')}
            className="text-xs text-[#ECEAE2]/80 hover:text-[#C7E24E] flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">storefront</span>
            <span>Staff Portal</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
          <button
            onClick={handleLogout}
            className="text-xs text-[#ff6b6b] hover:underline flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-10">
        
        {/* Header Title & Campaign Status Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#4E4C4B]/40 pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#B88A44] font-semibold">
              REAL-TIME CAMPAIGN CONTROL CENTER
            </span>
            <h1 className="font-serif-display text-3xl font-bold text-[#ECEAE2] mt-0.5">
              Onam Surprise 2026 Control Center
            </h1>
            <p className="font-sans text-xs text-[#ECEAE2]/70 mt-1">
              Active Window: <strong>15 August 2026 – 30 September 2026</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-[#20221C] p-3 rounded-2xl border border-[#4E4C4B]">
            <span className="text-xs font-sans text-[#ECEAE2]/80 font-bold uppercase tracking-wider">
              Campaign Mode:
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setCampaignStatus('LIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  campaignStatus === 'LIVE' ? 'bg-[#C7E24E] text-[#070A0D]' : 'bg-[#070A0D] text-[#ECEAE2]/60 hover:text-white'
                }`}
              >
                LIVE
              </button>
              <button
                type="button"
                onClick={() => setCampaignStatus('PAUSED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  campaignStatus === 'PAUSED' ? 'bg-[#ff6b6b] text-white' : 'bg-[#070A0D] text-[#ECEAE2]/60 hover:text-white'
                }`}
              >
                PAUSED
              </button>
              <button
                type="button"
                onClick={() => setCampaignStatus('UPCOMING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  campaignStatus === 'UPCOMING' ? 'bg-[#B88A44] text-white' : 'bg-[#070A0D] text-[#ECEAE2]/60 hover:text-white'
                }`}
              >
                UPCOMING
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: CAMPAIGN CONFIG & SCHEDULING CONTROLS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Gold & Silver Rate Controller */}
          <div className="bg-[#20221C] p-6 rounded-2xl border border-[#C7E24E]/30 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">STORE RATES</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Gold & Silver Rates</h3>
              </div>
              <span className="material-symbols-outlined text-[#C7E24E]">trending_up</span>
            </div>

            <form onSubmit={handleUpdateGoldRate} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">22K Gold Rate per Gram (₹)</label>
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 focus-within:border-[#C7E24E]">
                  <span className="text-[#C7E24E] font-bold mr-2">₹</span>
                  <input
                    type="number"
                    value={newGoldRate}
                    onChange={(e) => setNewGoldRate(Number(e.target.value))}
                    className="w-full bg-transparent font-data text-sm font-bold text-[#ECEAE2] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">Silver Rate per Gram (₹)</label>
                <div className="flex items-center bg-[#070A0D] border border-[#4E4C4B] rounded-xl px-3 py-2 focus-within:border-[#C7E24E]">
                  <span className="text-[#B88A44] font-bold mr-2">₹</span>
                  <input
                    type="number"
                    value={silverRate}
                    onChange={(e) => setSilverRate(Number(e.target.value))}
                    className="w-full bg-transparent font-data text-sm font-bold text-[#ECEAE2] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">published_with_changes</span>
                <span>Update Store Rates</span>
              </button>

              {rateUpdatedNotice && (
                <p className="text-[11px] text-[#C7E24E] bg-[#C7E24E]/10 p-2 rounded-lg border border-[#C7E24E]/30 text-center font-bold animate-fadeIn">
                  ✓ Gold rate updated to ₹{goldRate.toLocaleString()}/g! All product prices recalculated.
                </p>
              )}
            </form>
          </div>

          {/* Campaign Schedule & Rules */}
          <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold">TIMING & RULES</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Schedule & Limits</h3>
              </div>
              <span className="material-symbols-outlined text-[#B88A44]">event</span>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] focus:border-[#C7E24E] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] focus:border-[#C7E24E] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">OTP Verification Mode</label>
                <select
                  value={otpMode}
                  onChange={(e) => setOtpMode(e.target.value as any)}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] outline-none font-medium"
                >
                  <option value="SIMULATED">Simulated OTP / Demo Mode (Auto-fill 123456)</option>
                  <option value="STRICT">Strict Phone Verification Mode</option>
                </select>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">Max Claims Per Mobile Number</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxPerPhone}
                  onChange={(e) => setMaxPerPhone(Number(e.target.value))}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] outline-none font-data font-bold"
                />
              </div>
            </div>
          </div>

          {/* Manual Voucher Issuer Override */}
          <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">MANUAL OVERRIDE</span>
                <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Issue Custom Voucher</h3>
              </div>
              <span className="material-symbols-outlined text-[#C7E24E]">card_giftcard</span>
            </div>

            <form onSubmit={handleIssueManualVoucher} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">Customer Mobile</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={manualMobile}
                  onChange={(e) => setManualMobile(e.target.value)}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] font-data font-bold outline-none focus:border-[#C7E24E]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="Anjali Nair"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs text-[#ECEAE2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">Discount Amount</label>
                  <select
                    value={manualDiscount}
                    onChange={(e) => setManualDiscount(Number(e.target.value))}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2 rounded-xl text-xs font-data font-bold text-[#C7E24E] outline-none"
                  >
                    <option value={50000}>₹50,000</option>
                    <option value={25000}>₹25,000</option>
                    <option value={10000}>₹10,000</option>
                    <option value={5000}>₹5,000</option>
                    <option value={2500}>₹2,500</option>
                    <option value={1000}>₹1,000</option>
                    <option value={500}>₹500</option>
                    <option value={100}>₹100</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#B88A44] hover:bg-[#a3793b] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">send</span>
                <span>Generate & Issue Voucher</span>
              </button>

              {manualNotice && (
                <p className="text-[11px] text-[#C7E24E] bg-[#C7E24E]/10 p-2 rounded-lg border border-[#C7E24E]/30 text-center font-bold animate-fadeIn">
                  {manualNotice}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: COUPON INVENTORY ALLOCATION & QUOTA POOLS */}
        {/* ========================================================= */}
        <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#4E4C4B]/40 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">COUPON INVENTORY BACKEND</span>
              <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
                Onam Coupon Quota Pool Configuration
              </h3>
              <p className="text-xs text-[#ECEAE2]/70 mt-1">
                Set maximum distribution limits for high-tier grand coupons. Lower tier coupons (£50–£500) balance dynamically.
              </p>
            </div>

            <button
              onClick={handleSaveQuotas}
              className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <span className="material-symbols-outlined text-base">save</span>
              <span>Save Quota Limits</span>
            </button>
          </div>

          {configNotice && (
            <p className="text-xs text-[#C7E24E] bg-[#C7E24E]/10 p-2.5 rounded-xl border border-[#C7E24E]/30 text-center font-bold animate-fadeIn">
              {configNotice}
            </p>
          )}

          {/* Editable Quota Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-sans">
            {/* 50K Quota */}
            <div className="bg-[#070A0D] p-4 rounded-xl border border-[#C7E24E] space-y-2">
              <div className="flex justify-between items-center text-[#C7E24E] font-bold">
                <span>₹50,000 Grand</span>
                <span className="text-[10px] uppercase bg-[#C7E24E]/20 px-2 py-0.5 rounded">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#ECEAE2]/60 text-[11px]">Issued / Max:</span>
                <span className="font-data text-sm font-extrabold text-[#ECEAE2]">{issued50k} /</span>
                <input
                  type="number"
                  min={issued50k}
                  max="10"
                  value={q50k}
                  onChange={(e) => setQ50k(Number(e.target.value))}
                  className="w-16 bg-[#20221C] border border-[#C7E24E] rounded px-2 py-0.5 font-data text-sm font-bold text-[#C7E24E]"
                />
              </div>
              <div className="w-full bg-[#20221C] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#C7E24E] h-full" 
                  style={{ width: `${Math.min(100, (issued50k / (q50k || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* 25K Quota */}
            <div className="bg-[#070A0D] p-4 rounded-xl border border-[#B88A44] space-y-2">
              <div className="flex justify-between items-center text-[#B88A44] font-bold">
                <span>₹25,000 Bumper</span>
                <span className="text-[10px] uppercase bg-[#B88A44]/20 px-2 py-0.5 rounded">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#ECEAE2]/60 text-[11px]">Issued / Max:</span>
                <span className="font-data text-sm font-extrabold text-[#ECEAE2]">{issued25k} /</span>
                <input
                  type="number"
                  min={issued25k}
                  max="20"
                  value={q25k}
                  onChange={(e) => setQ25k(Number(e.target.value))}
                  className="w-16 bg-[#20221C] border border-[#B88A44] rounded px-2 py-0.5 font-data text-sm font-bold text-[#B88A44]"
                />
              </div>
              <div className="w-full bg-[#20221C] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#B88A44] h-full" 
                  style={{ width: `${Math.min(100, (issued25k / (q25k || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* 10K Quota */}
            <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B] space-y-2">
              <div className="flex justify-between items-center text-[#ECEAE2] font-bold">
                <span>₹10,000 Major</span>
                <span className="text-[10px] uppercase bg-[#20221C] px-2 py-0.5 rounded">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#ECEAE2]/60 text-[11px]">Issued / Max:</span>
                <span className="font-data text-sm font-extrabold text-[#ECEAE2]">{issued10k} /</span>
                <input
                  type="number"
                  min={issued10k}
                  max="50"
                  value={q10k}
                  onChange={(e) => setQ10k(Number(e.target.value))}
                  className="w-16 bg-[#20221C] border border-[#4E4C4B] rounded px-2 py-0.5 font-data text-sm font-bold text-[#ECEAE2]"
                />
              </div>
              <div className="w-full bg-[#20221C] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ECEAE2] h-full" 
                  style={{ width: `${Math.min(100, (issued10k / (q10k || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* 5K Quota */}
            <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B] space-y-2">
              <div className="flex justify-between items-center text-[#ECEAE2]/80 font-bold">
                <span>₹5,000 Festive</span>
                <span className="text-[10px] uppercase bg-[#20221C] px-2 py-0.5 rounded">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#ECEAE2]/60 text-[11px]">Issued / Max:</span>
                <span className="font-data text-sm font-extrabold text-[#ECEAE2]">{issued5k} /</span>
                <input
                  type="number"
                  min={issued5k}
                  max="100"
                  value={q5k}
                  onChange={(e) => setQ5k(Number(e.target.value))}
                  className="w-16 bg-[#20221C] border border-[#4E4C4B] rounded px-2 py-0.5 font-data text-sm font-bold text-[#ECEAE2]"
                />
              </div>
              <div className="w-full bg-[#20221C] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ECEAE2]/70 h-full" 
                  style={{ width: `${Math.min(100, (issued5k / (q5k || 1)) * 100)}%` }} 
                />
              </div>
            </div>

            {/* 2.5K Quota */}
            <div className="bg-[#070A0D] p-4 rounded-xl border border-[#4E4C4B] space-y-2">
              <div className="flex justify-between items-center text-[#ECEAE2]/70 font-bold">
                <span>₹2,500 Special</span>
                <span className="text-[10px] uppercase bg-[#20221C] px-2 py-0.5 rounded">LIMIT</span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[#ECEAE2]/60 text-[11px]">Issued / Max:</span>
                <span className="font-data text-sm font-extrabold text-[#ECEAE2]">{issued2500} /</span>
                <input
                  type="number"
                  min={issued2500}
                  max="200"
                  value={q2500}
                  onChange={(e) => setQ2500(Number(e.target.value))}
                  className="w-16 bg-[#20221C] border border-[#4E4C4B] rounded px-2 py-0.5 font-data text-sm font-bold text-[#ECEAE2]"
                />
              </div>
              <div className="w-full bg-[#20221C] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-[#ECEAE2]/50 h-full" 
                  style={{ width: `${Math.min(100, (issued2500 / (q2500 || 1)) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: 50% MAKING CHARGE DISCOUNT CALCULATOR SIMULATOR */}
        {/* ========================================================= */}
        <div className="bg-[#20221C] p-6 rounded-2xl border border-[#B88A44]/40 space-y-4 shadow-xl">
          <div className="border-b border-[#4E4C4B]/40 pb-3">
            <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold">RULES & REDEMPTION LOGIC</span>
            <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
              50% Making Charges Capping Simulator
            </h3>
            <p className="text-xs text-[#ECEAE2]/70 mt-1">
              Test coupon discount calculations: <strong>Actual Discount = Lower of (Coupon Value) or (50% × Eligible Making Charges)</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans items-center">
            <div className="space-y-3">
              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">Coupon Value (₹)</label>
                <select
                  value={simCouponVal}
                  onChange={(e) => setSimCouponVal(Number(e.target.value))}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data font-bold text-[#ECEAE2]"
                >
                  <option value={50000}>₹50,000 Coupon</option>
                  <option value={25000}>₹25,000 Coupon</option>
                  <option value={10000}>₹10,000 Coupon</option>
                  <option value={5000}>₹5,000 Coupon</option>
                  <option value={2500}>₹2,500 Coupon</option>
                  <option value={1000}>₹1,000 Coupon</option>
                  <option value={500}>₹500 Coupon</option>
                  <option value={100}>₹100 Coupon</option>
                </select>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">Eligible Making Charges (₹)</label>
                <input
                  type="number"
                  value={simMakingCharge}
                  onChange={(e) => setSimMakingCharge(Number(e.target.value) || 0)}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data font-bold text-[#ECEAE2]"
                />
              </div>
            </div>

            <div className="md:col-span-2 bg-[#070A0D] p-5 rounded-2xl border border-[#4E4C4B] space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C7E24E]">SIMULATION RESULT</span>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[#ECEAE2]/60 block text-[10px]">50% Making Cap</span>
                  <span className="font-data text-sm font-bold text-[#ECEAE2]">
                    ₹{simResult.maxAllowedDiscount50Percent.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#ECEAE2]/60 block text-[10px]">Granted Discount</span>
                  <span className="font-data text-base font-extrabold text-[#C7E24E]">
                    ₹{simResult.actualDiscountGranted.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[#ECEAE2]/60 block text-[10px]">Unclaimed Coupon Remainder</span>
                  <span className="font-data text-sm font-bold text-[#ECEAE2]/50">
                    ₹{simResult.unclaimedCouponValue.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#ECEAE2]/70 pt-2 border-t border-[#4E4C4B]/40">
                {simResult.actualDiscountGranted < simCouponVal 
                  ? `⚠️ Capped by 50% making charges threshold. Customer receives ₹${simResult.actualDiscountGranted.toLocaleString()} discount.`
                  : `✓ Full coupon value of ₹${simCouponVal.toLocaleString()} applied against making charges!`}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: CUSTOMER REGISTRY & COUPON MANAGEMENT TABLE */}
        {/* ========================================================= */}
        <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#4E4C4B]/40 pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">CUSTOMER REGISTRY</span>
              <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">
                Generated Coupons & Participant Logs ({filteredCoupons.length})
              </h3>
            </div>

            {/* Export CSV & Search Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleExportCSV}
                className="bg-[#B88A44] hover:bg-[#a3793b] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
              >
                <span className="material-symbols-outlined text-base">download</span>
                <span>Export CSV</span>
              </button>

              <input
                type="text"
                placeholder="Search name, email, mobile, or coupon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#070A0D] border border-[#4E4C4B] text-xs font-sans text-[#ECEAE2] px-3 py-2 rounded-xl focus:outline-none focus:border-[#C7E24E] w-64"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#070A0D] border border-[#4E4C4B] text-xs font-sans text-[#ECEAE2] px-3 py-2 rounded-xl"
              >
                <option value="ALL">All Statuses</option>
                <option value="UNUSED">UNUSED</option>
                <option value="REDEEMED">REDEEMED</option>
              </select>

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-[#070A0D] border border-[#4E4C4B] text-xs font-sans text-[#ECEAE2] px-3 py-2 rounded-xl"
              >
                <option value="ALL">All Sources</option>
                <option value="qr">QR Code</option>
                <option value="instagram">Instagram</option>
                <option value="newspaper">Newspaper</option>
                <option value="store">Showroom</option>
                <option value="admin-issued">Admin Issued</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#070A0D] text-[#ECEAE2]/60 uppercase text-[10px] tracking-wider border-b border-[#4E4C4B]">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Participant Name</th>
                  <th className="p-3">Email & Contact</th>
                  <th className="p-3">Discount Value</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Redeemed Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4E4C4B]/40">
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#ECEAE2]/50 italic">
                      No matching coupons found. Try clearing search filters.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((c) => (
                    <tr key={c.code} className="hover:bg-[#070A0D]/50 transition-colors">
                      <td className="p-3 font-data font-bold text-[#C7E24E]">{c.code}</td>
                      <td className="p-3 font-semibold text-[#ECEAE2]">{c.userName || '—'}</td>
                      <td className="p-3 text-[11px]">
                        <span className="font-data text-[#ECEAE2] block">+91 {c.mobile}</span>
                        {c.userEmail && <span className="text-[#ECEAE2]/60 block text-[10px]">{c.userEmail}</span>}
                      </td>
                      <td className="p-3 font-serif-display font-bold text-[#ECEAE2]">
                        ₹{c.discountAmount.toLocaleString()}
                      </td>
                      <td className="p-3 uppercase text-[10px] text-[#B88A44] font-bold">{c.source}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          c.status === 'UNUSED' ? 'bg-[#C7E24E]/20 text-[#C7E24E]' : 'bg-[#ff6b6b]/20 text-[#ff6b6b]'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-[#ECEAE2]/70">
                        {c.redeemedAt ? `${c.redeemedAt} (${c.redeemedStore})` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};
