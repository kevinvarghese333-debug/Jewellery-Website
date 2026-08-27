import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp 
} from '../lib/firebase';
import { ASSET_IMAGES } from './products';

export interface StoreBrandingConfig {
  logoUrl: string;
  logoAltText: string;
  heroImageUrl: string;
  heroFallbackUrl: string;
  heroBlurLevel: 'none' | 'subtle' | 'medium' | 'strong' | 'luxury';
  heroOverlayOpacity: number; // e.g. 0.4 to 0.9
  heroHeadingLine1?: string;
  heroHeadingLine2?: string;
  heroSubtitle?: string;
  brandTagline?: string;
  updatedAt?: any;
  updatedBy?: string;
}

const CONFIG_DOC_PATH = 'app_config';
const BRANDING_DOC_ID = 'branding';

export const DEFAULT_BRANDING: StoreBrandingConfig = {
  logoUrl: '/logo.svg',
  logoAltText: 'Kavitha Jewellery Logo',
  heroImageUrl: ASSET_IMAGES.hero,
  heroFallbackUrl: ASSET_IMAGES.heroFallback,
  heroBlurLevel: 'medium', // Default to blurred as requested by user
  heroOverlayOpacity: 0.65,
  heroHeadingLine1: 'Crafted for Today.',
  heroHeadingLine2: 'Cherished for Generations',
  heroSubtitle: "Kerala's trusted destination for pure 22K 916 BIS Hallmarked gold, heirloom bridal Haarams, antique temple jewellery, and exquisite solitaire designs.",
  brandTagline: 'EST. 1992 • CHERAI, KERALA • 916 BIS',
};

const sanitizeBranding = (config: Partial<StoreBrandingConfig>): StoreBrandingConfig => {
  const result: StoreBrandingConfig = { ...DEFAULT_BRANDING, ...config };
  
  // If logo is unset or points to broken legacy local files, enforce permanent official SVG emblem
  if (
    !result.logoUrl ||
    result.logoUrl === '/logo.png' ||
    result.logoUrl === '/kavitha-logo.jpg' ||
    result.logoUrl === '/logo.jpg' ||
    result.logoUrl.trim() === ''
  ) {
    result.logoUrl = DEFAULT_BRANDING.logoUrl;
  }

  // If hero image is unset or points to broken legacy local paths, enforce permanent high-res campaign hero
  if (
    !result.heroImageUrl ||
    result.heroImageUrl === '/hero-banner-composed.jpg' ||
    result.heroImageUrl === '/hero.jpg' ||
    result.heroImageUrl === '/hero-model.jpg' ||
    result.heroImageUrl === '/hero-portrait.jpg' ||
    result.heroImageUrl === '/hero-traditional.jpg' ||
    result.heroImageUrl === '/hero-traditional-cropped.jpg' ||
    result.heroImageUrl.trim() === ''
  ) {
    result.heroImageUrl = DEFAULT_BRANDING.heroImageUrl;
  }

  if (
    !result.heroFallbackUrl ||
    result.heroFallbackUrl.startsWith('/hero') ||
    result.heroFallbackUrl.trim() === ''
  ) {
    result.heroFallbackUrl = DEFAULT_BRANDING.heroFallbackUrl;
  }

  return result;
};

/**
 * Get initial cached branding configuration from localStorage or default
 */
export const getLocalCachedBranding = (): StoreBrandingConfig => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('kavitha_store_branding');
      if (saved) {
        const parsed = JSON.parse(saved);
        const sanitized = sanitizeBranding(parsed);
        // Persist sanitized version back so it is permanent
        if (sanitized.logoUrl !== parsed.logoUrl || sanitized.heroImageUrl !== parsed.heroImageUrl) {
          localStorage.setItem('kavitha_store_branding', JSON.stringify(sanitized));
        }
        return sanitized;
      }
    } catch (e) {
      console.error('Error loading cached branding:', e);
    }
  }
  return DEFAULT_BRANDING;
};

/**
 * Compress / downscale image data URL if it exceeds max dimensions or size limit
 */
