import { OnamCoupon, CampaignMetrics } from '../types';

// Discount tiers as specified in brief
export const DISCOUNT_TIERS = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000];

// Initial seed mock coupons
const INITIAL_COUPONS: OnamCoupon[] = [
  {
    code: 'KJ-ONAM-7F29',
    mobile: '9876543210',
    userName: 'Anjali Menon',
    userEmail: 'anjali.menon@example.com',
    discountAmount: 5000,
    status: 'UNUSED',
    issuedAt: '2026-08-11T10:30:00Z',
    validFrom: '15 August 2026',
    validUntil: '30 September 2026',
    source: 'instagram',
  },
  {
    code: 'KJ-ONAM-9K42',
    mobile: '9123456789',
    userName: 'Rahul Nair',
    userEmail: 'rahul.nair@example.com',
    discountAmount: 2500,
    status: 'REDEEMED',
    issuedAt: '2026-08-10T14:15:00Z',
    validFrom: '15 August 2026',
    validUntil: '30 September 2026',
    source: 'qr',
    redeemedAt: '11 Aug 2026, 5:42 PM',
    redeemedStore: 'Kavitha Jewellery, Cherai',
  },
  {
    code: 'KJ-ONAM-3M88',
    mobile: '9988776655',
    discountAmount: 10000,
    status: 'UNUSED',
    issuedAt: '2026-08-11T11:00:00Z',
    validFrom: '15 August 2026',
    validUntil: '30 September 2026',
    source: 'newspaper',
  },
  {
    code: 'KJ-ONAM-1X50',
    mobile: '9840123456',
    discountAmount: 50000,
    status: 'UNUSED',
    issuedAt: '2026-08-11T12:05:00Z',
    validFrom: '15 August 2026',
    validUntil: '30 September 2026',
    source: 'store',
  }
];

const LOCAL_STORAGE_KEY = 'kavitha_onam_coupons_v1';

export function getStoredCoupons(): OnamCoupon[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load coupons', e);
  }
  return INITIAL_COUPONS;
}

export function saveStoredCoupons(coupons: OnamCoupon[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(coupons));
  } catch (e) {
    console.error('Failed to save coupons', e);
  }
}

export function getCouponByMobile(mobile: string): OnamCoupon | undefined {
  const coupons = getStoredCoupons();
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  return coupons.find((c) => c.mobile.replace(/\D/g, '').slice(-10) === cleanMobile);
}

export function getCouponByCode(code: string): OnamCoupon | undefined {
  const coupons = getStoredCoupons();
  const cleanCode = code.trim().toUpperCase();
  return coupons.find((c) => c.code.toUpperCase() === cleanCode);
}

export interface CouponPoolConfig {
  max50k: number; // default 1
  max25k: number; // default 2
  max10k: number; // default 5
  max5k: number;  // default 10
  max2500: number; // default 15
}

const DEFAULT_POOL_CONFIG: CouponPoolConfig = {
  max50k: 1,
  max25k: 2,
  max10k: 5,
  max5k: 10,
  max2500: 15,
};

const POOL_CONFIG_KEY = 'kavitha_coupon_pool_config_v2';

