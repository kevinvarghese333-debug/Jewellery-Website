import { UserProfile } from '../types';

const USER_SESSION_KEY = 'kavitha_user_session_v1';

export function getStoredUserProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isLoggedIn) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse user session', e);
  }
  return null;
}

export function saveUserProfile(profile: Partial<UserProfile>): UserProfile {
  const existing = getStoredUserProfile();
  const updated: UserProfile = {
    name: profile.name || existing?.name || '',
    email: profile.email || existing?.email || '',
    mobile: profile.mobile || existing?.mobile || '',
    city: profile.city || existing?.city || 'Kerala',
    isLoggedIn: true,
    loyaltyPoints: profile.loyaltyPoints ?? existing?.loyaltyPoints ?? 3955,
    lastLoginAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updated));
    // Dispatch custom event so all components react immediately to login changes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kavitha_user_auth_changed', { detail: updated }));
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }

  return updated;
}

export function clearUserProfile(): void {
  try {
    localStorage.removeItem(USER_SESSION_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('kavitha_user_auth_changed', { detail: null }));
    }
  } catch (e) {
    console.error('Failed to clear user session', e);
  }
}
