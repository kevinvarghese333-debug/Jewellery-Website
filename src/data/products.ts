import { Product, PriceBreakdown } from '../types';

export const CURRENT_GOLD_RATE_22K = 6240; // ₹ per gram
export const CURRENT_GOLD_RATE_18K = 5120; // ₹ per gram
export const CURRENT_GOLD_RATE_14K = 3980; // ₹ per gram

export function calculatePriceBreakdown(
  weightGrams: number,
  purity: '14K' | '18K' | '22K' = '22K',
  customRate?: number
): PriceBreakdown {
  const ratePerGram = customRate || (purity === '22K' ? CURRENT_GOLD_RATE_22K : purity === '18K' ? CURRENT_GOLD_RATE_18K : CURRENT_GOLD_RATE_14K);
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

export const PRODUCTS: Product[] = [
  {
    id: 'veda-antique-choker',
    name: 'Veda Antique Gold Choker',
    category: 'Chokers',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 52.400,
    basePrice: 312450,
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
    name: 'Aadhya Gold Choker',
    category: 'Chokers',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 45.200,
    basePrice: 284500,
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
    name: 'Lakshmi Heritage Haaram',
    category: 'Long Necklaces (Haaram)',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 68.500,
    basePrice: 415200,
    size: '24 inches Long Haaram',
    description: 'An opulent multi-layer long Haaram necklace crafted for grand bridal occasions with traditional South Indian filigree and pendant work.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQkNbh7U8E8PIZjPFckcuwsh8Soy2oIZsVW6ykjHxXh5QIkyPePcNz3K1y6tFvpU0hKzG5Rnfz2RoUDBVHreXXzoHB2CglUsIFS0QrdObwmljsVpeFii6GYTk5gKZAxRd1b4g_HK91udMIAtp15HhiH97W_dX3tkKHbU4g74ecRtLVCBCZGt-mLcQu0Tqrbh93L6AMcV4FU07iUwA2JTKl9kmhuITccNfXxXyTuwSOigHQ7zH32s2tyg',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'tara-layered-chain',
    name: 'Tara Layered Chain',
    category: 'Layered Necklaces',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 24.100,
    basePrice: 145800,
    size: '16-18 inches Double Layer',
    description: 'Contemporary double-layered 22K gold chain featuring minimalist geometric coin and bar pendants for modern elegance.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADBDQhW9epSYjMwAjeeygzoiFxq282SW12zIBj05VWir803-62SiQmXl5g4Va4Z4v0HCGepDXsumJrPwzFTAOEOWQ0xMcyEq6TVmmWO3tezgO4N-XvnW8uhK0ka9VyRjieWO9Dfx0-gOetkjMiCP1FMMmCLzbhLvvSEmFLmm9rVPyxFFaTjCNnIOijTnGCRQOizFd6gt5rbxYFYgX3jGqpeivNGgbrheLHDy2sngiyS7VJXjkzSOxdbQ',
    },
    updatedTime: '10:30 AM',
    isNewArrival: true,
  },
  {
    id: 'bridals-trousseau-royal-set',
    name: 'Royal Tanjore Bridal Trousseau Set',
    category: 'Bridal Trousseau',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 112.800,
    basePrice: 698000,
    size: 'Grand Bridal Set',
    description: 'A masterpiece heritage bridal set incorporating a choker, grand Haaram, matching Jhumkas, and temple mathapatti.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJKWUVghuy30UPwFO2WMmEd7YHWo11egA-wFUjGbtU9F2d-uiWW7qCaJI817iU9zyBbfD4nUBA4MTaEpY7kFSNrK_F5u0ERRZ9Rx5nDr2nAmae3VVMomxkFaGPEZ5FWFRmV7kCIPeTPHXkFn3N7TFFoVk_THGBYml7q2gmn0avvovzBN3_OPh7bS9lGKAWAxsSgGHPpvj-lVsxfxOQ7gOUBnBoRAMbrm04yD81Ee4SG5nQjlwzoQWsLg',
    },
    updatedTime: '10:30 AM',
    isBestseller: true,
  },
  {
    id: 'kanak-heritage-jhumka',
    name: 'Kanak Temple Jhumka Earrings',
    category: 'Earrings',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 18.600,
    basePrice: 116200,
    size: 'Standard Jhumka (2.2 inches)',
    description: 'Classic bell-shaped 22K gold Jhumkas with intricate umbrella filigree and dangling micro-gold beads.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'samriddhi-gold-bangles',
    name: 'Samriddhi Stacked Gold Bangles (Set of 4)',
    category: 'Bangles & Bracelets',
    purity: '22K',
    purityBadge: '22K/916',
    weightGrams: 42.000,
    basePrice: 262000,
    size: 'Size 2-6 (Adjustable)',
    description: 'Set of 4 hand-engraved 22K yellow gold bangles featuring traditional floral motifs and polished edge highlights.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9txV76eYclxctlXI81lz33dGz7CroUzHyEa-1ijty7WivypVQP8KrbfvWscV06f7B3BFnDAmc3UtbSQj_7-wbGq7vkmqwQkgSUSQZpE-gzOUGVVvxhFIdIJfcM1kliHpZD0jrhoRyTwUjMPFFUsnmhZNN1Q759srXW6NU-S5dAHISm5Ys7a-NSkaSYNTlsg1NlsV-kuBUPOQ6XneRWAi5v3sJeLn4YGSKyRBrPet9xZhZIaVFsXaghA',
    },
    updatedTime: '10:30 AM',
  },
  {
    id: 'navya-pendant-necklace',
    name: 'Navya Contemporary Gold Pendant',
    category: 'Layered Necklaces',
    purity: '18K',
    purityBadge: '18K/750',
    weightGrams: 14.200,
    basePrice: 88500,
    size: '18 inches Chain',
    description: 'Modern 18K yellow gold pendant necklace designed for everyday refined luxury.',
    images: {
      main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w',
    },
    updatedTime: '10:30 AM',
  }
];

