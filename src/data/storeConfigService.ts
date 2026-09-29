import { db, doc, setDoc, onSnapshot, serverTimestamp } from "../lib/firebase";
import {
  CURRENT_GOLD_RATE_22K,
  CURRENT_GOLD_RATE_18K,
  CURRENT_GOLD_RATE_14K,
  getGoldRateForPurity,
} from "./products";

import { getLocalCachedGoldRate } from "./rateCache";
export { getLocalCachedGoldRate } from "./rateCache";

export interface BullionRates {
  rate22k: number;
  rate18k: number;
  rate14k: number;
  silverRate: number;
  updatedAt?: any;
  updatedBy?: string;
  status?: "published" | "cached" | "fallback";
}

const CONFIG_DOC_PATH = "app_config";
const GOLD_RATES_DOC_ID = "gold_rates";

/**
 * Subscribe to real-time bullion gold rates from Firestore.
 * When the admin updates the rate in the Admin Panel, every client browser
 * automatically updates immediately.
 */
export const subscribeToGoldRates = (
  onUpdate: (rates: BullionRates) => void,
): (() => void) => {
  const docRef = doc(db, CONFIG_DOC_PATH, GOLD_RATES_DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BullionRates;
        if (Number.isFinite(data.rate22k) && data.rate22k > 0) {
          try {
            localStorage.setItem(
              "kavitha_live_gold_rate",
              String(data.rate22k),
            );
            localStorage.setItem(
              "kavitha_live_silver_rate",
              String(data.silverRate || 98),
            );
          } catch (e) {
            console.error("Error caching gold rate:", e);
          }
          onUpdate({
            ...data,
            status:
              snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites
                ? "cached"
                : "published",
          });
          return;
        }
      }

      // No published record: return indicative defaults without writing from a visitor.
      const initialRates: BullionRates = {
        rate22k: CURRENT_GOLD_RATE_22K,
        rate18k: CURRENT_GOLD_RATE_18K,
        rate14k: CURRENT_GOLD_RATE_14K,
        silverRate: 98,
        updatedBy: "Indicative fallback",
        status: "fallback",
      };

      // Reading the public rate must never create or mutate store settings.

      onUpdate(initialRates);
    },
    (error) => {
      console.warn(
        "Firestore real-time gold rate snapshot warning (using local fallback):",
        error,
      );
      // Fallback to local cached or current constant
      const fallbackRate = getLocalCachedGoldRate();
      onUpdate({
        rate22k: fallbackRate,
        rate18k: getGoldRateForPurity("18K", fallbackRate),
        rate14k: getGoldRateForPurity("14K", fallbackRate),
        silverRate: 98,
        status: "fallback",
      });
    },
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
  adminUser: string = "Administrator",
): Promise<void> => {
  if (
    !Number.isFinite(rate22k) ||
    rate22k <= 0 ||
    !Number.isFinite(silverRate) ||
    silverRate <= 0
  ) {
    throw new Error("Enter a valid positive gold and silver rate.");
  }
  const rate18k = getGoldRateForPurity("18K", rate22k);
  const rate14k = getGoldRateForPurity("14K", rate22k);

  const ratesData: BullionRates = {
    rate22k,
    rate18k,
    rate14k,
    silverRate,
    updatedAt: serverTimestamp(),
    updatedBy: adminUser,
  };

  // A local cache update is not proof that every customer received the rate.
  // Wait for the server acknowledgement and let the admin UI report failures.
  const docRef = doc(db, CONFIG_DOC_PATH, GOLD_RATES_DOC_ID);
  await setDoc(docRef, ratesData, { merge: true });
  try {
    localStorage.setItem("kavitha_live_gold_rate", String(rate22k));
    localStorage.setItem("kavitha_live_silver_rate", String(silverRate));
  } catch {
    /* The published rate remains available without local storage. */
  }
};
