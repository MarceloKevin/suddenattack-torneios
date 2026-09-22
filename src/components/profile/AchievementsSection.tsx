import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Medal, Trophy } from 'lucide-react';
import { TeamHistory } from '../../types';
import { cardClass } from './shared';

export interface AchievementItem {
  id: string;
  title: string;
  format: string;
  date: string;
  place: string;
  highlight?: boolean;
  tournamentId?: string;
}

const placeStyle = (place: string) => {
  if (place === 'CAMPEÃO') return 'text-amber-300';
  if (place.includes('2') || place === 'VICE-CAMPEÃO') return 'text-zinc-300';
  if (place.includes('3')) return 'text-amber-600';
  return 'text-cyan-300/90';
};

interface AchievementsSectionProps {
  items: AchievementItem[];
}

export const mapTeamHistoryToAchievements = (
  history?: TeamHistory[]
): AchievementItem[] => {
  if (!history || history.length === 0) return [];
  const principalIndex = Math.max(
    0,
    history.findIndex((h) => h.result === 'CAMPEÃO')
  );
  return history.map((h, index) => ({
    id: h.id,
    title: h.tournamentName,
    format: 'CAMPEONATO',
    date: h.date,
    place: h.result,
    highlight: index === principalIndex,
    tournamentId: h.tournamentId,
  }));
};

/** Fallback career titles when team history is empty */
export const FALLBACK_ACHIEVEMENTS: AchievementItem[] = [
  {
    id: 'a-mix',
    title: 'MIX DO TS',
    format: 'CAMPEONATO',
    date: '12/04/2026',
    place: 'CAMPEÃO',
    highlight: true,
  },
  {
    id: 'a-draft',
    title: 'DRAFT',
    format: 'CAMPEONATO',
    date: '12/04/2026',
    place: '2º LUGAR',
  },
  {
    id: 'a-sa',
    title: 'SERIE A',
    format: 'CAMPEONATO',
    date: '12/04/2026',
    place: '3º LUGAR',
  },
  {
    id: 'a-sb',
    title: 'SERIE B',
    format: 'CAMPEONATO',
    date: '12/04/2026',
    place: 'CAMPEÃO',
  },
];

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({ items }) => {
  const list = items.slice(0, 4);

  return (
    <section className={`${cardClass} p-5`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Troféus e conquistas
          </h2>
          <p className="text-[11px] text-[#8B93A7] mt-1">
            Torneios ganhos e destaques da carreira.
          </p>
        </div>
        <Link
          to="/torneios"
          className="text-[10px] font-mono uppercase tracking-wider text-[#E31B23] hover:text-[#ff4d55] inline-flex items-center gap-1 shrink-0 transition-colors"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {list.map((item) => {
          const isChamp = item.place === 'CAMPEÃO';
          return (
            <div
              key={item.id}
              className={`relative rounded-xl border p-4 text-center flex flex-col items-center hover:border-[#E31B23]/40 transition-colors duration-200 ${
                item.highlight
                  ? 'border-[#E31B23]/55 bg-gradient-to-b from-[#E31B23]/12 to-[#0B0F15] shadow-[0_0_24px_rgba(227,27,35,0.12)]'
                  : 'border-[#1D2633] bg-[#0B0F15]'
              }`}
            >
              {item.highlight && (
                <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider bg-[#E31B23] text-white font-bold rounded">
                  Principal
                </span>
              )}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mb-3 border ${
                  isChamp
                    ? 'border-amber-400/40 bg-amber-400/10 text-amber-300'
                    : 'border-[#1D2633] bg-[#10151D] text-[#8B93A7]'
                }`}
              >
                {isChamp ? (
                  <Trophy className="w-5 h-5" aria-hidden />
                ) : (
                  <Medal className="w-5 h-5" aria-hidden />
                )}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-white leading-snug">
                {item.title}
              </p>
              <p className="text-[9px] font-mono uppercase text-[#6B7280] mt-1.5">
                {item.format}
              </p>
              <p className="text-[10px] font-mono text-[#8B93A7] mt-0.5">{item.date}</p>
              <p
                className={`text-[11px] font-bold uppercase tracking-wider mt-3 ${placeStyle(item.place)}`}
              >
                {item.place}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
