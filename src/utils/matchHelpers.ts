import {
  MapVetoEntry,
  Tournament,
  TournamentFormat,
  TournamentMatch,
  resolvePhaseFormats,
} from '../types';
import { MOCK_MAPS } from '../data/mockData';

export const MAP_POOL = MOCK_MAPS.map((m) => m.name);

export const getMapImageByName = (
  mapName: string,
  catalog: { name: string; image: string }[] = MOCK_MAPS
): string | undefined => {
  const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');
  const key = normalize(mapName);
  return catalog.find((m) => normalize(m.name) === key)?.image;
};

export const isFinalPhase = (phase: string) =>
  phase === 'FINAL' || phase === 'GRAND_FINAL' || phase === 'LB_FINAL';

export const isGroupPhase = (phase: string) =>
  phase.startsWith('GRUPO') || phase === 'FASE DE GRUPOS';

export const resolveMatchFormatFromTournament = (
  tournament: Tournament,
  phase: string
): TournamentFormat => {
  const formats = resolvePhaseFormats(tournament);
  if (isFinalPhase(phase)) return formats.final;
  if (isGroupPhase(phase)) return formats.groups;
  return formats.knockout;
};

export const getTournamentMatches = (tournament: Tournament): TournamentMatch[] => {
  const groupMatches = (tournament.matches ?? []).map((match) => ({
    ...match,
    format: match.format || resolveMatchFormatFromTournament(tournament, match.phase),
  }));
  const bracketMatches: TournamentMatch[] = (tournament.brackets ?? []).map((match) => ({
    id: match.id,
    phase: match.round,
    matchNumber: match.matchNumber,
    team1: match.team1,
    team2: match.team2,
    status: match.status,
    date: match.date,
    format: resolveMatchFormatFromTournament(tournament, match.round),
    playedMaps: match.playedMaps,
    evidence: match.evidence,
    chatMessages: match.chatMessages,
    adminCalled: match.adminCalled,
    adminCalledAt: match.adminCalledAt,
    adminCalledBy: match.adminCalledBy,
  }));
  return [...groupMatches, ...bracketMatches];
};

export const phaseLabel = (phase: string) => {
  switch (phase) {
    case 'OITAVAS':
      return 'OITAVAS DE FINAL';
    case 'QUARTAS':
      return 'QUARTAS DE FINAL';
    case 'SEMIFINAL':
      return 'SEMIFINAL';
    case 'FINAL':
      return 'FINAL (CHAVE SUPERIOR)';
    case 'LB_R1':
      return 'CHAVE INFERIOR — R1';
    case 'LB_R2':
      return 'CHAVE INFERIOR — R2';
    case 'LB_R3':
      return 'CHAVE INFERIOR — R3';
    case 'LB_R4':
      return 'CHAVE INFERIOR — R4';
    case 'LB_R5':
      return 'CHAVE INFERIOR — R5';
    case 'LB_R6':
      return 'CHAVE INFERIOR — R6';
    case 'LB_FINAL':
      return 'FINAL (CHAVE INFERIOR)';
    case 'GRAND_FINAL':
      return 'GRANDE FINAL';
    default:
      return phase;
  }
};

export const matchStatusLabel = (status: TournamentMatch['status']) => {
  switch (status) {
    case 'LIVE':
      return { text: 'AO VIVO', className: 'text-[#E31B23]' };
    case 'SCHEDULED':
      return { text: 'AGENDADA', className: 'text-amber-400' };
    default:
      return { text: 'ENCERRADA', className: 'text-emerald-400' };
  }
};

export const buildDefaultMapVeto = (
  match: TournamentMatch,
  mapPool: readonly string[] = MAP_POOL
): MapVetoEntry[] => {
  if (match.mapVeto && match.mapVeto.length > 0) return match.mapVeto;

  const pool = mapPool.length > 0 ? [...mapPool] : [...MAP_POOL];
  const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');
  const played =
    pool.find((m) => normalize(m) === normalize(match.map || '')) ||
    (match.status === 'COMPLETED' ? pool[0] ?? null : null);

  if (match.status === 'SCHEDULED' || !played) {
    return pool.map((map) => ({ map, status: 'AVAILABLE' as const }));
  }

  let banToggle = true;
  return pool.map((map) => {
    if (map === played) {
      return { map, status: 'PICKED' as const };
    }
    const status = banToggle ? ('BANNED_TEAM1' as const) : ('BANNED_TEAM2' as const);
    banToggle = !banToggle;
    return { map, status };
  });
};

export const getMatchFormat = (match: TournamentMatch, tournament?: Tournament) => {
  if (match.format) return match.format;
  if (tournament) return resolveMatchFormatFromTournament(tournament, match.phase);
  if (isFinalPhase(match.phase)) return 'MD5';
  if (isGroupPhase(match.phase)) return 'MD1';
  return 'MD3';
};
