import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Trophy } from 'lucide-react';
import { Tournament } from '../../types';
import { cardClass, isImageSrc } from './shared';

const statusBadge = (status: Tournament['status']) => {
  switch (status) {
    case 'open':
      return {
        label: 'INSCRIÇÕES',
        className: 'border-sky-500/50 text-sky-300 bg-sky-500/10',
      };
    case 'active':
      return {
        label: 'EM ANDAMENTO',
        className: 'border-emerald-500/50 text-emerald-300 bg-emerald-500/10',
      };
    case 'draft':
      return {
        label: 'EM BREVE',
        className: 'border-[#E31B23]/50 text-[#ff4d55] bg-[#E31B23]/10',
      };
    default:
      return {
        label: 'FINALIZADO',
        className: 'border-[#1D2633] text-[#8B93A7] bg-[#10151D]',
      };
  }
};

interface UpcomingTournamentsProps {
  tournaments: Tournament[];
}

export const UpcomingTournaments: React.FC<UpcomingTournamentsProps> = ({
  tournaments,
}) => {
  const list = tournaments
    .filter((t) => t.status === 'open' || t.status === 'active' || t.status === 'draft')
    .slice(0, 4);

  return (
    <section className={`${cardClass} p-5`}>
      <div className="mb-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-white whitespace-nowrap">
          Próximos torneios
        </h2>
        <div className="mt-1.5 flex justify-end">
          <Link
            to="/torneios"
            className="text-[10px] font-mono uppercase tracking-wider text-[#E31B23] hover:text-[#ff4d55] inline-flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="space-y-2">
        {list.length > 0 ? (
          list.map((t) => {
            const badge = statusBadge(t.status);
            return (
              <Link
                key={t.id}
                to={`/torneios/${t.id}`}
                className="group flex items-start gap-3 rounded-lg border border-[#1D2633] bg-[#0B0F15] px-3 py-2.5 hover:border-[#E31B23]/40 hover:bg-[#10151D] transition-colors duration-200"
              >
                <div className="w-9 h-9 rounded-lg bg-[#10151D] border border-[#1D2633] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                  {t.banner && isImageSrc(t.banner) ? (
                    <img src={t.banner} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Trophy className="w-4 h-4 text-[#E31B23]" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <span
                    className={`self-start px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border rounded whitespace-nowrap ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <p className="text-xs font-semibold text-white whitespace-nowrap truncate group-hover:text-[#E31B23] transition-colors">
                    {t.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#6B7280] whitespace-nowrap truncate">
                    {t.startDate} — {t.endDate}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-xs text-[#8B93A7] py-4 text-center">
            Nenhum torneio disponível no momento.
          </p>
        )}
      </div>
    </section>
  );
};
