import {
  GroupStanding,
  MatchBracketGame,
  Tournament,
  TournamentGroup,
  TournamentMatch,
  TournamentTeamRef,
  getConfirmedTeams,
  isDoubleElimStructure,
  isGroupsStructure,
} from '../types';

const GROUP_NAMES = ['GRUPO A', 'GRUPO B', 'GRUPO C', 'GRUPO D', 'GRUPO E', 'GRUPO F', 'GRUPO G', 'GRUPO H'];

export { isDoubleElimStructure, isGroupsStructure };

/** Distribui times nos grupos: resto vai para os primeiros (ex.: 16 em 3 → 6, 5, 5). */
export const distributeTeamsPerGroup = (teamCount: number, groupCount: number): number[] => {
  const groups = Math.max(1, Math.floor(groupCount));
  const total = Math.max(0, Math.floor(teamCount));
  const base = Math.floor(total / groups);
  const remainder = total % groups;
  return Array.from({ length: groups }, (_, i) => base + (i < remainder ? 1 : 0));
};

export const formatGroupDistribution = (teamCount: number, groupCount: number): string => {
  const sizes = distributeTeamsPerGroup(teamCount, groupCount);
  if (teamCount <= 0 || groupCount <= 0) return '';
  const parts = sizes.map((size, i) => {
    const label = GROUP_NAMES[i]?.replace('GRUPO ', '') ?? String(i + 1);
    const teamWord = size === 1 ? 'time' : 'times';
    return `${size} ${teamWord} no grupo ${label}`;
  });
  if (parts.length === 1) return `Com ${teamCount} equipes: ${parts[0]}.`;
  if (parts.length === 2) return `Com ${teamCount} equipes: ${parts[0]} e ${parts[1]}.`;
  return `Com ${teamCount} equipes: ${parts.slice(0, -1).join(', ')} e ${parts[parts.length - 1]}.`;
};

const shuffle = <T,>(list: T[]): T[] => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const emptyStanding = (team: TournamentTeamRef): GroupStanding => ({
  teamId: team.id,
  teamName: team.name,
  teamTag: team.tag,
  teamLogo: team.logo,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  roundsFor: 0,
  roundsAgainst: 0,
  points: 0,
});

const toBracketSide = (team: TournamentTeamRef, score = 0) => ({
  id: team.id,
  name: team.name,
  tag: team.tag,
  logo: team.logo,
  score,
});

const TBD = {
  id: 'tbd',
  name: 'A DEFINIR',
  tag: 'TBD',
  logo: '❓',
  score: 0,
};

const MONTHS_PT = [
  'JAN',
  'FEV',
  'MAR',
  'ABR',
  'MAI',
  'JUN',
  'JUL',
  'AGO',
  'SET',
  'OUT',
  'NOV',
  'DEZ',
] as const;

const MONTH_INDEX: Record<string, number> = {
  JAN: 0,
  FEV: 1,
  MAR: 2,
  ABR: 3,
  MAI: 4,
  JUN: 5,
  JUL: 6,
  AGO: 7,
  SET: 8,
  OUT: 9,
  NOV: 10,
  DEZ: 11,
};

