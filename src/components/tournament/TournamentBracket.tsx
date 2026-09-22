import React from 'react';
import { MatchBracketGame } from '../../types';
import { Card } from '../ui/Card';
import { Trophy, Swords, CheckCircle2 } from 'lucide-react';

interface TournamentBracketProps {
  brackets: MatchBracketGame[];
  championName?: string;
  championLogo?: string;
  championTag?: string;
}

const MatchCard: React.FC<{
  match: MatchBracketGame;
  format?: string;
  highlight?: boolean;
}> = ({ match, format = 'MD3', highlight = false }) => (
  <Card
    variant={highlight ? 'primary' : 'secondary'}
    hasHudCorners={highlight}
    className={`p-3 border-[#272B35] relative hover:border-[#E31B23]/40 transition-colors ${
      highlight
        ? 'border-yellow-500/50 bg-gradient-to-b from-[#181B23] to-[#13161D] shadow-lg shadow-yellow-950/20'
        : ''
    }`}
  >
    <div
      className={`text-[10px] font-mono mb-2 flex justify-between ${
        highlight ? 'text-yellow-500 font-bold' : 'text-[#9298A5]'
      }`}
    >
      <span>
        {format} • JOGO {match.matchNumber}
      </span>
      <span>{match.date || 'ENCERRADO'}</span>
    </div>

    <div className="space-y-1.5">
      <div
        className={`flex items-center justify-between p-1.5 text-xs ${
          match.team1.isWinner
            ? highlight
              ? 'bg-yellow-500/20 font-bold text-white border-l-4 border-yellow-500'
              : 'bg-[#E31B23]/10 font-bold text-white border-l-2 border-[#E31B23]'
            : 'text-zinc-400'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span>{match.team1.logo}</span>
          <span className="truncate">{match.team1.name}</span>
        </span>
        <span
          className={`font-mono text-sm ml-2 px-1.5 ${
            highlight ? 'bg-[#08090D] text-yellow-400 font-bold' : 'bg-[#0E1016]'
          }`}
        >
          {match.team1.score}
        </span>
      </div>

      <div
        className={`flex items-center justify-between p-1.5 text-xs ${
          match.team2.isWinner
            ? highlight
              ? 'bg-yellow-500/20 font-bold text-white border-l-4 border-yellow-500'
              : 'bg-[#E31B23]/10 font-bold text-white border-l-2 border-[#E31B23]'
            : 'text-zinc-400'
        }`}
      >
        <span className="flex items-center gap-1.5 truncate">
          <span>{match.team2.logo}</span>
          <span className="truncate">{match.team2.name}</span>
        </span>
        <span className="font-mono text-sm ml-2 px-1.5 bg-[#0E1016]">{match.team2.score}</span>
      </div>
    </div>
  </Card>
);

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  brackets,
  championName = 'SKILL KINGS',
  championLogo = '👑',
  championTag = 'SK',
}) => {
  const oitavas = brackets.filter((b) => b.round === 'OITAVAS');
  const quartas = brackets.filter((b) => b.round === 'QUARTAS');
  const semifinal = brackets.filter((b) => b.round === 'SEMIFINAL');
  const finalMatch = brackets.find((b) => b.round === 'FINAL');
  const hasOitavas = oitavas.length > 0;
  const columns = hasOitavas ? 5 : 4;

  return (
    <div className="w-full overflow-x-auto pb-6">
      <div
        className={`grid gap-5 items-start ${
          hasOitavas ? 'min-w-[1100px] grid-cols-5' : 'min-w-[840px] grid-cols-4'
        }`}
      >
        {hasOitavas && (
          <div className="space-y-4">
            <div className="text-center pb-2 border-b border-[#272B35]">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                01 // OITAVAS DE FINAL
              </span>
            </div>
            <div className="space-y-3">
              {oitavas.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-[#272B35]">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              {hasOitavas ? '02' : '01'} // QUARTAS DE FINAL
            </span>
          </div>
          <div className={`space-y-4 ${hasOitavas ? 'pt-6' : ''}`}>
            {quartas.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-[#272B35]">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              {hasOitavas ? '03' : '02'} // SEMIFINAIS
            </span>
          </div>
          <div className={`space-y-12 ${hasOitavas ? 'pt-16' : ''}`}>
            {semifinal.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-[#272B35]">
            <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5" /> {hasOitavas ? '04' : '03'} // GRANDE FINAL
            </span>
          </div>
          <div className={hasOitavas ? 'pt-28' : ''}>
            {finalMatch ? (
              <MatchCard match={finalMatch} format="MD5" highlight />
            ) : (
              <Card variant="secondary" className="p-4 text-center text-xs text-[#9298A5]">
                Aguardando finalistas
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-center pb-2 border-b border-[#272B35]">
            <span className="text-xs font-mono uppercase tracking-widest text-yellow-400 font-bold">
              {String(columns).padStart(2, '0')} // TROFÉU & GLÓRIA
            </span>
          </div>
          <div className={hasOitavas ? 'pt-28' : ''}>
            <div className="p-5 bg-gradient-to-b from-[#181B23] to-[#0E1016] border-2 border-yellow-500/70 text-center relative hud-corner shadow-2xl shadow-yellow-900/10">
              <div className="w-14 h-14 mx-auto mb-2 rounded-none bg-yellow-500/10 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
                <Trophy className="w-8 h-8 animate-bounce" />
              </div>

              <div className="text-[10px] font-mono tracking-widest uppercase text-yellow-500 font-bold mb-1">
                CAMPEÃO DO TORNEIO
              </div>

              <div className="text-3xl my-1">{championLogo}</div>

              <h4 className="text-2xl font-display text-white uppercase tracking-wider">
                {championName}
              </h4>

              <span className="inline-block text-xs font-mono bg-yellow-500/20 text-yellow-300 px-2.5 py-0.5 mt-1 border border-yellow-500/30 font-bold">
                TAG: [{championTag}]
              </span>

              <div className="mt-4 pt-3 border-t border-[#272B35] flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-4 h-4" />
                TÍTULO CONQUISTADO
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
