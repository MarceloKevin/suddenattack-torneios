import { MapVetoEntry, Tournament, TournamentMatch } from '../types';

export const MAP_POOL = [
  'Crossport',
  'Old town',
  'CityCat',
  'Provence',
  'Depot5',
  'Depot3',
  'DragonRoad',
] as const;

export const getTournamentMatches = (tournament: Tournament): TournamentMatch[] => {
  const groupMatches = tournament.matches ?? [];
  const bracketMatches: TournamentMatch[] = (tournament.brackets ?? []).map((match) => ({
    id: match.id,
    phase: match.round,
    matchNumber: match.matchNumber,
    team1: match.team1,
    team2: match.team2,
    status: match.status,
    date: match.date,
    format: match.round === 'FINAL' ? 'MD5' : 'MD3',
    playedMaps: match.playedMaps,
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

export const buildDefaultMapVeto = (match: TournamentMatch): MapVetoEntry[] => {
  if (match.mapVeto && match.mapVeto.length > 0) return match.mapVeto;

  const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');
  const played =
    MAP_POOL.find((m) => normalize(m) === normalize(match.map || '')) ||
    (match.status === 'COMPLETED' ? 'DragonRoad' : null);

  if (match.status === 'SCHEDULED' || !played) {
    return MAP_POOL.map((map) => ({ map, status: 'AVAILABLE' as const }));
  }

  let banToggle = true;
  return MAP_POOL.map((map) => {
    if (map === played) {
      return { map, status: 'PICKED' as const };
    }
    const status = banToggle ? ('BANNED_TEAM1' as const) : ('BANNED_TEAM2' as const);
    banToggle = !banToggle;
    return { map, status };
  });
};

export const getMatchFormat = (match: TournamentMatch) =>
  match.format ||
  (match.phase === 'FINAL' ? 'MD5' : match.phase.startsWith('GRUPO') ? 'MD1' : 'MD3');
