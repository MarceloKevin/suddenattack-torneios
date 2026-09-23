import React, { createContext, useContext, useState } from 'react';
import { User, Team, Tournament, RecentMatch, TournamentMatch, MatchBracketGame } from '../types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_TOURNAMENTS, MOCK_RECENT_MATCHES } from '../data/mockData';
import { canAssignRosterSlot } from '../utils/rosterHelpers';
import { generateTournamentTable as buildTable, generateKnockoutBracket as buildKnockout } from '../utils/tournamentGenerator';
import { applyBracketMatchResult, BracketMatchResultInput } from '../utils/bracketHelpers';

interface AuthContextType {
  currentUser: User | null;
  currentTeam: Team | null;
  users: User[];
  teams: Team[];
  tournaments: Tournament[];
  recentMatches: RecentMatch[];
  login: (email: string) => boolean;
  register: (name: string, nickname: string, email: string, knownAs?: string, accountId?: string) => void;
  logout: () => void;
  // Simulation toggles for evaluation/testing
  toggleUserTeamState: () => void;
  toggleAdminState: () => void;
  switchUser: (userId: string) => void;
  // Team actions
  createTeam: (teamData: { name: string; tag: string; description: string; logo: string }) => string | undefined;
  requestJoinTeam: (teamId: string) => void;
  leaveTeam: () => void;
  updateUserProfile: (
    data: Partial<Pick<User, 'name' | 'nickname' | 'knownAs' | 'avatar' | 'banner' | 'email' | 'accountId' | 'customUrl' | 'description' | 'socialLinks'>>
  ) => void;
  updateTeamProfile: (
    teamId: string,
    data: Partial<Pick<Team, 'name' | 'tag' | 'description' | 'logo' | 'banner'>>
  ) => void;
  updateMemberRosterSlot: (
    teamId: string,
    userId: string,
    rosterSlot: 'LINEUP' | 'RESERVA' | 'FORA'
  ) => { ok: boolean; message?: string };
  // Admin actions
  adminUpdateUser: (
    userId: string,
    data: Partial<Pick<User, 'role' | 'isAdmin' | 'status' | 'teamId'>>
  ) => void;
  deleteUser: (userId: string) => void;
  updateTournament: (tournamentId: string, data: Partial<Tournament>) => void;
  deleteTournament: (tournamentId: string) => void;
  generateTournamentTable: (tournamentId: string) => { ok: boolean; message?: string };
  generateTournamentBracket: (tournamentId: string) => { ok: boolean; message?: string };
  setBracketMatchResult: (
    tournamentId: string,
    matchId: string,
    result: BracketMatchResultInput
  ) => { ok: boolean; message?: string; championSet?: boolean };
  releaseMatch: (tournamentId: string, matchId: string) => { ok: boolean; message?: string };
  // Tournament actions
  createTournament: (tournamentData: Partial<Tournament>) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Kevuzin (User 1)
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [recentMatches] = useState<RecentMatch[]>(MOCK_RECENT_MATCHES);

  // Sync currentTeam whenever currentUser or teams change
  const currentTeam = currentUser?.teamId
    ? teams.find((t) => t.id === currentUser.teamId) || null
    : null;

  const login = (_email: string): boolean => {
    // In demo, default to Kevuzin
    setCurrentUser(MOCK_USERS[0]);
    return true;
  };

