import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChevronRight,
  Flag,
  Medal,
  Swords,
  Trophy,
  UserRound,
} from 'lucide-react';
import { RecentMatch } from '../../types';
import { cardClass } from './shared';

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: 'win' | 'loss' | 'trophy' | 'team' | 'profile';
  href?: string;
}

export const buildActivitiesFromMatches = (matches: RecentMatch[]): ActivityItem[] =>
  matches.slice(0, 5).map((m) => ({
    id: m.id,
    title:
      m.result === 'VITÓRIA'
        ? `Venceu partida contra ${m.opponent.name}`
        : `Derrota para ${m.opponent.name}`,
    time: m.date,
    type: m.result === 'VITÓRIA' ? 'win' : 'loss',
    href: `/torneios/${m.tournamentId}/partidas/${m.matchId}`,
  }));

const iconFor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'win':
      return { Icon: Flag, className: 'text-cyan-300' };
    case 'loss':
      return { Icon: Swords, className: 'text-[#E31B23]' };
    case 'trophy':
      return { Icon: Trophy, className: 'text-amber-300' };
    case 'team':
      return { Icon: Medal, className: 'text-violet-300' };
    default:
      return { Icon: UserRound, className: 'text-[#8B93A7]' };
  }
};

interface RecentActivitiesProps {
  items: ActivityItem[];
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ items }) => {
  const navigate = useNavigate();

  return (
    <section className={`${cardClass} p-5 h-full`}>
      <div className="flex items-start justify-between gap-2 mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">
          Últimas atividades
        </h2>
      </div>

      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => {
            const { Icon, className } = iconFor(item.type);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => item.href && navigate(item.href)}
                className="w-full group flex items-center gap-3 rounded-lg border border-[#1D2633] bg-[#0B0F15] px-3 py-2.5 text-left hover:border-[#E31B23]/40 hover:bg-[#10151D] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]/50"
              >
                <span
                  className={`w-8 h-8 rounded-lg bg-[#10151D] border border-[#1D2633] flex items-center justify-center shrink-0 ${className}`}
                >
                  <Icon className="w-3.5 h-3.5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-white truncate">{item.title}</p>
                  <p className="text-[10px] font-mono text-[#6B7280] mt-0.5">{item.time}</p>
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#4A5568] group-hover:text-[#E31B23] transition-colors shrink-0"
                  aria-hidden
                />
              </button>
            );
          })
        ) : (
          <p className="text-xs text-[#8B93A7] py-4 text-center">Nenhuma atividade recente.</p>
        )}
      </div>

      <Link
        to="/torneios"
        className="mt-4 inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-[#E31B23] hover:text-[#ff4d55] transition-colors"
      >
        Ver histórico <ArrowRight className="w-3 h-3" />
      </Link>
    </section>
  );
};
