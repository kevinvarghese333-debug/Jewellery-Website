import { CURRENT_GOLD_RATE_22K } from "./products";
/** An offline estimate only; fresh published rates arrive through Firestore. */
export function getLocalCachedGoldRate(): number {
  try {
    const value = Number(localStorage.getItem("kavitha_live_gold_rate"));
    return Number.isFinite(value) && value > 0 ? value : CURRENT_GOLD_RATE_22K;
  } catch {
    return CURRENT_GOLD_RATE_22K;
  }
}
