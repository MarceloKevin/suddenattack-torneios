import React from 'react';

export const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&q=80';

export const cardClass =
  'rounded-xl bg-[#0D1118] border border-[#1D2633] transition-colors duration-200';

export const BrazilFlag: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={`inline-block w-[18px] h-[13px] rounded-[1px] overflow-hidden shrink-0 border border-black/30 align-middle ${className ?? ''}`}
    title="Brasil"
    aria-label="Brasil"
  >
    <svg viewBox="0 0 22 15" className="w-full h-full block">
      <rect width="22" height="15" fill="#009B3A" />
      <polygon points="11,1.5 20,7.5 11,13.5 2,7.5" fill="#FEDF00" />
      <circle cx="11" cy="7.5" r="3.2" fill="#002776" />
    </svg>
  </span>
);

export const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    reader.readAsDataURL(file);
  });

export const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

export type ProfileTab = 'overview' | 'matches' | 'stats' | 'achievements';

export const FORMAT_TITLES = [
  { label: 'MIX DO TS', count: 5, bar: 100, color: 'bg-[#E31B23]' },
  { label: 'DRAFT', count: 3, bar: 60, color: 'bg-cyan-400' },
  { label: 'SERIE A', count: 2, bar: 40, color: 'bg-violet-400' },
  { label: 'SERIE B', count: 5, bar: 100, color: 'bg-amber-400' },
] as const;
