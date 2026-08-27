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
    branding?.logoUrl || '/logo.svg',
    '/logo.svg',
  ];
  const activeLogoSrc = logoSources[fallbackIndex] || '/logo.svg';

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
      {!imgError && activeLogoSrc && activeLogoSrc !== '/logo.png' && activeLogoSrc !== '/kavitha-logo.jpg' && activeLogoSrc !== '/logo.jpg' ? (
        <img
          src={activeLogoSrc}
          alt={branding?.logoAltText || "Kavitha Jewellery Logo"}
          className="w-full h-full object-contain drop-shadow-xs"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <svg
          width={currentSize.px}
          height={currentSize.px}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="kjGoldShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF7D6" />
              <stop offset="25%" stopColor="#F5D77F" />
              <stop offset="50%" stopColor="#D4A843" />
              <stop offset="75%" stopColor="#A87926" />
              <stop offset="100%" stopColor="#6E480F" />
            </linearGradient>
            <linearGradient id="kjGoldHighlight" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#FFE8A3" />
              <stop offset="70%" stopColor="#C99832" />
              <stop offset="100%" stopColor="#784E10" />
            </linearGradient>
            <radialGradient id="kjRubyGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="60%" stopColor="#A4133C" />
              <stop offset="100%" stopColor="#590D22" />
            </radialGradient>
          </defs>
          <g transform="translate(80, 80)">
            {/* Outer Filigree Halo Ring */}
            <circle cx="0" cy="0" r="70" stroke="url(#kjGoldShimmer)" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.75" />
            <circle cx="0" cy="0" r="64" stroke="url(#kjGoldHighlight)" strokeWidth="1.8" opacity="0.9" />

            {/* 4 Cardinal Ornamental Lotus Beads */}
            <circle cx="0" cy="-64" r="4" fill="url(#kjGoldHighlight)" />
            <circle cx="64" cy="0" r="4" fill="url(#kjGoldHighlight)" />
            <circle cx="0" cy="64" r="4" fill="url(#kjGoldHighlight)" />
            <circle cx="-64" cy="0" r="4" fill="url(#kjGoldHighlight)" />

            {/* Royal Crown & Temple Crest Pinnacles */}
            <path d="M-36 -32 L-26 -14 L-12 -26 L0 -40 L12 -26 L26 -14 L36 -32 L28 -8 L-28 -8 Z" fill="url(#kjGoldHighlight)" />
            
            {/* Central Auspicious Ruby Stone */}
            <polygon points="0,-36 5,-28 0,-20 -5,-28" fill="url(#kjRubyGlow)" stroke="url(#kjGoldHighlight)" strokeWidth="1" />

            {/* Interlocking "K" & "J" Royal Monogram */}
            <path d="M-28 -2 L-16 -2 L-16 44 L-28 44 Z" fill="url(#kjGoldShimmer)" />
            <path d="M-16 18 L6 -2 L18 -2 L-6 24 Z" fill="url(#kjGoldHighlight)" />
            <path d="M-8 21 L16 44 L4 44 L-16 26 Z" fill="url(#kjGoldShimmer)" />
            <path d="M18 -2 L28 -2 L28 28 C28 40 18 46 4 46 C-2 46 -8 44 -12 40 L-7 32 C-4 34 0 36 4 36 C11 36 17 32 17 25 Z" fill="url(#kjGoldHighlight)" />

            {/* Diamond Brilliant Sparkle Accent */}
            <polygon points="0,6 5,14 0,22 -5,14" fill="#FFFFFF" opacity="0.95" />
          </g>
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
