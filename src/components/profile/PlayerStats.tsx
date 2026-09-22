import React from 'react';
import { Activity, Target, Trophy, Zap } from 'lucide-react';
import { UserStats } from '../../types';
import { cardClass } from './shared';

const WinRateRing: React.FC<{ value: number }> = ({ value }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative w-[88px] h-[88px] shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1D2633" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E31B23"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-white tabular-nums leading-none">
          {clamped.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};

/** Mini sparkline from match results (W=up, L=down) */
const EvolutionSparkline: React.FC<{ points: number[] }> = ({ points }) => {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 120;
  const h = 36;
  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="mt-3 pt-3 border-t border-[#1D2633]">
      <p className="text-[9px] font-mono uppercase tracking-wider text-[#6B7280] mb-2">
        Evolução nas últimas partidas
      </p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-9" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords}
        />
      </svg>
    </div>
  );
};

interface PlayerStatsProps {
  stats: UserStats;
  sparkline?: number[];
}

export const PlayerStats: React.FC<PlayerStatsProps> = ({ stats, sparkline }) => {
  const cards = [
    {
      label: 'Partidas',
      value: stats.matches,
      icon: Activity,
      tone: 'text-[#8B93A7]',
    },
    {
      label: 'Vitórias',
      value: stats.wins,
      icon: Trophy,
      tone: 'text-cyan-400/80',
    },
    {
      label: 'Derrotas',
      value: stats.losses,
      icon: Target,
      tone: 'text-[#E31B23]/80',
    },
  ];

  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">
          Estatísticas do jogador
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid grid-cols-3 gap-2.5 flex-1 min-w-0">
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                className="rounded-xl border border-[#1D2633] bg-[#0B0F15] p-3 sm:p-4 hover:border-[#E31B23]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#8B93A7]">
                    {c.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${c.tone}`} aria-hidden />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {c.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#E31B23]/35 bg-gradient-to-br from-[#E31B23]/10 to-[#0B0F15] p-4 flex items-center gap-4 sm:w-[220px] shrink-0">
          <WinRateRing value={stats.winRate} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="w-3.5 h-3.5 text-[#E31B23]" aria-hidden />
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#E31B23]">
                Win rate
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-300/90">{stats.wins} vitórias</p>
            <p className="text-[10px] font-mono text-[#E31B23]/80 mt-0.5">
              {stats.losses} derrotas
            </p>
          </div>
        </div>
      </div>

      {sparkline && sparkline.length > 1 && <EvolutionSparkline points={sparkline} />}
    </section>
  );
};
