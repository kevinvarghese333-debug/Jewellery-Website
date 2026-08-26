import React, { useState, useEffect } from 'react';
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
import { getDltConfig, saveDltConfig, sendDltSmsOtp, BsnlDltConfig } from '../data/dltSmsConfig';
import { generateAndDownloadClientSidePdf } from '../utils/generateHandoverPdf';
import { Logo } from '../components/Logo';
import { updateLiveBullionRatesInFirestore } from '../data/storeConfigService';
import { getGoldRateForPurity } from '../data/products';
import { AdminProductManager } from '../components/AdminProductManager';
import { AdminAppointmentsManager } from '../components/AdminAppointmentsManager';
import { AdminBrandingManager } from '../components/AdminBrandingManager';

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
  // Admin authentication state - strictly protected via session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kavitha_admin_remember');
      } catch (e) {
        console.error(e);
      }
      return sessionStorage.getItem('kavitha_admin_authenticated') === 'true';
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
  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);

  // Sync state if gold rate is updated from cloud
  useEffect(() => {
    if (goldRate > 0) {
      setNewGoldRate(goldRate);
    }
  }, [goldRate]);

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

  // BSNL DLT SMS Configuration state
  const [dltConfig, setDltConfig] = useState<BsnlDltConfig>(getDltConfig());
  const [dltSaveNotice, setDltSaveNotice] = useState<string>('');
  const [testPhone, setTestPhone] = useState<string>('');
  const [testSmsNotice, setTestSmsNotice] = useState<string>('');
  const [testSmsLoading, setTestSmsLoading] = useState<boolean>(false);

  // Table Filters & Search
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Navigation Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'branding' | 'leads' | 'rates_inventory' | 'onam_campaign' | 'dlt_sms'>('branding');

  const handleSaveDltConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveDltConfig(dltConfig);
    setDltSaveNotice('✓ BSNL DLT Portal parameters updated successfully!');
    setTimeout(() => setDltSaveNotice(''), 4000);
  };

  const handleSendTestDltSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || testPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    setTestSmsLoading(true);
    setTestSmsNotice('');
    
    // Generate test 6-digit OTP
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const res = await sendDltSmsOtp(testPhone, testOtp);
    setTestSmsLoading(false);
    setTestSmsNotice(res.message);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('kavitha_admin_authenticated');
    try {
      localStorage.removeItem('kavitha_admin_remember');
    } catch (e) {
      console.error(e);
    }
  };

  // Update Live Store Rates and Broadcast to Firestore
  const handleUpdateGoldRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoldRate > 0) {
      setIsUpdatingRate(true);
      try {
        await updateLiveBullionRatesInFirestore(newGoldRate, silverRate);
        setGoldRate(newGoldRate);
        setRateUpdatedNotice(true);
        setTimeout(() => setRateUpdatedNotice(false), 5000);
      } catch (err) {
        console.error('Error updating live rate to cloud:', err);
        setGoldRate(newGoldRate);
        setRateUpdatedNotice(true);
        setTimeout(() => setRateUpdatedNotice(false), 5000);
      } finally {
        setIsUpdatingRate(false);
      }
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
        <div className="flex items-center gap-3">
          <Logo variant="mark-only" size="sm" />
          <span className="font-bold tracking-wider uppercase text-[#C7E24E]">
            ADMIN DASHBOARD • KAVITHA JEWELLERY ONAM 2026
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => generateAndDownloadClientSidePdf()}
            className="bg-[#B88A44] hover:bg-[#a67936] text-[#070A0D] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
            title="Download Developer Architecture & Database Documentation PDF"
          >
            <span className="material-symbols-outlined text-sm font-bold">picture_as_pdf</span>
            <span>Developer Handover PDF</span>
          </button>
          <span className="text-[#4E4C4B]">|</span>
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
              KAVITHA JEWELLERY CHERAI
            </span>
            <h1 className="font-serif-display text-3xl font-bold text-[#ECEAE2] mt-0.5">
              Master Store & Lead Management Console
            </h1>
            <p className="font-sans text-xs text-[#ECEAE2]/70 mt-1">
              Active Window: <strong>Onam 2026 Season • 15 August – 30 September 2026</strong>
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

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 border-b border-[#4E4C4B]/60 pb-3">
          <button
            onClick={() => setActiveAdminTab('branding')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeAdminTab === 'branding'
                ? 'bg-[#C7E24E] text-[#070A0D] shadow-md ring-2 ring-[#C7E24E]/40'
                : 'bg-[#20221C] text-[#ECEAE2]/80 hover:text-white hover:bg-[#2a2d24]'
            }`}
          >
            <span className="material-symbols-outlined text-base">palette</span>
            <span>Store Media & Branding (Logo / Hero)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('leads')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeAdminTab === 'leads'
                ? 'bg-[#C7E24E] text-[#070A0D] shadow-md ring-2 ring-[#C7E24E]/40'
                : 'bg-[#20221C] text-[#ECEAE2]/80 hover:text-white hover:bg-[#2a2d24]'
            }`}
          >
            <span className="material-symbols-outlined text-base">table_chart</span>
            <span>Leads & Appointments (Google Sheets)</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('rates_inventory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeAdminTab === 'rates_inventory'
                ? 'bg-[#C7E24E] text-[#070A0D] shadow-md ring-2 ring-[#C7E24E]/40'
                : 'bg-[#20221C] text-[#ECEAE2]/80 hover:text-white hover:bg-[#2a2d24]'
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            <span>Bullion Rates & Inventory</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('onam_campaign')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeAdminTab === 'onam_campaign'
                ? 'bg-[#C7E24E] text-[#070A0D] shadow-md ring-2 ring-[#C7E24E]/40'
                : 'bg-[#20221C] text-[#ECEAE2]/80 hover:text-white hover:bg-[#2a2d24]'
            }`}
          >
            <span className="material-symbols-outlined text-base">loyalty</span>
            <span>Onam 2026 Surprise Campaign</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('dlt_sms')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
              activeAdminTab === 'dlt_sms'
                ? 'bg-[#C7E24E] text-[#070A0D] shadow-md ring-2 ring-[#C7E24E]/40'
                : 'bg-[#20221C] text-[#ECEAE2]/80 hover:text-white hover:bg-[#2a2d24]'
            }`}
          >
            <span className="material-symbols-outlined text-base">sms</span>
            <span>BSNL DLT SMS Gateway</span>
          </button>
        </div>

        {/* TAB 0: Store Media & Branding (Logo / Hero) */}
        {activeAdminTab === 'branding' && (
          <div className="animate-fadeIn">
            <AdminBrandingManager />
          </div>
        )}

        {/* TAB 1: Leads & Appointments (Google Sheets) */}
        {activeAdminTab === 'leads' && (
          <div className="animate-fadeIn">
            <AdminAppointmentsManager />
          </div>
        )}

        {/* TAB 2: Bullion Rates & Product Inventory */}
        {activeAdminTab === 'rates_inventory' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Bullion Rate Controller */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#20221C] p-6 rounded-2xl border border-[#C7E24E]/30 space-y-4 shadow-xl lg:col-span-2">
                <div className="flex justify-between items-center border-b border-[#4E4C4B]/40 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">STORE BULLION RATES</span>
                    <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2]">Gold & Silver Rates</h3>
                  </div>
                  <span className="material-symbols-outlined text-[#C7E24E]">trending_up</span>
                </div>

                <form onSubmit={handleUpdateGoldRate} className="space-y-3 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  </div>

                  {/* Live Multi-Karat Breakdown */}
                  <div className="bg-[#070A0D] border border-[#4E4C4B]/60 p-3 rounded-xl space-y-1.5 text-[11px] font-data">
                    <div className="flex justify-between text-[#ECEAE2]">
                      <span>22K (916) Hallmark:</span>
                      <span className="font-bold text-[#C7E24E]">₹{newGoldRate.toLocaleString()}/g • 8g (1 Sovereign): ₹{(newGoldRate * 8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#ECEAE2]/90">
                      <span>18K (750) Fine Gold:</span>
                      <span className="font-bold text-[#D4AF6A]">₹{getGoldRateForPurity('18K', newGoldRate).toLocaleString()}/g • 8g: ₹{(getGoldRateForPurity('18K', newGoldRate) * 8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[#ECEAE2]/80">
                      <span>14K (585) Everyday Gold:</span>
                      <span className="font-bold text-[#94A3B8]">₹{getGoldRateForPurity('14K', newGoldRate).toLocaleString()}/g • 8g: ₹{(getGoldRateForPurity('14K', newGoldRate) * 8).toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingRate}
                    className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isUpdatingRate ? (
                      <span className="inline-block w-4 h-4 border-2 border-[#070A0D] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-base">published_with_changes</span>
                        <span>Update Live Store Rates</span>
                      </>
                    )}
                  </button>

                  {rateUpdatedNotice && (
                    <div className="text-[11px] text-[#C7E24E] bg-[#C7E24E]/10 p-2.5 rounded-lg border border-[#C7E24E]/30 text-center font-bold space-y-0.5 animate-fadeIn">
                      <p>✓ 22K, 18K & 14K Gold rates updated in real-time!</p>
                      <p className="text-[10px] text-[#ECEAE2]/80 font-normal">All product prices & estimators recalculated live across the store.</p>
                    </div>
                  )}
                </form>
              </div>

              <div className="bg-[#20221C] p-6 rounded-2xl border border-[#4E4C4B] space-y-3 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#B88A44] font-bold">STORE CREDENTIALS</span>
                  <h3 className="font-serif-display text-lg font-bold text-[#ECEAE2] mt-1">916 BIS Hallmark Atelier</h3>
                  <p className="text-xs text-[#ECEAE2]/70 mt-2 leading-relaxed">
                    Live bullion rates are broadcasted in real time to the hero banner, PDP calculators, and cart breakdowns.
                  </p>
                </div>
                <div className="bg-[#070A0D] p-3 rounded-xl border border-[#4E4C4B]/40 text-xs text-[#C7E24E] font-mono">
                  Cherai, Ernakulam • Since 1992
                </div>
              </div>
            </div>

            {/* Product Upload & Karat Tagging Studio */}
            <AdminProductManager currentGoldRate={newGoldRate} />
          </div>
        )}

        {/* TAB 3: Onam 2026 Campaign & Quotas */}
        {activeAdminTab === 'onam_campaign' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Campaign Config & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    )}

    {/* TAB 4: BSNL DLT SMS Gateway */}
    {activeAdminTab === 'dlt_sms' && (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-[#20221C] p-6 rounded-2xl border border-[#C7E24E]/40 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#4E4C4B]/40 pb-3">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C7E24E] font-bold">TELECOM DLT COMPLIANCE</span>
              <h3 className="font-serif-display text-xl font-bold text-[#ECEAE2]">BSNL DLT SMS OTP Configuration & Testing</h3>
            </div>
            <span className="bg-[#C7E24E]/10 text-[#C7E24E] border border-[#C7E24E]/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              TRAI DLT Verified: BSNL
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-sans">
            {/* Left 8 cols: Config form */}
            <form onSubmit={handleSaveDltConfig} className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">
                    BSNL Principal Entity (PE) ID
                  </label>
                  <input
                    type="text"
                    placeholder="17011582900000xxxxx"
                    value={dltConfig.entityId}
                    onChange={(e) => setDltConfig({ ...dltConfig, entityId: e.target.value })}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">
                    Approved Sender ID (Header)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="KAVITH"
                    value={dltConfig.senderHeader}
                    onChange={(e) => setDltConfig({ ...dltConfig, senderHeader: e.target.value.toUpperCase() })}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data font-bold text-[#C7E24E] uppercase tracking-wider outline-none focus:border-[#C7E24E]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">
                    Approved DLT Content Template ID
                  </label>
                  <input
                    type="text"
                    placeholder="17071629000000xxxxx"
                    value={dltConfig.templateId}
                    onChange={(e) => setDltConfig({ ...dltConfig, templateId: e.target.value })}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[#ECEAE2]/80 font-medium mb-1">
                    SMS Gateway Provider
                  </label>
                  <select
                    value={dltConfig.gatewayProvider}
                    onChange={(e) => setDltConfig({ ...dltConfig, gatewayProvider: e.target.value as any })}
                    className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-bold text-[#ECEAE2] outline-none"
                  >
                    <option value="simulated">Simulated DLT Mode (Testing without API key)</option>
                    <option value="fast2sms">Fast2SMS (Quick DLT API)</option>
                    <option value="msg91">MSG91 (v5 DLT OTP API)</option>
                    <option value="textlocal">Textlocal India</option>
                    <option value="twilio">Twilio India DLT Header</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#ECEAE2]/80 font-medium mb-1">
                  SMS Gateway API Key
                </label>
                <input
                  type="password"
                  placeholder="Enter API Key from Fast2SMS / MSG91 / Gateway"
                  value={dltConfig.apiKey}
                  onChange={(e) => setDltConfig({ ...dltConfig, apiKey: e.target.value })}
                  className="w-full bg-[#070A0D] border border-[#4E4C4B] p-2.5 rounded-xl text-xs font-data text-[#ECEAE2] outline-none focus:border-[#C7E24E]"
                />
                <p className="text-[10px] text-[#ECEAE2]/50 mt-1">
                  Registered Template Text: <code className="text-[#C7E24E]">{dltConfig.templateContent}</code>
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all flex items-center gap-1.5 shadow"
                >
                  <span className="material-symbols-outlined text-base">save</span>
                  <span>Save DLT Credentials</span>
                </button>
                {dltSaveNotice && (
                  <span className="text-xs text-[#C7E24E] font-bold animate-fadeIn">{dltSaveNotice}</span>
                )}
              </div>
            </form>

            {/* Right 4 cols: Live SMS OTP Tester */}
            <div className="lg:col-span-4 bg-[#070A0D] p-5 rounded-xl border border-[#4E4C4B] space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#B88A44] block">LIVE TEST SENDER</span>
                <h4 className="font-serif-display text-base font-bold text-[#ECEAE2]">Test BSNL DLT OTP Dispatch</h4>
                <p className="text-[11px] text-[#ECEAE2]/60 mt-1">
                  Send a real-time verification OTP to verify TRAI DLT header delivery.
                </p>
              </div>

              <form onSubmit={handleSendTestDltSms} className="space-y-3">
                <div>
                  <label className="block text-[11px] text-[#ECEAE2]/70 mb-1">Mobile (+91)</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#20221C] border border-[#4E4C4B] px-3 py-2.5 rounded-xl font-data text-xs font-bold text-[#C7E24E] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={testSmsLoading}
                  className="w-full bg-[#B88A44] hover:bg-[#a3793b] text-white py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-base">send_to_mobile</span>
                  <span>{testSmsLoading ? 'Sending...' : 'Send Test BSNL DLT SMS'}</span>
                </button>

                {testSmsNotice && (
                  <p className="text-[11px] text-[#C7E24E] bg-[#C7E24E]/10 p-2.5 rounded-lg border border-[#C7E24E]/30 font-data leading-tight">
                    {testSmsNotice}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    )}

      </div>
    </div>
  );
};
