import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark-only';
  theme?: 'light' | 'dark' | 'maroon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  subBrand?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  subBrand,
}) => {
  const isDark = theme === 'dark' || theme === 'maroon';
  const textColor = theme === 'maroon' ? 'text-white' : isDark ? 'text-[#FAF6F0]' : 'text-[#370617]';
  const tagColor = theme === 'maroon' ? 'text-[#D4AF6A]' : isDark ? 'text-[#B88A44]' : 'text-[#847375]';

  // Mark sizing
  const markSizeMap = {
    sm: 28,
    md: 40,
    lg: 54,
    xl: 72,
  };
  const markSize = markSizeMap[size] || 40;

  /**
   * The Official Kavitha Jewellery Monogram Mark
   * Precision vector tracing of the geometric interlocking 'K' & 'J' gold crown emblem
   */
  const MonogramMark = (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Kavitha Jewellery Logo"
    >
      <defs>
        {/* Rich Brushed 22K Metallic Gold Gradient (Left Wing / K) */}
        <linearGradient id="kjGoldWingLeft" x1="10%" y1="90%" x2="90%" y2="10%">
          <stop offset="0%" stopColor="#875E26" />
          <stop offset="25%" stopColor="#AF833B" />
          <stop offset="55%" stopColor="#D9B76A" />
          <stop offset="80%" stopColor="#F5E4B3" />
          <stop offset="100%" stopColor="#C99F4E" />
        </linearGradient>

        {/* Dynamic Facet Gradient (Right Wing / J Hook) */}
        <linearGradient id="kjGoldWingRight" x1="20%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#966C2E" />
          <stop offset="35%" stopColor="#C8A155" />
          <stop offset="70%" stopColor="#EED799" />
          <stop offset="100%" stopColor="#BA9045" />
        </linearGradient>

        {/* Subtle Drop Filter for Premium Depth */}
        <filter id="kjGoldGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#370617" floodOpacity="0.15" />
        </filter>
      </defs>

      <g filter="url(#kjGoldGlow)">
        {/* Left Wing / 'K' Primary Geometric Facet */}
        <path
          d="M20 22 L20 62 L60 102 L76 86 L36 46 L36 34 C44 26 56 26 76 34 L76 22 C52 14 36 14 20 22 Z"
          fill="url(#kjGoldWingLeft)"
        />

        {/* Right Hook / 'J' & Crown Chevron */}
        <path
          d="M100 22 L100 62 L74 88 L58 72 L76 54 L76 38 L100 22 Z"
          fill="url(#kjGoldWingRight)"
        />
      </g>
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{MonogramMark}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center group ${className}`}>
        {MonogramMark}
        <div className="mt-2.5">
          <span
            className={`font-serif-display font-bold tracking-tight block ${textColor} ${
              size === 'xl' ? 'text-3xl md:text-4xl' : size === 'lg' ? 'text-2xl md:text-3xl' : size === 'md' ? 'text-xl' : 'text-lg'
            }`}
          >
            Kavitha Jewellery
          </span>
          {subBrand && (
            <span className="block text-[10px] uppercase tracking-widest text-[#B88A44] font-medium mt-0.5">
              {subBrand}
            </span>
          )}
          <span className={`block font-sans text-[9px] uppercase tracking-[0.25em] ${tagColor} mt-1 font-semibold`}>
            BUILT ON TRUST • SINCE 1992
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3.5 group ${className}`}>
      {MonogramMark}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span
            className={`font-serif-display font-bold tracking-tight ${textColor} ${
              size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-2xl md:text-3xl' : size === 'md' ? 'text-xl md:text-2xl' : 'text-lg'
            }`}
          >
            Kavitha Jewellery
          </span>
          {subBrand && (
            <span className="text-[10px] uppercase tracking-wider text-[#B88A44] font-semibold">
              • {subBrand}
            </span>
          )}
        </div>
        <span className={`font-sans text-[9px] uppercase tracking-[0.22em] font-semibold ${tagColor} -mt-0.5`}>
          BUILT ON TRUST • SINCE 1992
        </span>
      </div>
    </div>
  );
};
