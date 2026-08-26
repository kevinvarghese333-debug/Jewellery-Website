import { OnamCoupon, CampaignMetrics } from '../types';

// Discount tiers as specified in brief
export const DISCOUNT_TIERS = [50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000] as const;

export const TIER_PRESETS = {
  balanced: {
    name: 'Balanced Festive (Standard)',
    desc: 'Heavily weighted towards ₹50–₹500 with balanced lottery excitement for ₹1K–₹50K',
    weights: { 50: 40, 100: 25, 250: 15, 500: 10, 1000: 5, 2500: 2.5, 5000: 1.5, 10000: 0.6, 25000: 0.3, 50000: 0.1 },
  },
  budget_saver: {
    name: 'Budget-Safe Retail Mode',
    desc: 'Focuses payouts on ₹50 to ₹250 tiers, strictly rationing higher-value vouchers',
    weights: { 50: 60, 100: 25, 250: 10, 500: 3.5, 1000: 1, 2500: 0.3, 5000: 0.15, 10000: 0.04, 25000: 0.01, 50000: 0.001 },
  },
  high_excitement: {
    name: 'High-Reward Festive Mode',
    desc: 'Boosts probability for medium and high value vouchers (₹1K, ₹5K, ₹10K, ₹25K, ₹50K)',
    weights: { 50: 15, 100: 15, 250: 20, 500: 20, 1000: 15, 2500: 8, 5000: 4, 10000: 2, 25000: 0.8, 50000: 0.2 },
  },
  uniform: {
    name: 'Uniform Equal Spread',
    desc: 'Equal chance across all active tiers in the min-max range',
    weights: { 50: 10, 100: 10, 250: 10, 500: 10, 1000: 10, 2500: 10, 5000: 10, 10000: 10, 25000: 10, 50000: 10 },
  },
} as const;

export interface CouponPoolConfig {
  minDiscount: number; // e.g. 50 (slider 50 to 5000)
  maxDiscount: number; // e.g. 50000 (slider 1000 to 50000)
  allocationMode: 'custom' | 'balanced' | 'budget_saver' | 'high_excitement' | 'uniform';
  // Quota limits for top tiers & all tiers
  max50k: number;
  max25k: number;
  max10k: number;
  max5k: number;
  max2500: number;
  max1000?: number;
  max500?: number;
  max250?: number;
  max100?: number;
  max50?: number;
  // Probability weight sliders for all tiers (₹50 to ₹50,000)
  tierWeights: Record<number, number>;
  // Quota limits mapping
  tierQuotas: Record<number, number>;
}

const DEFAULT_POOL_CONFIG: CouponPoolConfig = {
  minDiscount: 50,
  maxDiscount: 50000,
  allocationMode: 'balanced',
  max50k: 1,
  max25k: 2,
  max10k: 5,
  max5k: 10,
  max2500: 15,
  max1000: 50,
  max500: 200,
  max250: 500,
  max100: 1000,
  max50: 5000,
  tierWeights: {
    50: 40,
    100: 25,
    250: 15,
    500: 10,
    1000: 5,
    2500: 2.5,
    5000: 1.5,
    10000: 0.6,
    25000: 0.3,
    50000: 0.1,
  },
  tierQuotas: {
    50: 5000,
    100: 1000,
    250: 500,
    500: 200,
    1000: 50,
    2500: 15,
    5000: 10,
    10000: 5,
    25000: 2,
    50000: 1,
  },
};

const POOL_CONFIG_KEY = 'kavitha_coupon_pool_config_v3';

export function getCouponPoolConfig(): CouponPoolConfig {
  try {
    const raw = localStorage.getItem(POOL_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_POOL_CONFIG,
        ...parsed,
        tierWeights: {
          ...DEFAULT_POOL_CONFIG.tierWeights,
          ...(parsed.tierWeights || {}),
        },
        tierQuotas: {
          ...DEFAULT_POOL_CONFIG.tierQuotas,
          ...(parsed.tierQuotas || {}),
        },
      };
    }
  } catch (e) {
    console.error('Failed to load coupon pool config', e);
  }
  return DEFAULT_POOL_CONFIG;
}

