import React from 'react';

interface BadgeProps {
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'green',
  children,
  className = '',
}) => {
  const variantStyles = {
    green: 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]',
    yellow: 'bg-[#FEF08A] text-[#854D0E] border-[#854D0E]',
    red: 'bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C]',
    blue: 'bg-[#E0F2FE] text-[#0369A1] border-[#0369A1]',
    purple: 'bg-[#F3E8FF] text-[#6B21A8] border-[#6B21A8]',
    gray: 'bg-[#F3F4F6] text-[#374151] border-[#374151]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
