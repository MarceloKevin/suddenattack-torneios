import React, { createContext, useContext, useState } from 'react';
import { User, Team, Tournament, RecentMatch } from '../types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_TOURNAMENTS, MOCK_RECENT_MATCHES } from '../data/mockData';
import { canAssignRosterSlot } from '../utils/rosterHelpers';

interface AuthContextType {
  currentUser: User | null;
  currentTeam: Team | null;
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
  createTeam: (teamData: { name: string; tag: string; description: string; logo: string }) => void;
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
  // Tournament actions
  createTournament: (tournamentData: Partial<Tournament>) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Kevuzin (User 1)
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
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
    setCurrentUser(newUser);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Switch between having a team and not having a team (for demo)
  const toggleUserTeamState = () => {
    if (!currentUser) return;
    if (currentUser.teamId) {
      setCurrentUser({
        ...currentUser,
        teamId: undefined,
      });
    } else {
      setCurrentUser({
        ...currentUser,
        teamId: 'team-sk',
      });
    }
  };

  // Switch between admin and regular player
  const toggleAdminState = () => {
    if (!currentUser) return;
    setCurrentUser({
      ...currentUser,
      isAdmin: !currentUser.isAdmin,
    });
  };

  const switchUser = (userId: string) => {
    const found = MOCK_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
    }
  };

  const createTeam = (teamData: { name: string; tag: string; description: string; logo: string }) => {
    if (!currentUser) return;
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
    setCurrentUser({
      ...currentUser,
      ...data,
      ...(data.nickname ? { nickname: data.nickname.toUpperCase() } : {}),
      ...(data.customUrl !== undefined
        ? { customUrl: data.customUrl.trim().toLowerCase() || undefined }
        : {}),
      ...(data.description !== undefined
        ? { description: data.description.trim() || undefined }
        : {}),
    });
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
      startDate: tournamentData.startDate || '01 NOV 2026',
      endDate: tournamentData.endDate || '10 NOV 2026',
      prizePool: tournamentData.prizePool || 'R$ 1.500',
      firstPlacePrize: 'R$ 1.000',
      secondPlacePrize: 'R$ 350',
      thirdPlacePrize: 'R$ 150',
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
