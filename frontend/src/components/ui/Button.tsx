import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'pink' | 'danger' | 'outline' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-bold',
    md: 'px-5 py-2.5 text-sm font-extrabold',
    lg: 'px-7 py-3.5 text-base font-black',
  };

  const variantClasses = {
    primary: 'bg-[#22C55E] text-black hover:bg-[#16a34a] shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    secondary: 'bg-black text-white hover:bg-zinc-800 shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    accent: 'bg-[#00C2CB] text-black hover:bg-[#00a7af] shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    yellow: 'bg-[#FFD200] text-black hover:bg-[#ecc200] shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    pink: 'bg-[#FF0DFD] text-black hover:bg-[#e00ce0] shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    danger: 'bg-[#EF4444] text-white hover:bg-[#dc2626] shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
    outline: 'bg-white text-black hover:bg-zinc-100 shadow-neo hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-neo-sm',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
