import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product, PurityType, ActiveView } from '../types';
import { calculatePriceBreakdown, CURRENT_GOLD_RATE_22K } from '../data/products';

export type ToastType = 'cart' | 'wishlist-add' | 'wishlist-remove' | 'gold-rate' | 'success' | 'info' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  product?: Product;
  purity?: PurityType;
  quantity?: number;
  goldRate?: number;
  calculatedPrice?: number;
  actionLabel?: string;
  actionView?: ActiveView;
  duration?: number; // ms, default 4500
  createdAt: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  notifyAddToCart: (product: Product, purity?: PurityType, quantity?: number, goldRate?: number) => void;
  notifyWishlistToggle: (product: Product, isAdded: boolean) => void;
  notifyGoldRateUpdate: (newRate: number, oldRate?: number) => void;
  notifySuccess: (title: string, message?: string) => void;
  notifyInfo: (title: string, message?: string) => void;
  notifyError: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback((toastData: Omit<ToastItem, 'id' | 'createdAt'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = {
      ...toastData,
      id,
      duration: toastData.duration ?? 4500,
      createdAt: Date.now(),
    };

    setToasts((prev) => {
      // Keep up to 3 toasts max at once for neat visual hierarchy
      const filtered = prev.slice(-2);
      return [...filtered, newToast];
    });

    return id;
  }, []);

  const notifyAddToCart = useCallback(
    (product: Product, purity: PurityType = '22K', quantity: number = 1, goldRate: number = CURRENT_GOLD_RATE_22K) => {
      const bd = calculatePriceBreakdown(product.weightGrams, purity, goldRate);
      const calculatedPrice = bd.total * quantity;

      showToast({
        type: 'cart',
        title: 'Added to Shopping Bag',
        message: `${product.name} (${quantity} ${quantity > 1 ? 'items' : 'item'} • ${purity})`,
        product,
        purity,
        quantity,
        goldRate,
        calculatedPrice,
        actionLabel: 'View Bag',
        actionView: 'cart',
        duration: 5000,
      });
    },
    [showToast]
  );

  const notifyWishlistToggle = useCallback(
    (product: Product, isAdded: boolean) => {
      if (isAdded) {
        showToast({
          type: 'wishlist-add',
          title: 'Saved to Wishlist',
          message: `${product.name} is now in your personal vault.`,
          product,
          actionLabel: 'View Wishlist',
          actionView: 'wishlist',
          duration: 4500,
        });
      } else {
        showToast({
          type: 'wishlist-remove',
          title: 'Removed from Wishlist',
          message: `${product.name} removed from your saved pieces.`,
          product,
          duration: 3500,
        });
      }
    },
    [showToast]
  );

  const notifyGoldRateUpdate = useCallback(
    (newRate: number, oldRate?: number) => {
      const difference = oldRate ? newRate - oldRate : 0;
      const diffFormatted =
        difference > 0
          ? `+₹${difference.toLocaleString()}`
          : difference < 0
          ? `-₹${Math.abs(difference).toLocaleString()}`
          : '';

      showToast({
        type: 'gold-rate',
        title: '22K Gold Rate Updated',
        message: `Live store rate is now ₹${newRate.toLocaleString()}/gm ${
          diffFormatted ? `(${diffFormatted})` : ''
        }. All catalog prices recalculated.`,
        goldRate: newRate,
        duration: 5000,
      });
    },
    [showToast]
  );

  const notifySuccess = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'success',
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  const notifyInfo = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'info',
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  const notifyError = useCallback(
    (title: string, message?: string) => {
      showToast({
        type: 'error',
        title,
        message,
        duration: 5000,
      });
    },
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      dismissToast,
      clearAllToasts,
      notifyAddToCart,
      notifyWishlistToggle,
      notifyGoldRateUpdate,
      notifySuccess,
      notifyInfo,
      notifyError,
    }),
    [
      toasts,
      showToast,
      dismissToast,
      clearAllToasts,
      notifyAddToCart,
      notifyWishlistToggle,
      notifyGoldRateUpdate,
      notifySuccess,
      notifyInfo,
      notifyError,
    ]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
