import React, { createContext, useContext, useState } from 'react';
import { User, Team, Tournament, RecentMatch, TournamentMatch, MatchBracketGame, GameMap, isAdminUserType } from '../types';
import { MOCK_USERS, MOCK_TEAMS, MOCK_TOURNAMENTS, MOCK_RECENT_MATCHES, MOCK_MAPS } from '../data/mockData';
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
  maps: GameMap[];
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
  deleteTeam: (teamId: string) => { ok: boolean; message?: string };
  updateMemberRosterSlot: (
    teamId: string,
    userId: string,
    rosterSlot: 'LINEUP' | 'RESERVA' | 'FORA'
  ) => { ok: boolean; message?: string };
  // Admin actions
  adminUpdateUser: (
    userId: string,
    data: Partial<Pick<User, 'role' | 'userType' | 'isAdmin' | 'status' | 'teamId' | 'accountActive'>>
  ) => void;
  setUserAccountActive: (userId: string, active: boolean) => void;
  updateTournament: (tournamentId: string, data: Partial<Tournament>) => void;
  deleteTournament: (tournamentId: string) => void;
  createMap: (data: { name: string; image: string }) => { ok: boolean; message?: string; id?: string };
  updateMap: (
    mapId: string,
    data: Partial<Pick<GameMap, 'name' | 'image'>>
  ) => { ok: boolean; message?: string };
  generateTournamentTable: (tournamentId: string) => { ok: boolean; message?: string };
  generateTournamentBracket: (tournamentId: string) => { ok: boolean; message?: string };
  setBracketMatchResult: (
    tournamentId: string,
    matchId: string,
    result: BracketMatchResultInput
  ) => { ok: boolean; message?: string; championSet?: boolean };
  releaseMatch: (tournamentId: string, matchId: string) => { ok: boolean; message?: string };
  addMatchEvidence: (
    tournamentId: string,
    matchId: string,
    data: { imageUrl: string; comment: string }
  ) => { ok: boolean; message?: string };
  addMatchChatMessage: (
    tournamentId: string,
    matchId: string,
    text: string
  ) => { ok: boolean; message?: string };
  callMatchAdmin: (
    tournamentId: string,
    matchId: string
  ) => { ok: boolean; message?: string };
  registerTeamForTournament: (
    tournamentId: string,
    roster: { lineupPlayerIds: string[]; reservePlayerIds: string[] }
  ) => { ok: boolean; message?: string };
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
  const [maps, setMaps] = useState<GameMap[]>(MOCK_MAPS);

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
      userType: 'player',
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

  // Switch between admin master and regular player (demo)
  const toggleAdminState = () => {
    if (!currentUser) return;
    const becomingAdmin = !currentUser.isAdmin;
    const next: User = {
      ...currentUser,
      isAdmin: becomingAdmin,
      userType: becomingAdmin ? 'admin_master' : 'player',
    };
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
    data: Partial<Pick<User, 'role' | 'userType' | 'isAdmin' | 'status' | 'teamId' | 'accountActive'>>
  ) => {
    const patched =
      data.userType !== undefined
        ? { ...data, isAdmin: isAdminUserType(data.userType) }
        : data;
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...patched } : u))
    );
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...patched });
    }
  };

  const setUserAccountActive = (userId: string, active: boolean) => {
    if (currentUser?.id === userId && !active) return;
    adminUpdateUser(userId, { accountActive: active, ...(active ? {} : { status: 'offline' }) });
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

    const inBrackets = (tournament.brackets ?? []).some((m) => m.id === matchId);
    if (inBrackets) {
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
    }

    const inMatches = (tournament.matches ?? []).some((m) => m.id === matchId);
    if (!inMatches) {
      return { ok: false, message: 'Partida não encontrada.' };
    }

    const { score1, score2, winner, wo, date } = result;
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournamentId) return t;
        return {
          ...t,
          matches: (t.matches ?? []).map((m) => {
            if (m.id !== matchId) return m;
            const scheduledDate =
              date?.trim() && !/^a definir$/i.test(date.trim())
                ? date.trim()
                : m.date && !/^a definir$/i.test(m.date)
                  ? m.date
                  : undefined;
            return {
              ...m,
              status: 'COMPLETED' as const,
              date: scheduledDate || m.date || 'Encerrado',
              team1: {
                ...m.team1,
                score: wo ? (winner === 'team1' ? Math.max(score1, 1) : 0) : score1,
                isWinner: winner === 'team1',
              },
              team2: {
                ...m.team2,
                score: wo ? (winner === 'team2' ? Math.max(score2, 1) : 0) : score2,
                isWinner: winner === 'team2',
              },
            };
          }),
        };
      })
    );
    return { ok: true };
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

  const deleteTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return { ok: false, message: 'Equipe não encontrada.' };

    setTeams((prev) => prev.filter((t) => t.id !== teamId));
    setUsers((prev) =>
      prev.map((u) => (u.teamId === teamId ? { ...u, teamId: undefined } : u))
    );
    if (currentUser?.teamId === teamId) {
      setCurrentUser({ ...currentUser, teamId: undefined });
    }
    setTournaments((prev) =>
      prev.map((tour) => ({
        ...tour,
        registeredTeams: tour.registeredTeams.filter((t) => t.id !== teamId),
      }))
    );
    return { ok: true };
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

  const addMatchEvidence = (
    tournamentId: string,
    matchId: string,
    data: { imageUrl: string; comment: string }
  ) => {
    if (!data.imageUrl) {
      return { ok: false, message: 'Selecione um print da partida.' };
    }

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };

    const inMatches = (tournament.matches ?? []).some((m) => m.id === matchId);
    const inBrackets = (tournament.brackets ?? []).some((m) => m.id === matchId);
    if (!inMatches && !inBrackets) {
      return { ok: false, message: 'Partida não encontrada.' };
    }

    const now = new Date();
    const uploadedAt = `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const entry = {
      id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      imageUrl: data.imageUrl,
      comment: data.comment.trim(),
      uploadedAt,
      uploadedBy: currentUser?.nickname,
    };

    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournamentId) return t;

        const append = <M extends TournamentMatch | MatchBracketGame>(match: M): M =>
          match.id === matchId
            ? { ...match, evidence: [...(match.evidence ?? []), entry] }
            : match;

        return {
          ...t,
          matches: (t.matches ?? []).map(append),
          brackets: (t.brackets ?? []).map(append),
        };
      })
    );

    return { ok: true };
  };

  const formatDateTimeNow = () => {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(
      now.getMonth() + 1
    ).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
  };

  const patchMatchInTournament = (
    tournamentId: string,
    matchId: string,
    patch: (match: TournamentMatch | MatchBracketGame) => TournamentMatch | MatchBracketGame
  ) => {
    setTournaments((prev) =>
      prev.map((t) => {
        if (t.id !== tournamentId) return t;
        return {
          ...t,
          matches: (t.matches ?? []).map((m) =>
            m.id === matchId ? (patch(m) as TournamentMatch) : m
          ),
          brackets: (t.brackets ?? []).map((m) =>
            m.id === matchId ? (patch(m) as MatchBracketGame) : m
          ),
        };
      })
    );
  };

  const addMatchChatMessage = (
    tournamentId: string,
    matchId: string,
    text: string
  ) => {
    const trimmed = text.trim();
    if (!trimmed) return { ok: false, message: 'Digite uma mensagem.' };
    if (!currentUser) return { ok: false, message: 'Faça login para usar o chat.' };

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };

    const inMatches = (tournament.matches ?? []).some((m) => m.id === matchId);
    const inBrackets = (tournament.brackets ?? []).some((m) => m.id === matchId);
    if (!inMatches && !inBrackets) {
      return { ok: false, message: 'Partida não encontrada.' };
    }

    const message = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId: currentUser.id,
      nickname: currentUser.nickname,
      avatar: currentUser.avatar,
      isAdmin: Boolean(currentUser.isAdmin),
      text: trimmed,
      sentAt: formatDateTimeNow(),
    };

    patchMatchInTournament(tournamentId, matchId, (match) => ({
      ...match,
      chatMessages: [...(match.chatMessages ?? []), message],
    }));

    return { ok: true };
  };

  const callMatchAdmin = (tournamentId: string, matchId: string) => {
    if (!currentUser) return { ok: false, message: 'Faça login para chamar um admin.' };

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };

    const match =
      (tournament.matches ?? []).find((m) => m.id === matchId) ||
      (tournament.brackets ?? []).find((m) => m.id === matchId);
    if (!match) return { ok: false, message: 'Partida não encontrada.' };

    if (match.adminCalled) {
      return { ok: false, message: 'Um admin já foi chamado nesta partida.' };
    }

    const sentAt = formatDateTimeNow();
    const systemMessage = {
      id: `chat-admin-${Date.now()}`,
      userId: 'system',
      nickname: 'SISTEMA',
      text: `${currentUser.nickname} chamou um ADMIN para esta partida.`,
      sentAt,
      system: true,
      isAdmin: false,
    };

    patchMatchInTournament(tournamentId, matchId, (m) => ({
      ...m,
      adminCalled: true,
      adminCalledAt: sentAt,
      adminCalledBy: currentUser.nickname,
      chatMessages: [...(m.chatMessages ?? []), systemMessage],
    }));

    return { ok: true, message: 'Admin alertado com sucesso.' };
  };

  const registerTeamForTournament = (
    tournamentId: string,
    roster: { lineupPlayerIds: string[]; reservePlayerIds: string[] }
  ) => {
    if (!currentUser || !currentTeam) {
      return { ok: false, message: 'Você precisa estar em um time para se inscrever.' };
    }

    const tournament = tournaments.find((t) => t.id === tournamentId);
    if (!tournament) return { ok: false, message: 'Torneio não encontrado.' };
    if (tournament.status !== 'open') {
      return { ok: false, message: 'As inscrições deste torneio não estão abertas.' };
    }

    const { lineupPlayerIds, reservePlayerIds } = roster;
    if (lineupPlayerIds.length !== 5) {
      return { ok: false, message: 'Selecione exatamente 5 jogadores para a Lineup.' };
    }
    if (reservePlayerIds.length !== 2) {
      return { ok: false, message: 'Selecione exatamente 2 jogadores reservas.' };
    }

    const selected = [...lineupPlayerIds, ...reservePlayerIds];
    if (new Set(selected).size !== selected.length) {
      return { ok: false, message: 'Um jogador não pode estar em Lineup e Reserva ao mesmo tempo.' };
    }

    const memberIds = new Set(currentTeam.members.map((m) => m.userId));
    if (selected.some((id) => !memberIds.has(id))) {
      return { ok: false, message: 'Há jogadores inválidos na escalação.' };
    }

    const now = new Date();
    const registeredAt = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const entry = {
      id: currentTeam.id,
      name: currentTeam.name,
      tag: currentTeam.tag,
      logo: currentTeam.logo,
      playersCount: selected.length,
      registeredAt,
      confirmed: false as boolean | undefined,
      lineupPlayerIds: [...lineupPlayerIds],
      reservePlayerIds: [...reservePlayerIds],
    };

    const already = tournament.registeredTeams.some((t) => t.id === currentTeam.id);
    if (already) {
      setTournaments((prev) =>
        prev.map((t) =>
          t.id !== tournamentId
            ? t
            : {
                ...t,
                registeredTeams: t.registeredTeams.map((rt) =>
                  rt.id === currentTeam.id
                    ? {
                        ...rt,
                        playersCount: selected.length,
                        lineupPlayerIds: entry.lineupPlayerIds,
                        reservePlayerIds: entry.reservePlayerIds,
                        registeredAt: rt.registeredAt || registeredAt,
                      }
                    : rt
                ),
              }
        )
      );
      return { ok: true, message: 'Escalação atualizada com sucesso.' };
    }

    const confirmedCount = tournament.registeredTeams.filter((t) => t.confirmed !== false).length;
    if (confirmedCount >= tournament.maxTeams) {
      return { ok: false, message: 'O torneio já atingiu o limite de times.' };
    }

    setTournaments((prev) =>
      prev.map((t) =>
        t.id !== tournamentId
          ? t
          : { ...t, registeredTeams: [...t.registeredTeams, entry] }
      )
    );
    return { ok: true, message: 'Time inscrito. Aguarde a confirmação do admin.' };
  };

  const createMap = (data: { name: string; image: string }): { ok: boolean; message?: string; id?: string } => {
    const name = data.name.trim();
    const image = data.image.trim();
    if (!name) return { ok: false, message: 'Informe o nome do mapa.' };
    if (!image) return { ok: false, message: 'Adicione uma imagem do mapa.' };

    const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');
    const duplicate = maps.some((m) => normalize(m.name) === normalize(name));
    if (duplicate) return { ok: false, message: 'Já existe um mapa com esse nome.' };

    const id = `map-${Date.now()}`;
    setMaps((prev) => [...prev, { id, name, image }]);
    return { ok: true, id };
  };

  const updateMap = (
    mapId: string,
    data: Partial<Pick<GameMap, 'name' | 'image'>>
  ): { ok: boolean; message?: string } => {
    const target = maps.find((m) => m.id === mapId);
    if (!target) return { ok: false, message: 'Mapa não encontrado.' };

    const nextName = data.name !== undefined ? data.name.trim() : target.name;
    const nextImage = data.image !== undefined ? data.image.trim() : target.image;
    if (!nextName) return { ok: false, message: 'Informe o nome do mapa.' };
    if (!nextImage) return { ok: false, message: 'Adicione uma imagem do mapa.' };

    const normalize = (value: string) => value.toLowerCase().replace(/[\s_-]/g, '');
    const duplicate = maps.some(
      (m) => m.id !== mapId && normalize(m.name) === normalize(nextName)
    );
    if (duplicate) return { ok: false, message: 'Já existe um mapa com esse nome.' };

    setMaps((prev) =>
      prev.map((m) =>
        m.id === mapId ? { ...m, name: nextName, image: nextImage } : m
      )
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
      phaseFormats: tournamentData.phaseFormats || {
        groups: 'MD1',
        knockout: tournamentData.format || 'MD3',
        final: 'MD5',
      },
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
        {
          id: `rule-${Date.now()}`,
          title: 'Geral',
          items: [
            'Regras Padrão 5v5 Sudden Attack',
            'Gravação de partidas obrigatória',
            'Proibido softwares ilegais',
          ],
        },
      ],
      registeredTeams: [],
      brackets: [],
      groups: [],
      matches: [],
      mapIds: tournamentData.mapIds ?? [],
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
        maps,
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
        deleteTeam,
        updateMemberRosterSlot,
        adminUpdateUser,
        setUserAccountActive,
        updateTournament,
        deleteTournament,
        createMap,
        updateMap,
        generateTournamentTable,
        generateTournamentBracket,
        setBracketMatchResult,
        releaseMatch,
        addMatchEvidence,
        addMatchChatMessage,
        callMatchAdmin,
        registerTeamForTournament,
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
