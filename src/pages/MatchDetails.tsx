import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
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
  Check,
  Clock3,
  Map as MapIcon,
  Trophy,
} from 'lucide-react';
import '../components/match/MatchDetails.css';
import { PlayedMaps } from '../components/match/PlayedMaps';
import { paths } from '../utils/paths';

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

const MAP_THUMBS: Record<string, string> = {
  crossport:
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=240&h=140&fit=crop&q=70',
  oldtown:
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=240&h=140&fit=crop&q=70',
  citycat:
    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=240&h=140&fit=crop&q=70',
  provence:
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=240&h=140&fit=crop&q=70',
  depot5:
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=240&h=140&fit=crop&q=70',
  depot3:
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=240&h=140&fit=crop&q=70',
  dragonroad:
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=240&h=140&fit=crop&q=70',
};

const mapThumbSrc = (mapName: string) => {
  const key = mapName.toLowerCase().replace(/[\s_-]/g, '');
  return MAP_THUMBS[key];
};

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

const statusBadgeClass = (status: 'LIVE' | 'SCHEDULED' | 'COMPLETED') => {
  if (status === 'LIVE') return 'sa-match-status--live';
  if (status === 'SCHEDULED') return 'sa-match-status--scheduled';
  return 'sa-match-status--done';
};

const TeamLogo: React.FC<{
  logo: string;
  name: string;
  winner?: boolean;
  className?: string;
}> = ({ logo, name, winner, className = '' }) => (
  <div
    className={`sa-match-logo ${winner ? 'sa-match-logo--winner' : ''} ${className}`.trim()}
  >
    {isImageSrc(logo) ? (
      <img src={logo} alt={name} />
    ) : (
      <span>{logo}</span>
    )}
  </div>
);

