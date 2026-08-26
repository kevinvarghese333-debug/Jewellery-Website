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
  | 'earrings'
  | 'necklaces'
  | 'bangles'
  | 'bridal'
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

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string;
  authorName: string;
  authorEmail?: string;
  location?: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  date: string;
  verifiedBuyer: boolean;
  purityBought?: string;
  occasion?: string;
  recommended?: boolean;
  helpfulCount: number;
  createdAt?: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  mobile: string;
  city?: string;
  photoURL?: string;
  authProvider?: 'google' | 'password' | 'phone' | 'guest';
  isLoggedIn: boolean;
  loyaltyPoints: number;
  lastLoginAt: string;
  createdAt?: string;
  savedWishlistCount?: number;
}

export interface OrderItemRecord {
  productId: string;
  name: string;
  category?: string;
  purity: PurityType;
  weightGrams: number;
  quantity: number;
  unitPrice?: number;
  pricePerUnit?: number;
  totalPrice: number;
  image: string;
  giftMessage?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItemRecord[];
  goldValue: number;
  makingCharges: number;
  gst: number;
  discount: number;
  couponCode?: string;
  grandTotal: number;
  totalWeightGrams: number;
  status: 'CONFIRMED' | 'HALLMARK_VERIFIED' | 'INSURED_TRANSIT' | 'DELIVERED';
  createdAt: string;
  estimatedDeliveryDate?: string;
  trackingNumber: string;
  paymentMethod: string;
  deliveryAddress?: string;
}

export interface AppointmentRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  location: string;
  type: 'video' | 'showroom';
  date: string;
  time: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedProductImage?: string;
  selectedProductPurity?: string;
  notes?: string;
  status: 'NEW' | 'CONTACTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  source: string;
  createdAt: string;
  updatedAt?: string;
  staffNotes?: string;
  syncedToGoogleSheets?: boolean;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncAt?: string;
}



