import React from 'react';
import { Crosshair, Swords, Target, Zap } from 'lucide-react';
import { cardClass, FORMAT_TITLES } from './shared';

const ICONS = [Swords, Target, Crosshair, Zap] as const;

interface TitlesByFormatProps {
  titles?: { label: string; count: number; bar: number; color: string }[];
}

export const TitlesByFormat: React.FC<TitlesByFormatProps> = ({ titles }) => {
  const list = titles ?? [...FORMAT_TITLES];

  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">
          Títulos por formato
        </h2>
        <p className="text-[11px] text-[#8B93A7] mt-1">
          Quantidade de títulos conquistados em cada formato.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {list.map((item, index) => {
          const Icon = ICONS[index % ICONS.length];
          return (
            <div
              key={item.label}
              className="rounded-xl border border-[#1D2633] bg-[#0B0F15] p-4 hover:border-[#E31B23]/35 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">
                  {item.label}
                </span>
                <Icon
                  className="w-4 h-4 text-[#4A5568] group-hover:text-[#E31B23] transition-colors"
                  aria-hidden
                />
              </div>
              <p className="text-3xl font-bold text-white tabular-nums tracking-tight">
                {item.count}X
              </p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-[#151B24] overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${item.bar}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