export function saveCouponPoolConfig(config: CouponPoolConfig): void {
  try {
    // Keep max50k..max2500 in sync with tierQuotas
    const syncedConfig: CouponPoolConfig = {
      ...config,
      max50k: config.tierQuotas?.[50000] ?? config.max50k ?? 1,
      max25k: config.tierQuotas?.[25000] ?? config.max25k ?? 2,
      max10k: config.tierQuotas?.[10000] ?? config.max10k ?? 5,
      max5k: config.tierQuotas?.[5000] ?? config.max5k ?? 10,
      max2500: config.tierQuotas?.[2500] ?? config.max2500 ?? 15,
    };
    localStorage.setItem(POOL_CONFIG_KEY, JSON.stringify(syncedConfig));
  } catch (e) {
    console.error('Failed to save coupon pool config', e);
  }
}

/**
 * Calculates normalized percentage probabilities for each tier
 */
export function calculateNormalizedPercentages(
  tierWeights: Record<number, number>,
  minDiscount: number = 50,
  maxDiscount: number = 50000
): Record<number, number> {
  const eligibleTiers = DISCOUNT_TIERS.filter((t) => t >= minDiscount && t <= maxDiscount);
  const totalWeight = eligibleTiers.reduce((acc, t) => acc + (tierWeights[t] || 0), 0);

  const result: Record<number, number> = {};
  DISCOUNT_TIERS.forEach((t) => {
    if (t < minDiscount || t > maxDiscount || totalWeight <= 0) {
      result[t] = 0;
    } else {
      result[t] = Math.round(((tierWeights[t] || 0) / totalWeight) * 1000) / 10; // 1 decimal place
    }
  });
  return result;
}

/**
 * Core Random Allocation Engine: Samples a random discount from ₹50 to ₹50,000
 * respecting min/max sliders, probability weights, and tier quota limits.
 */
export function sampleRandomDiscount(
  config?: CouponPoolConfig,
  currentCoupons?: OnamCoupon[]
): number {
  const activeConfig = config || getCouponPoolConfig();
  const coupons = currentCoupons || getStoredCoupons();

  const minBound = activeConfig.minDiscount || 50;
  const maxBound = activeConfig.maxDiscount || 50000;

  // Filter tiers within active min-max slider range
  const candidateTiers = DISCOUNT_TIERS.filter((t) => t >= minBound && t <= maxBound);

  // Check remaining quota for each candidate tier
  const tierRemainingQuotas: Record<number, number> = {};
  candidateTiers.forEach((tier) => {
    const maxAllowed =
      activeConfig.tierQuotas?.[tier] ??
      (tier === 50000 ? activeConfig.max50k :
       tier === 25000 ? activeConfig.max25k :
       tier === 10000 ? activeConfig.max10k :
       tier === 5000 ? activeConfig.max5k :
       tier === 2500 ? activeConfig.max2500 : 99999);

    const issuedCount = coupons.filter((c) => c.discountAmount === tier).length;
    tierRemainingQuotas[tier] = Math.max(0, maxAllowed - issuedCount);
  });

  // Filter to tiers that still have quota available
  const availableTiers = candidateTiers.filter((t) => tierRemainingQuotas[t] > 0);

  if (availableTiers.length === 0) {
    // If all candidate quotas exhausted, return lowest valid candidate or fallback to 50
    return candidateTiers[0] || 50;
  }

  // Calculate total weight of available tiers
  const weights = activeConfig.tierWeights || DEFAULT_POOL_CONFIG.tierWeights;
  const totalWeight = availableTiers.reduce((sum, t) => sum + (weights[t] || 1), 0);

  if (totalWeight <= 0) {
    return availableTiers[0];
  }

  // Weighted random roll
  let randomVal = Math.random() * totalWeight;
  for (const tier of availableTiers) {
    const weight = weights[tier] || 1;
    if (randomVal <= weight) {
      return tier;
    }
    randomVal -= weight;
  }

  return availableTiers[availableTiers.length - 1];
}

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

  // Draw random discount adhering to configurable tier weights, range bounds, and quotas
  const selectedDiscount = sampleRandomDiscount(config, currentCoupons);

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
