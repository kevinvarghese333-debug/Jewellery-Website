import React from 'react';

interface DiamondRuleProps {
  label?: string;
  align?: 'center' | 'left';
  className?: string;
  color?: string;
}

export const DiamondRule: React.FC<DiamondRuleProps> = ({
  label,
  align = 'center',
  className = '',
  color = '#B88A44'
}) => {
  return (
    <div className={`flex items-center gap-3 my-6 ${align === 'center' ? 'justify-center' : 'justify-start'} ${className}`}>
      <span className="text-xs" style={{ color }}>◆</span>
      <div className="h-[1px] flex-grow max-w-xs bg-gradient-to-r from-[#B88A44] to-transparent opacity-50" />
      {label && (
        <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-semibold text-[#847375] px-2">
          {label}
        </span>
      )}
      {label && <div className="h-[1px] flex-grow max-w-xs bg-gradient-to-l from-[#B88A44] to-transparent opacity-50" />}
    </div>
  );
};
