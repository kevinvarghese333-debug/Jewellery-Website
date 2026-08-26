import { useState, useEffect } from 'react';
import { 
  StoreBrandingConfig, 
  DEFAULT_BRANDING, 
  getLocalCachedBranding, 
  subscribeToStoreBranding 
} from '../data/storeBrandingService';

export const useStoreBranding = (): StoreBrandingConfig => {
  const [branding, setBranding] = useState<StoreBrandingConfig>(() => getLocalCachedBranding());

  useEffect(() => {
    // 1. Subscribe to Firestore snapshot
    const unsubscribe = subscribeToStoreBranding((updated) => {
      setBranding(updated);
    });

    // 2. Listen to window event for instant local updates within the same tab
    const handleLocalUpdate = (e: CustomEvent<StoreBrandingConfig>) => {
      if (e.detail) {
        setBranding(e.detail);
      }
    };

    window.addEventListener('kavitha_branding_updated' as any, handleLocalUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('kavitha_branding_updated' as any, handleLocalUpdate);
    };
  }, []);

  return branding;
};