export const ASSET_IMAGES = {
  hero: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAh-itlPSH0Af-uweqn_KNd-85MM9872yNQnji3Pmk_D4ZHVMlabzK3OQBbgwsIKjtiQxRQzQakJNCx4dYxPjLhck-OxW5YUiCKg57ogltXij9a00xSOovDeJa05GcWIaCRNIu8znb7toHCiYX3n76ql4mwjSLjt0o4LIejJD3eh_bdgwAb6qxxFYoJ-cmHcN8coWZigEquI9gfFD9Tg0yr1dV8aajYZTe5kvxUwQiGBAhy8AEnxe3FQ',
  bridalCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJKWUVghuy30UPwFO2WMmEd7YHWo11egA-wFUjGbtU9F2d-uiWW7qCaJI817iU9zyBbfD4nUBA4MTaEpY7kFSNrK_F5u0ERRZ9Rx5nDr2nAmae3VVMomxkFaGPEZ5FWFRmV7kCIPeTPHXkFn3N7TFFoVk_THGBYml7q2gmn0avvovzBN3_OPh7bS9lGKAWAxsSgGHPpvj-lVsxfxOQ7gOUBnBoRAMbrm04yD81Ee4SG5nQjlwzoQWsLg',
  necklacesCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCFnIW7MpYWKLhk2eQbummGd6OlVGAfq5xXrQ_6nJSqyZYcHSQ4alS8i7EMOcreo91KZBwIObg6SnQ4MNybu7FQkT8JyKMrnr_ngfRhx8xeN3rjV9L7ALj_TgQzq7yS3S2OZfS5pxLFmvloMWq1voVfVvcx_Y9io82hyYYiMkKiE7c7boDOoMkQ-Ku7CoDWZfKGNnBxPfUBie8VIfbuGwh8iXipuSUX4FQzD76lw3UsKTRl-rsQqBH-w',
  earringsCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCthD5TK07WFpSSHFY23CSficQ31bznnFKWy1gYQ-vvXirGH_k1vLxiwIeUgFDwd7sDSlI509FulAo1Qbm1cSvjD6a33n8rCCTTkKxXDk8BvAnLrzrLaJ9OSOITqYg6mgDmkoe5i13EOsgdG8pfO2O_0GApawNgRNNYNoWa3VxIJj9_pNQ0sZJ7u25DKvk-mBIWhsGtdCzhh_8UdeXrOis1Rq5Oqoxvd_cJwBlk7DiWfzWjk3_HUgrEsw',
  banglesCategory: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9txV76eYclxctlXI81lz33dGz7CroUzHyEa-1ijty7WivypVQP8KrbfvWscV06f7B3BFnDAmc3UtbSQj_7-wbGq7vkmqwQkgSUSQZpE-gzOUGVVvxhFIdIJfcM1kliHpZD0jrhoRyTwUjMPFFUsnmhZNN1Q759srXW6NU-S5dAHISm5Ys7a-NSkaSYNTlsg1NlsV-kuBUPOQ6XneRWAi5v3sJeLn4YGSKyRBrPet9xZhZIaVFsXaghA',
  artisanHands: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNLh46ypsmeAoMzqbRHxfVzqKXiAeT3DJmOIqv2MYbjEHqIg4_zywoaO7nIkOsB1ZMlDEf2zZGyntrBdH4YoP-vNzRrrNCycjKYuZO9t8zPzGWfEfQS8UeHn4Hqxb8HbshjdCUXd4knT0GdTcdYdzuH9fDsawxTXuqp25PWn-JH3zGVgrJUosytju5dWEbRNss654TC0tG0kWlMneNDQSIaz7roAjq9FFG2AHxSXWyOtf-plDFNuSQwg',
  goldTools: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5xjeuGAG7O6GSF7Ix97i_qssNf1AJcwumcsyVWfxXoZCxpkSzznUmXhu74PbRxXA9huoEbNv5OOrxb7VUch9J5tkYfqb7TX35Z-U_DJn9PwFJUNYPuQ3GOGbAC2BBEKC68l6ch94_veHJ2KBMq-03Ni1oLEZpzV1QxTJ2IN-SdChdap4cIKzbMcG3CxsQQbzKdSrnofOm0HohO1GrlwLp-OuyJbE-g7_9Ra05VhEfYlxC_xTG3D_eaQ',
};
