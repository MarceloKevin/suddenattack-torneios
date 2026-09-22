import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-[#9298A5]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#9298A5]">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-[#0E1016] border border-[#272B35] rounded-none px-3.5 py-2.5 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 transition-colors focus:border-[#E31B23] focus:outline-none focus:ring-1 focus:ring-[#E31B23]',
            icon ? 'pl-10' : '',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#9298A5]">{helperText}</p>}
    </div>
  );
};
