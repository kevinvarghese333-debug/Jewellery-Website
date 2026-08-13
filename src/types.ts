export type CategoryType = 
  | 'Chokers' 
  | 'Long Necklaces (Haaram)' 
  | 'Layered Necklaces' 
  | 'Earrings' 
  | 'Bangles & Bracelets' 
  | 'Rings' 
  | 'Bridal Trousseau';

export type PurityType = '14K' | '18K' | '22K';

export interface ProductImageSet {
  main: string;
  angle?: string;
  clasp?: string;
  worn?: string;
  videoThumbnail?: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryType;
  purity: PurityType;
  purityBadge: string; // e.g. '22K/916'
  weightGrams: number;
  basePrice: number; // e.g. 284500
  size?: string;
  description: string;
  images: ProductImageSet;
  updatedTime: string;
  isNewArrival?: boolean;
  isBestseller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedPurity: PurityType;
  giftMessage?: string;
}

export interface FilterState {
  categories: CategoryType[];
  purities: PurityType[];
  minPrice: number;
  maxPrice: number;
  searchQuery: string;
  sortBy: 'newest' | 'price-asc' | 'price-desc' | 'weight-asc' | 'weight-desc';
}

export type ActiveView = 
  | 'home' 
  | 'catalog' 
  | 'pdp' 
  | 'cart' 
  | 'wishlist' 
  | 'locations'
  | 'onam-campaign'
  | 'staff-redemption'
  | 'campaign-admin';

export interface PriceBreakdown {
  goldValue: number;
  makingCharges: number;
  wastage: number;
  bisHallmarking: number;
  gst: number;
  total: number;
}

export interface OnamCoupon {
  code: string;
  mobile: string;
  userName?: string;
  userEmail?: string;
  discountAmount: number; // 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000
  status: 'UNUSED' | 'REDEEMED' | 'EXPIRED';
  issuedAt: string;
  validFrom: string;
  validUntil: string;
  source: string; // e.g., 'instagram', 'qr', 'newspaper', 'whatsapp', 'store'
  redeemedAt?: string;
  redeemedStore?: string;
}

export interface CampaignMetrics {
  totalVisitors: number;
  totalParticipants: number;
  otpVerifiedCount: number;
  couponsIssued: number;
  couponsRedeemed: number;
  totalLiability: number;
  totalSalesGenerated: number;
}

