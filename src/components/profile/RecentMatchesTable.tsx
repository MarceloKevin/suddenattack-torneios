import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Swords } from 'lucide-react';
import { RecentMatch } from '../../types';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { BrazilFlag, cardClass } from './shared';

interface RecentMatchesTableProps {
  matches: RecentMatch[];
}

export const RecentMatchesTable: React.FC<RecentMatchesTableProps> = ({ matches }) => {
  const navigate = useNavigate();

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="flex items-end justify-between gap-3 px-5 pt-5 pb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">
            Partidas recentes
          </h2>
          <p className="text-[11px] text-[#8B93A7] mt-1">Últimos confrontos disputados.</p>
        </div>
        <Link to="/torneios">
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            VER TABELAS
          </Button>
        </Link>
      </div>

      {matches.length > 0 ? (
        <div className="overflow-x-auto border-t border-[#1D2633]">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0B0F15] text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">
              <tr>
                <th className="py-3 px-5 font-medium">Campeonato</th>
                <th className="py-3 px-4 font-medium">Mapa</th>
                <th className="py-3 px-4 font-medium">Adversário</th>
                <th className="py-3 px-4 text-center font-medium">Formato</th>
                <th className="py-3 px-4 text-center font-medium">Placar</th>
                <th className="py-3 px-5 text-right font-medium">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1D2633]/70">
              {matches.map((match) => {
                const isWin = match.result === 'VITÓRIA';
                const detailsPath = `/torneios/${match.tournamentId}/partidas/${match.matchId}`;
                return (
                  <tr
                    key={match.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(detailsPath)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(detailsPath);
                      }
                    }}
                    className={`cursor-pointer border-l-2 transition-colors duration-200 hover:bg-[#10151D] focus:outline-none focus-visible:bg-[#10151D] ${
                      isWin
                        ? 'border-l-cyan-500/50 bg-cyan-950/10'
                        : 'border-l-[#E31B23]/40 bg-red-950/10'
                    }`}
                  >
                    <td className="py-3 px-5 font-semibold text-white text-xs sm:text-sm">
                      <Link
                        to={`/torneios/${match.tournamentId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:text-[#E31B23] transition-colors"
                      >
                        {match.tournamentName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-[#B8BEC9]">{match.map}</td>
                    <td className="py-3 px-4 text-xs font-medium text-white">
                      <div className="flex items-center gap-2">
                        <BrazilFlag />
                        <span>{match.opponent.name}</span>
                        <span className="text-[10px] font-mono text-[#8B93A7]">
                          [{match.opponent.tag}]
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-xs font-mono font-bold text-[#C8CCD4]">
                      MD1
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-sm font-bold">
                      <span className={isWin ? 'text-cyan-300' : 'text-[#E31B23]'}>
                        {match.myScore}
                      </span>{' '}
                      <span className="text-[#4A5568]">×</span>{' '}
                      <span className={!isWin ? 'text-cyan-300/80' : 'text-[#8B93A7]'}>
                        {match.opponentScore}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right text-xs font-mono text-[#8B93A7]">
                      {match.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-5 pb-6">
          <EmptyState
            icon={<Swords className="w-8 h-8" />}
            title="Nenhuma partida recente"
            description="Suas partidas aparecerão aqui quando você disputar um campeonato."
            actionText="VER TORNEIOS"
            onAction={() => (window.location.href = '/torneios')}
          />
        </div>
      )}
    </section>
  );
};
