import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'red' | 'green' | 'amber' | 'slate' | 'gold';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'red',
  size = 'md',
  pulse = false,
  className,
}) => {
  const variants = {
    red: 'bg-[#E31B23]/15 text-[#ff4d55] border-[#E31B23]/40',
    green: 'bg-emerald-950/40 text-emerald-400 border-emerald-700/50',
    amber: 'bg-amber-950/40 text-amber-400 border-amber-700/50',
    slate: 'bg-[#181B23] text-[#9298A5] border-[#272B35]',
    gold: 'bg-yellow-950/40 text-yellow-300 border-yellow-600/50',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wider',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold uppercase tracking-widest border rounded-[2px]',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {children}
    </span>
  );
};
