import React from 'react';
import { Team } from '../../types';
import { cardClass, SectionLabel, SectionTitle } from './shared';

interface TeamOverviewProps {
  team: Team;
}

export const TeamOverview: React.FC<TeamOverviewProps> = ({ team }) => {
  const quickStats = [
    { value: String(team.stats.titles), label: 'Títulos', accent: 'text-amber-300' },
    { value: String(team.stats.matches), label: 'Partidas', accent: 'text-white' },
    { value: `${team.stats.winRate}%`, label: 'Win Rate', accent: 'text-emerald-400' },
    { value: team.createdAt, label: 'Criado em', accent: 'text-white', compact: true },
  ];

  return (
    <section className={`${cardClass} p-5 sm:p-6 space-y-5`}>
      <div>
        <SectionLabel>Identidade</SectionLabel>
        <SectionTitle className="mt-1">Sobre o time</SectionTitle>
        <p className="mt-3 text-sm text-[#B8BEC9] leading-relaxed">
          {team.description}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-[#0B0F15] border border-[#1D2633] p-3.5 text-center hover:border-[#2A3444] transition-colors"
          >
            <span
              className={`block font-extrabold tracking-tight tabular-nums ${stat.accent} ${
                stat.compact ? 'text-xs sm:text-sm leading-snug pt-1' : 'text-2xl sm:text-[1.65rem]'
              }`}
            >
              {stat.value}
            </span>
            <span className="mt-1.5 block text-[10px] font-mono uppercase tracking-[0.14em] text-[#6B7280]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-xs font-mono text-[#8B93A7]">
        <span>
          Capitão:{' '}
          <strong className="text-white font-semibold">{team.captainNickname}</strong>
        </span>
        <span>
          Elenco:{' '}
          <strong className="text-white font-semibold">
            {team.members.length}/{team.maxMembers}
          </strong>
        </span>
      </div>
    </section>
  );
};