export function getCouponPoolConfig(): CouponPoolConfig {
  try {
    const raw = localStorage.getItem(POOL_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load coupon pool config', e);
  }
  return DEFAULT_POOL_CONFIG;
}

export function saveCouponPoolConfig(config: CouponPoolConfig): void {
  try {
    localStorage.setItem(POOL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save coupon pool config', e);
  }
}

export function calculateEffectiveMakingChargeDiscount(
  couponValue: number,
  makingCharges: number
): {
  couponValue: number;
  makingCharges: number;
  maxAllowedDiscount50Percent: number;
  actualDiscountGranted: number;
  unclaimedCouponValue: number;
} {
  const maxAllowedDiscount50Percent = Math.round(makingCharges * 0.50);
  const actualDiscountGranted = Math.min(couponValue, maxAllowedDiscount50Percent);
  const unclaimedCouponValue = Math.max(0, couponValue - actualDiscountGranted);

  return {
    couponValue,
    makingCharges,
    maxAllowedDiscount50Percent,
    actualDiscountGranted,
    unclaimedCouponValue,
  };
}

export function generateOnamCoupon(
  mobile: string, 
  source: string = 'qr', 
  userName?: string, 
  userEmail?: string,
  dateOfBirth?: string
): { coupon: OnamCoupon; isNew: boolean; message?: string } {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  const existing = getCouponByMobile(cleanMobile);

  if (existing) {
    if (userName && !existing.userName) existing.userName = userName.trim();
    if (userEmail && !existing.userEmail) existing.userEmail = userEmail.trim();
    if (dateOfBirth && !existing.dateOfBirth) existing.dateOfBirth = dateOfBirth.trim();
    
    // Save updated contact fields if any
    const all = getStoredCoupons().map((c) => 
      c.mobile.replace(/\D/g, '').slice(-10) === cleanMobile ? { ...c, ...existing } : c
    );
    saveStoredCoupons(all);

    return {
      coupon: existing,
      isNew: false,
      message: `Mobile +91 ${cleanMobile} has already tried and unlocked code ${existing.code} (₹${existing.discountAmount.toLocaleString('en-IN')} OFF). Only one voucher is permitted per mobile number.`,
    };
  }

  const currentCoupons = getStoredCoupons();
  const config = getCouponPoolConfig();

  // Count existing issued top-tier coupons
  const issued50k = currentCoupons.filter((c) => c.discountAmount === 50000).length;
  const issued25k = currentCoupons.filter((c) => c.discountAmount === 25000).length;
  const issued10k = currentCoupons.filter((c) => c.discountAmount === 10000).length;
  const issued5k = currentCoupons.filter((c) => c.discountAmount === 5000).length;
  const issued2500 = currentCoupons.filter((c) => c.discountAmount === 2500).length;

  let selectedDiscount = 50; // default low-tier baseline

  // Quota allocation algorithm:
  // 1. Try ₹50,000 if quota remaining (1 max total)
  if (issued50k < config.max50k && Math.random() < 0.08) {
    selectedDiscount = 50000;
  } 
  // 2. Try ₹25,000 if quota remaining (2 max total)
  else if (issued25k < config.max25k && Math.random() < 0.12) {
    selectedDiscount = 25000;
  } 
  // 3. Try ₹10,000 if quota remaining (5 max total)
  else if (issued10k < config.max10k && Math.random() < 0.18) {
    selectedDiscount = 10000;
  } 
  // 4. Try ₹5,000 if quota remaining (10 max total)
  else if (issued5k < config.max5k && Math.random() < 0.22) {
    selectedDiscount = 5000;
  } 
  // 5. Try ₹2,500 if quota remaining (15 max total)
  else if (issued2500 < config.max2500 && Math.random() < 0.28) {
    selectedDiscount = 2500;
  } 
  // 6. Otherwise, shuffle under ₹50 to ₹500 (mostly aligned to lower end)
  else {
    const rand = Math.random();
    if (rand < 0.55) {
      selectedDiscount = 50;    // 55% chance
    } else if (rand < 0.80) {
      selectedDiscount = 100;   // 25% chance
    } else if (rand < 0.92) {
      selectedDiscount = 250;   // 12% chance
    } else {
      selectedDiscount = 500;   // 8% chance
    }
  }

  // Generate unique 4-char hex suffix
  const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
  const code = `KJ-ONAM-${randomHex}`;

  const newCoupon: OnamCoupon = {
    code,
    mobile: cleanMobile,
    userName: userName?.trim(),
    userEmail: userEmail?.trim().toLowerCase(),
    dateOfBirth: dateOfBirth?.trim(),
    discountAmount: selectedDiscount,
    status: 'UNUSED',
    issuedAt: new Date().toISOString(),
    validFrom: '15 August 2026',
    validUntil: '30 September 2026',
    source: source || 'qr',
    sheetsSynced: true,
  };

  const updated = [newCoupon, ...currentCoupons];
  saveStoredCoupons(updated);

  return { coupon: newCoupon, isNew: true };
}

export function redeemCouponInStore(code: string, storeName: string): { success: boolean; message: string; coupon?: OnamCoupon } {
  const coupons = getStoredCoupons();
  const cleanCode = code.trim().toUpperCase();
  const index = coupons.findIndex((c) => c.code.toUpperCase() === cleanCode);

  if (index === -1) {
    return { success: false, message: 'Invalid Coupon Code. Please verify the code.' };
  }

  const coupon = coupons[index];
  if (coupon.status === 'REDEEMED') {
    return { 
      success: false, 
      message: `Coupon ${coupon.code} was ALREADY REDEEMED on ${coupon.redeemedAt} at ${coupon.redeemedStore}.`,
      coupon 
    };
  }

  const updatedCoupon: OnamCoupon = {
    ...coupon,
    status: 'REDEEMED',
    redeemedAt: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    redeemedStore: storeName || 'Kavitha Jewellery, Cherai',
  };

  coupons[index] = updatedCoupon;
  saveStoredCoupons(coupons);

  return {
    success: true,
    message: `Successfully redeemed ₹${coupon.discountAmount.toLocaleString()} discount for coupon ${coupon.code}!`,
    coupon: updatedCoupon,
  };
}

export function getCampaignMetrics(): CampaignMetrics {
  const coupons = getStoredCoupons();
  const totalLiability = coupons.reduce((sum, c) => sum + c.discountAmount, 0);
  const redeemedCoupons = coupons.filter((c) => c.status === 'REDEEMED');

  return {
    totalVisitors: coupons.length * 12 + 1840,
    totalParticipants: coupons.length + 1420,
    otpVerifiedCount: coupons.length + 1410,
    couponsIssued: coupons.length + 1410,
    couponsRedeemed: redeemedCoupons.length + 280,
    totalLiability,
    totalSalesGenerated: (redeemedCoupons.length + 280) * 85000,
  };
}
