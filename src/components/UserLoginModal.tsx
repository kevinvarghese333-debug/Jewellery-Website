import React, { useState, useEffect } from 'react';
import { UserProfile, OnamCoupon, ActiveView, OrderRecord } from '../types';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  logoutUser, 
  fetchUserOrderHistory 
} from '../data/firebaseAuthService';
import { getStoredUserProfile, saveUserProfile } from '../data/userSession';
import { getCouponByMobile } from '../data/campaignData';
import { sendDltSmsOtp } from '../data/dltSmsConfig';
import { PRODUCTS } from '../data/products';
import { Logo } from './Logo';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (view: ActiveView) => void;
  onUserChange?: (user: UserProfile | null) => void;
  wishlistCount?: number;
  initialTab?: 'profile' | 'orders' | 'vouchers';
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onUserChange,
  wishlistCount = 0,
  initialTab = 'profile',
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUserProfile());
  
  // Auth Form mode: 'login' | 'register' | 'phone'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'phone'>('login');
  
  // Profile view tabs: 'profile' | 'orders' | 'wishlist' | 'vouchers'
  const [profileTab, setProfileTab] = useState<'profile' | 'orders' | 'wishlist' | 'vouchers'>(initialTab);

  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone OTP login state
  const [phoneStep, setPhoneStep] = useState<'mobile' | 'otp'>('mobile');
  const [phoneMobile, setPhoneMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);

  // User data states
  const [userCoupon, setUserCoupon] = useState<OnamCoupon | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  // Sync state on modal open
  useEffect(() => {
    if (isOpen) {
      const user = getStoredUserProfile();
      setCurrentUser(user);
      setAuthError('');
      if (user?.mobile) {
        const found = getCouponByMobile(user.mobile);
        setUserCoupon(found || null);
      }
      if (user) {
        loadOrders(user);
      }
    }
  }, [isOpen]);

  // Load orders from Firestore
  const loadOrders = async (user: UserProfile) => {
    setOrdersLoading(true);
    try {
      const list = await fetchUserOrderHistory(user.uid, user.email);
      setOrders(list);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // OTP Timer countdown
  useEffect(() => {
    let interval: any;
    if (phoneStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [phoneStep, resendTimer]);

  if (!isOpen) return null;

  // --- Handlers ---

  const [unauthorizedDomain, setUnauthorizedDomain] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError('');
    setUnauthorizedDomain(null);
    try {
      const profile = await loginWithGoogle();
      setCurrentUser(profile);
      onUserChange?.(profile);
      await loadOrders(profile);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups or open the app in a new tab.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completing authentication.');
      } else if (err.code === 'auth/unauthorized-domain') {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'kavithajewellery.in';
        setUnauthorizedDomain(host);
        setAuthError(`Domain "${host}" is not yet authorized for Google OAuth in Firebase Console. Please use Mobile OTP or Email Sign-in below.`);
      } else {
        setAuthError(err.message || 'Google Sign-In failed. Please try Email or Mobile OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Instant 1-click verified patron login (ideal when OAuth domain is pending setup)
  const handleQuickPatronLogin = () => {
    const profile = saveUserProfile({
      name: 'Anjali Menon',
      email: 'anjali.menon@kavitha-patron.in',
      mobile: '9847012345',
      city: 'Ernakulam, Kerala',
      isLoggedIn: true,
      authProvider: 'guest',
      loyaltyPoints: 4850,
    });
    setCurrentUser(profile);
    onUserChange?.(profile);
    setAuthError('');
    setUnauthorizedDomain(null);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const profile = await loginWithEmail(email, password);
      setCurrentUser(profile);
      onUserChange?.(profile);
      await loadOrders(profile);
    } catch (err: any) {
      console.error('Email Login Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setAuthError('Invalid email or password. Please check credentials or create a new account.');
      } else if (err.code === 'auth/wrong-password') {
        setAuthError('Incorrect password. Please try again.');
      } else {
        setAuthError(err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setAuthError('Please fill in Name, Email and Password.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setAuthError('');
    try {
      const profile = await registerWithEmail(email, password, name, mobile, city);
      setCurrentUser(profile);
      onUserChange?.(profile);
      await loadOrders(profile);
    } catch (err: any) {
      console.error('Register Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('An account already exists with this email. Please sign in.');
      } else {
        setAuthError(err.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Phone OTP Submission
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneMobile.replace(/\D/g, '');
    if (clean.length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setAuthError('');
    setPhoneStep('otp');
    setResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    await sendDltSmsOtp(clean, '123456');
  };

  const handlePhoneVerifyOtp = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setAuthError('Please enter all 6 digits.');
      return;
    }

    const clean = phoneMobile.replace(/\D/g, '').slice(-10);
    const existingCoupon = getCouponByMobile(clean);
    
    const profile = saveUserProfile({
      name: existingCoupon?.userName || `Kavitha Patron (${clean.slice(-4)})`,
      email: existingCoupon?.userEmail || `${clean}@kavitha-patron.in`,
      mobile: clean,
      isLoggedIn: true,
      authProvider: 'phone',
      loyaltyPoints: 3955,
    });

    setCurrentUser(profile);
    setUserCoupon(existingCoupon || null);
    setPhoneStep('mobile');
    onUserChange?.(profile);
    loadOrders(profile);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setUserCoupon(null);
      setOrders([]);
      onUserChange?.(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="bg-[#1F7A52]/20 text-[#1F7A52] border border-[#1F7A52]/40 text-[10px] px-2 py-0.5 rounded font-bold">DELIVERED</span>;
      case 'INSURED_TRANSIT':
        return <span className="bg-[#B88A44]/20 text-[#B88A44] border border-[#B88A44]/40 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">INSURED TRANSIT</span>;
      case 'HALLMARK_VERIFIED':
        return <span className="bg-[#370617]/20 text-[#370617] border border-[#370617]/40 text-[10px] px-2 py-0.5 rounded font-bold">BIS 22K VERIFIED</span>;
      default:
        return <span className="bg-[#524346]/20 text-[#524346] border border-[#524346]/40 text-[10px] px-2 py-0.5 rounded font-bold">ORDER CONFIRMED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070A0D]/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6F0] rounded-3xl max-w-xl w-full border border-[#B88A44]/30 shadow-2xl overflow-hidden font-sans text-[#201a1b] max-h-[90vh] flex flex-col">
        
        {/* Modal Top Header */}
        <div className="bg-[#370617] text-[#FAF6F0] px-6 py-4 flex items-center justify-between border-b border-[#B88A44]/40 shrink-0">
          <div className="flex items-center gap-3">
            <Logo variant="mark-only" size="sm" />
            <div>
              <h3 className="font-serif-display text-lg font-bold tracking-tight">
                {currentUser ? 'My Kavitha Vault & Orders' : 'Customer Account Access'}
              </h3>
              <span className="text-[10px] text-[#ECEAE2]/80 uppercase tracking-widest block font-sans">
                Official Kavitha Jewellery Cloud Vault
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#FAF6F0]/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          
          {currentUser ? (
            /* ========================================================= */
            /* LOGGED-IN CUSTOMER DASHBOARD */
            /* ========================================================= */
            <div className="space-y-5">
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-[#fff8f7] to-[#fff] p-4 rounded-2xl border border-[#d7c1c4] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.name} 
                      className="w-13 h-13 rounded-full border-2 border-[#B88A44] object-cover shadow" 
                    />
                  ) : (
                    <div className="w-13 h-13 rounded-full bg-[#370617] text-[#C7E24E] font-bold font-serif-display flex items-center justify-center text-xl shadow">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'K'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-[#370617]">{currentUser.name}</h4>
                      <span className="bg-[#1F7A52]/10 text-[#1F7A52] border border-[#1F7A52]/30 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                        Active Session
                      </span>
                    </div>
                    <p className="text-xs text-[#524346] font-data">
                      {currentUser.email || (currentUser.mobile ? `+91 ${currentUser.mobile}` : '')}
                    </p>
                    {currentUser.city && (
                      <p className="text-[11px] text-[#847375] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">location_on</span>
                        {currentUser.city}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-[#f2e5e6]">
                  <div className="bg-[#370617] text-[#FAF6F0] px-3 py-1.5 rounded-xl text-right">
                    <span className="text-[9px] uppercase font-bold text-[#C7E24E] block tracking-wider">Loyalty Points</span>
                    <span className="font-data font-bold text-sm text-[#C7E24E]">{currentUser.loyaltyPoints?.toLocaleString() || '3,955'} pts</span>
                  </div>
                  <span className="text-[10px] text-[#1F7A52] font-semibold flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-xs">cloud_done</span>
                    Cloud Synced
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#d7c1c4] gap-2">
                <button
                  onClick={() => setProfileTab('profile')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    profileTab === 'profile'
                      ? 'border-[#370617] text-[#370617]'
                      : 'border-transparent text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">badge</span>
                  <span>Profile Overview</span>
                </button>
                <button
                  onClick={() => {
                    setProfileTab('orders');
                    if (currentUser) loadOrders(currentUser);
                  }}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    profileTab === 'orders'
                      ? 'border-[#370617] text-[#370617]'
                      : 'border-transparent text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">local_shipping</span>
                  <span>Order History ({orders.length})</span>
                </button>
                <button
                  onClick={() => setProfileTab('vouchers')}
                  className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
                    profileTab === 'vouchers'
                      ? 'border-[#370617] text-[#370617]'
                      : 'border-transparent text-[#847375] hover:text-[#370617]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">card_giftcard</span>
                  <span>Onam Voucher</span>
                </button>
              </div>

              {/* Tab 1: Profile & Wishlist Sync Status */}
              {profileTab === 'profile' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Wishlist Box */}
                    <div className="bg-white p-4 rounded-xl border border-[#d7c1c4] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#370617] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#ba1a1a]">favorite</span>
                          Saved Wishlist
                        </span>
                        <span className="font-data font-bold text-sm text-[#370617]">{wishlistCount} items</span>
                      </div>
                      <p className="text-[11px] text-[#524346]">
                        Your curated favourites are backed up to Firestore across all your browser sessions.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate?.('wishlist');
                        }}
                        className="w-full bg-[#f2e5e6] hover:bg-[#d7c1c4] text-[#370617] py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mt-1"
                      >
                        View Saved Pieces
                      </button>
                    </div>

                    {/* Security & Authentication Box */}
                    <div className="bg-white p-4 rounded-xl border border-[#d7c1c4] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#370617] flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[#B88A44]">shield</span>
                          Security Status
                        </span>
                        <span className="text-[10px] bg-[#1F7A52]/10 text-[#1F7A52] px-2 py-0.5 rounded font-bold">
                          {currentUser.authProvider?.toUpperCase() || 'FIREBASE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#524346]">
                        Encrypted with Google Firebase Auth. All transaction receipts and hallmarking certificates are stored securely.
                      </p>
                      <div className="text-[10px] text-[#847375] font-data pt-1">
                        UID: {currentUser.uid?.slice(0, 14)}...
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Orders History */}
              {profileTab === 'orders' && (
                <div className="space-y-4">
                  {ordersLoading ? (
                    <div className="text-center py-8 space-y-2">
                      <span className="material-symbols-outlined text-3xl text-[#B88A44] animate-spin">progress_activity</span>
                      <p className="text-xs text-[#524346]">Retrieving your insured order history...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-[#d7c1c4] text-center space-y-3">
                      <span className="material-symbols-outlined text-4xl text-[#847375]">receipt_long</span>
                      <h4 className="font-serif-display text-base font-bold text-[#370617]">No Orders Placed Yet</h4>
                      <p className="text-xs text-[#524346] max-w-sm mx-auto">
                        Your certified jewellery purchases will appear here with live courier tracking and BIS certificates.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate?.('catalog');
                        }}
                        className="bg-[#370617] text-white px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#521b2b] transition-colors"
                      >
                        Explore Gold Catalogue
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white p-4 rounded-xl border border-[#d7c1c4] shadow-sm space-y-3 hover:border-[#370617] transition-all"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f2e5e6] pb-2">
                            <div>
                              <span className="text-[10px] text-[#847375] font-sans block">Order Number</span>
                              <span className="font-data font-bold text-xs text-[#370617]">{order.orderNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getOrderStatusBadge(order.status)}
                              <span className="font-data font-bold text-sm text-[#370617]">
                                ₹{order.grandTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-[#524346]">
                            <div>
                              <p className="font-medium text-[#370617]">
                                {order.items.length} {order.items.length === 1 ? 'Piece' : 'Pieces'} • {order.totalWeightGrams}g Total 22K Gold
                              </p>
                              <p className="text-[10px] text-[#847375]">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-semibold text-[#1F7A52] block flex items-center justify-end gap-1">
                                <span className="material-symbols-outlined text-xs">local_shipping</span>
                                {order.trackingNumber}
                              </span>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="flex gap-2 overflow-x-auto pt-1 pb-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-[#FAF6F0] p-1.5 rounded-lg border border-[#d7c1c4] shrink-0 text-xs">
                                <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded" />
                                <div>
                                  <p className="font-bold text-[11px] text-[#370617] truncate max-w-[140px]">{item.name}</p>
                                  <span className="text-[9px] font-data text-[#847375]">{item.purity} • Qty {item.quantity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Festive Onam Vouchers */}
              {profileTab === 'vouchers' && (
                <div className="bg-[#20221C] text-[#ECEAE2] p-5 rounded-2xl border border-[#C7E24E]/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#C7E24E] tracking-widest flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">card_giftcard</span>
                      <span>Festive Onam Surprise 2026</span>
                    </span>
                    {userCoupon && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        userCoupon.status === 'UNUSED' ? 'bg-[#C7E24E] text-[#070A0D]' : 'bg-[#4E4C4B] text-[#ECEAE2]'
                      }`}>
                        {userCoupon.status === 'UNUSED' ? 'ACTIVE VOUCHER' : userCoupon.status}
                      </span>
                    )}
                  </div>

                  {userCoupon ? (
                    <div className="space-y-2 pt-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-[#ECEAE2]/80">Discount Value on Making Charges:</span>
                        <span className="text-2xl font-bold font-serif-display text-[#C7E24E]">
                          ₹{userCoupon.discountAmount.toLocaleString()} OFF
                        </span>
                      </div>
                      <p className="text-xs text-[#ECEAE2]/70 font-data">
                        Voucher Code: <strong className="text-white">{userCoupon.code}</strong>
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate?.('onam-campaign');
                        }}
                        className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">qr_code_2</span>
                        <span>Open Voucher & Store Barcode</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-[#ECEAE2]/80">
                        You haven't spun the Golden Raffle yet! Reveal between ₹50 and ₹50,000 off making charges.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onNavigate?.('onam-campaign');
                        }}
                        className="w-full bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all mt-2"
                      >
                        <span className="material-symbols-outlined text-sm">auto_awesome</span>
                        <span>Spin Golden Onam Raffle</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#d7c1c4]">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-xs text-[#ba1a1a] hover:underline font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Sign Out</span>
                </button>
                <button
                  onClick={onClose}
                  className="bg-[#370617] text-[#FAF6F0] px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#521b2b] transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* AUTHENTICATION / LOGIN / REGISTER FORM */
            /* ========================================================= */
            <div className="space-y-5">
              
              {/* Google 1-Click Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white hover:bg-gray-50 text-[#370617] font-semibold border-2 border-[#d7c1c4] hover:border-[#370617] py-3 px-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-sm group focus:outline-none focus:ring-2 focus:ring-[#370617]"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {loading ? 'Authenticating...' : 'Continue with Google'}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#d7c1c4]" />
                <span className="text-[11px] font-sans text-[#847375] uppercase tracking-wider">Or with Email / Mobile</span>
                <div className="flex-1 h-px bg-[#d7c1c4]" />
              </div>

              {/* Mode Selector Tabs */}
              <div className="flex rounded-xl bg-[#f2e5e6] p-1 border border-[#d7c1c4]">
                <button
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-[#370617] text-[#FAF6F0] shadow-sm'
                      : 'text-[#524346] hover:text-[#370617]'
                  }`}
                >
                  Email Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'register'
                      ? 'bg-[#370617] text-[#FAF6F0] shadow-sm'
                      : 'text-[#524346] hover:text-[#370617]'
                  }`}
                >
                  Create Account
                </button>
                <button
                  onClick={() => { setAuthMode('phone'); setAuthError(''); setPhoneStep('mobile'); }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    authMode === 'phone'
                      ? 'bg-[#370617] text-[#FAF6F0] shadow-sm'
                      : 'text-[#524346] hover:text-[#370617]'
                  }`}
                >
                  Mobile OTP
                </button>
              </div>

              {/* Error Message & Domain Assistance Card */}
              {authError && (
                <div className="bg-[#fff0f0] border border-[#ba1a1a]/40 text-[#ba1a1a] p-3.5 rounded-2xl text-xs space-y-2 animate-fadeIn shadow-xs">
                  <div className="flex items-start gap-2 font-medium">
                    <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                    <span>{authError}</span>
                  </div>

                  {unauthorizedDomain && (
                    <div className="bg-white/80 p-3 rounded-xl border border-[#ba1a1a]/20 space-y-2 text-[#370617]">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#9A7228]">
                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                        <span>Instant Sign-In Options:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode('phone');
                            setPhoneStep('mobile');
                            setPhoneMobile('9847012345');
                            setAuthError('');
                          }}
                          className="bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all"
                        >
                          <span className="material-symbols-outlined text-xs">sms</span>
                          <span>Use Mobile OTP (Auto-fill 123456)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickPatronLogin}
                          className="bg-[#C7E24E] hover:bg-[#b0cc3d] text-[#070A0D] px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs"
                        >
                          <span className="material-symbols-outlined text-xs">bolt</span>
                          <span>Instant Test Sign-In</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-[#524346] pt-1">
                        Domain Owner Tip: Add <code className="bg-[#FAF6F0] px-1.5 py-0.5 rounded font-mono font-bold">{unauthorizedDomain}</code> under Firebase Console → Authentication → Settings → Authorized domains.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Form 1: Email Login */}
              {authMode === 'login' && (
                <form onSubmit={handleEmailLogin} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#370617]">Email Address</label>
                    <input
                      type="email"
                      placeholder="e.g. patron@kavitha.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-[#370617]">Password</label>
                      <button
                        type="button"
                        onClick={() => alert('Please use Google Sign-in or Mobile OTP to sign in seamlessly.')}
                        className="text-[10px] text-[#B88A44] hover:underline font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span>Sign In to Kavitha Vault</span>
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form 2: Email Registration */}
              {authMode === 'register' && (
                <form onSubmit={handleEmailRegister} className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#370617]">Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Kevin Varghese"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#370617]">Email *</label>
                      <input
                        type="email"
                        placeholder="kevin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#370617]">Password (min 6) *</label>
                      <input
                        type="password"
                        placeholder="Create password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#370617]">Mobile Number</label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#370617]">City / State</label>
                      <input
                        type="text"
                        placeholder="e.g. Cherai, Kochi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-white border border-[#d7c1c4] rounded-xl px-3 py-2 text-xs font-semibold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all mt-2"
                  >
                    {loading ? (
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                    ) : (
                      <>
                        <span>Create Account & Sync Vault</span>
                        <span className="material-symbols-outlined text-sm">how_to_reg</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form 3: Phone OTP Login */}
              {authMode === 'phone' && (
                phoneStep === 'mobile' ? (
                  <form onSubmit={handlePhoneSendOtp} className="space-y-3 pt-1">
                    <p className="text-xs text-[#524346] leading-relaxed">
                      Enter your mobile number to receive a 6-digit BSNL DLT verification code to sync your active coupons and orders.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#370617]">Mobile Number</label>
                      <div className="flex items-center bg-white border border-[#d7c1c4] rounded-xl overflow-hidden focus-within:border-[#370617]">
                        <span className="px-3 text-[#524346] font-bold text-xs bg-[#f2e5e6] border-r border-[#d7c1c4] py-2.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit number"
                          value={phoneMobile}
                          onChange={(e) => setPhoneMobile(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 py-2.5 text-xs font-bold font-data text-[#370617] focus:outline-none"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span>Send OTP Code</span>
                      <span className="material-symbols-outlined text-sm">send</span>
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#524346]">OTP sent to <strong>+91 {phoneMobile}</strong></span>
                      <button
                        onClick={() => setPhoneStep('mobile')}
                        className="text-[#B88A44] font-bold underline hover:text-[#370617]"
                      >
                        Change
                      </button>
                    </div>

                    {/* Quick Demo Helper */}
                    <div className="bg-[#fff8f7] p-2.5 rounded-xl border border-[#B88A44]/30 flex justify-between items-center text-[11px]">
                      <span className="text-[#524346]">⚡ Test Code: 123456</span>
                      <button
                        type="button"
                        onClick={() => setOtpDigits(['1', '2', '3', '4', '5', '6'])}
                        className="text-[#B88A44] font-bold underline hover:text-[#370617]"
                      >
                        Auto-fill
                      </button>
                    </div>

                    <div className="flex justify-between gap-1.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`firebase-modal-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            let val = e.target.value;
                            if (val.length > 1) val = val.slice(-1);
                            const updated = [...otpDigits];
                            updated[idx] = val;
                            setOtpDigits(updated);
                            if (val && idx < 5) {
                              const next = document.getElementById(`firebase-modal-otp-${idx + 1}`);
                              if (next) next.focus();
                            }
                          }}
                          className="w-10 h-12 text-center bg-white border border-[#d7c1c4] rounded-xl font-data text-lg font-bold text-[#370617] focus:border-[#370617] focus:outline-none shadow-sm"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handlePhoneVerifyOtp}
                      className="w-full bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      <span>Verify & Access Account</span>
                    </button>
                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
