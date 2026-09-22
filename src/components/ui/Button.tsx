import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31B23] focus:ring-offset-[#08090D] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-[#E31B23] hover:bg-[#c9151c] text-white shadow-lg shadow-[#E31B23]/20 active:translate-y-0.5 border border-[#ff3b44]/40',
    secondary: 'bg-[#181B23] hover:bg-[#202530] text-[#F5F5F5] border border-[#272B35] hover:border-[#3a404f]',
    outline: 'bg-transparent border-2 border-[#272B35] hover:border-[#E31B23] text-[#F5F5F5] hover:text-white hover:bg-[#E31B23]/10',
    ghost: 'bg-transparent text-[#9298A5] hover:text-[#F5F5F5] hover:bg-[#13161D]',
    danger: 'bg-red-950/40 text-red-400 border border-red-800/60 hover:bg-red-900/60',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
