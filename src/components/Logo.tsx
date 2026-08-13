import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'stacked' | 'mark-only';
  theme?: 'light' | 'dark' | 'maroon';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  subBrand?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  className = '',
  subBrand
}) => {
  // Brand Colors based on manual:
  // Primary Maroon: #6B1F2A / #370617
  // Heritage Gold: #B88A44
  // Bright Gold: #D4AF6A

  const isDark = theme === 'dark' || theme === 'maroon';
  const textColor = theme === 'maroon' ? 'text-white' : isDark ? 'text-[#FAF6F0]' : 'text-[#370617]';
  const tagColor = theme === 'maroon' ? 'text-[#D4AF6A]' : isDark ? 'text-[#B88A44]' : 'text-[#847375]';

  // Mark sizing
  const markSizeMap = {
    sm: 24,
    md: 36,
    lg: 48
  };
  const markSize = markSizeMap[size];

  // The Geometric Monogram (K formed by interlocking chevrons descending into a vault point)
  const MonogramMark = (
    <svg
      width={markSize}
      height={markSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="inline-block shrink-0"
    >
      <defs>
        <linearGradient id="kavithaGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8C5C1E" />
          <stop offset="40%" stopColor="#B88A44" />
          <stop offset="70%" stopColor="#E2C17C" />
          <stop offset="100%" stopColor="#F5E3B3" />
        </linearGradient>
      </defs>
      
      {/* Outer Interlocking Chevron 1 (Left arm & converging base) */}
      <path
        d="M22 20 L42 20 L50 68 L28 42 Z"
        fill="url(#kavithaGoldGrad)"
      />
      {/* Outer Interlocking Chevron 2 (Right arm & vault peak) */}
      <path
        d="M78 20 L58 20 L50 68 L72 42 Z"
        fill="url(#kavithaGoldGrad)"
        opacity="0.9"
      />
      {/* Upper Aspirational Arms / Crown */}
      <path
        d="M32 12 L50 48 L68 12 L82 12 L50 62 L18 12 Z"
        fill="url(#kavithaGoldGrad)"
      />
      {/* Central Diamond Accent */}
      <polygon points="50,68 58,82 50,96 42,82" fill="url(#kavithaGoldGrad)" />
    </svg>
  );

  if (variant === 'mark-only') {
    return <div className={`inline-flex items-center ${className}`}>{MonogramMark}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {MonogramMark}
        <div className="mt-2">
          <span className={`font-serif-display font-bold tracking-tight ${textColor} ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'}`}>
            Kavitha Jewellery
          </span>
          {subBrand && (
            <span className="block text-[10px] uppercase tracking-widest text-[#B88A44] font-medium mt-0.5">
              {subBrand}
            </span>
          )}
          <span className={`block font-sans text-[9px] uppercase tracking-[0.25em] ${tagColor} mt-0.5`}>
            BUILT ON TRUST
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {MonogramMark}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-serif-display font-bold tracking-tight ${textColor} ${size === 'lg' ? 'text-2xl md:text-3xl' : size === 'md' ? 'text-xl md:text-2xl' : 'text-lg'}`}>
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
