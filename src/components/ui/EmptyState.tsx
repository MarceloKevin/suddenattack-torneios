import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <Card variant="primary" hasHudCorners className="p-8 sm:p-12 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 mx-auto mb-4 rounded-none bg-[#181B23] border border-[#272B35] flex items-center justify-center text-[#E31B23]">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wider text-[#F5F5F5] mb-2">
        {title}
      </h3>
      <p className="text-sm text-[#9298A5] leading-relaxed max-w-md mx-auto mb-6">
        {description}
      </p>
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <Button variant="primary" size="md" onClick={onAction}>
              {actionText}
            </Button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <Button variant="secondary" size="md" onClick={onSecondaryAction}>
              {secondaryActionText}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
