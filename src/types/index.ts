export type UserRole = 'player' | 'captain' | 'coach' | 'admin';
export type UserStatus = 'online' | 'in-game' | 'offline';

export interface UserStats {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kdRatio: number;
  headshots: number;
  mvps: number;
}

export interface UserSocialLinks {
  facebook?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  twitch?: string;
  kick?: string;
}

export interface User {
  id: string;
  name: string;
  nickname: string;
  knownAs?: string;
  accountId?: string;
  customUrl?: string;
  description?: string;
  socialLinks?: UserSocialLinks;
  email: string;
  avatar: string;
  banner?: string;
  status: UserStatus;
  role: UserRole;
  isAdmin: boolean;
  teamId?: string;
  stats: UserStats;
  joinedAt: string;
}

export interface TeamMember {
  userId: string;
  nickname: string;
  name: string;
  avatar: string;
  role: 'CAPITÃO' | 'PLAYER' | 'RESERVA' | 'COACH';
  rosterSlot?: 'LINEUP' | 'RESERVA' | 'FORA';
  inGameRole?: 'RIFLE' | 'SNA';
  status: UserStatus;
  joinedDate: string;
  kd: string;
}

export interface FormerTeamMember {
  userId: string;
  nickname: string;
  name: string;
  avatar: string;
  role: 'CAPITÃO' | 'PLAYER' | 'RESERVA' | 'COACH';
  joinedDate: string;
  leftDate: string;
  kd: string;
}

export interface TeamHistory {
  id: string;
  tournamentId: string;
  tournamentName: string;
  result: 'CAMPEÃO' | 'VICE-CAMPEÃO' | 'SEMIFINAL' | 'QUARTAS DE FINAL' | 'FASE DE GRUPOS';
  date: string;
  prize?: string;
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo: string;
  banner?: string;
  description: string;
  captainId: string;
  captainNickname: string;
  maxMembers: number;
  members: TeamMember[];
  formerMembers?: FormerTeamMember[];
  history: TeamHistory[];
  stats: {
    titles: number;
    winRate: number;
    matches: number;
    wins: number;
    losses: number;
    points: number;
  };
  createdAt: string;
}

export type TournamentStatus = 'draft' | 'open' | 'active' | 'finished';
export type TournamentFormat = 'MD1' | 'MD3' | 'MD5';
export type TournamentStructure =
  | 'single_elim'
  | 'double_elim'
  | 'groups_single_elim'
  | 'groups_double_elim';

export const TOURNAMENT_STRUCTURE_LABELS: Record<TournamentStructure, string> = {
  single_elim: 'Mata-mata — eliminação única',
  double_elim: 'Mata-mata — dupla eliminação',
  groups_single_elim: 'Fase de grupos + mata-mata (eliminação única)',
  groups_double_elim: 'Fase de grupos + mata-mata (dupla eliminação)',
};

export const isDoubleElimStructure = (structure?: TournamentStructure) =>
  structure === 'double_elim' || structure === 'groups_double_elim';

export interface TournamentTeamRef {
  id: string;
  name: string;
  tag: string;
  logo: string;
  playersCount: number;
  seed?: number;
  /** Data/hora da inscrição no torneio (ex.: 23/09/2026 14:32) */
  registeredAt?: string;
  /** false = inscrito aguardando; true/undefined = confirmado no campeonato */
  confirmed?: boolean;
}

/** Times confirmados pelo admin (ocupam vaga na chave/tabela) */
export const getConfirmedTeams = (teams: TournamentTeamRef[]) =>
  teams.filter((t) => t.confirmed !== false);

/** Times inscritos ainda não confirmados */
export const getPendingTeams = (teams: TournamentTeamRef[]) =>
  teams.filter((t) => t.confirmed === false);

export interface PlayedMapResult {
  map: string;
  order: number;
  status: 'PICKED' | 'VETO' | 'NOT_PLAYED';
  team1Score: number | null;
  team2Score: number | null;
  image?: string;
}

export type BracketRound =
  | 'OITAVAS'
  | 'QUARTAS'
  | 'SEMIFINAL'
  | 'FINAL'
  | 'LB_R1'
  | 'LB_R2'
  | 'LB_R3'
  | 'LB_R4'
  | 'LB_R5'
  | 'LB_R6'
  | 'LB_FINAL'
  | 'GRAND_FINAL';

export type BracketSide = 'winners' | 'losers' | 'grand';

export interface MatchBracketGame {
  id: string;
  round: BracketRound;
  matchNumber: number;
  /** winners = chave superior; losers = chave inferior; grand = grande final */
  bracketSide?: BracketSide;
  team1: {
    id: string;
    name: string;
    tag: string;
    logo: string;
    score: number;
    isWinner?: boolean;
  };
  team2: {
    id: string;
    name: string;
    tag: string;
    logo: string;
    score: number;
    isWinner?: boolean;
  };
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  date?: string;
  streamUrl?: string;
  playedMaps?: PlayedMapResult[];
  /** Partida decidida por W.O. (walkover) */
  wo?: boolean;
}

export interface MapVetoEntry {
  map: string;
  status: 'AVAILABLE' | 'BANNED_TEAM1' | 'BANNED_TEAM2' | 'PICKED';
}

export interface TournamentMatch {
  id: string;
  phase: string;
  matchNumber: number;
  team1: {
    id: string;
    name: string;
    tag: string;
    logo: string;
    score: number;
    isWinner?: boolean;
  };
  team2: {
    id: string;
    name: string;
    tag: string;
    logo: string;
    score: number;
    isWinner?: boolean;
  };
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  date?: string;
  map?: string;
  format?: string;
  server?: string;
  mapVeto?: MapVetoEntry[];
  playedMaps?: PlayedMapResult[];
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  teamTag: string;
  teamLogo: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  roundsFor: number;
  roundsAgainst: number;
  points: number;
}

export interface TournamentGroup {
  id: string;
  name: string;
  standings: GroupStanding[];
}

export interface TournamentPrizeTier {
  id: string;
  /** single = uma colocação; range = intervalo (ex.: 4–8) */
  type: 'single' | 'range';
  from: number;
  to: number;
  /** Texto livre da premiação, ex.: "R$ 1.000 + 50k player + 300 pontos" */
  reward: string;
}

export interface Tournament {
  id: string;
  name: string;
  tag: string;
  description: string;
  banner?: string;
  status: TournamentStatus;
  format: TournamentFormat;
  /** Estrutura do campeonato (chave / grupos) */
  structure?: TournamentStructure;
  startDate: string;
  endDate: string;
  prizePool: string;
  firstPlacePrize: string;
  secondPlacePrize: string;
  thirdPlacePrize: string;
  /** Tabela flexível de premiação (posições e intervalos) */
  prizeTiers?: TournamentPrizeTier[];
  maxTeams: number;
  registeredTeams: TournamentTeamRef[];
  championTeam?: {
    id: string;
    name: string;
    tag: string;
    logo: string;
  };
  brackets: MatchBracketGame[];
  groups?: TournamentGroup[];
  matches?: TournamentMatch[];
  rules: string[];
  server: string;
}

export interface RecentMatch {
  id: string;
  matchId: string;
  tournamentName: string;
  tournamentId: string;
  opponent: {
    name: string;
    tag: string;
    logo: string;
    country?: string;
  };
  result: 'VITÓRIA' | 'DERROTA';
  myScore: number;
  opponentScore: number;
  map: string;
  date: string;
  duration: string;
}
