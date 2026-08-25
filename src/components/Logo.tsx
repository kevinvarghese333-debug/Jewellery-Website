import React, { useState } from 'react';

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
  showImage = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const isDark = theme === 'dark' || theme === 'maroon';
  const textColor = theme === 'maroon' ? 'text-white' : isDark ? 'text-[#FAF6F0]' : 'text-[#370617]';
  const tagColor = theme === 'maroon' ? 'text-[#D4AF6A]' : isDark ? 'text-[#C7E24E]' : 'text-[#B88A44]';

  // Mark / Image sizing map
  const sizeMap = {
    sm: { h: 36, w: 36, imgH: 'h-9 w-9', text: 'text-lg sm:text-xl', subText: 'text-[8.5px]' },
    md: { h: 46, w: 46, imgH: 'h-11 w-11 sm:h-12 sm:w-12', text: 'text-xl sm:text-2xl', subText: 'text-[9.5px]' },
    lg: { h: 60, w: 60, imgH: 'h-14 w-14 sm:h-16 sm:w-16', text: 'text-2xl sm:text-3xl', subText: 'text-[11px]' },
    xl: { h: 80, w: 80, imgH: 'h-20 w-20 sm:h-24 sm:w-24', text: 'text-3xl sm:text-4xl', subText: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  /**
   * The Official Kavitha Jewellery Vector Gold Crown & Monogram Emblem
   */
  const VectorEmblem = (
    <svg
      width={currentSize.w}
      height={currentSize.h}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Kavitha Jewellery Monogram Emblem"
    >
      <defs>
        <radialGradient id="kjGoldCenter" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="30%" stopColor="#E5C16C" />
          <stop offset="70%" stopColor="#B28438" />
          <stop offset="100%" stopColor="#6C4B18" />
        </radialGradient>
        <linearGradient id="kjGoldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDEAB3" />
          <stop offset="35%" stopColor="#D4A853" />
          <stop offset="70%" stopColor="#9C6F2B" />
          <stop offset="100%" stopColor="#634313" />
        </linearGradient>
        <linearGradient id="kjGoldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="25%" stopColor="#F5D98B" />
          <stop offset="60%" stopColor="#C49641" />
          <stop offset="100%" stopColor="#7A5119" />
        </linearGradient>
        <linearGradient id="kjMaroonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A0E1F" />
          <stop offset="50%" stopColor="#2A0510" />
          <stop offset="100%" stopColor="#150208" />
        </linearGradient>
        <filter id="kjGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Outer Luxury Crest Medallion */}
      <rect x="8" y="8" width="224" height="224" rx="44" fill="url(#kjMaroonGrad)" stroke="url(#kjGoldGrad1)" strokeWidth="3.5" />
      <rect x="18" y="18" width="204" height="204" rx="36" fill="none" stroke="url(#kjGoldGrad2)" strokeWidth="1.2" strokeDasharray="4 3" opacity="0.75" />

      {/* Corner Lotus Flourishes */}
      <circle cx="28" cy="28" r="3.5" fill="#E5C16C" />
      <circle cx="212" cy="28" r="3.5" fill="#E5C16C" />
      <circle cx="28" cy="212" r="3.5" fill="#E5C16C" />
      <circle cx="212" cy="212" r="3.5" fill="#E5C16C" />

      {/* Main Geometric Jewel & Crown Monogram */}
      <g filter="url(#kjGoldGlow)" transform="translate(120, 112)">
        {/* Crown Pinnacles */}
        <path d="M-42 -44 L-30 -22 L-14 -36 L0 -52 L14 -36 L30 -22 L42 -44 L32 -14 L-32 -14 Z" fill="url(#kjGoldGrad2)" />
        {/* Crown Central Gem */}
        <polygon points="0,-46 5,-38 0,-30 -5,-38" fill="#FFF8E7" />

        {/* Royal Monogram "K" & "J" Geometric Crest */}
        <path d="M-36 -8 L-22 -8 L-22 52 L-36 52 Z" fill="url(#kjGoldGrad1)" />
        <path d="M-22 18 L4 -8 L18 -8 L-10 24 Z" fill="url(#kjGoldGrad2)" />
        <path d="M-12 20 L18 52 L4 52 L-22 26 Z" fill="url(#kjGoldGrad1)" />
        <path d="M22 -8 L36 -8 L36 34 C36 48 24 56 6 56 C-2 56 -8 54 -12 50 L-6 40 C-3 42 1 44 6 44 C15 44 22 39 22 30 Z" fill="url(#kjGoldCenter)" />
        <polygon points="0,0 6,10 0,20 -6,10" fill="#FFFDF5" opacity="0.9" />
      </g>

      {/* 916 Hallmark Ribbon & EST 1992 */}
      <text x="120" y="196" fontFamily="'Cinzel', 'Playfair Display', serif" fontSize="9.5" fontWeight="700" fill="#E5C16C" textAnchor="middle" letterSpacing="3.5">
        EST. 1992 • CHERAI
      </text>
      <text x="120" y="209" fontFamily="sans-serif" fontSize="7" fontWeight="800" fill="#FFF4D0" textAnchor="middle" letterSpacing="2.5" opacity="0.85">
        916 BIS HALLMARK
      </text>
    </svg>
  );

  /**
   * Official Logo Image Asset with Gold Frame / Precision Fallback
   */
  const LogoVisual = showImage && !imageError ? (
    <div className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-sm border border-[#B88A44]/40 bg-[#FAF6F0] p-0.5 group-hover:border-[#B88A44] transition-all`}>
      <img
        src="/logo.svg"
        alt="Kavitha Jewellery Official Logo"
        className={`${currentSize.imgH} object-contain rounded-xl`}
        onError={() => setImageError(true)}
      />
    </div>
  ) : (
    VectorEmblem
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoVisual}</div>;
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2.5 bg-[#FAF6F0] border border-[#B88A44]/50 rounded-2xl px-3.5 py-2 shadow-sm ${className}`}>
        {LogoVisual}
        <div className="flex flex-col text-left">
          <span className="font-serif-display font-bold text-sm sm:text-base text-[#370617] leading-tight">
            Kavitha Jewellery
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-[#B88A44]">
            EST. 1992 • CHERAI
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'stacked') {
    const alignClasses = align === 'left' ? 'items-start text-left' : 'items-center text-center';
    return (
      <div className={`flex flex-col ${alignClasses} group ${className}`}>
        {LogoVisual}
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
          <span className={`block font-sans ${currentSize.subText} uppercase tracking-[0.25em] ${tagColor} mt-1 font-bold whitespace-nowrap`}>
            EST. 1992 • CHERAI, KERALA
          </span>
        </div>
      </div>
    );
  }

  // Default 'horizontal' variant
  return (
    <div className={`inline-flex items-center gap-3 sm:gap-3.5 group ${className}`}>
      {LogoVisual}
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

