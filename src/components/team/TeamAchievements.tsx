import React from 'react';
import { Link } from 'react-router-dom';
import { Medal, Trophy } from 'lucide-react';
import { TeamHistory } from '../../types';
import { cardClass, SectionLabel, SectionTitle } from './shared';

interface TeamAchievementsProps {
  history: TeamHistory[];
}

const placeMeta = (result: TeamHistory['result']) => {
  if (result === 'CAMPEÃO') {
    return { icon: Trophy, color: 'text-amber-300', emoji: '🏆' };
  }
  if (result === 'VICE-CAMPEÃO') {
    return { icon: Medal, color: 'text-zinc-300', emoji: '🥈' };
  }
  return { icon: Medal, color: 'text-cyan-300/90', emoji: '🎖️' };
};

export const TeamAchievements: React.FC<TeamAchievementsProps> = ({ history }) => {
  const principalId =
    history.find((h) => h.result === 'CAMPEÃO')?.id ?? history[0]?.id ?? null;

  return (
    <section className={`${cardClass} p-5 sm:p-6 space-y-4`}>
      <div>
        <SectionLabel>Palmarés</SectionLabel>
        <SectionTitle className="mt-1">Troféus e conquistas</SectionTitle>
      </div>

      {history.length === 0 ? (
        <p className="text-xs font-mono text-[#6B7280] py-8 text-center border border-dashed border-[#1D2633] rounded-xl">
          Nenhuma conquista registrada ainda.
        </p>
      ) : (
        <div className="space-y-2.5">
          {history.map((item) => {
            const meta = placeMeta(item.result);
            const isHighlight = item.id === principalId && item.result === 'CAMPEÃO';
            const Icon = meta.icon;

            return (
              <Link
                key={item.id}
                to={`/torneios/${item.tournamentId}`}
                className={`flex items-center gap-3.5 rounded-xl border p-3.5 transition-all duration-200 hover:scale-[1.01] ${
                  isHighlight
                    ? 'bg-gradient-to-r from-amber-950/30 to-[#0B0F15] border-amber-500/40 shadow-lg shadow-amber-950/10'
                    : 'bg-[#0B0F15] border-[#1D2633] hover:border-[#2A3444]'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl ${
                    isHighlight
                      ? 'bg-amber-500/15 border border-amber-500/30'
                      : 'bg-[#10151D] border border-[#1D2633]'
                  }`}
                >
                  <span aria-hidden>{meta.emoji}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide truncate">
                    {item.tournamentName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-mono text-[#6B7280]">
                    <span className={`font-bold uppercase tracking-wider ${meta.color}`}>
                      {item.result}
                    </span>
                    <span className="text-[#2A3444]">•</span>
                    <span>{item.date}</span>
                    {item.prize && (
                      <>
                        <span className="text-[#2A3444]">•</span>
                        <span className="text-emerald-400">{item.prize}</span>
                      </>
                    )}
                  </div>
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${meta.color} opacity-70`} aria-hidden />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};