const PlayerRow: React.FC<{
  player: TeamMember;
  reserve?: boolean;
}> = ({ player, reserve }) => {
  const isCaptain = player.role === 'CAPITÃO';
  const role = inGameRoleLabel(player);

  return (
    <div className={`sa-match-player ${reserve ? 'sa-match-player--reserve' : ''}`}>
      <div className="sa-match-player__avatar">
        {isImageSrc(player.avatar) ? (
          <img src={player.avatar} alt={player.nickname} />
        ) : (
          <span className="sa-match-player__avatar-fallback">
            {player.nickname.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <div className="sa-match-player__body">
        <p className="sa-match-player__nick">
          <Link to={paths.player(player.userId)} className="hover:text-[#2DD4BF] transition-colors">
            {player.nickname}
          </Link>
        </p>
        <p className="sa-match-player__name">{player.name}</p>
      </div>
      <div className="sa-match-player__badges">
        {isCaptain && <span className="sa-match-chip sa-match-chip--captain">Capitão</span>}
        <span
          className={`sa-match-chip ${
            role === 'SNA' ? 'sa-match-chip--sna' : 'sa-match-chip--rifle'
          }`}
        >
          {role}
        </span>
        <span
          className={`sa-match-online sa-match-online--${player.status}`}
          title={player.status}
          aria-label={player.status}
        />
      </div>
    </div>
  );
};

const TeamRosterCard: React.FC<{
  teamId: string;
  teamName: string;
  teamTag: string;
  teamLogo: string;
  members: TeamMember[];
  isWinner?: boolean;
  matchCompleted: boolean;
}> = ({ teamId, teamName, teamTag, teamLogo, members, isWinner, matchCompleted }) => {
  const { lineup, reserves } = splitRoster(members);

  return (
    <article className="sa-match-team">
      <header className="sa-match-team__head">
        <div className="sa-match-team__logo">
          {isImageSrc(teamLogo) ? (
            <img src={teamLogo} alt={teamName} />
          ) : (
            <span>{teamLogo}</span>
          )}
        </div>
        <div className="sa-match-team__info">
          <h3 className="sa-match-team__name font-display">
            <Link to={paths.team(teamId)}>{teamName}</Link>
          </h3>
          {matchCompleted && (
            <span
              className={`sa-match-team__outcome ${
                isWinner ? 'sa-match-team__outcome--win' : 'sa-match-team__outcome--loss'
              }`}
            >
              {isWinner ? (
                <>
                  <Check className="w-3 h-3" aria-hidden /> Vitória
                </>
              ) : (
                <>Derrota</>
              )}
            </span>
          )}
        </div>
        <span className="sa-match-team__tag">[{teamTag}]</span>
      </header>

      <div>
        <h4 className="sa-match-group__title">★ Titulares</h4>
        <div className="sa-match-players">
          {lineup.map((player) => (
            <PlayerRow key={player.userId} player={player} />
          ))}
        </div>
      </div>

      <div>
        <h4 className="sa-match-group__title sa-match-group__title--muted">Reservas</h4>
        <div className="sa-match-players">
          {reserves.length > 0 ? (
            reserves.map((player) => (
              <PlayerRow key={player.userId} player={player} reserve />
            ))
          ) : (
            <p className="sa-match-empty">Sem reservas</p>
          )}
        </div>
      </div>
    </article>
  );
};

const mapCardClass = (status: MapVetoEntry['status']) => {
  switch (status) {
    case 'PICKED':
      return 'sa-match-map--pick';
    case 'BANNED_TEAM1':
      return 'sa-match-map--veto-t1';
    case 'BANNED_TEAM2':
      return 'sa-match-map--veto-t2';
    default:
      return '';
  }
};

const mapStatusClass = (status: MapVetoEntry['status']) => {
  switch (status) {
    case 'PICKED':
      return 'sa-match-map__status--pick';
    case 'BANNED_TEAM1':
      return 'sa-match-map__status--veto-t1';
    case 'BANNED_TEAM2':
      return 'sa-match-map__status--veto-t2';
    default:
      return 'sa-match-map__status--pool';
  }
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
  const matchCompleted = match.status === 'COMPLETED';
  const timeLabel =
    schedule.time === '--:--'
      ? schedule.time
      : schedule.time.toLowerCase().includes('h')
        ? schedule.time
        : `${schedule.time}h`;

  return (
    <div className="sa-match">
      <div className="sa-match__bg" aria-hidden>
        <div
          className="sa-match__bg-image"
          style={{ backgroundImage: `url(${tournament.banner || DEFAULT_MATCH_BG})` }}
        />
        <div className="sa-match__bg-overlay" />
        <div className="sa-match__bg-grid" />
      </div>

      <div className="sa-match__inner">
        {/* Hero */}
        <section className="sa-match-hero" aria-label="Placar da partida">
          <div className="sa-match-hero__media" aria-hidden>
            <img src={heroBg} alt="" />
            <div className="sa-match-hero__shade" />
          </div>

          <div className="sa-match-hero__content">
            <div className="sa-match-hero__top">
              <Link
                to={`/torneios/${tournament.id}?tab=partidas`}
                className="sa-match-back"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
                Voltar para o campeonato
              </Link>

              <div className="sa-match-hero__tournament">
                <p className="sa-match-hero__tour-name font-display">
                  {tournament.name}
                </p>
                <p className="sa-match-hero__tour-meta">
                  {phaseLabel(match.phase)} · Jogo{' '}
                  {String(match.matchNumber).padStart(2, '0')}
                </p>
              </div>

              <span className={`sa-match-status ${statusBadgeClass(match.status)}`}>
                <span className="sa-match-status__dot" aria-hidden />
                {status.text}
              </span>
            </div>

            <div className="sa-match-confront">
              <div className="sa-match-side sa-match-side--left">
                <div className="sa-match-side__text min-w-0">
                  <Link
                    to={`/time/${match.team1.id}`}
                    className="sa-match-side__name font-display"
                  >
                    {match.team1.name}
                  </Link>
                  <p className="sa-match-side__rank">{team1Rank}</p>
                </div>
                <TeamLogo
                  logo={team1Logo}
                  name={match.team1.name}
                  winner={!!match.team1.isWinner}
                />
              </div>

              <div className="sa-match-scoreboard">
                <div className="sa-match-score">
                  <span
                    className={`sa-match-score__num font-display ${
                      match.team1.isWinner
                        ? 'sa-match-score__num--win'
                        : matchCompleted
                          ? 'sa-match-score__num--loss'
                          : ''
                    }`}
                  >
                    {match.team1.score}
                  </span>
                  <span className="sa-match-score__sep">:</span>
                  <span
                    className={`sa-match-score__num font-display ${
                      match.team2.isWinner
                        ? 'sa-match-score__num--win'
                        : matchCompleted
                          ? 'sa-match-score__num--loss'
                          : ''
                    }`}
                  >
                    {match.team2.score}
                  </span>
                </div>
                {matchCompleted && (match.team1.isWinner || match.team2.isWinner) && (
                  <span className="sa-match-result">
                    <Trophy aria-hidden />
                    Vitória
                  </span>
                )}
              </div>

              <div className="sa-match-side sa-match-side--right">
                <TeamLogo
                  logo={team2Logo}
                  name={match.team2.name}
                  winner={!!match.team2.isWinner}
                />
                <div className="sa-match-side__text min-w-0">
                  <Link
                    to={`/time/${match.team2.id}`}
                    className="sa-match-side__name font-display"
                  >
                    {match.team2.name}
                  </Link>
                  <p className="sa-match-side__rank">{team2Rank}</p>
                </div>
              </div>
            </div>

            <div className="sa-match-meta">
              <span className="sa-match-meta__item">
                <Bookmark aria-hidden />
                {formatLabel(format)}
              </span>
              <span className="sa-match-meta__item">
                <CalendarDays aria-hidden />
                {schedule.date}
              </span>
              <span className="sa-match-meta__item">
                <Clock3 aria-hidden />
                {timeLabel}
              </span>
              <span className="sa-match-meta__item">
                <MapIcon aria-hidden />
                {mapName}
              </span>
            </div>
          </div>
        </section>

        {match.playedMaps && match.playedMaps.length > 0 && (
          <PlayedMaps
            maps={match.playedMaps}
            team1={{
              name: match.team1.name,
              tag: match.team1.tag,
              logo: team1Logo,
            }}
            team2={{
              name: match.team2.name,
              tag: match.team2.tag,
              logo: team2Logo,
            }}
          />
        )}

        {/* Lineups & Veto */}
        <section aria-label="Lineups e veto de mapas">
          <div className="sa-match-section__head">
            <div className="sa-match-section__label-row">
              <span className="sa-match-section__label">Confrontos</span>
              <span className="sa-match-section__label-line" aria-hidden />
            </div>
            <h2 className="sa-match-section__title font-display">Lineups & Veto</h2>
          </div>

          <div className="sa-match-body">
            <div className="sa-match-lineups">
              <TeamRosterCard
                teamId={match.team1.id}
                teamName={match.team1.name}
                teamTag={match.team1.tag}
                teamLogo={team1Logo}
                members={team1Members}
                isWinner={match.team1.isWinner}
                matchCompleted={matchCompleted}
              />
              <TeamRosterCard
                teamId={match.team2.id}
                teamName={match.team2.name}
                teamTag={match.team2.tag}
                teamLogo={team2Logo}
                members={team2Members}
                isWinner={match.team2.isWinner}
                matchCompleted={matchCompleted}
              />
            </div>

            <aside className="sa-match-veto">
              <h3 className="sa-match-veto__title">Veto de mapas</h3>
              <div className="sa-match-veto__list">
                {mapVeto.map((entry) => {
                  const vetoOwner =
                    entry.status === 'BANNED_TEAM1'
                      ? match.team1.tag
                      : entry.status === 'BANNED_TEAM2'
                        ? match.team2.tag
                        : entry.status === 'PICKED'
                          ? match.team1.isWinner
                            ? match.team1.tag
                            : match.team2.isWinner
                              ? match.team2.tag
                              : match.team1.tag
                          : null;

                  const statusLabel =
                    entry.status === 'PICKED'
                      ? '✓ Pick'
                      : entry.status === 'BANNED_TEAM1' || entry.status === 'BANNED_TEAM2'
                        ? `⊘ Veto${vetoOwner ? ` · ${vetoOwner}` : ''}`
                        : 'Pool';

                  const thumb = mapThumbSrc(entry.map);

                  return (
                    <div
                      key={entry.map}
                      className={`sa-match-map ${mapCardClass(entry.status)}`}
                    >
                      <div className="sa-match-map__thumb" aria-hidden>
                        {thumb ? (
                          <img src={thumb} alt="" />
                        ) : (
                          <span className="sa-match-map__thumb-fallback">
                            {entry.map.slice(0, 3)}
                          </span>
                        )}
                      </div>
                      <div className="sa-match-map__body">
                        <p className="sa-match-map__name">{entry.map}</p>
                        <p
                          className={`sa-match-map__status ${mapStatusClass(entry.status)}`}
                        >
                          {statusLabel}
                        </p>
                      </div>
                      {vetoOwner && (
                        <span className="sa-match-map__tag">{vetoOwner}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </div>
  );
};
