import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile,
  onAuthStateChanged,
  db, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot,
  User 
} from '../lib/firebase';
import { UserProfile, OrderRecord } from '../types';
import { saveUserProfile, clearUserProfile, getStoredUserProfile } from './userSession';

const USERS_COLLECTION = 'users';
const ORDERS_COLLECTION = 'orders';

/**
 * Maps a Firebase User + Firestore doc into an application UserProfile
 */
export async function syncUserProfileFromFirestore(firebaseUser: User): Promise<UserProfile> {
  const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
  let profileData: Partial<UserProfile> = {};

  try {
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      profileData = snap.data() as Partial<UserProfile>;
    }
  } catch (err) {
    console.warn('[FirebaseAuthService] Could not read user profile from firestore (using Auth fallback):', err);
  }

  const isGoogleProvider = firebaseUser.providerData?.some(
    (provider) => provider.providerId?.includes('google')
  ) || firebaseUser.providerId?.includes('google');

  const profile: UserProfile = {
    uid: firebaseUser.uid,
    name: profileData.name || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Kavitha Patron'),
    email: firebaseUser.email || profileData.email || '',
    mobile: profileData.mobile || firebaseUser.phoneNumber || '',
    dateOfBirth: profileData.dateOfBirth || undefined,
    city: profileData.city || 'Kerala, India',
    photoURL: firebaseUser.photoURL || profileData.photoURL || undefined,
    authProvider: isGoogleProvider ? 'google' : 'password',
    isLoggedIn: true,
    loyaltyPoints: profileData.loyaltyPoints ?? 3955,
    lastLoginAt: new Date().toISOString(),
    savedWishlistCount: profileData.savedWishlistCount || 0,
  };

  // Upsert profile in firestore with creation timestamp tracking
  try {
    await setDoc(userRef, {
      ...profile,
      createdAt: profileData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log('[FirebaseAuthService] User profile synchronized with Firestore successfully:', profile.uid);
  } catch (e) {
    console.warn('[FirebaseAuthService] Firestore setDoc failed for user profile (falling back to local cache):', e);
  }

  saveUserProfile(profile);
  return profile;
}

/**
 * Sign in / Create account with Google Popup
 */
export async function loginWithGoogle(): Promise<UserProfile> {
  console.log('[FirebaseAuthService] Initiating Google OAuth popup sign-in flow...');
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('[FirebaseAuthService] Google OAuth popup successful for user:', {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      providerId: result.user.providerId,
    });
    const profile = await syncUserProfileFromFirestore(result.user);
    return profile;
  } catch (error: any) {
    console.error('[FirebaseAuthService] Google OAuth Error Details:', {
      code: error?.code,
      message: error?.message,
      customData: error?.customData,
      currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A',
      currentHost: typeof window !== 'undefined' ? window.location.hostname : 'N/A',
    });
    throw error;
  }
}

/**
 * Sign in with Email & Password
 */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const profile = await syncUserProfileFromFirestore(result.user);
  return profile;
}

/**
 * Create new account with Email & Password
 */
export async function registerWithEmail(
  email: string, 
  pass: string, 
  name: string, 
  mobile: string, 
  city?: string,
  dateOfBirth?: string
): Promise<UserProfile> {
  const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  
  if (name.trim()) {
    try {
      await updateProfile(result.user, { displayName: name.trim() });
    } catch (e) {
      console.warn('Failed to update displayName:', e);
    }
  }

  const userRef = doc(db, USERS_COLLECTION, result.user.uid);
  const profile: UserProfile = {
    uid: result.user.uid,
    name: name.trim() || 'Kavitha Patron',
    email: email.trim(),
    mobile: mobile.trim(),
    dateOfBirth: dateOfBirth?.trim() || undefined,
    city: city?.trim() || 'Kerala, India',
    authProvider: 'password',
    isLoggedIn: true,
    loyaltyPoints: 3955,
    lastLoginAt: new Date().toISOString(),
    savedWishlistCount: 0,
  };

  try {
    await setDoc(userRef, {
      ...profile,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Could not save user profile to firestore:', e);
  }

  saveUserProfile(profile);
  return profile;
}

/**
 * Sign out of Firebase Auth
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Sign out error:', e);
  }
  clearUserProfile();
}

/**
 * Listen to Auth State Changes
 */
export function initAuthListener(onUserChange: (user: UserProfile | null) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await syncUserProfileFromFirestore(firebaseUser);
      onUserChange(profile);
    } else {
      const local = getStoredUserProfile();
      if (!local?.uid) {
        onUserChange(local);
      } else {
        clearUserProfile();
        onUserChange(null);
      }
    }
  });

  return unsubscribe;
}

