import React from 'react';
import { MatchBracketGame } from '../../types';
import { Trophy, Swords, CheckCircle2 } from 'lucide-react';
import { resolveTeamLogo } from '../../utils/teamLogo';
import { isImageSrc } from '../profile/shared';
import { phaseLabel } from '../../utils/matchHelpers';
import './TournamentDetails.css';

interface TournamentBracketProps {
  brackets: MatchBracketGame[];
  championName?: string;
  championLogo?: string;
  championTag?: string;
  championId?: string;
  /** Quando informado, as partidas ficam clicáveis */
  onMatchClick?: (match: MatchBracketGame) => void;
  /** Esconde o card de campeão se ainda não houver */
  showChampion?: boolean;
}

const TeamMark: React.FC<{ id: string; logo?: string; name: string }> = ({ id, logo, name }) => {
  const src = resolveTeamLogo(id, logo);
  return (
    <div className="sa-td-brow__team">
      <span className="sa-td-brow__logo">
        {isImageSrc(src) ? <img src={src} alt="" /> : <span>{src}</span>}
      </span>
      <span>{name}</span>
    </div>
  );
};

const MatchCard: React.FC<{
  match: MatchBracketGame;
  format?: string;
  highlight?: boolean;
  onClick?: () => void;
}> = ({ match, format = 'MD3', highlight = false, onClick }) => {
  const interactive = Boolean(onClick);
  const className = [
    'sa-td-bmatch',
    highlight ? 'sa-td-bmatch--final' : '',
    interactive ? 'sa-td-bmatch--clickable' : '',
    match.wo ? 'sa-td-bmatch--wo' : '',
    match.bracketSide === 'losers' ? 'sa-td-bmatch--losers' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <div className="sa-td-bmatch__meta">
        <span>
          {format} • JOGO {match.matchNumber}
          {match.wo ? ' • W.O.' : ''}
        </span>
        <span>
          {match.date && !/^a definir$/i.test(match.date.trim())
            ? match.date
            : match.status === 'COMPLETED'
              ? 'ENCERRADO'
              : '—'}
        </span>
      </div>

      <div className="sa-td-bmatch__rows">
        <div className={`sa-td-brow ${match.team1.isWinner ? 'is-winner' : ''}`}>
          <TeamMark id={match.team1.id} logo={match.team1.logo} name={match.team1.name} />
          <span className="sa-td-brow__score">{match.team1.score}</span>
        </div>

        <div className={`sa-td-brow ${match.team2.isWinner ? 'is-winner' : ''}`}>
          <TeamMark id={match.team2.id} logo={match.team2.logo} name={match.team2.name} />
          <span className="sa-td-brow__score">{match.team2.score}</span>
        </div>
      </div>
    </>
  );

  if (interactive) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
};

