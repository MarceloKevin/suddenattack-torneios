import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import {
  buildDefaultMapVeto,
  getMatchFormat,
  getTournamentMatches,
  matchStatusLabel,
  phaseLabel,
} from '../utils/matchHelpers';
import { getRosterSlot } from '../utils/rosterHelpers';
import { MapVetoEntry, Team, TeamMember } from '../types';
import {
  AlertCircle,
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Clock3,
  Map as MapIcon,
} from 'lucide-react';

const FALLBACK_AVATARS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
];

const FALLBACK_NICKS = [
  { nick: 'ShadowFox', name: 'Lucas Ferreira' },
  { nick: 'NovaPulse', name: 'Rafael Souza' },
  { nick: 'DriftKing', name: 'Bruno Alves' },
  { nick: 'ColdAim', name: 'Pedro Henrique' },
  { nick: 'BlitzSA', name: 'Thiago Moura' },
  { nick: 'EchoShot', name: 'Igor Campos' },
  { nick: 'RogueOne', name: 'André Lima' },
];

const DEFAULT_MATCH_BG =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=600&fit=crop&q=80';

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const formatLabel = (format: string) => {
  switch (format) {
    case 'MD1':
      return 'Melhor de 1';
    case 'MD3':
      return 'Melhor de 3';
    case 'MD5':
      return 'Melhor de 5';
    default:
      return format;
  }
};

const parseMatchSchedule = (raw?: string) => {
  if (!raw) return { date: 'A definir', time: '--:--' };
  const parts = raw.split('-').map((p) => p.trim());
  if (parts.length >= 2) {
    return { date: parts[0], time: parts.slice(1).join(' - ') };
  }
  return { date: raw, time: '--:--' };
};

const getTeamRankingPosition = (teams: Team[], teamId: string): number => {
  const ranked = [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.titles !== a.stats.titles) return b.stats.titles - a.stats.titles;
    return b.stats.winRate - a.stats.winRate;
  });
  const index = ranked.findIndex((t) => t.id === teamId);
  return index >= 0 ? index + 1 : ranked.length + 1;
};

const formatRankingPosition = (position: number) => `${position}º no ranking`;

