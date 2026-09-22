import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Map, Swords, Trophy, X } from 'lucide-react';
import { cardClass, TeamMatchView, isImageSrc } from './shared';

interface TeamRecentMatchesProps {
  teamName: string;
  teamLogo?: string;
  teamTag?: string;
  matches: TeamMatchView[];
  limit?: number;
}

const VICTORY = '#2DD4BF';
const DEFEAT = '#F43F5E';

/* ─── Logo ─── */

const TeamLogo: React.FC<{
  name: string;
  logo?: string;
  tag?: string;
  highlight?: boolean;
}> = ({ name, logo, tag, highlight }) => (
  <div className="flex flex-col items-center gap-2 shrink-0">
    <div
      className={`w-[64px] h-[64px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center p-2.5 transition-transform duration-200 group-hover:scale-[1.03] ${
        highlight
          ? 'bg-[#0A1A1C] border-2 border-[#2DD4BF]/70 shadow-[0_0_22px_rgba(45,212,191,0.28)]'
          : 'bg-[#0C1418] border border-white/10'
      }`}
    >
      {isImageSrc(logo) ? (
        <img src={logo} alt={name} className="w-full h-full object-contain" />
      ) : logo ? (
        <span className="text-2xl sm:text-3xl leading-none">{logo}</span>
      ) : (
        <span className="text-xs font-extrabold text-[#8B93A7]">
          {(tag || name).slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
    {highlight && (
      <span className="inline-flex px-2 py-0.5 rounded-full bg-[#E31B23] text-[9px] font-extrabold uppercase tracking-[0.12em] text-white leading-none">
        Seu time
      </span>
    )}
  </div>
);

/* ─── Team info text ─── */

const TeamInfo: React.FC<{
  name: string;
  tag?: string;
  align: 'left' | 'right' | 'center';
}> = ({ name, tag, align }) => (
  <div
    className={`min-w-0 ${
      align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
    }`}
  >
    <p className="text-[16px] sm:text-[18px] md:text-[19px] font-extrabold text-white tracking-tight leading-tight truncate">
      {name}
    </p>
    {tag && (
      <p className="mt-1 text-[11px] sm:text-xs font-medium text-[#7A8599] tracking-wide">
        [{tag}]
      </p>
    )}
  </div>
);

/* ─── Score ─── */

const MatchScore: React.FC<{
  myScore: number;
  opponentScore: number;
  isWin: boolean;
  isLoss: boolean;
}> = ({ myScore, opponentScore, isWin, isLoss }) => (
  <div className="flex items-baseline justify-center gap-2.5 sm:gap-3.5 shrink-0 px-2">
    <span
      className={`text-[2.35rem] sm:text-[2.65rem] md:text-[2.75rem] font-black tabular-nums leading-none tracking-tight ${
        isWin ? 'text-[#2DD4BF]' : isLoss ? 'text-[#F43F5E]' : 'text-white'
      }`}
    >
      {myScore}
    </span>
    <span className="text-xl sm:text-2xl font-semibold text-white/40 leading-none">:</span>
    <span
      className={`text-[2.35rem] sm:text-[2.65rem] md:text-[2.75rem] font-black tabular-nums leading-none tracking-tight ${
        isWin ? 'text-[#2DD4BF]' : isLoss ? 'text-[#F43F5E]/70' : 'text-white'
      }`}
    >
      {opponentScore}
    </span>
  </div>
);

/* ─── Header ─── */

const MatchHeader: React.FC<{
  tournamentName: string;
  phase?: string;
  date: string;
}> = ({ tournamentName, phase, date }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 min-w-0 flex-wrap">
      <Trophy className="w-3.5 h-3.5 text-[#2DD4BF]/80 shrink-0" aria-hidden />
      <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-[#C8D0DC] truncate">
        {tournamentName}
      </span>
      {phase && (
        <span className="inline-flex px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-wider text-[#8B93A7]">
          {phase}
        </span>
      )}
    </div>
    <div className="flex items-center gap-1.5 shrink-0 text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-[#7A8599]">
      <CalendarDays className="w-3.5 h-3.5" aria-hidden />
      <span>{date}</span>
    </div>
  </div>
);

/* ─── Footer ─── */

const MatchFooter: React.FC<{
  result: TeamMatchView['result'];
  status: TeamMatchView['status'];
  map: string;
}> = ({ result, status, map }) => {
  const isWin = result === 'VITÓRIA';
  const isLoss = result === 'DERROTA';

  return (
    <div className="flex items-center justify-between gap-3">
      {result ? (
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.1em] border ${
            isWin
              ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/35'
              : isLoss
                ? 'bg-[#F43F5E]/10 text-[#F43F5E] border-[#F43F5E]/35'
                : 'bg-white/5 text-[#8B93A7] border-white/10'
          }`}
        >
          {isWin ? (
            <Trophy className="w-3.5 h-3.5" aria-hidden />
          ) : (
            <X className="w-3.5 h-3.5" aria-hidden />
          )}
          {result}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.1em] border bg-amber-500/10 text-amber-300 border-amber-500/35">
          {status === 'LIVE' ? 'AO VIVO' : 'AGENDADA'}
        </span>
      )}

      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#8B93A7]">
        <Map className="w-3.5 h-3.5" aria-hidden />
        {map}
      </span>
    </div>
  );
};

/* ─── Card ─── */

interface MatchCardProps {
  match: TeamMatchView;
  teamName: string;
  teamLogo?: string;
  teamTag?: string;
  onOpen: (path: string) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({
  match,
  teamName,
  teamLogo,
  teamTag,
  onOpen,
}) => {
  const isWin = match.result === 'VITÓRIA';
  const isLoss = match.result === 'DERROTA';
  const detailsPath = `/torneios/${match.tournamentId}/partidas/${match.matchId}`;

  const borderColor = isWin
    ? 'border-[#2DD4BF]/30 hover:border-[#2DD4BF]/55'
    : isLoss
      ? 'border-[#F43F5E]/30 hover:border-[#F43F5E]/50'
      : 'border-white/10 hover:border-white/20';

  return (
    <button
      type="button"
      onClick={() => onOpen(detailsPath)}
      className={`group relative w-full text-left overflow-hidden rounded-2xl border min-h-[175px] px-5 py-[18px] sm:px-6 sm:py-5 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]/40 ${borderColor}`}
      style={{
        background:
          'linear-gradient(135deg, #08151A 0%, #071214 48%, #0A161A 100%)',
        boxShadow: isWin
          ? '0 0 0 1px rgba(45,212,191,0.04), 0 8px 28px rgba(0,0,0,0.35)'
          : isLoss
            ? '0 0 0 1px rgba(244,63,94,0.04), 0 8px 28px rgba(0,0,0,0.35)'
            : '0 8px 28px rgba(0,0,0,0.3)',
      }}
    >
      {/* Subtle tech texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.9) 12px, rgba(255,255,255,0.9) 13px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 w-56 h-56 rounded-full blur-3xl opacity-20"
        style={{
          background: isWin ? VICTORY : isLoss ? DEFEAT : '#2A3444',
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-5 sm:gap-6 h-full justify-between">
        <MatchHeader
          tournamentName={match.tournamentName}
          phase={match.phase}
          date={match.date}
        />

        {/* Desktop / tablet confrontation */}
        <div
          className="hidden sm:grid items-center gap-3 md:gap-4"
          style={{
            gridTemplateColumns: 'auto minmax(100px, 1fr) auto minmax(100px, 1fr) auto',
          }}
        >
          <TeamLogo
            name={teamName}
            logo={teamLogo}
            tag={teamTag}
            highlight
          />
          <TeamInfo name={teamName} tag={teamTag} align="left" />
          <MatchScore
            myScore={match.myScore}
            opponentScore={match.opponentScore}
            isWin={isWin}
            isLoss={isLoss}
          />
          <TeamInfo
            name={match.opponent.name}
            tag={match.opponent.tag}
            align="right"
          />
          <TeamLogo
            name={match.opponent.name}
            logo={match.opponent.logo}
            tag={match.opponent.tag}
          />
        </div>

        {/* Mobile confrontation */}
        <div className="flex sm:hidden flex-col items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <TeamLogo name={teamName} logo={teamLogo} tag={teamTag} highlight />
            <TeamInfo name={teamName} tag={teamTag} align="center" />
          </div>
          <MatchScore
            myScore={match.myScore}
            opponentScore={match.opponentScore}
            isWin={isWin}
            isLoss={isLoss}
          />
          <div className="flex flex-col items-center gap-2">
            <TeamLogo
              name={match.opponent.name}
              logo={match.opponent.logo}
              tag={match.opponent.tag}
            />
            <TeamInfo
              name={match.opponent.name}
              tag={match.opponent.tag}
              align="center"
            />
          </div>
        </div>

        <MatchFooter result={match.result} status={match.status} map={match.map} />
      </div>
    </button>
  );
};

/* ─── Section ─── */

export const TeamRecentMatches: React.FC<TeamRecentMatchesProps> = ({
  teamName,
  teamLogo,
  teamTag,
  matches,
  limit,
}) => {
  const navigate = useNavigate();
  const list = typeof limit === 'number' ? matches.slice(0, limit) : matches;
  const count = matches.length;

  return (
    <section className={`${cardClass} p-5 sm:p-6 space-y-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E31B23]">
              Confrontos
            </span>
            <span className="h-px w-8 sm:w-10 bg-[#E31B23]/80" aria-hidden />
          </div>
          <h2 className="mt-2 text-[1.65rem] sm:text-[1.85rem] md:text-[2rem] font-extrabold text-white tracking-[-0.03em] leading-none">
            Partidas recentes
          </h2>
          <p className="mt-2.5 text-sm sm:text-[15px] text-[#8B93A7] leading-relaxed">
            Histórico de jogos disputados por {teamName}.
          </p>
        </div>

        {count > 0 && (
          <div className="shrink-0 inline-flex items-center gap-2 rounded-full border border-[#1D2633] bg-[#0B0F15] px-3 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#C8D0DC]">
            <CalendarDays className="w-3.5 h-3.5 text-[#8B93A7]" aria-hidden />
            {count} partidas
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1D2633] bg-[#071214] py-12 text-center space-y-2">
          <Swords className="w-8 h-8 text-zinc-600 mx-auto" aria-hidden />
          <p className="text-sm text-zinc-600">
            Nenhuma partida registrada para este time.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {list.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              teamName={teamName}
              teamLogo={teamLogo}
              teamTag={teamTag}
              onOpen={(path) => navigate(path)}
            />
          ))}
        </div>
      )}
    </section>
  );
};
