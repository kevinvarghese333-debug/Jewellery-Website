import { ProductReview } from '../types';

// Default authentic sample reviews for Kavitha Jewellery pieces
const INITIAL_REVIEWS: Record<string, ProductReview[]> = {
  default: [
    {
      id: 'rev-1',
      productId: 'default',
      authorName: 'Ananya Nair',
      location: 'Kochi, Kerala',
      rating: 5,
      title: 'Exquisite 22K Craftsmanship & Authentic Hallmark',
      comment: 'The temple engraving detail is breathtaking in person. Weight was verified at our local assayer and was exactly 28.5g as stated. Received in a tamper-evident velvet box within 2 days.',
      date: '12 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      helpfulCount: 24,
    },
    {
      id: 'rev-2',
      productId: 'default',
      authorName: 'Meera Kurup',
      location: 'Trivandrum, Kerala',
      rating: 5,
      title: 'Perfect Bridal Piece with Price Lock Guarantee',
      comment: 'Inspected this on their live video call service before ordering. The gold finish has a gorgeous traditional antique warm glow. Highly recommended for bridal shopping!',
      date: '04 Aug 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      helpfulCount: 18,
    },
    {
      id: 'rev-3',
      productId: 'default',
      authorName: 'Lakshmi Menon',
      location: 'Thrissur, Kerala',
      rating: 4,
      title: 'Sturdy Clasp & Genuine 916 BIS Stamp',
      comment: 'Very solid build quality and comfortable weight distribution. The BIS hallmarking stamp is clearly visible on the back clasp.',
      date: '28 Jul 2026',
      verifiedBuyer: true,
      purityBought: '22K',
      helpfulCount: 9,
    },
  ],
};

const LOCAL_STORAGE_KEY_PREFIX = 'kavitha_reviews_prod_';

export function getProductReviews(productId: string): ProductReview[] {
  if (typeof window === 'undefined') return INITIAL_REVIEWS.default;

  const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error parsing reviews from localStorage', e);
    }
  }

  // Return default reviews customized for product
  const defaultList = INITIAL_REVIEWS.default.map((r) => ({ ...r, productId }));
  return defaultList;
}

export function saveProductReview(productId: string, review: Omit<ProductReview, 'id' | 'date' | 'helpfulCount'>): ProductReview {
  const current = getProductReviews(productId);
  const newReview: ProductReview = {
    ...review,
    id: `rev-${Date.now()}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    helpfulCount: 0,
  };

  const updated = [newReview, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(updated));
  }
  return newReview;
}

export function voteReviewHelpful(productId: string, reviewId: string): ProductReview[] {
  const current = getProductReviews(productId);
  const updated = current.map((r) => {
    if (r.id === reviewId) {
      return { ...r, helpfulCount: r.helpfulCount + 1 };
    }
    return r;
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(updated));
  }
  return updated;
}
