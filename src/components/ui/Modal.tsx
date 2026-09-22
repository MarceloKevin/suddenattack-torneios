import React from 'react';
import { Card } from './Card';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <Card
        variant="primary"
        hasHudCorners
        className={`w-full p-6 relative border-[#E31B23]/40 shadow-2xl shadow-red-950/20 max-h-[90vh] overflow-y-auto ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#272B35] mb-5">
          <h3 className="text-xl font-display uppercase tracking-wider text-[#F5F5F5]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#9298A5] hover:text-white p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div>{children}</div>
      </Card>
    </div>
  );
};
