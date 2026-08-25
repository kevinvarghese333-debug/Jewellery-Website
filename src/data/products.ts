import { Product, PriceBreakdown, CategoryType } from '../types';

export const CURRENT_GOLD_RATE_22K = 15010; // ₹ per gram (₹1,20,080 per 8g / 1 Sovereign)
export const CURRENT_GOLD_RATE_18K = 12281; // ₹ per gram (18K Hallmark 750)
export const CURRENT_GOLD_RATE_14K = 9552;  // ₹ per gram (14K Hallmark 585)

/**
 * Returns the exact per-gram bullion rate for a specific gold purity (22K, 18K, 14K)
 * given a base 22K gold rate.
 */
export function getGoldRateForPurity(
  purity: '14K' | '18K' | '22K' | string = '22K',
  base22kRate: number = CURRENT_GOLD_RATE_22K
): number {
  if (purity === '18K' || purity === '18k') {
    // 18K gold is 75.0% pure (18/22 of 22K rate)
    return Math.round(base22kRate * (18 / 22));
  }
  if (purity === '14K' || purity === '14k') {
    // 14K gold is 58.33% pure (14/22 of 22K rate)
    return Math.round(base22kRate * (14 / 22));
  }
  return base22kRate;
}

export function calculatePriceBreakdown(
  weightGrams: number,
  purity: '14K' | '18K' | '22K' = '22K',
  customRate?: number
): PriceBreakdown {
  const base22kRate = customRate && customRate > 0 ? customRate : CURRENT_GOLD_RATE_22K;
  const ratePerGram = getGoldRateForPurity(purity, base22kRate);

  const goldValue = Math.round(weightGrams * ratePerGram);
  const makingCharges = Math.round(goldValue * 0.08); // 8% making
  const wastage = Math.round(goldValue * 0.02); // 2% wastage
  const bisHallmarking = 45;
  const taxableSubtotal = goldValue + makingCharges + wastage + bisHallmarking;
  const gst = Math.round(taxableSubtotal * 0.03); // 3% GST
  const total = taxableSubtotal + gst;

  return {
    goldValue,
    makingCharges,
    wastage,
    bisHallmarking,
    gst,
    total,
  };
}

export function getLiveProductPrice(
  product: Product,
  customGoldRate?: number
): number {
  return calculatePriceBreakdown(
    product.weightGrams,
    product.purity,
    customGoldRate
  ).total;
}

export interface CategoryMeta {
  slug: string;
  name: string;
  subtitle: string;
  tagline: string;
  description: string;
  heroImage: string;
  filterCategories: CategoryType[];
}