/**
 * Push updated wishlist array to Firestore for a user
 */
export async function syncWishlistToFirestore(userId: string, wishlistIds: string[]): Promise<void> {
  if (!userId) return;
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await setDoc(userRef, {
      wishlist: wishlistIds,
      savedWishlistCount: wishlistIds.length,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (e) {
    console.warn('Failed to sync wishlist to Firestore:', e);
  }
}

/**
 * Fetch wishlist from Firestore
 */
export async function fetchWishlistFromFirestore(userId: string): Promise<string[]> {
  if (!userId) return [];
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.wishlist)) {
        return data.wishlist;
      }
    }
  } catch (e) {
    console.warn('Failed to fetch wishlist from Firestore:', e);
  }
  return [];
}

/**
 * Save new placed order to Firestore
 */
export async function createOrderInFirestore(order: OrderRecord): Promise<string> {
  try {
    const orderDocRef = doc(db, ORDERS_COLLECTION, order.id);
    await setDoc(orderDocRef, {
      ...order,
      timestamp: new Date().toISOString(),
    });
    
    // Also save in user's recent orders array or local cache
    const existingOrdersRaw = localStorage.getItem(`kavitha_orders_${order.userId || 'guest'}`);
    const existing: OrderRecord[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
    existing.unshift(order);
    localStorage.setItem(`kavitha_orders_${order.userId || 'guest'}`, JSON.stringify(existing.slice(0, 30)));

    return order.id;
  } catch (e) {
    console.warn('Failed to save order to Firestore:', e);
    // Fallback to local storage
    const existingOrdersRaw = localStorage.getItem(`kavitha_orders_${order.userId || 'guest'}`);
    const existing: OrderRecord[] = existingOrdersRaw ? JSON.parse(existingOrdersRaw) : [];
    existing.unshift(order);
    localStorage.setItem(`kavitha_orders_${order.userId || 'guest'}`, JSON.stringify(existing.slice(0, 30)));
    return order.id;
  }
}

/**
 * Fetch user's order history from Firestore + local cache
 */
export async function fetchUserOrderHistory(userId?: string, userEmail?: string): Promise<OrderRecord[]> {
  const combinedOrders: Map<string, OrderRecord> = new Map();

  // 1. Fetch from local cache first for instant feedback
  const localKey = `kavitha_orders_${userId || 'guest'}`;
  try {
    const raw = localStorage.getItem(localKey);
    if (raw) {
      const parsed: OrderRecord[] = JSON.parse(raw);
      parsed.forEach((o) => combinedOrders.set(o.id, o));
    }
  } catch (e) {
    console.warn('Failed to parse local order history:', e);
  }

  // 2. Fetch from Firestore if user is authenticated
  if (userId) {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const orderData = docSnap.data() as OrderRecord;
        combinedOrders.set(orderData.id, orderData);
      });
    } catch (e) {
      console.warn('Could not query orders by userId:', e);
    }
  }

  // 3. Fallback: query by email if available
  if (userEmail && combinedOrders.size === 0) {
    try {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('customerEmail', '==', userEmail)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const orderData = docSnap.data() as OrderRecord;
        combinedOrders.set(orderData.id, orderData);
      });
    } catch (e) {
      console.warn('Could not query orders by userEmail:', e);
    }
  }

  const sorted = Array.from(combinedOrders.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return sorted;
}
