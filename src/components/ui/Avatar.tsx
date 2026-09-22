import React from 'react';
import { UserStatus } from '../../types';
import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: UserStatus;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'Player',
  size = 'md',
  status,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    'in-game': 'bg-amber-500',
    offline: 'bg-zinc-600',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'SA';

  return (
    <div className={cn('relative inline-block shrink-0', className)}>
      <div
        className={cn(
          'rounded-sm overflow-hidden border border-[#272B35] bg-[#181B23] flex items-center justify-center font-bold text-zinc-300 font-display select-none',
          sizes[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-[#08090D]',
            statusColors[status],
            size === 'sm' && 'w-2 h-2',
            size === 'md' && 'w-2.5 h-2.5',
            size === 'lg' && 'w-3.5 h-3.5',
            size === 'xl' && 'w-4 h-4'
          )}
          title={`Status: ${status}`}
        />
      )}
    </div>
  );
};
