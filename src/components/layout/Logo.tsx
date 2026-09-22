import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import logoSuddenAttack from '../../assets/logo-sudden-attack.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  return (
    <Link to="/" className={cn('inline-flex items-center select-none group', className)}>
      <img
        src={logoSuddenAttack}
        alt="Sudden Attack"
        className={cn(
          'w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]',
          size === 'sm' && 'h-10 sm:h-11',
          size === 'md' && 'h-12 sm:h-14',
          size === 'lg' && 'h-16 sm:h-20'
        )}
      />
    </Link>
  );
};