  const register = (name: string, nickname: string, email: string, knownAs?: string, accountId?: string) => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      nickname: nickname.toUpperCase(),
      knownAs: knownAs || undefined,
      accountId: accountId || undefined,
      email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      status: 'online',
      role: 'player',
      isAdmin: false,
      teamId: undefined, // starts without a team
      stats: {
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        kdRatio: 0,
        headshots: 0,
        mvps: 0,
      },
      joinedAt: 'Hoje',
    };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Switch between having a team and not having a team (for demo)
  const toggleUserTeamState = () => {
    if (!currentUser) return;
    const next = currentUser.teamId
      ? { ...currentUser, teamId: undefined }
      : { ...currentUser, teamId: 'team-sk' };
    setCurrentUser(next);
    setUsers((prev) => prev.map((u) => (u.id === next.id ? next : u)));
  };

  // Switch between admin and regular player
  const toggleAdminState = () => {
    if (!currentUser) return;
    const next = { ...currentUser, isAdmin: !currentUser.isAdmin };
    setCurrentUser(next);
    setUsers((prev) => prev.map((u) => (u.id === next.id ? next : u)));
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const createTeam = (teamData: { name: string; tag: string; description: string; logo: string }) => {
    if (!currentUser) return undefined;
    const newTeamId = `team-${Date.now()}`;
    const newTeam: Team = {
      id: newTeamId,
      name: teamData.name,
      tag: teamData.tag.toUpperCase(),
      logo: teamData.logo || '🛡️',
      description: teamData.description,
      captainId: currentUser.id,
      captainNickname: currentUser.nickname,
      maxMembers: 10,
      createdAt: 'Agora',
      stats: {
        titles: 0,
        winRate: 0,
        matches: 0,
        wins: 0,
        losses: 0,
        points: 0,
      },
      members: [
        {
          userId: currentUser.id,
          nickname: currentUser.nickname,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'CAPITÃO',
          rosterSlot: 'LINEUP',
          status: currentUser.status,
          joinedDate: 'Hoje',
          kd: currentUser.stats.kdRatio.toFixed(2),
        },
      ],
      history: [],
      formerMembers: [],
    };

    setTeams([newTeam, ...teams]);
    setCurrentUser({
      ...currentUser,
      teamId: newTeamId,
      role: 'captain',
    });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, teamId: newTeamId, role: 'captain' } : u
      )
    );
    return newTeamId;
  };

  const requestJoinTeam = (teamId: string) => {
    if (!currentUser) return;
    // Add current user to target team for simulation
    const updatedTeams = teams.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          members: [
            ...t.members,
            {
              userId: currentUser.id,
              nickname: currentUser.nickname,
              name: currentUser.name,
              avatar: currentUser.avatar,
              role: 'PLAYER' as const,
              rosterSlot: 'FORA' as const,
              status: currentUser.status,
              joinedDate: 'Hoje',
              kd: currentUser.stats.kdRatio.toFixed(2),
            },
          ],
        };
      }
      return t;
    });

    setTeams(updatedTeams);
    setCurrentUser({
      ...currentUser,
      teamId,
    });
  };

  const leaveTeam = () => {
    if (!currentUser || !currentUser.teamId) return;
    setCurrentUser({
      ...currentUser,
      teamId: undefined,
    });
  };

  const updateUserProfile = (
    data: Partial<Pick<User, 'name' | 'nickname' | 'knownAs' | 'avatar' | 'banner' | 'email' | 'accountId' | 'customUrl' | 'description' | 'socialLinks'>>
  ) => {
    if (!currentUser) return;
    const nextUser: User = {
      ...currentUser,
      ...data,
      ...(data.nickname ? { nickname: data.nickname.toUpperCase() } : {}),
      ...(data.customUrl !== undefined
        ? { customUrl: data.customUrl.trim().toLowerCase() || undefined }
        : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() || undefined }
        : {}),
    };
    setCurrentUser(nextUser);
    setUsers((prev) => prev.map((u) => (u.id === nextUser.id ? nextUser : u)));
  };

  const adminUpdateUser = (
    userId: string,
    data: Partial<Pick<User, 'role' | 'isAdmin' | 'status' | 'teamId'>>
  ) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  const deleteUser = (userId: string) => {
    if (currentUser?.id === userId) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  const updateTournament = (tournamentId: string, data: Partial<Tournament>) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? { ...t, ...data } : t))
    );
  };

  const deleteTournament = (tournamentId: string) => {
    setTournaments((prev) => prev.filter((t) => t.id !== tournamentId));
  };

  const generateTournamentTable = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };
    const confirmedCount = tournament.registeredTeams.filter((t) => t.confirmed !== false).length;
    if (confirmedCount < 2) {
      return { ok: false, message: 'É necessário ao menos 2 times confirmados.' };
    }

    const generated = buildTable(tournament);
    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? {
              ...t,
              groups: generated.groups,
              matches: generated.matches,
              brackets: generated.brackets,
            }
          : t
      )
    );
    return { ok: true };
  };

  const generateTournamentBracket = (tournamentId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };
    const confirmedCount = tournament.registeredTeams.filter((t) => t.confirmed !== false).length;
    if (confirmedCount < 2) {
      return { ok: false, message: 'É necessário ao menos 2 times confirmados.' };
    }

    const brackets = buildKnockout(tournament);
    if (brackets.length === 0) {
      return { ok: false, message: 'Não foi possível gerar a chave mata-mata.' };
    }

    setTournaments((prev) =>
      prev.map((t) =>
        t.id === tournamentId
          ? { ...t, brackets, championTeam: undefined }
          : t
      )
    );
    return { ok: true };
  };

  const setBracketMatchResult = (
    tournamentId: string,
    matchId: string,
    result: BracketMatchResultInput
  ) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };

    const applied = applyBracketMatchResult(tournament, matchId, result);
    if (!applied.ok || !applied.tournament) {
      return { ok: false, message: applied.message || 'Falha ao salvar placar.' };
    }

    setTournaments((prev) =>
      prev.map((t) => (t.id === tournamentId ? applied.tournament! : t))
    );
    return {
      ok: true,
      championSet: Boolean(applied.tournament.championTeam),
    };
  };

  const releaseMatch = (tournamentId: string, matchId: string) => {
    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };

    const inMatches = (tournament.matches ?? []).some((m) => m.id === matchId);
    const inBrackets = (tournament.brackets ?? []).some((m) => m.id === matchId);
    if (!inMatches && !inBrackets) {
      return { ok: false, message: 'Partida não encontrada.' };
    }

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournamentId) return t;

        const releaseSide = <M extends TournamentMatch | MatchBracketGame>(match: M): M =>
          match.id === matchId ? { ...match, status: 'LIVE' } : match;

        return {
          ...t,
          matches: (t.matches ?? []).map(releaseSide),
          brackets: (t.brackets ?? []).map(releaseSide),
        };
      })
    );

    return { ok: true };
  };

  const updateTeamProfile = (
    teamId: string,
    data: Partial<Pick<Team, 'name' | 'tag' | 'description' | 'logo' | 'banner'>>
  ) => {
    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          ...data,
          ...(data.tag ? { tag: data.tag.toUpperCase() } : {}),
        };
      })
    );
  };

  const updateMemberRosterSlot = (
    teamId: string,
    userId: string,
    rosterSlot: 'LINEUP' | 'RESERVA' | 'FORA'
  ) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, message: 'Time não encontrado.' };

    const validation = canAssignRosterSlot(team.members, userId, rosterSlot);
    if (!validation.ok) return validation;

    setTeams(
      teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          members: t.members.map((m) =>
            m.userId === userId
              ? {
                  ...m,
                  rosterSlot,
                  role:
                    m.role === 'CAPITÃO'
                      ? 'CAPITÃO'
                      : rosterSlot === 'RESERVA'
                        ? 'RESERVA'
                        : rosterSlot === 'LINEUP'
                          ? 'PLAYER'
                          : m.role === 'COACH'
                            ? 'COACH'
                            : 'PLAYER',
                }
              : m
          ),
        };
      })
    );

    return { ok: true };
  };

  const createTournament = (tournamentData: Partial<Tournament>): string => {
    const newId = `tour-${Date.now()}`;
    const newTournament: Tournament = {
      id: newId,
      name: tournamentData.name || 'NOVO CAMPEONATO SA',
      tag: (tournamentData.name?.substring(0, 4) || 'TOUR').toUpperCase(),
      description: tournamentData.description || 'Campeonato competitivo oficial da comunidade.',
      status: tournamentData.status || 'open',
      format: tournamentData.format || 'MD3',
      structure: tournamentData.structure || 'single_elim',
      startDate: tournamentData.startDate || '01 NOV 2026',
      endDate: tournamentData.endDate || '10 NOV 2026',
      prizePool: tournamentData.prizePool || 'R$ 1.500',
      firstPlacePrize: tournamentData.firstPlacePrize || 'R$ 1.000',
      secondPlacePrize: tournamentData.secondPlacePrize || 'R$ 350',
      thirdPlacePrize: tournamentData.thirdPlacePrize || 'R$ 150',
      prizeTiers: tournamentData.prizeTiers || [],
      maxTeams: tournamentData.maxTeams || 16,
      server: 'Servidor Oficial SA #02',
      rules: [
        'Regras Padrão 5v5 Sudden Attack',
        'Gravação de partidas obrigatória',
        'Proibido softwares ilegais',
      ],
      registeredTeams: [],
      brackets: [],
      groups: [],
      matches: [],
    };

    setTournaments([newTournament, ...tournaments]);
    return newId;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentTeam,
        users,
        teams,
        tournaments,
        recentMatches,
        login,
        register,
        logout,
        toggleUserTeamState,
        toggleAdminState,
        switchUser,
        createTeam,
        requestJoinTeam,
        leaveTeam,
        updateUserProfile,
        updateTeamProfile,
        updateMemberRosterSlot,
        adminUpdateUser,
        deleteUser,
        updateTournament,
        deleteTournament,
        generateTournamentTable,
        generateTournamentBracket,
        setBracketMatchResult,
        releaseMatch,
        createTournament,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
