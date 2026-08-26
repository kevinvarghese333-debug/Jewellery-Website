import React, { useState } from 'react';
import { useStoreBranding } from '../hooks/useStoreBranding';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark-only' | 'badge';
  theme?: 'light' | 'dark' | 'maroon' | 'gold';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subBrand?: string;
  align?: 'left' | 'center';
  showImage?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  subBrand,
  align = 'center',
}) => {
  const branding = useStoreBranding();
  const [imgError, setImgError] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const isDark = theme === 'dark' || theme === 'maroon';
  const textColor = theme === 'maroon' ? 'text-white' : isDark ? 'text-[#FAF6F0]' : 'text-[#370617]';
  const tagColor = theme === 'maroon' ? 'text-[#D4AF6A]' : isDark ? 'text-[#E5C16C]' : 'text-[#9A7228]';

  // Sizing map for dimensions
  const sizeMap = {
    sm: { px: 36, text: 'text-lg sm:text-xl', subText: 'text-[9px]' },
    md: { px: 46, text: 'text-xl sm:text-2xl', subText: 'text-[10px]' },
    lg: { px: 60, text: 'text-2xl sm:text-3xl', subText: 'text-[11px]' },
    xl: { px: 80, text: 'text-3xl sm:text-4xl', subText: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Active logo source prioritizing Admin-configured logo
  const logoSources = [
    branding?.logoUrl || '/logo.png',
    '/logo.png',
    '/kavitha-logo.jpg',
    '/logo.jpg',
  ];
  const activeLogoSrc = logoSources[fallbackIndex] || '/logo.png';

  const handleImageError = () => {
    if (fallbackIndex < logoSources.length - 1) {
      setFallbackIndex(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // Authentic Brand Logo Image with luxury container
  const BrandLogoMark = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full transition-transform duration-300 group-hover:scale-105 select-none ${
        isDark ? 'bg-[#FAF6F0] p-1 shadow-sm ring-1 ring-[#D4AF6A]/60' : 'bg-transparent'
      }`}
      style={{ width: currentSize.px, height: currentSize.px }}
    >
      {!imgError ? (
        <img
          src={activeLogoSrc}
          alt={branding?.logoAltText || "Kavitha Jewellery Logo"}
          className="w-full h-full object-contain drop-shadow-xs"
          onError={handleImageError}
        />
      ) : (
        <svg
          width={currentSize.px}
          height={currentSize.px}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="kjGoldShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="100%" stopColor="#6E480F" />
            </linearGradient>
          </defs>
          <circle cx="80" cy="80" r="70" stroke="url(#kjGoldShimmer)" strokeWidth="3" />
          <path d="M52 48 L64 48 L64 112 L52 112 Z" fill="url(#kjGoldShimmer)" />
          <path d="M64 80 L88 48 L102 48 L76 86 Z" fill="url(#kjGoldShimmer)" />
          <path d="M72 84 L102 112 L88 112 L64 88 Z" fill="url(#kjGoldShimmer)" />
          <path d="M98 48 L110 48 L110 98 C110 110 98 114 86 114 L86 102 C94 102 98 98 98 92 Z" fill="url(#kjGoldShimmer)" />
        </svg>
      )}
    </div>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>{BrandLogoMark}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-3 bg-[#FAF6F0] border border-[#B88A44]/40 rounded-2xl px-4 py-2.5 shadow-sm ${className}`}>
        {BrandLogoMark}
        <div className="flex flex-col text-left">
          <span className="font-serif-display font-bold text-sm sm:text-base text-[#370617] leading-tight tracking-tight">
            Kavitha Jewellery
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B88A44]">
            EST. 1992 • CHERAI, KERALA
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    const alignClasses = align === 'left' ? 'items-start text-left' : 'items-center text-center';
    return (
      <div className={`flex flex-col ${alignClasses} group ${className}`}>
        {BrandLogoMark}
        <div className="mt-2.5">
          <span
            className={`font-serif-display font-bold tracking-tight block whitespace-nowrap ${textColor} ${currentSize.text}`}
          >
            Kavitha Jewellery
          </span>
          {subBrand && (
            <span className="block text-[10px] uppercase tracking-widest text-[#B88A44] font-semibold mt-0.5 whitespace-nowrap font-sans">
              {subBrand}
            </span>
          )}
          <span className={`block font-sans ${currentSize.subText} uppercase tracking-[0.22em] ${tagColor} mt-1 font-bold whitespace-nowrap`}>
            EST. 1992 • CHERAI, KERALA
          </span>
        </div>
      </div>
    );
  }

  // Default 'horizontal' variant
  return (
    <div className={`inline-flex items-center gap-3 group ${className}`}>
      {BrandLogoMark}
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline gap-1.5 flex-wrap sm:flex-nowrap">
          <span
            className={`font-serif-display font-bold tracking-tight whitespace-nowrap ${textColor} ${currentSize.text}`}
          >
            Kavitha Jewellery
          </span>
          {subBrand && (
            <span className="text-[10px] uppercase tracking-wider text-[#B88A44] font-semibold whitespace-nowrap font-sans">
              • {subBrand}
            </span>
          )}
        </div>
        <span className={`font-sans ${currentSize.subText} uppercase tracking-[0.22em] font-bold ${tagColor} mt-0.5 whitespace-nowrap`}>
          EST. 1992 • CHERAI, KERALA • 916 BIS
        </span>
      </div>
    </div>
  );
};
