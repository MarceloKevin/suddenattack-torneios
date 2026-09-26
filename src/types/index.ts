export type UserRole = 'player' | 'captain' | 'coach' | 'admin';
/** Tipo de conta na plataforma (poderes / título) */
export type UserType =
  | 'admin_master'
  | 'admin_full'
  | 'admin'
  | 'streamer'
  | 'player';
export type UserStatus = 'online' | 'in-game' | 'offline';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  admin_master: 'Admin Master',
  admin_full: 'Admin Full',
  admin: 'Admin',
  streamer: 'Streamer',
  player: 'Player',
};

export const USER_TYPE_DESCRIPTIONS: Record<UserType, string> = {
  admin_master: 'Admin com 100% de poder sobre o sistema',
  admin_full:
    'Admin abaixo do Admin Master; pode tudo menos colocar outros usuários como Admin Master',
  admin: 'Admin normal; pode administrar os torneios',
  streamer: 'Apenas o título de streamer, sem poder de admin',
  player: 'Perfil normal do player, sem poder de admin',
};

export const USER_TYPE_OPTIONS = (
  Object.keys(USER_TYPE_LABELS) as UserType[]
).map((value) => ({
  value,
  label: USER_TYPE_LABELS[value],
  description: USER_TYPE_DESCRIPTIONS[value],
}));

export const isAdminUserType = (type?: UserType | null) =>
  type === 'admin_master' || type === 'admin_full' || type === 'admin';

export const resolveUserType = (user: {
  userType?: UserType;
  isAdmin?: boolean;
  role?: UserRole;
}): UserType => {
  if (user.userType) return user.userType;
  if (user.isAdmin || user.role === 'admin') return 'admin_master';
  return 'player';
};

export const canManageUserTypes = (actorType: UserType) =>
  actorType === 'admin_master' || actorType === 'admin_full';

/** Admin Full não promove/demove Admin Master; Admin comum não altera tipos. */
export const canAssignUserType = (
  actorType: UserType,
  targetCurrentType: UserType,
  nextType: UserType
) => {
  if (actorType === 'admin_master') return true;
  if (actorType === 'admin_full') {
    if (targetCurrentType === 'admin_master') return false;
    if (nextType === 'admin_master') return false;
    return true;
  }
  return false;
};

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
  /** Papel no time / legado (capitão, player…) — não é o tipo de conta admin */
  role: UserRole;
  /** Tipo de usuário na plataforma (Admin Master, Streamer, Player…) */
  userType?: UserType;
  isAdmin: boolean;
  /** false = conta desativada pelo admin (permanece no sistema) */
  accountActive?: boolean;
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

export const TOURNAMENT_FORMAT_LABELS: Record<TournamentFormat, string> = {
  MD1: 'MD1 (Melhor de 1 — tiro curto)',
  MD3: 'MD3 (Melhor de 3 — padrão)',
  MD5: 'MD5 (Melhor de 5 — maratona)',
};

/** Formatos de série por fase do campeonato */
export interface TournamentPhaseFormats {
  groups: TournamentFormat;
  knockout: TournamentFormat;
  final: TournamentFormat;
}

export const DEFAULT_PHASE_FORMATS: TournamentPhaseFormats = {
  groups: 'MD1',
  knockout: 'MD3',
  final: 'MD5',
};

export const resolvePhaseFormats = (tournament: {
  format?: TournamentFormat;
  phaseFormats?: Partial<TournamentPhaseFormats>;
}): TournamentPhaseFormats => ({
  groups: tournament.phaseFormats?.groups ?? DEFAULT_PHASE_FORMATS.groups,
  knockout:
    tournament.phaseFormats?.knockout ?? tournament.format ?? DEFAULT_PHASE_FORMATS.knockout,
  final: tournament.phaseFormats?.final ?? DEFAULT_PHASE_FORMATS.final,
});

export const isDoubleElimStructure = (structure?: TournamentStructure) =>
  structure === 'double_elim' || structure === 'groups_double_elim';

export const isGroupsStructure = (structure?: TournamentStructure) =>
  structure === 'groups_single_elim' || structure === 'groups_double_elim';

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
  /** IDs dos 5 titulares escalados para o torneio */
  lineupPlayerIds?: string[];
  /** IDs dos 2 reservas escalados para o torneio */
  reservePlayerIds?: string[];
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

export interface MatchEvidence {
  id: string;
  /** Data URL ou URL da imagem do print */
  imageUrl: string;
  comment: string;
  /** Ex.: 23/09/2026 16:42 */
  uploadedAt: string;
  uploadedBy?: string;
}

export interface MatchChatMessage {
  id: string;
  userId: string;
  nickname: string;
  avatar?: string;
  isAdmin?: boolean;
  text: string;
  /** Ex.: 23/09/2026 16:42 */
  sentAt: string;
  /** Mensagem automática do sistema (ex.: alerta admin) */
  system?: boolean;
}

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
  /** Prints enviados como prova do resultado */
  evidence?: MatchEvidence[];
  /** Chat da partida */
  chatMessages?: MatchChatMessage[];
  /** Admin foi chamado para atender a partida */
  adminCalled?: boolean;
  adminCalledAt?: string;
  adminCalledBy?: string;
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
  /** Prints enviados como prova do resultado */
  evidence?: MatchEvidence[];
  /** Chat da partida */
  chatMessages?: MatchChatMessage[];
  /** Admin foi chamado para atender a partida */
  adminCalled?: boolean;
  adminCalledAt?: string;
  adminCalledBy?: string;
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

/** Tópico do regulamento (ex.: Formato, Armas, Pontualidade) */
export interface TournamentRuleTopic {
  id: string;
  title: string;
  /** Itens / cláusulas do tópico */
  items: string[];
}

export interface Tournament {
  id: string;
  name: string;
  tag: string;
  description: string;
  banner?: string;
  status: TournamentStatus;
  /** Formato principal (legado / resumo; preferir phaseFormats) */
  format: TournamentFormat;
  /** Formatos por fase: grupos, mata-mata e final */
  phaseFormats?: Partial<TournamentPhaseFormats>;
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
  /** Regulamento organizado por tópicos */
  rules: TournamentRuleTopic[];
  server: string;
  /** IDs dos mapas do catálogo que entram no pool do torneio */
  mapIds?: string[];
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

/** Catálogo de mapas administráveis (veto / partidas) */
export interface GameMap {
  id: string;
  name: string;
  image: string;
}