export const formatMatchSchedule = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())} ${MONTHS_PT[date.getMonth()]} ${date.getFullYear()} - ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const parseTournamentStartDate = (startDate?: string): Date => {
  const fallback = new Date();
  fallback.setHours(19, 0, 0, 0);
  if (!startDate?.trim()) return fallback;

  const parts = startDate.trim().toUpperCase().split(/[\s\-]+/);
  const day = Number(parts[0]);
  const month = MONTH_INDEX[parts[1]] ?? fallback.getMonth();
  const year = Number(parts[2]) || fallback.getFullYear();
  if (!day) return fallback;

  const date = new Date(year, month, day, 19, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const ROUND_DAY_OFFSET: Partial<Record<MatchBracketGame['round'], number>> = {
  OITAVAS: 0,
  QUARTAS: 2,
  SEMIFINAL: 4,
  FINAL: 6,
  LB_R1: 1,
  LB_R2: 3,
  LB_R3: 5,
  LB_R4: 6,
  LB_R5: 7,
  LB_R6: 8,
  LB_FINAL: 9,
  GRAND_FINAL: 10,
};

const scheduleMatchDate = (
  base: Date,
  round: MatchBracketGame['round'],
  indexInRound: number
) => {
  const date = new Date(base);
  date.setDate(date.getDate() + (ROUND_DAY_OFFSET[round] ?? 0));
  date.setHours(18 + (indexInRound % 3), indexInRound % 2 === 0 ? 0 : 30, 0, 0);
  return formatMatchSchedule(date);
};

const roundRobinPairs = (teams: TournamentTeamRef[]) => {
  const pairs: [TournamentTeamRef, TournamentTeamRef][] = [];
  for (let i = 0; i < teams.length; i += 1) {
    for (let j = i + 1; j < teams.length; j += 1) {
      pairs.push([teams[i], teams[j]]);
    }
  }
  return pairs;
};

const buildGroups = (
  teams: TournamentTeamRef[],
  tournamentId: string,
  configuredGroupCount?: number
): TournamentGroup[] => {
  const shuffled = shuffle(teams);
  const autoCount = Math.max(2, Math.ceil(shuffled.length / 4));
  const groupCount = Math.min(
    GROUP_NAMES.length,
    Math.max(2, configuredGroupCount ?? autoCount)
  );
  const groups: TournamentGroup[] = Array.from({ length: groupCount }, (_, i) => ({
    id: `${tournamentId}-group-${String.fromCharCode(97 + i)}`,
    name: GROUP_NAMES[i],
    standings: [],
  }));

  shuffled.forEach((team, index) => {
    groups[index % groupCount].standings.push(emptyStanding(team));
  });

  return groups;
};

const buildGroupMatches = (
  groups: TournamentGroup[],
  teamsById: Map<string, TournamentTeamRef>,
  tournamentId: string,
  startDate?: string
): TournamentMatch[] => {
  const matches: TournamentMatch[] = [];
  let matchNumber = 1;
  const scheduleBase = parseTournamentStartDate(startDate);

  groups.forEach((group, groupIndex) => {
    const groupTeams = group.standings
      .map((s) => teamsById.get(s.teamId))
      .filter((t): t is TournamentTeamRef => Boolean(t));

    roundRobinPairs(groupTeams).forEach(([a, b], pairIndex) => {
      const date = new Date(scheduleBase);
      date.setDate(date.getDate() + groupIndex);
      date.setHours(18 + (pairIndex % 3), pairIndex % 2 === 0 ? 0 : 30, 0, 0);
      matches.push({
        id: `${tournamentId}-m-${matchNumber}`,
        phase: group.name,
        matchNumber,
        team1: { ...toBracketSide(a), isWinner: false },
        team2: { ...toBracketSide(b), isWinner: false },
        status: 'SCHEDULED',
        date: formatMatchSchedule(date),
        format: 'MD1',
      });
      matchNumber += 1;
    });
  });

  return matches;
};

const nextPowerOfTwo = (n: number) => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
};

const bracketRoundForSize = (slotCount: number): MatchBracketGame['round'] => {
  if (slotCount >= 16) return 'OITAVAS';
  if (slotCount >= 8) return 'QUARTAS';
  if (slotCount >= 4) return 'SEMIFINAL';
  return 'FINAL';
};

const seedTeams = (teams: TournamentTeamRef[], size: number) => {
  const seeded = shuffle(teams);
  while (seeded.length < size) {
    seeded.push({
      id: `bye-${seeded.length}`,
      name: 'BYE',
      tag: 'BYE',
      logo: '—',
      playersCount: 0,
    });
  }
  return seeded;
};

/** Quantidade de jogos por rodada da chave inferior (dupla eliminação). */
const getLosersRoundSizes = (size: number): number[] => {
  if (size < 4) return [1];
  const rounds: number[] = [];
  let n = size / 4;
  while (n >= 1) {
    rounds.push(n);
    rounds.push(n);
    n /= 2;
  }
  return rounds;
};

const losersRoundName = (index: number, total: number): MatchBracketGame['round'] => {
  if (index === total - 1) return 'LB_FINAL';
  const names: MatchBracketGame['round'][] = [
    'LB_R1',
    'LB_R2',
    'LB_R3',
    'LB_R4',
    'LB_R5',
    'LB_R6',
  ];
  return names[Math.min(index, names.length - 1)];
};

/** Build single-elim (winners) bracket from teams */
export const buildBracket = (
  teams: TournamentTeamRef[],
  tournamentId: string,
  startDate?: string,
  options?: { idPrefix?: string; bracketSide?: MatchBracketGame['bracketSide'] }
): MatchBracketGame[] => {
  if (teams.length < 2) return [];

  const scheduleBase = parseTournamentStartDate(startDate);
  const size = nextPowerOfTwo(teams.length);
  const seeded = seedTeams(teams, size);
  const idPrefix = options?.idPrefix ?? 'b';
  const bracketSide = options?.bracketSide ?? 'winners';

  const firstRound = bracketRoundForSize(size);
  const firstRoundMatches = size / 2;
  const brackets: MatchBracketGame[] = [];
  let matchNumber = 1;

  for (let i = 0; i < firstRoundMatches; i += 1) {
    const t1 = seeded[i * 2];
    const t2 = seeded[i * 2 + 1];
    const isBye = t1.id.startsWith('bye-') || t2.id.startsWith('bye-');
    brackets.push({
      id: `${tournamentId}-${idPrefix}-${matchNumber}`,
      round: firstRound,
      matchNumber,
      bracketSide,
      team1: t1.id.startsWith('bye-') ? { ...TBD } : toBracketSide(t1),
      team2: t2.id.startsWith('bye-') ? { ...TBD } : toBracketSide(t2),
      status: isBye ? 'COMPLETED' : 'SCHEDULED',
      date: scheduleMatchDate(scheduleBase, firstRound, i),
    });
    matchNumber += 1;
  }

  const roundOrder: MatchBracketGame['round'][] = ['OITAVAS', 'QUARTAS', 'SEMIFINAL', 'FINAL'];
  const startIdx = roundOrder.indexOf(firstRound);
  let prevCount = firstRoundMatches;

  for (let r = startIdx + 1; r < roundOrder.length; r += 1) {
    const count = prevCount / 2;
    if (count < 1) break;
    const round = roundOrder[r];
    for (let i = 0; i < count; i += 1) {
      brackets.push({
        id: `${tournamentId}-${idPrefix}-${matchNumber}`,
        round,
        matchNumber,
        bracketSide,
        team1: { ...TBD },
        team2: { ...TBD },
        status: 'SCHEDULED',
        date: scheduleMatchDate(scheduleBase, round, i),
      });
      matchNumber += 1;
    }
    prevCount = count;
  }

  return brackets;
};

/** Chave de dupla eliminação: superior + inferior + grande final */
export const buildDoubleElimBracket = (
  teams: TournamentTeamRef[],
  tournamentId: string,
  startDate?: string
): MatchBracketGame[] => {
  if (teams.length < 2) return [];

  const scheduleBase = parseTournamentStartDate(startDate);
  const size = nextPowerOfTwo(teams.length);
  const winners = buildBracket(teams, tournamentId, startDate, {
    idPrefix: 'wb',
    bracketSide: 'winners',
  });

  const lbSizes = getLosersRoundSizes(size);
  const losers: MatchBracketGame[] = [];
  let matchNumber = winners.length + 1;

  lbSizes.forEach((count, roundIdx) => {
    const round = losersRoundName(roundIdx, lbSizes.length);
    for (let i = 0; i < count; i += 1) {
      losers.push({
        id: `${tournamentId}-lb-${matchNumber}`,
        round,
        matchNumber,
        bracketSide: 'losers',
        team1: { ...TBD },
        team2: { ...TBD },
        status: 'SCHEDULED',
        date: scheduleMatchDate(scheduleBase, round, i),
      });
      matchNumber += 1;
    }
  });

  const grandFinal: MatchBracketGame = {
    id: `${tournamentId}-gf-1`,
    round: 'GRAND_FINAL',
    matchNumber,
    bracketSide: 'grand',
    team1: { ...TBD },
    team2: { ...TBD },
    status: 'SCHEDULED',
    date: scheduleMatchDate(scheduleBase, 'GRAND_FINAL', 0),
  };

  return [...winners, ...losers, grandFinal];
};

export type GenerateTableResult = {
  groups: TournamentGroup[];
  matches: TournamentMatch[];
  brackets: MatchBracketGame[];
};

const buildKnockoutForStructure = (
  teams: TournamentTeamRef[],
  tournament: Tournament
): MatchBracketGame[] => {
  if (isDoubleElimStructure(tournament.structure)) {
    return buildDoubleElimBracket(teams, tournament.id, tournament.startDate);
  }
  return buildBracket(teams, tournament.id, tournament.startDate, {
    idPrefix: 'b',
    bracketSide: 'winners',
  });
};

/**
 * Gera estrutura automática (grupos + jogos e/ou chave) a partir dos times inscritos.
 */
export const generateTournamentTable = (tournament: Tournament): GenerateTableResult => {
  const teams = getConfirmedTeams(tournament.registeredTeams);
  if (teams.length < 2) {
    return { groups: [], matches: [], brackets: [] };
  }

  const teamsById = new Map(teams.map((t) => [t.id, t]));
  const useGroups = isGroupsStructure(tournament.structure);

  if (useGroups && teams.length >= 4) {
    const groups = buildGroups(teams, tournament.id, tournament.groupCount);
    const matches = buildGroupMatches(groups, teamsById, tournament.id, tournament.startDate);
    const perGroup = Math.max(1, tournament.qualifyPerGroup ?? 2);
    const qualifiersNeeded = Math.min(
      16,
      Math.max(2, groups.length * perGroup)
    );
    const brackets =
      qualifiersNeeded >= 2
        ? buildKnockoutForStructure(
            Array.from({ length: qualifiersNeeded }, (_, i) => ({
              id: `tbd-${i}`,
              name: 'A DEFINIR',
              tag: 'TBD',
              logo: '❓',
              playersCount: 0,
            })),
            tournament
          ).map((b) => ({
            ...b,
            team1: { ...TBD },
            team2: { ...TBD },
            status: 'SCHEDULED' as const,
          }))
        : [];

    return { groups, matches, brackets };
  }

  return {
    groups: [],
    matches: [],
    brackets: buildKnockoutForStructure(teams, tournament),
  };
};

/**
 * Gera apenas a chave mata-mata conforme a estrutura do torneio
 * (eliminação única ou dupla).
 */
export const generateKnockoutBracket = (tournament: Tournament): MatchBracketGame[] => {
  const teams = getConfirmedTeams(tournament.registeredTeams);
  if (teams.length < 2) return [];
  return buildKnockoutForStructure(teams, tournament);
};

export const formatRegistrationDateTime = (date = new Date()) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const teamToRef = (
  team: {
    id: string;
    name: string;
    tag: string;
    logo: string;
    members: { length: number };
  },
  options?: { confirmed?: boolean; registeredAt?: string }
): TournamentTeamRef => ({
  id: team.id,
  name: team.name,
  tag: team.tag,
  logo: team.logo,
  playersCount: team.members.length,
  registeredAt: options?.registeredAt ?? formatRegistrationDateTime(),
  confirmed: options?.confirmed ?? false,
});
