import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TournamentMatch } from '../../types';
import { matchStatusLabel, phaseLabel } from '../../utils/matchHelpers';
import { resolveTeamLogo } from '../../utils/teamLogo';
import { isImageSrc } from '../profile/shared';
import { Swords } from 'lucide-react';
import './TournamentDetails.css';

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

const statusModifier = (status: TournamentMatch['status']) => {
  if (status === 'LIVE') return 'sa-td-match__status--live';
  if (status === 'SCHEDULED') return 'sa-td-match__status--scheduled';
  return 'sa-td-match__status--done';
};

const SideLogo: React.FC<{ id: string; logo?: string }> = ({ id, logo }) => {
  const src = resolveTeamLogo(id, logo);
  return (
    <span className="sa-td-match__side-logo">
      {isImageSrc(src) ? <img src={src} alt="" /> : src}
    </span>
  );
};

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
    <div className="sa-td-matches-wrap">
      <div className="sa-td-filters">
        <button
          type="button"
          onClick={() => setFilter('TODAS')}
          className={`sa-td-filter ${filter === 'TODAS' ? 'is-active' : ''}`}
        >
          TODAS ({matches.length})
        </button>
        {phases.map((phase) => {
          const count = matches.filter((m) => m.phase === phase).length;
          return (
            <button
              key={phase}
              type="button"
              onClick={() => setFilter(phase)}
              className={`sa-td-filter ${filter === phase ? 'is-active' : ''}`}
            >
              {phaseLabel(phase)} ({count})
            </button>
          );
        })}
      </div>

      <div className="sa-td-matches">
        {sorted.map((match) => {
          const status = matchStatusLabel(match.status);
          return (
            <Link
              key={match.id}
              to={`/torneios/${tournamentId}/partidas/${match.id}`}
              className="sa-td-match"
            >
              <article className="sa-td-match__card">
                <div className="sa-td-match__phase">
                  <span className="sa-td-match__phase-badge">{phaseLabel(match.phase)}</span>
                  <span className="sa-td-match__game">JOGO {match.matchNumber}</span>
                </div>

                <div className="sa-td-match__scoreboard">
                  <div
                    className={`sa-td-match__side sa-td-match__side--left ${
                      match.team1.isWinner ? 'is-winner' : ''
                    }`}
                  >
                    <div className="sa-td-match__side-text min-w-0">
                      <span className="sa-td-match__side-name font-display">
                        {match.team1.name}
                      </span>
                      <span className="sa-td-match__side-tag">[{match.team1.tag}]</span>
                    </div>
                    <SideLogo id={match.team1.id} logo={match.team1.logo} />
                  </div>

                  <div className="sa-td-match__scores">
                    <span
                      className={`sa-td-match__score font-display ${
                        match.team1.isWinner ? 'is-winner' : ''
                      }`}
                    >
                      {match.team1.score}
                    </span>
                    <Swords aria-hidden />
                    <span
                      className={`sa-td-match__score font-display ${
                        match.team2.isWinner ? 'is-winner' : ''
                      }`}
                    >
                      {match.team2.score}
                    </span>
                  </div>

                  <div
                    className={`sa-td-match__side ${match.team2.isWinner ? 'is-winner' : ''}`}
                  >
                    <SideLogo id={match.team2.id} logo={match.team2.logo} />
                    <div className="sa-td-match__side-text min-w-0">
                      <span className="sa-td-match__side-name font-display">
                        {match.team2.name}
                      </span>
                      <span className="sa-td-match__side-tag">[{match.team2.tag}]</span>
                    </div>
                  </div>
                </div>

                <div className="sa-td-match__aside">
                  <span className="sa-td-match__date">{match.date || '—'}</span>
                  <span className={`sa-td-match__status ${statusModifier(match.status)}`}>
                    {status.text}
                  </span>
                  <span className="sa-td-match__cta">VER DETALHES →</span>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
