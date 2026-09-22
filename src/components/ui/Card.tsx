import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'glass';
  hasHudCorners?: boolean;
  glow?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'primary',
  hasHudCorners = false,
  glow = false,
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-[#13161D] border border-[#272B35]',
    secondary: 'bg-[#181B23] border border-[#272B35]',
    glass: 'bg-[#13161D]/80 backdrop-blur-md border border-[#272B35]/80',
  };

  return (
    <div
      className={cn(
        'relative transition-all duration-200',
        variants[variant],
        hasHudCorners && 'hud-corner',
        glow && 'hover:border-[#E31B23]/60 hover:shadow-lg hover:shadow-[#E31B23]/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
