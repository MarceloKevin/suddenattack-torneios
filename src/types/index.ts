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

export interface TournamentTeamRef {
  id: string;
  name: string;
  tag: string;
  logo: string;
  playersCount: number;
  seed?: number;
}

export interface MatchBracketGame {
  id: string;
  round: 'OITAVAS' | 'QUARTAS' | 'SEMIFINAL' | 'FINAL';
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
  streamUrl?: string;
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

export interface Tournament {
  id: string;
  name: string;
  tag: string;
  description: string;
  banner?: string;
  status: TournamentStatus;
  format: TournamentFormat;
  startDate: string;
  endDate: string;
  prizePool: string;
  firstPlacePrize: string;
  secondPlacePrize: string;
  thirdPlacePrize: string;
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
