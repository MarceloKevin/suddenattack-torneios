import React from 'react';
import { Award, Swords, Target, TrendingUp, Trophy, Zap } from 'lucide-react';
import { Team } from '../../types';
import { cardClass, SectionLabel, SectionTitle } from './shared';

interface TeamStatsProps {
  team: Team;
}

export const TeamStats: React.FC<TeamStatsProps> = ({ team }) => {
  const { stats } = team;
  const items = [
    { label: 'Partidas', value: String(stats.matches), icon: Swords, color: 'text-white' },
    { label: 'Vitórias', value: String(stats.wins), icon: Zap, color: 'text-emerald-400' },
    { label: 'Derrotas', value: String(stats.losses), icon: Target, color: 'text-red-400' },
    { label: 'Win Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Títulos', value: String(stats.titles), icon: Trophy, color: 'text-amber-300' },
    { label: 'Pontos', value: String(stats.points), icon: Award, color: 'text-white' },
  ];

  return (
    <section className={`${cardClass} p-5 sm:p-6 space-y-4`}>
      <div>
        <SectionLabel>Desempenho</SectionLabel>
        <SectionTitle className="mt-1">Estatísticas do time</SectionTitle>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-xl bg-[#0B0F15] border border-[#1D2633] p-3.5 hover:border-[#E31B23]/35 transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-3.5 h-3.5 text-[#4A5568]" aria-hidden />
              </div>
              <span className={`block text-2xl font-extrabold tracking-tight tabular-nums ${item.color}`}>
                {item.value}
              </span>
              <span className="mt-1 block text-[10px] font-mono uppercase tracking-[0.14em] text-[#6B7280]">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