const TeamLogoBadge: React.FC<{ logo: string; name: string }> = ({ logo, name }) => (
  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 bg-[#181B23] flex items-center justify-center shrink-0 shadow-lg">
    {isImageSrc(logo) ? (
      <img src={logo} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-3xl sm:text-4xl leading-none">{logo}</span>
    )}
  </div>
);

const vetoStatusStyle = (status: MapVetoEntry['status']) => {
  switch (status) {
    case 'BANNED_TEAM1':
      return {
        border: 'border-[#E31B23]/60',
        bg: 'bg-[#E31B23]/15',
        label: 'VETO',
        labelClass: 'text-[#ff4d55]',
        mapClass: 'text-zinc-500 line-through',
      };
    case 'BANNED_TEAM2':
      return {
        border: 'border-sky-500/60',
        bg: 'bg-sky-500/15',
        label: 'VETO',
        labelClass: 'text-sky-300',
        mapClass: 'text-zinc-500 line-through',
      };
    case 'PICKED':
      return {
        border: 'border-emerald-400/70',
        bg: 'bg-emerald-500/15',
        label: 'PICK',
        labelClass: 'text-emerald-300',
        mapClass: 'text-white font-bold',
      };
    default:
      return {
        border: 'border-[#272B35]',
        bg: 'bg-[#0E1016]/80',
        label: 'POOL',
        labelClass: 'text-[#9298A5]',
        mapClass: 'text-zinc-300',
      };
  }
};

const buildFallbackRoster = (tag: string): TeamMember[] => {
  const starters = FALLBACK_NICKS.slice(0, 5);
  const reserves = FALLBACK_NICKS.slice(5, 7);

  return [
    ...starters.map((player, index) => ({
      userId: `${tag}-starter-${index}`,
      nickname: player.nick,
      name: player.name,
      avatar: FALLBACK_AVATARS[index],
      role: (index === 0 ? 'CAPITÃO' : 'PLAYER') as TeamMember['role'],
      rosterSlot: 'LINEUP' as const,
      inGameRole: (index === 0 || index === 2 ? 'SNA' : 'RIFLE') as TeamMember['inGameRole'],
      status: 'offline' as const,
      joinedDate: '01/01/2026',
      kd: '1.40',
    })),
    ...reserves.map((player, index) => ({
      userId: `${tag}-reserve-${index}`,
      nickname: player.nick,
      name: player.name,
      avatar: FALLBACK_AVATARS[5 + index],
      role: 'RESERVA' as const,
      rosterSlot: 'RESERVA' as const,
      inGameRole: 'RIFLE' as const,
      status: 'offline' as const,
      joinedDate: '01/01/2026',
      kd: '1.10',
    })),
  ];
};

const splitRoster = (members: TeamMember[]) => {
  const lineup = members.filter((m) => getRosterSlot(m) === 'LINEUP');
  const reserves = members.filter((m) => getRosterSlot(m) === 'RESERVA');

  if (lineup.length > 0 || reserves.length > 0) {
    return {
      lineup: lineup.slice(0, 5),
      reserves: reserves.slice(0, 2),
    };
  }

  return {
    lineup: members.filter((m) => m.role === 'CAPITÃO' || m.role === 'PLAYER').slice(0, 5),
    reserves: members.filter((m) => m.role === 'RESERVA').slice(0, 2),
  };
};

const inGameRoleLabel = (player: TeamMember): 'RIFLE' | 'SNA' => {
  if (player.inGameRole) return player.inGameRole;
  if (player.role === 'CAPITÃO') return 'SNA';
  if (/snip|awp|sna/i.test(player.nickname)) return 'SNA';
  return 'RIFLE';
};

const inGameRoleColor = (label: 'RIFLE' | 'SNA') =>
  label === 'SNA'
    ? 'text-sky-200 border-sky-400/50 bg-sky-500/15 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
    : 'text-emerald-200 border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_12px_rgba(52,211,153,0.12)]';

const PlayerRow: React.FC<{
  player: TeamMember;
  align?: 'left' | 'right';
}> = ({ player, align = 'left' }) => {
  const isCaptain = player.role === 'CAPITÃO';
  const functionLabel = inGameRoleLabel(player);

  return (
    <div
      className={`flex items-center gap-3 py-3 px-3 border border-[#272B35]/80 bg-[#0E1016]/60 min-h-[58px] ${
        align === 'right' ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <Avatar
        src={player.avatar}
        name={player.nickname}
        size="md"
        status={player.status}
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className={`flex items-center gap-1.5 ${align === 'right' ? 'justify-end' : ''}`}>
          <span className="text-sm font-semibold text-white truncate">{player.nickname}</span>
        </div>
        <p className="text-[11px] text-[#9298A5] truncate mt-0.5">{player.name}</p>
      </div>
      <div
        className={`flex items-center gap-2 shrink-0 ${
          align === 'right' ? 'flex-row-reverse' : ''
        }`}
      >
        <span
          className={`inline-flex items-center px-2.5 py-1 text-[11px] sm:text-xs font-display font-bold uppercase tracking-wider border ${inGameRoleColor(functionLabel)}`}
        >
          {functionLabel}
        </span>
        {isCaptain && (
          <span className="inline-flex items-center px-2 py-1 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wide text-[#ff4d55] border border-[#E31B23]/50 bg-[#E31B23]/15">
            Capitão
          </span>
        )}
      </div>
    </div>
  );
};

const TeamRosterColumn: React.FC<{
  teamId: string;
  teamName: string;
  teamTag: string;
  teamLogo: string;
  members: TeamMember[];
  side: 'left' | 'right';
  accent: string;
}> = ({ teamId, teamName, teamTag, teamLogo, members, side, accent }) => {
  const { lineup, reserves } = splitRoster(members);
  const align = side === 'left' ? 'left' : 'right';

  return (
    <div className="space-y-4">
      <div className={`flex items-center gap-2 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
        {isImageSrc(teamLogo) ? (
          <img
            src={teamLogo}
            alt={teamName}
            className="w-8 h-8 rounded-full object-cover border border-[#272B35] shrink-0"
          />
        ) : (
          <span className="text-xl">{teamLogo}</span>
        )}
        <div className="min-w-0">
          <span className={`text-[9px] font-mono uppercase tracking-widest ${accent}`}>
            [{teamTag}]
          </span>
          <h3 className="text-sm sm:text-base font-display uppercase tracking-wide text-white truncate">
            <Link to={`/time/${teamId}`} className="hover:text-[#E31B23] transition-colors">
              {teamName}
            </Link>
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 pb-1.5 border-b border-[#272B35] ${
            side === 'right' ? 'justify-end' : ''
          }`}
        >
          <span className={`text-[10px] font-mono uppercase tracking-[0.18em] ${accent}`}>
            Lineup
          </span>
        </div>
        <div className="space-y-1.5">
          {lineup.map((player) => (
            <PlayerRow key={player.userId} player={player} align={align} />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div
          className={`flex items-center gap-2 pb-1.5 border-b border-[#272B35] ${
            side === 'right' ? 'justify-end' : ''
          }`}
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
            Reservas
          </span>
        </div>
        <div className="space-y-1.5">
          {reserves.length > 0 ? (
            reserves.map((player) => (
              <PlayerRow key={player.userId} player={player} align={align} />
            ))
          ) : (
            <p
              className={`text-[10px] font-mono text-zinc-600 py-2 ${
                side === 'right' ? 'text-right' : ''
              }`}
            >
              Sem reservas
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const resolveMembers = (teams: Team[], teamId: string, tag: string): TeamMember[] => {
  const team = teams.find((t) => t.id === teamId);
  if (team && team.members.length > 0) {
    const hasReserve = team.members.some(
      (m) => getRosterSlot(m) === 'RESERVA' || m.role === 'RESERVA'
    );
    if (hasReserve) return team.members;
    return [...team.members, ...buildFallbackRoster(tag).filter((m) => m.role === 'RESERVA')];
  }
  return buildFallbackRoster(tag);
};

export const MatchDetails: React.FC = () => {
  const { id, matchId } = useParams<{ id: string; matchId: string }>();
  const { tournaments, teams } = useAuth();

  const tournament = tournaments.find((t) => t.id === id) || tournaments[0];
  const matches = useMemo(() => getTournamentMatches(tournament), [tournament]);
  const match = matches.find((m) => m.id === matchId);

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
        <Link
          to={`/torneios/${tournament.id}?tab=partidas`}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9298A5] hover:text-[#E31B23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLTAR PARA O TORNEIO
        </Link>

        <Card variant="primary" hasHudCorners className="p-10 border-[#272B35] text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-[#9298A5] mb-2" />
          <h1 className="text-2xl font-display uppercase tracking-wide text-white">
            PARTIDA NÃO ENCONTRADA
          </h1>
          <p className="text-xs text-[#9298A5] max-w-sm mx-auto mt-2">
            Essa partida não existe neste campeonato ou foi removida.
          </p>
        </Card>
      </div>
    );
  }

  const status = matchStatusLabel(match.status);
  const mapVeto = buildDefaultMapVeto(match);
  const format = getMatchFormat(match);
  const team1Members = resolveMembers(teams, match.team1.id, match.team1.tag);
  const team2Members = resolveMembers(teams, match.team2.id, match.team2.tag);
  const team1Logo =
    teams.find((t) => t.id === match.team1.id)?.logo || match.team1.logo;
  const team2Logo =
    teams.find((t) => t.id === match.team2.id)?.logo || match.team2.logo;
  const schedule = parseMatchSchedule(match.date);
  const mapName = match.map || mapVeto.find((e) => e.status === 'PICKED')?.map || 'A definir';
  const team1Rank = formatRankingPosition(getTeamRankingPosition(teams, match.team1.id));
  const team2Rank = formatRankingPosition(getTeamRankingPosition(teams, match.team2.id));
  const heroBg = tournament.banner || DEFAULT_MATCH_BG;
  const score1Class = match.team1.isWinner
    ? 'text-lime-400'
    : match.status === 'COMPLETED'
      ? 'text-red-500'
      : 'text-white';
  const score2Class = match.team2.isWinner
    ? 'text-lime-400'
    : match.status === 'COMPLETED'
      ? 'text-red-500'
      : 'text-white';
  const timeLabel =
    schedule.time === '--:--'
      ? schedule.time
      : schedule.time.toLowerCase().includes('h')
        ? schedule.time
        : `${schedule.time}h`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16 space-y-10 text-left">
      {/* HERO — apresentação no estilo placar */}
      <section className="relative overflow-hidden border border-[#272B35] min-h-[320px] sm:min-h-[360px]">
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-[#08090D]/78" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />

        <div className="relative z-10 flex flex-col min-h-[320px] sm:min-h-[360px]">
          <div className="relative px-4 sm:px-6 pt-4 sm:pt-5">
            <Link
              to={`/torneios/${tournament.id}?tab=partidas`}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-wider text-white border border-white/40 hover:border-[#E31B23] hover:text-[#ff4d55] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para o campeonato
            </Link>

            <div className="absolute left-1/2 top-3 sm:top-4 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white/25 bg-[#181B23]/90 flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.45)] overflow-hidden">
                {tournament.championTeam && isImageSrc(tournament.championTeam.logo) ? (
                  <img
                    src={tournament.championTeam.logo}
                    alt={tournament.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] sm:text-xs font-display font-bold text-white text-center leading-tight px-1">
                    {tournament.tag.slice(0, 6)}
                  </span>
                )}
              </div>
              <span className="mt-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.18em] text-white/80 text-center max-w-[12rem] truncate">
                {tournament.name}
              </span>
            </div>

            <div className="absolute right-4 sm:right-6 top-5">
              <span className={`text-[10px] font-mono uppercase tracking-widest ${status.className}`}>
                ● {status.text}
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center px-4 sm:px-8 py-8 sm:py-10">
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
              <div className="flex items-center justify-end gap-3 sm:gap-4 min-w-0">
                <div className="min-w-0 text-right">
                  <Link
                    to={`/time/${match.team1.id}`}
                    className="block text-lg sm:text-2xl lg:text-3xl font-semibold text-white uppercase tracking-tight truncate hover:text-[#E31B23] transition-colors"
                  >
                    {match.team1.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-[#9298A5] mt-1">{team1Rank}</p>
                </div>
                <TeamLogoBadge logo={team1Logo} name={match.team1.name} />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-[#181B23]/90 border border-white/10 flex items-center justify-center shadow-inner">
                  <span
                    className={`text-2xl sm:text-4xl font-bold tabular-nums leading-none ${score1Class}`}
                  >
                    {match.team1.score}
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-sky-300/90 lowercase">vs</span>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-md bg-[#181B23]/90 border border-white/10 flex items-center justify-center shadow-inner">
                  <span
                    className={`text-2xl sm:text-4xl font-bold tabular-nums leading-none ${score2Class}`}
                  >
                    {match.team2.score}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-start gap-3 sm:gap-4 min-w-0">
                <TeamLogoBadge logo={team2Logo} name={match.team2.name} />
                <div className="min-w-0 text-left">
                  <Link
                    to={`/time/${match.team2.id}`}
                    className="block text-lg sm:text-2xl lg:text-3xl font-semibold text-white uppercase tracking-tight truncate hover:text-[#E31B23] transition-colors"
                  >
                    {match.team2.name}
                  </Link>
                  <p className="text-xs sm:text-sm text-[#9298A5] mt-1">{team2Rank}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-8 pb-5 sm:pb-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-2 text-xs sm:text-sm text-white">
              <span className="inline-flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-lime-400" />
                {formatLabel(format)}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-300" />
                {schedule.date}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock3 className="w-4 h-4 text-amber-300" />
                {timeLabel}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-lime-400" />
                {mapName}
              </span>
            </div>
            <p className="text-center text-[10px] font-mono uppercase tracking-widest text-white/40 mt-3">
              {phaseLabel(match.phase)} · Jogo {String(match.matchNumber).padStart(2, '0')}
            </p>
          </div>
        </div>
      </section>

      {/* LINEUPS + MAP VETO */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-[#272B35] pb-3">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E31B23]">
              Confrontos
            </span>
            <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-white mt-1">
              Lineups & Veto
            </h2>
          </div>
          <div className="hidden sm:flex flex-wrap gap-3 text-[9px] font-mono uppercase text-[#9298A5]">
            <span>
              <span className="text-[#E31B23]">■</span> Veto {match.team1.tag}
            </span>
            <span>
              <span className="text-sky-400">■</span> Veto {match.team2.tag}
            </span>
            <span>
              <span className="text-emerald-400">■</span> Pick
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 min-w-0 min-h-[420px] content-start border border-[#272B35] bg-[#0E1016]/40 p-4 sm:p-5">
            <TeamRosterColumn
              teamId={match.team1.id}
              teamName={match.team1.name}
              teamTag={match.team1.tag}
              teamLogo={team1Logo}
              members={team1Members}
              side="left"
              accent="text-[#E31B23]"
            />
            <TeamRosterColumn
              teamId={match.team2.id}
              teamName={match.team2.name}
              teamTag={match.team2.tag}
              teamLogo={team2Logo}
              members={team2Members}
              side="right"
              accent="text-sky-400"
            />
          </div>

          <aside className="space-y-2 lg:sticky lg:top-6">
            <div className="pb-2 border-b border-[#272B35]">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#E31B23]">
                Veto de mapas
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {mapVeto.map((entry) => {
                const style = vetoStatusStyle(entry.status);
                const vetoOwner =
                  entry.status === 'BANNED_TEAM1'
                    ? match.team1.tag
                    : entry.status === 'BANNED_TEAM2'
                      ? match.team2.tag
                      : null;

                return (
                  <div
                    key={entry.map}
                    className={`min-h-[64px] px-4 py-4 border ${style.border} ${style.bg} flex flex-col items-start justify-center gap-1`}
                  >
                    <span
                      className={`text-sm sm:text-base font-display uppercase tracking-wide ${style.mapClass}`}
                    >
                      {entry.map}
                    </span>
                    <span className={`text-[10px] font-mono uppercase ${style.labelClass}`}>
                      {style.label}
                      {vetoOwner ? ` • ${vetoOwner}` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};
