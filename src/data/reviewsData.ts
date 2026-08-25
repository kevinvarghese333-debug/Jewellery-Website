import { ProductReview } from '../types';
import { db, collection, query, where, getDocs, doc, setDoc } from '../lib/firebase';
import { fetchUserOrderHistory } from './firebaseAuthService';

const REVIEWS_COLLECTION = 'reviews';
const LOCAL_STORAGE_KEY_PREFIX = 'kavitha_reviews_prod_';

// Initial curated reviews for popular Kavitha jewellery pieces
const PRODUCT_SPECIFIC_REVIEWS: Record<string, ProductReview[]> = {
  'veda-antique-choker': [
    {
      id: 'rev-v1',
      productId: 'veda-antique-choker',
      authorName: 'Ananya Nair',
      location: 'Kochi, Kerala',
      rating: 5,
      title: 'Exquisite 22K Craftsmanship & Authentic Hallmark',
      comment: 'The temple engraving detail is breathtaking in person. Weight was verified at our local assayer and was exactly 52.4g as stated. Received in a tamper-evident velvet box within 2 days with full BIS 916 certification.',
      date: '12 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Bridal Trousseau',
      recommended: true,
      helpfulCount: 38,
    },
    {
      id: 'rev-v2',
      productId: 'veda-antique-choker',
      authorName: 'Meera Kurup',
      location: 'Trivandrum, Kerala',
      rating: 5,
      title: 'Perfect Bridal Piece with Price Lock Guarantee',
      comment: 'Inspected this on their live video consultation call before booking. The antique matte gold finish has a gorgeous traditional warm glow that paired majestically with my Kanjeevaram saree.',
      date: '04 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Wedding Day',
      recommended: true,
      helpfulCount: 22,
    },
    {
      id: 'rev-v3',
      productId: 'veda-antique-choker',
      authorName: 'Lakshmi Menon',
      location: 'Thrissur, Kerala',
      rating: 5,
      title: 'Sturdy Clasp & Genuine 916 BIS Stamp',
      comment: 'Very solid build quality, comfortable neckline contouring, and no sharp edges. The BIS hallmarking stamp is clearly embossed near the adjustable back link.',
      date: '28 Jul 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Family Function',
      recommended: true,
      helpfulCount: 14,
    },
  ],
  'padma-layered-haaram': [
    {
      id: 'rev-p1',
      productId: 'padma-layered-haaram',
      authorName: 'Deepa Varma',
      location: 'Calicut, Kerala',
      rating: 5,
      title: 'Majestic Grandeur for My Daughter’s Wedding',
      comment: 'The 3-layer waterfall flow sits gracefully across the neckline. The floral ruby centerpieces glisten without overpowering the pure gold radiance. Worth every sovereign invested.',
      date: '18 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Bridal Trousseau',
      recommended: true,
      helpfulCount: 29,
    },
    {
      id: 'rev-p2',
      productId: 'padma-layered-haaram',
      authorName: 'Smitha Joseph',
      location: 'Ernakulam, Kerala',
      rating: 5,
      title: 'Transparent Pricing Breakdown & Friendly Staff',
      comment: 'I really appreciated the live transparent breakdown of making charges and GST before placing the order. Hallmarking certificate was included in the velvet box.',
      date: '09 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Anniversary Gift',
      recommended: true,
      helpfulCount: 17,
    },
  ],
  'mayura-kasu-bangles': [
    {
      id: 'rev-m1',
      productId: 'mayura-kasu-bangles',
      authorName: 'Reshma Pillai',
      location: 'Kottayam, Kerala',
      rating: 5,
      title: 'Authentic Traditional Kasu Mala Motifs',
      comment: 'The Lakshmi coin embossings on each bangle are crisp and deep. Perfect sound and weight balance. Wearing them feels like wearing heritage heirlooms.',
      date: '14 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Onam / Festive',
      recommended: true,
      helpfulCount: 25,
    },
    {
      id: 'rev-m2',
      productId: 'mayura-kasu-bangles',
      authorName: 'Pooja Hegde',
      location: 'Bangalore, Karnataka',
      rating: 4,
      title: 'Stunning Finish, Sizing is Accurate',
      comment: 'Ordered size 2.6 and it fits comfortably over the knuckle with zero pinching. Delivered via insured BlueDart in sealed security packaging.',
      date: '02 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Festive Wear',
      recommended: true,
      helpfulCount: 11,
    },
  ],
  default: [
    {
      id: 'rev-d1',
      productId: 'default',
      authorName: 'Ananya Nair',
      location: 'Kochi, Kerala',
      rating: 5,
      title: 'Exquisite 22K Craftsmanship & Authentic Hallmark',
      comment: 'The handcrafted detail is breathtaking in person. Weight was verified at our local assayer and was accurate to the milligram. Received in a tamper-evident velvet box with full documentation.',
      date: '12 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Bridal / Festive',
      recommended: true,
      helpfulCount: 28,
    },
    {
      id: 'rev-d2',
      productId: 'default',
      authorName: 'Meera Kurup',
      location: 'Trivandrum, Kerala',
      rating: 5,
      title: 'Certified Gold Purity with Price Lock Guarantee',
      comment: 'Inspected this on their live video consultation call before booking. The warm gold luster and comfortable contouring make this an unforgettable heirloom piece.',
      date: '04 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Special Occasion',
      recommended: true,
      helpfulCount: 19,
    },
    {
      id: 'rev-d3',
      productId: 'default',
      authorName: 'Lakshmi Menon',
      location: 'Thrissur, Kerala',
      rating: 4,
      title: 'Sturdy Build & Genuine 916 BIS Stamp',
      comment: 'Very solid build quality, comfortable weight distribution, and pure 916 BIS hallmark clearly visible. Highly recommended!',
      date: '28 Jul 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      occasion: 'Daily Elegance',
      recommended: true,
      helpfulCount: 12,
    },
  ],
};

