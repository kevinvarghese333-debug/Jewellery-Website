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
    '/kavitha_mark.svg',
    '/logo.svg',
    '/kavitha_mark.png',
  ];
  const activeLogoSrc = logoSources[fallbackIndex] || '/logo.svg';

  const handleImageError = () => {
    if (fallbackIndex < logoSources.length - 1) {
      setFallbackIndex(prev => prev + 1);
    } else {
      setImgError(true);
    }
  };

  // Authentic Brand Logo Image with luxury container matching uploaded emblem
  const BrandLogoMark = (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 select-none ${
        isDark ? 'drop-shadow-[0_2px_8px_rgba(245,215,127,0.3)]' : 'drop-shadow-xs'
      }`}
      style={{ width: currentSize.px, height: currentSize.px }}
    >
      {!imgError && activeLogoSrc ? (
        <img
          src={activeLogoSrc}
          alt={branding?.logoAltText || "Kavitha Jewellery Logo"}
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <svg
          width={currentSize.px}
          height={currentSize.px}
          viewBox="0 0 1000 1100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-contain"
        >
          <defs>
            <linearGradient id="kjMarkFallbackGold" x1="0%" y1="25%" x2="100%" y2="75%">
              <stop offset="0%" stopColor="#9E773A" />
              <stop offset="12%" stopColor="#BC934B" />
              <stop offset="30%" stopColor="#DFC075" />
              <stop offset="52%" stopColor="#F0D68F" />
              <stop offset="72%" stopColor="#D7B266" />
              <stop offset="88%" stopColor="#B68B42" />
              <stop offset="100%" stopColor="#926B2D" />
            </linearGradient>
          </defs>
          <g fill="url(#kjMarkFallbackGold)">
            {/* Shape 1: Left Wing with Arch */}
            <path d="M 40 60 L 40 620 L 360 940 L 435 940 L 275 780 L 380 675 L 275 570 L 170 465 L 280 355 C 280 355, 360 210, 610 210 L 535 285 C 380 285, 335 410, 335 440 L 120 225 L 280 65 L 40 60 Z" />

            {/* Shape 2: Center Diagonal Ribbon */}
            <path d="M 610 210 L 275 545 L 340 610 L 675 275 Z" />

            {/* Shape 3: Lower Center V-Block and Right Wing */}
            <path d="M 395 645 L 515 525 L 730 740 L 730 290 L 960 60 L 960 620 L 640 940 L 570 940 L 730 780 L 515 565 L 395 645 Z" />
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
