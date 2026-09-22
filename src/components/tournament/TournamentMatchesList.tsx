import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TournamentMatch } from '../../types';
import { Card } from '../ui/Card';
import { matchStatusLabel, phaseLabel } from '../../utils/matchHelpers';
import { Swords } from 'lucide-react';

interface TournamentMatchesListProps {
  matches: TournamentMatch[];
  tournamentId: string;
}

const PHASE_ORDER = [
  'GRUPO A',
  'GRUPO B',
  'GRUPO C',
  'GRUPO D',
  'OITAVAS',
  'QUARTAS',
  'SEMIFINAL',
  'FINAL',
];

export const TournamentMatchesList: React.FC<TournamentMatchesListProps> = ({
  matches,
  tournamentId,
}) => {
  const [filter, setFilter] = useState<string>('TODAS');

  const phases = useMemo(() => {
    const unique = Array.from(new Set(matches.map((m) => m.phase)));
    return unique.sort((a, b) => {
      const ia = PHASE_ORDER.indexOf(a);
      const ib = PHASE_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [matches]);

  const filtered = filter === 'TODAS' ? matches : matches.filter((m) => m.phase === filter);

  const sorted = [...filtered].sort((a, b) => {
    const pa = PHASE_ORDER.indexOf(a.phase);
    const pb = PHASE_ORDER.indexOf(b.phase);
    if (pa !== pb) {
      if (pa === -1) return 1;
      if (pb === -1) return -1;
      return pa - pb;
    }
    return a.matchNumber - b.matchNumber;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('TODAS')}
          className={`px-3 py-1.5 text-[10px] font-mono uppercase border transition-colors ${
            filter === 'TODAS'
              ? 'border-[#E31B23] text-white bg-[#E31B23]/10'
              : 'border-[#272B35] text-[#9298A5] hover:text-white'
          }`}
        >
          Todas ({matches.length})
        </button>
        {phases.map((phase) => {
          const count = matches.filter((m) => m.phase === phase).length;
          return (
            <button
              key={phase}
              onClick={() => setFilter(phase)}
              className={`px-3 py-1.5 text-[10px] font-mono uppercase border transition-colors ${
                filter === phase
                  ? 'border-[#E31B23] text-white bg-[#E31B23]/10'
                  : 'border-[#272B35] text-[#9298A5] hover:text-white'
              }`}
            >
              {phaseLabel(phase)} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {sorted.map((match) => {
          const status = matchStatusLabel(match.status);
          return (
            <Link
              key={match.id}
              to={`/torneios/${tournamentId}/partidas/${match.id}`}
              className="block"
            >
              <Card
                variant="primary"
                className="p-4 border-[#272B35] hover:border-[#E31B23]/60 transition-colors cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase">
                    <span className="px-2 py-0.5 border border-[#272B35] text-[#E31B23] font-bold">
                      {phaseLabel(match.phase)}
                    </span>
                    <span className="text-[#9298A5]">JOGO {match.matchNumber}</span>
                    {match.map && <span className="text-zinc-500">• {match.map}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-mono uppercase">
                    <span className="text-[#9298A5]">{match.date || '—'}</span>
                    <span className={status.className}>{status.text}</span>
                    <span className="text-[#E31B23] hidden sm:inline">VER DETALHES →</span>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div
                    className={`flex items-center gap-2.5 min-w-0 justify-end ${
                      match.team1.isWinner ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    <div className="min-w-0 text-right">
                      <span
                        className={`text-sm font-display uppercase block truncate ${
                          match.team1.isWinner ? 'font-bold' : ''
                        }`}
                      >
                        {match.team1.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#9298A5]">[{match.team1.tag}]</span>
                    </div>
                    <span className="text-xl shrink-0">{match.team1.logo}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`min-w-[28px] text-center text-lg font-display font-bold ${
                        match.team1.isWinner ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {match.team1.score}
                    </span>
                    <Swords className="w-3.5 h-3.5 text-[#E31B23]" />
                    <span
                      className={`min-w-[28px] text-center text-lg font-display font-bold ${
                        match.team2.isWinner ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {match.team2.score}
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-2.5 min-w-0 ${
                      match.team2.isWinner ? 'text-white' : 'text-zinc-400'
                    }`}
                  >
                    <span className="text-xl shrink-0">{match.team2.logo}</span>
                    <div className="min-w-0">
                      <span
                        className={`text-sm font-display uppercase block truncate ${
                          match.team2.isWinner ? 'font-bold' : ''
                        }`}
                      >
                        {match.team2.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#9298A5]">[{match.team2.tag}]</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