/**
 * Returns synchronized reviews for a product (LocalStorage cached + seeds)
 */
export function getProductReviews(productId: string): ProductReview[] {
  if (typeof window === 'undefined') {
    return PRODUCT_SPECIFIC_REVIEWS[productId] || PRODUCT_SPECIFIC_REVIEWS.default.map(r => ({ ...r, productId }));
  }

  const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`);
  if (saved) {
    try {
      const parsed: ProductReview[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Error parsing reviews from localStorage', e);
    }
  }

  // Return specific or default seeded reviews
  const defaultList = PRODUCT_SPECIFIC_REVIEWS[productId] || PRODUCT_SPECIFIC_REVIEWS.default.map((r) => ({ ...r, productId }));
  return defaultList;
}

/**
 * Fetches reviews from Firestore in real-time or async, merging with local
 */
export async function fetchProductReviewsFromCloud(productId: string): Promise<ProductReview[]> {
  const localList = getProductReviews(productId);
  const reviewMap = new Map<string, ProductReview>();
  
  // Seed with local list
  localList.forEach(r => reviewMap.set(r.id, r));

  try {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('productId', '==', productId)
    );
    const snap = await getDocs(q);
    snap.forEach((docSnap) => {
      const cloudReview = docSnap.data() as ProductReview;
      reviewMap.set(cloudReview.id, cloudReview);
    });

    const merged = Array.from(reviewMap.values()).sort((a, b) => {
      return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(merged));
    }
    return merged;
  } catch (e) {
    console.warn('Could not load reviews from Firestore cloud:', e);
    return localList;
  }
}

/**
 * Save new review to local cache and Firestore cloud
 */
export async function saveProductReview(
  productId: string, 
  review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount' | 'createdAt'>
): Promise<ProductReview> {
  const current = getProductReviews(productId);
  const now = new Date();
  const newReview: ProductReview = {
    ...review,
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: now.toISOString(),
    helpfulCount: 0,
  };

  const updated = [newReview, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(updated));
  }

  // Save to Firestore if available
  try {
    const reviewDocRef = doc(db, REVIEWS_COLLECTION, newReview.id);
    await setDoc(reviewDocRef, newReview);
  } catch (e) {
    console.warn('Could not sync review to Firestore cloud:', e);
  }

  return newReview;
}

/**
 * Vote review as helpful
 */
export function voteReviewHelpful(productId: string, reviewId: string): ProductReview[] {
  const current = getProductReviews(productId);
  const updated = current.map((r) => {
    if (r.id === reviewId) {
      return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
    }
    return r;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(updated));
  }

  // Update cloud doc if possible
  try {
    const updatedReview = updated.find(r => r.id === reviewId);
    if (updatedReview) {
      const reviewDocRef = doc(db, REVIEWS_COLLECTION, reviewId);
      setDoc(reviewDocRef, updatedReview, { merge: true }).catch(() => {});
    }
  } catch (e) {
    console.warn('Could not sync helpful vote to Firestore:', e);
  }

  return updated;
}

/**
 * Checks whether an authenticated user has previously purchased this piece
 */
export async function checkUserVerifiedBuyer(userId?: string, userEmail?: string, productId?: string): Promise<boolean> {
  if (!userId && !userEmail) return false;
  try {
    const orders = await fetchUserOrderHistory(userId, userEmail);
    if (!orders || orders.length === 0) return false;
    if (!productId) return orders.length > 0;

    return orders.some((order) => 
      order.items?.some((item) => item.productId === productId)
    );
  } catch (e) {
    console.warn('Error checking verified buyer status:', e);
    return false;
  }
}