export const CATEGORY_METAS: Record<string, CategoryMeta> = {
  earrings: {
    slug: 'earrings',
    name: 'Gold Earrings Collection',
    subtitle: 'SOUTH INDIAN 22K 916 GOLD',
    tagline: 'Timeless Jhumkas, Chandbalis, Studs & Sui-Dhaga Drops',
    description: 'Handcrafted with unyielding precision and certified 916 BIS Hallmark purity. Discover festive temple jhumkas, lightweight daily studs, and royal dangling chandbalis.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
    filterCategories: ['Earrings'],
  },
  necklaces: {
    slug: 'necklaces',
    name: 'Gold Necklaces & Haarams',
    subtitle: 'SOUTH INDIAN 22K 916 GOLD',
    tagline: 'Opulent Haarams, Chokers, Kasu Malas & Layered Chains',
    description: 'From grand bridal Haarams to modern layered chains, each masterpiece is crafted with pure certified 22K gold, gemstone accents, and heirloom South Indian artistry.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w',
    filterCategories: ['Chokers', 'Long Necklaces (Haaram)', 'Layered Necklaces'],
  },
  bangles: {
    slug: 'bangles',
    name: 'Gold Bangles & Kadas',
    subtitle: 'SOUTH INDIAN 22K 916 GOLD',
    tagline: 'Temple Kadas, Filigree Stacked Bangles & Modern Bracelets',
    description: 'Adorn your wrists with pure 22K gold bangles engineered for perfect comfort, laser-etched motifs, and durable daily and bridal wear.',
    heroImage: '/products/bangle-stacked.jpg',
    filterCategories: ['Bangles & Bracelets'],
  },
  bridal: {
    slug: 'bridal',
    name: 'Bridal Trousseau Masterpieces',
    subtitle: 'ROYAL WEDDING COLLECTION',
    tagline: 'Complete South Indian Bridal Heritage Suites & Ensembles',
    description: 'Curated bridal suites comprising regal Haarams, antique chokers, matching jhumkas, and temple mathapattis celebrating sacred wedding vows.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJKWUVghuy30UPwFO2WMmEd7YHWo11egA-wFUjGbtU9F2d-uiWW7qCaJI817iU9zyBbfD4nUBA4MTaEpY7kFSNrK_F5u0ERRZ9Rx5nDr2nAmae3VVMomxkFaGPEZ5FWFRmV7kCIPeTPHXkFn3N7TFFoVk_THGBYml7q2gmn0avvovzBN3_OPh7bS9lGKAWAxsSgGHPpvj-lVsxfxOQ7gOUBnBoRAMbrm04yD81Ee4SG5nQjlwzoQWsLg',
    filterCategories: ['Bridal Trousseau'],
  },
  catalog: {
    slug: 'catalog',
    name: 'Complete Gold Jewellery Catalogue',
    subtitle: 'SOUTH INDIAN 22K & 18K GOLD',
    tagline: '100% Certified 916 BIS Hallmark Masterpieces',
    description: 'Explore the full spectrum of Kavitha Jewellery creations with transparent, real-time live gold bullion pricing.',
    heroImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmHYU8wUqinFDzeGt8ub6VQNZFfyqERj7KV2dfauJLf3tXTMZzR5_LLIybr8PjBevHxN5OSMYWEBa9wmkWe6IYA-Oj7arHwELxBeQIMPOhGyJlNvGjMYjCnrYwL-EhtW8WCVamxBLET_9qjmwbqXPCShF69W3LYKoRdnCBRzCNXHFskL8m22jVsfSVfFx7wKVkXokoMTr3u2RgeUFTBgroWOaFSxAEu3othqqDJBg8NkHgne3tQStBPQ',
    filterCategories: ['Chokers', 'Long Necklaces (Haaram)', 'Layered Necklaces', 'Earrings', 'Bangles & Bracelets', 'Bridal Trousseau', 'Rings'],
  }
};

