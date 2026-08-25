import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useToast, ToastItem } from '../context/ToastContext';
import { ActiveView } from '../types';

interface ToastContainerProps {
  onNavigate?: (view: ActiveView) => void;
}

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
  onNavigate?: (view: ActiveView) => void;
}> = ({ toast, onDismiss, onNavigate }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 4500);

  useEffect(() => {
    if (isPaused) return;

    const totalDuration = toast.duration || 4500;
    const intervalMs = 25;
    const startTime = Date.now();
    const initialRemaining = remainingTimeRef.current;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentRemaining = Math.max(0, initialRemaining - elapsed);
      remainingTimeRef.current = currentRemaining;

      const pct = (currentRemaining / totalDuration) * 100;
      setProgress(pct);

      if (currentRemaining <= 0) {
        clearInterval(timer);
        onDismiss(toast.id);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, toast.duration, toast.id, onDismiss]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleActionClick = () => {
    if (toast.actionView && onNavigate) {
      onNavigate(toast.actionView);
      onDismiss(toast.id);
    }
  };

  // Render toast type specifics
  const renderIconAndColors = () => {
    switch (toast.type) {
      case 'cart':
        return {
          icon: 'shopping_bag',
          accentColor: '#370617',
          iconBg: 'bg-[#370617] text-[#FAF6F0]',
          badgeText: 'BAG UPDATED',
          badgeBg: 'bg-[#370617]/10 text-[#370617]',
          progressBarColor: 'bg-[#370617]',
        };
      case 'wishlist-add':
        return {
          icon: 'favorite',
          iconWeight: 'fill',
          accentColor: '#ba1a1a',
          iconBg: 'bg-[#ba1a1a] text-white',
          badgeText: 'WISHLIST SAVED',
          badgeBg: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
          progressBarColor: 'bg-[#ba1a1a]',
        };
      case 'wishlist-remove':
        return {
          icon: 'heart_minus',
          accentColor: '#847375',
          iconBg: 'bg-[#847375] text-white',
          badgeText: 'WISHLIST UPDATED',
          badgeBg: 'bg-[#847375]/10 text-[#847375]',
          progressBarColor: 'bg-[#847375]',
        };
      case 'gold-rate':
        return {
          icon: 'trending_up',
          accentColor: '#B88A44',
          iconBg: 'bg-gradient-to-br from-[#B88A44] to-[#7e5714] text-white',
          badgeText: 'LIVE BULLION BENCHMARK',
          badgeBg: 'bg-[#B88A44]/15 text-[#B88A44] border border-[#B88A44]/30',
          progressBarColor: 'bg-[#B88A44]',
        };
      case 'error':
        return {
          icon: 'error',
          accentColor: '#ba1a1a',
          iconBg: 'bg-[#ba1a1a] text-white',
          badgeText: 'NOTICE',
          badgeBg: 'bg-[#ba1a1a]/10 text-[#ba1a1a]',
          progressBarColor: 'bg-[#ba1a1a]',
        };
      case 'info':
        return {
          icon: 'info',
          accentColor: '#2B5C8F',
          iconBg: 'bg-[#2B5C8F] text-white',
          badgeText: 'INFORMATION',
          badgeBg: 'bg-[#2B5C8F]/10 text-[#2B5C8F]',
          progressBarColor: 'bg-[#2B5C8F]',
        };
      case 'success':
      default:
        return {
          icon: 'check_circle',
          accentColor: '#1F7A52',
          iconBg: 'bg-[#1F7A52] text-white',
          badgeText: 'SUCCESS',
          badgeBg: 'bg-[#1F7A52]/10 text-[#1F7A52]',
          progressBarColor: 'bg-[#1F7A52]',
        };
    }
  };

  const style = renderIconAndColors();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-[#ffffff] border border-[#d7c1c4] rounded-2xl shadow-2xl overflow-hidden pointer-events-auto transition-all hover:border-[#B88A44]/70 hover:shadow-2xl"
      role="status"
      aria-live="polite"
    >
      {/* Top Gold / Theme Progress Accent Bar */}
      <div className="h-1 w-full bg-[#f2e5e6] overflow-hidden">
        <div
          className={`h-full ${style.progressBarColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Visual Thumbnail or Icon Avatar */}
          {toast.product?.images?.main ? (
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#fef0f1] border border-[#d7c1c4] shrink-0 shadow-inner">
              <img
                src={toast.product.images.main}
                alt={toast.product.name}
                className="w-full h-full object-cover"
              />
              <div
                className={`absolute bottom-0 right-0 p-0.5 rounded-tl-md ${style.iconBg} shadow-sm`}
              >
                <span
                  className="material-symbols-outlined text-[13px] block leading-none"
                  data-weight={style.iconWeight ? 'fill' : undefined}
                >
                  {style.icon}
                </span>
              </div>
            </div>
          ) : (
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${style.iconBg} shrink-0 shadow-md`}
            >
              <span
                className="material-symbols-outlined text-2xl"
                data-weight={style.iconWeight ? 'fill' : undefined}
              >
                {style.icon}
              </span>
            </div>
          )}

          {/* Toast Text Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={`text-[9px] font-sans font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badgeBg}`}
              >
                {style.badgeText}
              </span>
              {toast.purity && (
                <span className="text-[10px] font-data font-bold text-[#FAF6F0] bg-[#370617] px-1.5 py-0.5 rounded shadow-sm">
                  {toast.purity} Hallmarked
                </span>
              )}
              {toast.type === 'gold-rate' && (
                <span className="text-[10px] font-data font-bold text-[#B88A44] bg-[#B88A44]/10 px-2 py-0.5 rounded border border-[#B88A44]/30">
                  ₹{toast.goldRate?.toLocaleString()}/g
                </span>
              )}
            </div>

            <h4 className="font-serif-display text-sm sm:text-base font-bold text-[#370617] leading-snug line-clamp-1">
              {toast.title}
            </h4>

            {toast.message && (
              <p className="font-sans text-xs text-[#524346] mt-0.5 line-clamp-2 leading-relaxed">
                {toast.message}
              </p>
            )}

            {/* Calculated Price Line for Cart additions */}
            {toast.calculatedPrice !== undefined && toast.calculatedPrice > 0 && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2e5e6] text-xs">
                <span className="font-sans text-[11px] text-[#847375]">Price:</span>
                <span className="font-data font-bold text-[#370617]">
                  ₹{toast.calculatedPrice.toLocaleString()}
                </span>
                {toast.product?.weightGrams && (
                  <span className="text-[10px] font-sans text-[#847375]">
                    ({toast.product.weightGrams}g)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => onDismiss(toast.id)}
            className="absolute top-3 right-3 p-1.5 text-[#847375] hover:text-[#370617] hover:bg-[#f2e5e6] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#370617]"
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        </div>

        {/* Action Button (e.g. View Bag / View Wishlist) */}
        {toast.actionLabel && toast.actionView && onNavigate && (
          <div className="mt-3 pt-2.5 border-t border-[#f2e5e6] flex justify-end">
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-1.5 bg-[#370617] hover:bg-[#521b2b] text-[#FAF6F0] px-4 py-2 rounded-lg font-sans text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:shadow-md focus:ring-2 focus:ring-[#370617] focus:outline-none"
            >
              <span>{toast.actionLabel}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ onNavigate }) => {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-label="Notifications"
      className="fixed z-[100] bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] max-w-full pointer-events-none flex flex-col gap-3"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onNavigate={onNavigate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
