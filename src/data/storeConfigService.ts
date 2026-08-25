import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  serverTimestamp 
} from '../lib/firebase';
import { CURRENT_GOLD_RATE_22K, CURRENT_GOLD_RATE_18K, CURRENT_GOLD_RATE_14K } from './products';

export interface BullionRates {
  rate22k: number;
  rate18k: number;
  rate14k: number;
  silverRate: number;
  updatedAt?: any;
  updatedBy?: string;
}

const CONFIG_DOC_PATH = 'app_config';
const GOLD_RATES_DOC_ID = 'gold_rates';

/**
 * Subscribe to real-time bullion gold rates from Firestore.
 * When the admin updates the rate in the Admin Panel, every client browser
 * automatically updates immediately.
 */
export const subscribeToGoldRates = (
  onUpdate: (rates: BullionRates) => void
): (() => void) => {
  const docRef = doc(db, CONFIG_DOC_PATH, GOLD_RATES_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BullionRates;
        if (data.rate22k && data.rate22k >= 5000) {
          try {
            localStorage.setItem('kavitha_live_gold_rate', String(data.rate22k));
            localStorage.setItem('kavitha_live_silver_rate', String(data.silverRate || 98));
          } catch (e) {
            console.error('Error caching gold rate:', e);
          }
          onUpdate(data);
          return;
        }
      }

      // If document doesn't exist yet in Firestore, initialize it with current standard rates
      const initialRates: BullionRates = {
        rate22k: CURRENT_GOLD_RATE_22K,
        rate18k: CURRENT_GOLD_RATE_18K,
        rate14k: CURRENT_GOLD_RATE_14K,
        silverRate: 98,
        updatedAt: serverTimestamp(),
        updatedBy: 'System Auto-Init'
      };
      
      setDoc(docRef, initialRates, { merge: true }).catch((err) => {
        console.warn('Initial gold rate document bootstrap notice:', err);
      });

      onUpdate(initialRates);
    },
    (error) => {
      console.warn('Firestore real-time gold rate snapshot warning (using local fallback):', error);
      // Fallback to local cached or current constant
      const fallbackRate = getLocalCachedGoldRate();
      onUpdate({
        rate22k: fallbackRate,
        rate18k: Math.round(fallbackRate * (12335 / 15010)),
        rate14k: Math.round(fallbackRate * (9550 / 15010)),
        silverRate: 98
      });
    }
  );

  return unsubscribe;
};

/**
 * Update the live gold bullion rates in Firestore.
 * This triggers a real-time update across all customers visiting the website.
 */
export const updateLiveBullionRatesInFirestore = async (
  rate22k: number,
  silverRate: number = 98,
  adminUser: string = 'Administrator'
): Promise<void> => {
  const rate18k = Math.round(rate22k * (12335 / 15010));
  const rate14k = Math.round(rate22k * (9550 / 15010));

  const ratesData: BullionRates = {
    rate22k,
    rate18k,
    rate14k,
    silverRate,
    updatedAt: serverTimestamp(),
    updatedBy: adminUser
  };

  // 1. Immediately update local storage for zero-latency UI
  try {
    localStorage.setItem('kavitha_live_gold_rate', String(rate22k));
    localStorage.setItem('kavitha_live_silver_rate', String(silverRate));
  } catch (e) {
    console.error(e);
  }

  // 2. Persist to Firestore for global real-time synchronization
  const docRef = doc(db, CONFIG_DOC_PATH, GOLD_RATES_DOC_ID);
  await setDoc(docRef, ratesData, { merge: true });
};

/**
 * Get initial cached rate safely, discarding obsolete legacy test numbers (< 10000)
 */
export const getLocalCachedGoldRate = (): number => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('kavitha_live_gold_rate');
      if (saved && !isNaN(Number(saved))) {
        const num = Number(saved);
        if (num >= 10000) return num;
        // Clean up legacy test rate like 6240
        localStorage.removeItem('kavitha_live_gold_rate');
      }
    } catch (e) {
      console.error(e);
    }
  }
  return CURRENT_GOLD_RATE_22K;
};
