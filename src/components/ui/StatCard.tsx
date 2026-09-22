import React from 'react';
import { Card } from './Card';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  highlight = false,
}) => {
  return (
    <Card
      variant="primary"
      hasHudCorners={highlight}
      className={cn(
        'p-4 sm:p-5 relative overflow-hidden group',
        highlight ? 'border-[#E31B23]/40 bg-gradient-to-br from-[#181B23] to-[#13161D]' : ''
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#9298A5]">{label}</span>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-sm border transition-colors',
              highlight
                ? 'bg-[#E31B23]/10 border-[#E31B23]/30 text-[#E31B23]'
                : 'bg-[#181B23] border-[#272B35] text-[#9298A5] group-hover:text-[#F5F5F5]'
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl sm:text-4xl font-display text-[#F5F5F5] tracking-tight">{value}</span>
        {subValue && <span className="text-xs text-[#9298A5] font-semibold">{subValue}</span>}
      </div>

      {/* Decorative subtle HUD bar */}
      <div className="mt-3 w-full bg-[#181B23] h-1 rounded-none overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-500',
            highlight ? 'bg-[#E31B23] w-3/4' : 'bg-[#272B35] group-hover:bg-[#E31B23]/60 w-1/2'
          )}
        />
      </div>
    </Card>
  );
};