export const compressImageDataUrl = (
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85
): Promise<string> => {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:image/')) {
    return Promise.resolve(dataUrl);
  }

  // If already small (< 100KB), return as is
  if (dataUrl.length < 100000) {
    return Promise.resolve(dataUrl);
  }

  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const isPng = dataUrl.startsWith('data:image/png');
            // Use JPEG/WebP for large images to save drastic space, or PNG if small
            const compressed = isPng && dataUrl.length < 300000
              ? canvas.toDataURL('image/png')
              : (canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality));
            resolve(compressed);
          } else {
            resolve(dataUrl);
          }
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
};

/**
 * Save branding configuration locally with quota safety
 */
export const saveLocalBranding = (config: StoreBrandingConfig): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kavitha_store_branding', JSON.stringify(config));
    } catch (e) {
      console.warn('localStorage quota reached, attempting storage with fallback:', e);
      try {
        // Fallback: If full, remove large transient keys or save a trimmed configuration
        localStorage.removeItem('kavitha_store_branding');
        localStorage.setItem('kavitha_store_branding', JSON.stringify(config));
      } catch (err) {
        console.error('Error saving local branding:', err);
      }
    }
    // Always dispatch custom event so all open components can re-render immediately
    try {
      window.dispatchEvent(new CustomEvent('kavitha_branding_updated', { detail: config }));
    } catch {}
  }
};

/**
 * Subscribe to real-time branding changes from Firestore.
 * When the admin updates the logo or hero image in the Admin Panel,
 * every customer device and page reloads the new logo/hero immediately.
 */
export const subscribeToStoreBranding = (
  onUpdate: (config: StoreBrandingConfig) => void
): (() => void) => {
  // First emit local cached data for zero latency
  const local = getLocalCachedBranding();
  onUpdate(local);

  try {
    const docRef = doc(db, CONFIG_DOC_PATH, BRANDING_DOC_ID);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StoreBrandingConfig;
          const merged = sanitizeBranding(data);
          saveLocalBranding(merged);
          onUpdate(merged);
        } else {
          // Initialize default document in Firestore
          setDoc(docRef, { ...DEFAULT_BRANDING, updatedAt: serverTimestamp() }, { merge: true }).catch((err) => {
            console.warn('Branding doc bootstrap notice:', err);
          });
          onUpdate(DEFAULT_BRANDING);
        }
      },
      (error) => {
        console.warn('Firestore branding snapshot error (using local cache):', error);
        onUpdate(getLocalCachedBranding());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('subscribeToStoreBranding initial error:', err);
    return () => {};
  }
};

/**
 * Update the Store Branding (Logo, Hero Image, Blur) in Firestore.
 */
export const updateStoreBrandingInFirestore = async (
  config: Partial<StoreBrandingConfig>,
  adminUser: string = 'Administrator'
): Promise<void> => {
  const current = getLocalCachedBranding();

  // Compress any large base64 images before saving
  let logoUrl = config.logoUrl !== undefined ? config.logoUrl : current.logoUrl;
  let heroImageUrl = config.heroImageUrl !== undefined ? config.heroImageUrl : current.heroImageUrl;

  if (logoUrl && logoUrl.startsWith('data:image/') && logoUrl.length > 200000) {
    logoUrl = await compressImageDataUrl(logoUrl, 800, 800, 0.85);
  }
  if (heroImageUrl && heroImageUrl.startsWith('data:image/') && heroImageUrl.length > 300000) {
    heroImageUrl = await compressImageDataUrl(heroImageUrl, 1600, 900, 0.82);
  }

  const updated: StoreBrandingConfig = {
    ...current,
    ...config,
    logoUrl,
    heroImageUrl,
    updatedAt: serverTimestamp(),
    updatedBy: adminUser,
  };

  // 1. Immediately update local cache and dispatch event for instant response
  saveLocalBranding(updated);

  // 2. Persist to Firestore with a reliable timeout race so it never blocks or hangs UI
  try {
    const docRef = doc(db, CONFIG_DOC_PATH, BRANDING_DOC_ID);
    const savePromise = setDoc(docRef, updated, { merge: true });
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
    
    // Race against 3.5s timeout
    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    console.warn('[StoreBranding] Firestore sync deferred (persisted to local cache):', err);
  }
};
