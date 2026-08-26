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
  logoUrl: '/logo.png',
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

/**
 * Get initial cached branding configuration from localStorage or default
 */
export const getLocalCachedBranding = (): StoreBrandingConfig => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('kavitha_store_branding');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch (e) {
      console.error('Error loading cached branding:', e);
    }
  }
  return DEFAULT_BRANDING;
};

/**
 * Save branding configuration locally
 */
export const saveLocalBranding = (config: StoreBrandingConfig): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('kavitha_store_branding', JSON.stringify(config));
      // Dispatch custom event so all open components can re-render immediately
      window.dispatchEvent(new CustomEvent('kavitha_branding_updated', { detail: config }));
    } catch (e) {
      console.error('Error saving local branding:', e);
    }
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

  const docRef = doc(db, CONFIG_DOC_PATH, BRANDING_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StoreBrandingConfig;
        const merged: StoreBrandingConfig = {
          ...DEFAULT_BRANDING,
          ...data,
        };
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
};

/**
 * Update the Store Branding (Logo, Hero Image, Blur) in Firestore.
 */
export const updateStoreBrandingInFirestore = async (
  config: Partial<StoreBrandingConfig>,
  adminUser: string = 'Administrator'
): Promise<void> => {
  const current = getLocalCachedBranding();
  const updated: StoreBrandingConfig = {
    ...current,
    ...config,
    updatedAt: serverTimestamp(),
    updatedBy: adminUser,
  };

  // 1. Immediately update local cache and dispatch event for instant response
  saveLocalBranding(updated);

  // 2. Persist to Firestore for real-time cloud broadcast
  const docRef = doc(db, CONFIG_DOC_PATH, BRANDING_DOC_ID);
  await setDoc(docRef, updated, { merge: true });
};