export const PRODUCTS: Product[] = [
  // ==================== EARRINGS ====================
  {
    id: 'kanak-heritage-jhumka',
    name: 'Kanak Temple Jhumka Earrings',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 18.600,
    basePrice: 325500,
    size: 'Standard Jhumka (2.2 inches)',
    description: 'Classic bell-shaped 22K gold Jhumkas with intricate umbrella filigree, ruby stone stud top, and dangling micro-gold beads.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
      angle: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'mayura-antique-chandbali',
    name: 'Mayura Peacock Antique Chandbalis',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 24.500,
    basePrice: 428000,
    size: 'Large Crescent (2.5 inches)',
    description: 'Royal peacock engraved crescent Chandbali earrings embellished with natural seed pearls and antique matte gold finish.',
    images: {
      main: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
      angle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'saira-diamond-cut-studs',
    name: 'Saira Diamond-Cut Gold Tops Studs',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 7.200,
    basePrice: 126000,
    size: '14mm Daily Wear Studs',
    description: 'Brilliant multi-faceted diamond-cut 22K gold studs designed for comfortable everyday wear and maximum light reflection.',
    images: {
      main: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'ananya-sui-dhaga-drops',
    name: 'Ananya Sui-Dhaga Hanging Drop Earrings',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 12.400,
    basePrice: 217000,
    size: '3.0 inches Threader Style',
    description: 'Slender threader Sui-Dhaga earrings featuring gold sphere drops and delicate box chain linkages.',
    images: {
      main: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'padmavathi-ruby-jhumki',
    name: 'Padmavathi Heritage Ruby Temple Jhumkas',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 28.600,
    basePrice: 500500,
    size: 'Grand Bridal (3.2 inches)',
    description: 'Heirloom temple earrings featuring dancing peacock motifs, handset cabochon rubies, and tiered cascading gold tassels.',
    images: {
      main: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'tara-daily-gold-studs',
    name: 'Tara Minimalist 18K Yellow Gold Studs',
    category: 'Earrings',
    purity: '18K',
    purityBadge: '18K/750',
    weightGrams: 4.800,
    basePrice: 68000,
    size: '10mm Minimal Studs',
    description: 'Ultra-lightweight 18K hallmarked geometric button studs with secure screw-back fastening.',
    images: {
      main: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },

  // ==================== NECKLACES (CHOKERS, HAARAM, LAYERED) ====================
  {
    id: 'veda-antique-choker',
    name: 'Veda Antique Gold Choker',
    category: 'Chokers',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 52.400,
    basePrice: 917000,
    size: 'Adjustable (14-16 inches)',
    description: 'A breathtaking South Indian antique gold choker featuring intricate temple architecture motifs, ruby stone accents, and pure 22K gold matte finish.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmHYU8wUqinFDzeGt8ub6VQNZFfyqERj7KV2dfauJLf3tXTMZzR5_LLIybr8PjBevHxN5OSMYWEBa9wmkWe6IYA-Oj7arHwELxBeQIMPOhGyJlNvGjMYjCnrYwL-EhtW8WCVamxBLET_9qjmwbqXPCShF69W3LYKoRdnCBRzCNXHFskL8m22jVsfSVfFx7wKVkXokoMTr3u2RgeUFTBgroWOaFSxAEu3othqqDJBg8NkHgne3tQStBPQ',
      angle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBTJ89hJPkyGuMawYWJJXeRektqx4Yc0T3Q3LNbwzQNB3PyzZbjSwEMC71GRU29NL1T7I_FvJF18SONxLXOGsUTeSjP5GLb7hUYRtAr0iVAEiv_stuOSO0Ff9UwBb9PVys6RHDE8jYtnxpLvxB_jMsZJAU-mpQjhPx5-7PZ67QNlNQRNUaY5FgJmVh60cwYX2fvVx74onTSO_P6xqamfd5tTuwlx7ErwjDF8gkGRe2uHIdlPvHhBTkLw',
      clasp: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtut6Cx-0NZgQtSupfc_Kt9b13w6xLNPARZI15704Qh0BHUcFSOy8kDCP-3cFaQ5iFOUMOs706_YS7snZ6VLNFUTkUl0P3mEXamR3c1mjuSdYloamK_QtpLChigrTWtG5-QMCRSUxzABifZ8G7emcB7VDrvEHZu6IFmYBhhYqM2NO4Dt0quzKB9OxyIYRykmh0yY_V9nDgf9kfDmxh7YziRFnXD0CMDgRIDfuX63g_s5DZmT9NjqHBNg',
      worn: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr9RanlAJtYqsv2tRn3d_EL2L8vaLXUbVIu_UHGhNQtK-qYnxRxDfZxm2fXWPJyr48C2vniKwlpw7Et_cOGdt5CCztZcHktur3Xh9l35giORxW6Qt4oRJbmnrfoVfmfpltanrtQNQBcyd8U6_M3jVrjKPJX501C1pmES7DMb_AlJlREkS9X1ZdDR1Um3EuJpJZe9rIVT_1Sh6gUHybCQrgcickJD99wThRi_Pulo4-OT08Ns4DREvd6w',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'aadhya-gold-choker',
    name: 'Aadhya Temple Gold Choker',
    category: 'Chokers',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 45.200,
    basePrice: 791000,
    size: 'Standard Choker (14 inches)',
    description: 'Timeless temple design choker adorned with traditional goddess Lakshmi embossing and pearl drops crafted in pure 22K hallmarked gold.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2LD4EynmHUiSa2iUjBub5_4fJ3KqAuFeP9CWSHdy-Qs9S_ar9cztaP65r79HtvXEPnVvRdurPo40RPRANKfULXjcNybNbnVpd7lsBihe29RgiSQPNWvsLaeXjblhkcgzk6lrJAkpdy_sYkOlPiBXvG_83WL58r48PfPS7-SBRp7PrUkAPkCPs940lAy5fdw8NIZ3Qgske56yX9C60Bw1NKKgVABZ2e5-Zb6YJDQCY-SMxi68G2l0EUA',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'lakshmi-heritage-haaram',
    name: 'Lakshmi Heritage Grand Haaram',
    category: 'Long Necklaces (Haaram)',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 68.500,
    basePrice: 1198750,
    size: '24 inches Long Haaram',
    description: 'An opulent multi-layer long Haaram necklace crafted for grand bridal occasions with traditional South Indian filigree and pendant work.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQkNbh7U8E8PIZjPFckcuwsh8Soy2oIZsVW6ykjHxXh5QIkyPePcNz3K1y6tFvpU0hKzG5Rnfz2RoUDBVHreXXzoHB2CglUsIFS0QrdObwmljsVpeFii6GYTk5gKZAxRd1b4g_HK91udMIAtp15HhiH97W_dX3tkKHbU4g74ecRtLVCBCZGt-mLcQu0Tqrbh93L6AMcV4FU07iUwA2JTKl9kmhuITccNfXxXyTuwSOigHQ7zH32s2tyg',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'kasu-mala-heritage-haaram',
    name: 'Traditional Kerala Kasu Mala Long Haaram',
    category: 'Long Necklaces (Haaram)',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 64.000,
    basePrice: 1120000,
    size: '26 inches Long Coin Chain',
    description: 'The definitive Kerala bridal classic featuring overlapping Lakshmi coins (Kasu) hand-strung in 22K 916 gold with ruby central accents.',
    images: {
      main: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'nagas-antique-mango-mala',
    name: 'Nagas Antique Manga Mala (Mango Necklace)',
    category: 'Long Necklaces (Haaram)',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 58.200,
    basePrice: 1018500,
    size: '22 inches Medium Haaram',
    description: 'Iconic South Indian Manga Mala crafted with handcrafted paisley mango motifs, closed setting red spinels, and antique god motifs.',
    images: {
      main: 'https://images.unsplash.com/photo-1611591475155-4284ec289e01?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'tara-layered-chain',
    name: 'Tara Minimalist Layered Chain',
    category: 'Layered Necklaces',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 24.100,
    basePrice: 421750,
    size: '16-18 inches Double Layer',
    description: 'Contemporary double-layered 22K gold chain featuring minimalist geometric coin and bar pendants for modern elegance.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADBDQhW9epSYjMwAjeeygzoiFxq282SW12zIBj05VWir803-62SiQmXl5g4Va4Z4v0HCGepDXsumJrPwzFTAOEOWQ0xMcyEq6TVmmWO3tezgO4N-XvnW8uhK0ka9VyRjieWO9Dfx0-gOetkjMiCP1FMMmCLzbhLvvSEmFLmm9rVPyxFFaTjCNnIOijTnGCRQOizFd6gt5rbxYFYgX3jGqpeivNGgbrheLHDy2sngiyS7VJXjkzSOxdbQ',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'navya-pendant-necklace',
    name: 'Navya Contemporary 18K Gold Pendant',
    category: 'Layered Necklaces',
    purity: '18K',
    purityBadge: '18K/750',
    weightGrams: 14.200,
    basePrice: 201200,
    size: '18 inches Chain',
    description: 'Modern 18K yellow gold pendant necklace designed for everyday refined luxury and casual festive styling.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'devika-emerald-floral-choker',
    name: 'Devika Royal Emerald & Gold Choker',
    category: 'Chokers',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 38.400,
    basePrice: 672000,
    size: '14.5 inches Choker',
    description: 'Intricate floral filigree choker highlighted with natural Zambian emerald stones and south sea pearl droplets.',
    images: {
      main: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },

  // ==================== BANGLES & BRACELETS ====================
  {
    id: 'samriddhi-gold-bangles',
    name: 'Samriddhi Stacked Gold Bangles (Set of 4)',
    category: 'Bangles & Bracelets',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 42.000,
    basePrice: 735000,
    size: 'Size 2-6 (Standard 2.4 - 2.8)',
    description: 'Set of 4 hand-engraved 22K yellow gold bangles featuring traditional floral motifs and polished edge highlights.',
    images: {
      main: '/products/bangle-stacked.jpg',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'kanteerava-royal-kada',
    name: 'Kanteerava Royal Antique Lion-Head Kada',
    category: 'Bangles & Bracelets',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 36.800,
    basePrice: 644000,
    size: 'Openable Kada (Size 2-6)',
    description: 'Regal single openable antique kada with lion-head finials, ruby eyes, and heavy textured solid gold construction.',
    images: {
      main: '/products/bangle-kada.jpg',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'swarna-filigree-bangles',
    name: 'Swarna Filigree Lightweight Bangles (Pair)',
    category: 'Bangles & Bracelets',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 22.400,
    basePrice: 392000,
    size: 'Size 2-4 / 2-6 Available',
    description: 'A pair of delicate lace filigree 22K gold bangles engineered for durability, lightweight elegance, and comfortable daily wear.',
    images: {
      main: '/products/bangle-filigree.jpg',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'nakshi-goddess-lakshmi-bangle',
    name: 'Nakshi Carved Goddess Lakshmi Bangle',
    category: 'Bangles & Bracelets',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 31.500,
    basePrice: 551250,
    size: 'Screw-lock Antique Bangle',
    description: 'Exquisite deep Nakshi embossed temple bangle depicting Goddess Lakshmi flanked by sacred elephants and floral vines.',
    images: {
      main: '/products/bangle-nakshi.jpg',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'modern-geometric-18k-bracelet',
    name: 'Modern Geometric 18K Gold Link Bracelet',
    category: 'Bangles & Bracelets',
    purity: '18K',
    purityBadge: '18K/750',
    weightGrams: 13.500,
    basePrice: 191295,
    size: '7.5 inches Link Bracelet',
    description: 'Polished interlocking geometric chain links in 18K yellow gold with high-grade lobster security clasp.',
    images: {
      main: '/products/bracelet-gold.jpg',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'ananya-14k-minimalist-bangle',
    name: 'Ananya 14K Everyday Minimal Gold Bangle',
    category: 'Bangles & Bracelets',
    purity: '14K',
    purityBadge: '14K/585',
    weightGrams: 10.200,
    basePrice: 110000,
    size: 'Size 2-4 / 2-6 Available',
    description: 'Elegant daily wear 14K solid gold sleek bangle with subtle diamond-cut facets and durable hinge lock.',
    images: {
      main: '/products/bangle-filigree.jpg',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },

  // ==================== BRIDAL TROUSSEAU ====================
  {
    id: 'bridals-trousseau-royal-set',
    name: 'Royal Tanjore Bridal Trousseau Set',
    category: 'Bridal Trousseau',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 112.800,
    basePrice: 1974000,
    size: 'Grand Bridal Suite (4-Piece Set)',
    description: 'A masterpiece heritage bridal set incorporating a choker, grand Haaram, matching Jhumkas, and temple mathapatti.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJKWUVghuy30UPwFO2WMmEd7YHWo11egA-wFUjGbtU9F2d-uiWW7qCaJI817iU9zyBbfD4nUBA4MTaEpY7kFSNrK_F5u0ERRZ9Rx5nDr2nAmae3VVMomxkFaGPEZ5FWFRmV7kCIPeTPHXkFn3N7TFFoVk_THGBYml7q2gmn0avvovzBN3_OPh7bS9lGKAWAxsSgGHPpvj-lVsxfxOQ7gOUBnBoRAMbrm04yD81Ee4SG5nQjlwzoQWsLg',
      angle: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmHYU8wUqinFDzeGt8ub6VQNZFfyqERj7KV2dfauJLf3tXTMZzR5_LLIybr8PjBevHxN5OSMYWEBa9wmkWe6IYA-Oj7arHwELxBeQIMPOhGyJlNvGjMYjCnrYwL-EhtW8WCVamxBLET_9qjmwbqXPCShF69W3LYKoRdnCBRzCNXHFskL8m22jVsfSVfFx7wKVkXokoMTr3u2RgeUFTBgroWOaFSxAEu3othqqDJBg8NkHgne3tQStBPQ',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'muhurtham-heritage-bridal-ensemble',
    name: 'Muhurtham Kerala Temple Grand Bridal Ensemble',
    category: 'Bridal Trousseau',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 148.500,
    basePrice: 2598750,
    size: 'Complete Bridal Wedding Set (5 Pieces)',
    description: 'The ultimate royal bridal ensemble featuring Kasu Mala, Palakka Mala, Mullamottu Mala, Nagapadam choker, and waist oddiyanam.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQkNbh7U8E8PIZjPFckcuwsh8Soy2oIZsVW6ykjHxXh5QIkyPePcNz3K1y6tFvpU0hKzG5Rnfz2RoUDBVHreXXzoHB2CglUsIFS0QrdObwmljsVpeFii6GYTk5gKZAxRd1b4g_HK91udMIAtp15HhiH97W_dX3tkKHbU4g74ecRtLVCBCZGt-mLcQu0Tqrbh93L6AMcV4FU07iUwA2JTKl9kmhuITccNfXxXyTuwSOigHQ7zH32s2tyg',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'chettinad-antique-wedding-set',
    name: 'Chettinad Antique Wedding Jewellery Suite',
    category: 'Bridal Trousseau',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 96.000,
    basePrice: 1680000,
    size: 'Bridal Choker & Haaram Set',
    description: 'Traditional Chettinad gold wedding jewellery handcrafted with ruby red kemp stones, mango pendants, and solid gold bead hangings.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmHYU8wUqinFDzeGt8ub6VQNZFfyqERj7KV2dfauJLf3tXTMZzR5_LLIybr8PjBevHxN5OSMYWEBa9wmkWe6IYA-Oj7arHwELxBeQIMPOhGyJlNvGjMYjCnrYwL-EhtW8WCVamxBLET_9qjmwbqXPCShF69W3LYKoRdnCBRzCNXHFskL8m22jVsfSVfFx7wKVkXokoMTr3u2RgeUFTBgroWOaFSxAEu3othqqDJBg8NkHgne3tQStBPQ',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'padmavati-emerald-bridal-set',
    name: 'Padmavati Grand Heritage Emerald Bridal Set',
    category: 'Bridal Trousseau',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 136.000,
    basePrice: 2380000,
    size: 'Complete Trousseau Suite',
    description: 'Masterpiece 22K gold bridal creation laden with unheated natural emeralds, basra pearls, and heavy relief temple carvings.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2LD4EynmHUiSa2iUjBub5_4fJ3KqAuFeP9CWSHdy-Qs9S_ar9cztaP65r79HtvXEPnVvRdurPo40RPRANKfULXjcNybNbnVpd7lsBihe29RgiSQPNWvsLaeXjblhkcgzk6lrJAkpdy_sYkOlPiBXvG_83WL58r48PfPS7-SBRp7PrUkAPkCPs940lAy5fdw8NIZ3Qgske56yX9C60Bw1NKKgVABZ2e5-Zb6YJDQCY-SMxi68G2l0EUA',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },

  // ==================== RINGS ====================
  {
    id: 'aashna-floral-cocktail-ring',
    name: 'Aashna Floral Antique Cocktail Ring',
    category: 'Rings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 8.400,
    basePrice: 147000,
    size: 'Size 12-16 (Adjustable)',
    description: 'Grand statement cocktail ring crafted in 22K yellow gold with blooming lotus petals and central ruby bead.',
    images: {
      main: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'mayuri-peacock-enamel-ring',
    name: 'Mayuri Peacock Temple Ring',
    category: 'Rings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 9.600,
    basePrice: 168000,
    size: 'Size 14-18',
    description: 'Intricately engraved peacock ring with royal blue and green Meenakari enamel accents and pure 22K 916 gold body.',
    images: {
      main: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'classic-solitaire-band',
    name: 'Classic 18K Yellow Gold Comfort Fit Band',
    category: 'Rings',
    purity: '18K',
    purityBadge: '18K/750',
    weightGrams: 5.200,
    basePrice: 73700,
    size: 'All Ring Sizes Available',
    description: 'Timeless smooth-polished 18K gold band with ergonomic comfort-fit curved interior.',
    images: {
      main: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    },
    updatedTime: '10:30 AM',
  },
];

export const ASSET_IMAGES = {
  hero: '/hero.jpg',
  heroFallback: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1920&q=85',
  bridalCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJKWUVghuy30UPwFO2WMmEd7YHWo11egA-wFUjGbtU9F2d-uiWW7qCaJI817iU9zyBbfD4nUBA4MTaEpY7kFSNrK_F5u0ERRZ9Rx5nDr2nAmae3VVMomxkFaGPEZ5FWFRmV7kCIPeTPHXkFn3N7TFFoVk_THGBYml7q2gmn0avvovzBN3_OPh7bS9lGKAWAxsSgGHPpvj-lVsxfxOQ7gOUBnBoRAMbrm04yD81Ee4SG5nQjlwzoQWsLg',
  necklacesCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w',
  earringsCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
  banglesCategory: '/products/bangle-stacked.jpg',
  artisanHands: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNLh46ypsmeAoMzqbRHxfVzqKXiAeT3DJmOIqv2MYbjEHqIg4_zywoaO7nIkOsB1ZMlDEf2zZGyntrBdH4YoP-vNzRrrNCycjKYuZO9t8zPzGWfEfQS8UeHn4Hqxb8HbshjdCUXd4knT0GdTcdYdzuH9fDsawxTXuqp25PWn-JH3zGVgrJUosytju5dWEbRNss654TC0tG0kWlMneNDQSIaz7roAjq9FFG2AHxSXWyOtf-plDFNuSQwg',
  goldTools: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5xjeuGAG7O6GSF7Ix97i_qssNf1AJcwumcsyVWfxXoZCxpkSzznUmXhu74PbRxXA9huoEbNv5OOrxb7VUch9J5tkYfqb7TX35Z-U_DJn9PwFJUNYPuQ3GOGbAC2BBEKC68l6ch94_veHJ2KBMq-03Ni1oLEZpzV1QxTJ2IN-SdChdap4cIKzbMcG3CxsQQbzKdSrnofOm0HohO1GrlwLp-OuyJbE-g7_9Ra05VhEfYlxC_xTG3D_eaQ',
};