const RoundColumn: React.FC<{
  label: string;
  matches: MatchBracketGame[];
  format?: string;
  highlight?: boolean;
  gold?: boolean;
  stackClass?: string;
  onMatchClick?: (match: MatchBracketGame) => void;
}> = ({ label, matches, format, highlight, gold, stackClass, onMatchClick }) => {
  if (matches.length === 0) return null;
  return (
    <div>
      <span
        className={`sa-td-bracket-col__label${gold ? ' sa-td-bracket-col__label--gold' : ''}`}
      >
        {gold && <Swords className="sa-td-bracket-col__icon" aria-hidden />}
        {label}
      </span>
      <div className={`sa-td-bracket-col__stack ${stackClass || ''}`.trim()}>
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            format={format}
            highlight={highlight}
            onClick={onMatchClick ? () => onMatchClick(match) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  brackets,
  championName = 'A DEFINIR',
  championLogo = '🏆',
  championTag = '—',
  championId = 'tbd',
  onMatchClick,
  showChampion = true,
}) => {
  const isDouble = brackets.some(
    (b) => b.bracketSide === 'losers' || b.round === 'GRAND_FINAL'
  );

  const winners = brackets.filter((b) => (b.bracketSide ?? 'winners') === 'winners');
  const losers = brackets.filter((b) => b.bracketSide === 'losers');
  const grandFinal = brackets.find((b) => b.round === 'GRAND_FINAL');

  const oitavas = winners.filter((b) => b.round === 'OITAVAS');
  const quartas = winners.filter((b) => b.round === 'QUARTAS');
  const semifinal = winners.filter((b) => b.round === 'SEMIFINAL');
  const finalMatch = winners.find((b) => b.round === 'FINAL');
  const hasOitavas = oitavas.length > 0;
  const champLogo = resolveTeamLogo(championId, championLogo);
  const hasChampion = Boolean(championId && championId !== 'tbd' && championName !== 'A DEFINIR');

  const losersByRound = LOSERS_ROUND_ORDER.map((round) => ({
    round,
    matches: losers
      .filter((b) => b.round === round)
      .sort((a, b) => a.matchNumber - b.matchNumber),
  })).filter((g) => g.matches.length > 0);

  return (
    <div className="sa-td-bracket-wrap">
      {isDouble && (
        <div className="sa-td-bracket-section-title">01 // CHAVE SUPERIOR (WINNERS)</div>
      )}

      <div
        className={`sa-td-bracket ${hasOitavas ? 'has-oitavas' : ''}${isDouble ? ' sa-td-bracket--winners-de' : ''}`}
      >
        <RoundColumn
          label={`${hasOitavas ? '01' : '01'} // OITAVAS DE FINAL`}
          matches={oitavas}
          onMatchClick={onMatchClick}
        />
        <RoundColumn
          label={`${hasOitavas ? '02' : '01'} // QUARTAS DE FINAL`}
          matches={quartas}
          stackClass={hasOitavas ? 'sa-td-bracket-col__stack--semi' : ''}
          onMatchClick={onMatchClick}
        />
        <RoundColumn
          label={`${hasOitavas ? '03' : '02'} // SEMIFINAIS`}
          matches={semifinal}
          stackClass="sa-td-bracket-col__stack--semi"
          onMatchClick={onMatchClick}
        />
        <RoundColumn
          label={`${hasOitavas ? '04' : '03'} // ${isDouble ? 'FINAL SUPERIOR' : 'GRANDE FINAL'}`}
          matches={finalMatch ? [finalMatch] : []}
          format="MD5"
          highlight
          gold
          stackClass="sa-td-bracket-col__stack--final"
          onMatchClick={onMatchClick}
        />

        {!isDouble && showChampion && (
          <div>
            <span className="sa-td-bracket-col__label sa-td-bracket-col__label--gold">
              {String(hasOitavas ? 5 : 4).padStart(2, '0')} // TROFÉU & GLÓRIA
            </span>
            <div className="sa-td-bracket-col__stack sa-td-bracket-col__stack--final">
              <ChampionCard
                championName={championName}
                championLogo={championLogo}
                championTag={championTag}
                champLogo={champLogo}
                hasChampion={hasChampion}
              />
            </div>
          </div>
        )}
      </div>

      {isDouble && losersByRound.length > 0 && (
        <>
          <div className="sa-td-bracket-section-title sa-td-bracket-section-title--losers">
            02 // CHAVE INFERIOR (LOSERS)
          </div>
          <div className="sa-td-bracket sa-td-bracket--losers">
            {losersByRound.map((group, idx) => (
              <RoundColumn
                key={group.round}
                label={`${String(idx + 1).padStart(2, '0')} // ${phaseLabel(group.round)}`}
                matches={group.matches}
                onMatchClick={onMatchClick}
              />
            ))}
          </div>
        </>
      )}

      {isDouble && (
        <>
          <div className="sa-td-bracket-section-title sa-td-bracket-section-title--gold">
            03 // GRANDE FINAL
          </div>
          <div className="sa-td-bracket sa-td-bracket--grand">
            <RoundColumn
              label="GRANDE FINAL"
              matches={grandFinal ? [grandFinal] : []}
              format="MD5"
              highlight
              gold
              stackClass="sa-td-bracket-col__stack--final"
              onMatchClick={onMatchClick}
            />
            {showChampion && (
              <div>
                <span className="sa-td-bracket-col__label sa-td-bracket-col__label--gold">
                  TROFÉU & GLÓRIA
                </span>
                <div className="sa-td-bracket-col__stack sa-td-bracket-col__stack--final">
                  <ChampionCard
                    championName={championName}
                    championLogo={championLogo}
                    championTag={championTag}
                    champLogo={champLogo}
                    hasChampion={hasChampion}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const LOSERS_ROUND_ORDER: MatchBracketGame['round'][] = [
  'LB_R1',
  'LB_R2',
  'LB_R3',
  'LB_R4',
  'LB_R5',
  'LB_R6',
  'LB_FINAL',
];

const ChampionCard: React.FC<{
  championName: string;
  championLogo: string;
  championTag: string;
  champLogo: string;
  hasChampion: boolean;
}> = ({ championName, championLogo, championTag, champLogo, hasChampion }) => (
  <div className={`sa-td-champ${!hasChampion ? ' sa-td-champ--empty' : ''}`}>
    <div className="sa-td-champ__icon">
      <Trophy aria-hidden />
    </div>
    <div className="sa-td-champ__eyebrow">CAMPEÃO DO TORNEIO</div>
    <div className="sa-td-champ__logo">
      {isImageSrc(champLogo) ? <img src={champLogo} alt="" /> : championLogo}
    </div>
    <h4 className="sa-td-champ__name font-display">{championName}</h4>
    <span className="sa-td-champ__tag">TAG: [{championTag}]</span>
    {hasChampion && (
      <div className="sa-td-champ__done">
        <CheckCircle2 aria-hidden />
        TÍTULO CONQUISTADO
      </div>
    )}
  </div>
);
