import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Map as MapIcon,
  Pencil,
  PlusCircle,
  Search,
  Shield,
  ShieldOff,
  Swords,
  Trash2,
  Trophy,
  UserX,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  TournamentStatus,
  TOURNAMENT_STRUCTURE_LABELS,
  USER_TYPE_OPTIONS,
  UserType,
  canAssignUserType,
  canManageUserTypes,
  getConfirmedTeams,
  resolveUserType,
} from '../../types';
import rankingBg from '../../assets/ranking-bg.png';
import { paths } from '../../utils/paths';
import { isImageSrc } from '../profile/shared';
import { AdminMapsPanel } from './AdminMapsPanel';
import './AdminDashboard.css';

type AdminTab = 'users' | 'teams' | 'tournaments' | 'maps';
type UserFilter = 'all' | 'admins' | 'players' | 'no-team';
type TeamFilter = 'all' | 'full' | 'incomplete' | 'titled';
type TourFilter = 'all' | TournamentStatus;

const STATUS_OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'open', label: 'Inscrições' },
  { value: 'active', label: 'Ativo' },
  { value: 'finished', label: 'Finalizado' },
];

const STATUS_BADGE: Record<TournamentStatus, string> = {
  draft: 'sa-admin-badge--draft',
  open: 'sa-admin-badge--open',
  active: 'sa-admin-badge--active',
  finished: 'sa-admin-badge--finished',
};

const STATUS_LABEL: Record<TournamentStatus, string> = {
  draft: 'Rascunho',
  open: 'Inscrições',
  active: 'Ativo',
  finished: 'Finalizado',
};

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    teams,
    tournaments,
    maps,
    adminUpdateUser,
    setUserAccountActive,
    updateTournament,
    deleteTournament,
    deleteTeam,
    createMap,
    updateMap,
  } = useAuth();

  const [tab, setTab] = useState<AdminTab>('users');
  const [userQuery, setUserQuery] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
  const [teamQuery, setTeamQuery] = useState('');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('all');
  const [tourQuery, setTourQuery] = useState('');
  const [tourFilter, setTourFilter] = useState<TourFilter>('all');

  const teamNameById = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((t) => map.set(t.id, `[${t.tag}] ${t.name}`));
    return map;
  }, [teams]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return users.filter((u) => {
      if (userFilter === 'admins' && !u.isAdmin) return false;
      if (userFilter === 'players' && u.isAdmin) return false;
      if (userFilter === 'no-team' && u.teamId) return false;
      if (!q) return true;
      return (
        u.nickname.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    });
  }, [users, userQuery, userFilter]);

  const filteredTeams = useMemo(() => {
    const q = teamQuery.trim().toLowerCase();
    return teams.filter((t) => {
      const isFull = t.members.length >= t.maxMembers;
      if (teamFilter === 'full' && !isFull) return false;
      if (teamFilter === 'incomplete' && isFull) return false;
      if (teamFilter === 'titled' && t.stats.titles <= 0) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.captainNickname.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [teams, teamQuery, teamFilter]);

  const filteredTournaments = useMemo(() => {
    const q = tourQuery.trim().toLowerCase();
    return tournaments.filter((t) => {
      if (tourFilter !== 'all' && t.status !== tourFilter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.tag.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    });
  }, [tournaments, tourQuery, tourFilter]);

  const stats = {
    users: users.length,
    admins: users.filter((u) => u.isAdmin).length,
    teams: teams.length,
    tournaments: tournaments.length,
    maps: maps.length,
    active: tournaments.filter((t) => t.status === 'active' || t.status === 'open').length,
  };

  if (!currentUser) {
    return (
      <div className="sa-admin">
        <div className="sa-admin__bg" aria-hidden>
          <div className="sa-admin__bg-base" />
        </div>
        <div className="sa-admin-gate">
          <Shield className="sa-admin-gate__icon" aria-hidden />
          <h1>Acesso restrito</h1>
          <p>Faça login para acessar o Painel do Administrador.</p>
          <Link to="/login" className="sa-admin-btn sa-admin-btn--primary">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  if (!currentUser.isAdmin) {
    return (
      <div className="sa-admin">
        <div className="sa-admin__bg" aria-hidden>
          <div className="sa-admin__bg-base" />
        </div>
        <div className="sa-admin-gate">
          <ShieldOff className="sa-admin-gate__icon" aria-hidden />
          <h1>Sem permissão de admin</h1>
          <p>
            Sua conta não tem privilégios administrativos. Use o alternador de testes no header
            para simular um admin, se estiver em modo demo.
          </p>
          <Link to="/dashboard" className="sa-admin-btn sa-admin-btn--primary">
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const actorType = resolveUserType(currentUser);
  const canEditUserTypes = canManageUserTypes(actorType);

  const handleUserTypeChange = (userId: string, nextType: UserType, currentType: UserType) => {
    if (!canAssignUserType(actorType, currentType, nextType)) return;
    adminUpdateUser(userId, { userType: nextType });
  };

  const confirmToggleAccount = (id: string, nickname: string, currentlyActive: boolean) => {
    if (id === currentUser.id) return;
    if (currentlyActive) {
      if (
        window.confirm(
          `Desativar a conta de ${nickname}? O usuário permanecerá no sistema, mas a conta ficará inacessível.`
        )
      ) {
        setUserAccountActive(id, false);
      }
      return;
    }
    if (window.confirm(`Reativar a conta de ${nickname}?`)) {
      setUserAccountActive(id, true);
    }
  };

  const confirmDeleteTournament = (id: string, name: string) => {
    if (window.confirm(`Excluir o torneio "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteTournament(id);
    }
  };

  const confirmDeleteTeam = (id: string, name: string, tag: string) => {
    if (
      !window.confirm(
        `Remover a equipe [${tag}] ${name}?\n\nOs membros ficarão sem time e a equipe sairá das inscrições de torneios.`
      )
    ) {
      return;
    }
    const result = deleteTeam(id);
    if (!result.ok) {
      window.alert(result.message || 'Não foi possível remover a equipe.');
    }
  };

  return (
    <div className="sa-admin">
      <div className="sa-admin__bg" aria-hidden>
        <div
          className="sa-admin__bg-image"
          style={{ backgroundImage: `url(${rankingBg})` }}
        />
        <div className="sa-admin__bg-base" />
        <div className="sa-admin__bg-grid" />
      </div>

      <div className="sa-admin__inner">
        <header className="sa-admin-header">
          <div>
            <span className="sa-admin-header__label">
              Centro de comando // Admin
            </span>
            <h1 className="sa-admin-header__title font-display">
              Painel do Administrador
            </h1>
            <p className="sa-admin-header__subtitle">
              Gerencie usuários, torneios e o catálogo de mapas da plataforma.
            </p>
          </div>
          <div className="sa-admin-header__actions">
            <Link to="/admin/torneios/novo" className="sa-admin-btn sa-admin-btn--primary">
              <PlusCircle className="w-3.5 h-3.5" aria-hidden />
              Criar Torneio
            </Link>
          </div>
        </header>

        <div className="sa-admin-stats">
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Usuários</div>
            <div className="sa-admin-stat__value">{stats.users}</div>
          </div>
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Admins</div>
            <div className="sa-admin-stat__value">{stats.admins}</div>
          </div>
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Equipes</div>
            <div className="sa-admin-stat__value">{stats.teams}</div>
          </div>
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Torneios</div>
            <div className="sa-admin-stat__value">{stats.tournaments}</div>
          </div>
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Mapas</div>
            <div className="sa-admin-stat__value">{stats.maps}</div>
          </div>
          <div className="sa-admin-stat">
            <div className="sa-admin-stat__label">Abertos / Ativos</div>
            <div className="sa-admin-stat__value">{stats.active}</div>
          </div>
        </div>

        <div className="sa-admin-tabs" role="tablist" aria-label="Seções do painel">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'users'}
            className={`sa-admin-tab${tab === 'users' ? ' sa-admin-tab--active' : ''}`}
            onClick={() => setTab('users')}
          >
            <Users className="w-4 h-4" aria-hidden />
            Usuários
            <span className="sa-admin-tab__count">{users.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'teams'}
            className={`sa-admin-tab${tab === 'teams' ? ' sa-admin-tab--active' : ''}`}
            onClick={() => setTab('teams')}
          >
            <Swords className="w-4 h-4" aria-hidden />
            Equipes
            <span className="sa-admin-tab__count">{teams.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'tournaments'}
            className={`sa-admin-tab${tab === 'tournaments' ? ' sa-admin-tab--active' : ''}`}
            onClick={() => setTab('tournaments')}
          >
            <Trophy className="w-4 h-4" aria-hidden />
            Torneios
            <span className="sa-admin-tab__count">{tournaments.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'maps'}
            className={`sa-admin-tab${tab === 'maps' ? ' sa-admin-tab--active' : ''}`}
            onClick={() => setTab('maps')}
          >
            <MapIcon className="w-4 h-4" aria-hidden />
            Mapas
            <span className="sa-admin-tab__count">{maps.length}</span>
          </button>
        </div>

        {tab === 'users' && (
          <section className="sa-admin-panel" aria-label="Gestão de usuários">
            <div className="sa-admin-toolbar">
              <div className="sa-admin-search">
                <Search className="sa-admin-search__icon" aria-hidden />
                <input
                  className="sa-admin-search__input"
                  type="search"
                  placeholder="Buscar nick, nome ou e-mail…"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  aria-label="Buscar usuários"
                />
              </div>
              <div className="sa-admin-filters" role="group" aria-label="Filtros de usuário">
                {(
                  [
                    ['all', 'Todos'],
                    ['admins', 'Admins'],
                    ['players', 'Jogadores'],
                    ['no-team', 'Sem time'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sa-admin-chip${userFilter === key ? ' sa-admin-chip--active' : ''}`}
                    onClick={() => setUserFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sa-admin-table-wrap">
              {filteredUsers.length === 0 ? (
                <div className="sa-admin-empty">Nenhum usuário encontrado.</div>
              ) : (
                <table className="sa-admin-table">
                  <thead>
                    <tr>
                      <th>Usuário</th>
                      <th>E-mail</th>
                      <th>Tipo de usuário</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isSelf = user.id === currentUser.id;
                      const isActive = user.accountActive !== false;
                      const type = resolveUserType(user);
                      const typeLocked =
                        !canEditUserTypes ||
                        !canAssignUserType(actorType, type, type) ||
                        (isSelf && type === 'admin_master');
                      return (
                        <tr key={user.id} className={!isActive ? 'sa-admin-row--inactive' : undefined}>
                          <td>
                            <div className="sa-admin-user">
                              <img
                                className="sa-admin-user__avatar"
                                src={user.avatar}
                                alt=""
                              />
                              <div className="sa-admin-user__meta">
                                <div className="sa-admin-user__nick">{user.nickname}</div>
                                <div className="sa-admin-user__name">{user.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="sa-admin-email">{user.email}</span>
                          </td>
                          <td>
                            <select
                              className="sa-admin-select sa-admin-select--user-type"
                              value={type}
                              disabled={typeLocked}
                              aria-label={`Tipo de usuário de ${user.nickname}`}
                              title={
                                typeLocked
                                  ? actorType === 'admin'
                                    ? 'Admin normal não altera tipos de usuário'
                                    : actorType === 'admin_full' && type === 'admin_master'
                                      ? 'Admin Full não pode alterar Admin Master'
                                      : 'Sem permissão para alterar este tipo'
                                  : USER_TYPE_OPTIONS.find((o) => o.value === type)?.description
                              }
                              onChange={(e) =>
                                handleUserTypeChange(
                                  user.id,
                                  e.target.value as UserType,
                                  type
                                )
                              }
                            >
                              {USER_TYPE_OPTIONS.map((opt) => {
                                const allowed = canAssignUserType(actorType, type, opt.value);
                                return (
                                  <option
                                    key={opt.value}
                                    value={opt.value}
                                    disabled={!allowed}
                                    title={opt.description}
                                  >
                                    {opt.label}
                                  </option>
                                );
                              })}
                            </select>
                            <div className="sa-admin-user-type-hint">
                              {USER_TYPE_OPTIONS.find((o) => o.value === type)?.description}
                            </div>
                          </td>
                          <td>
                            <span className="sa-admin-email">
                              {user.teamId
                                ? teamNameById.get(user.teamId) || user.teamId
                                : '—'}
                            </span>
                          </td>
                          <td>
                            {!isActive ? (
                              <span className="sa-admin-badge sa-admin-badge--inactive">
                                Desativada
                              </span>
                            ) : (
                              <span
                                className={`sa-admin-badge ${
                                  user.status === 'online'
                                    ? 'sa-admin-badge--online'
                                    : user.status === 'in-game'
                                      ? 'sa-admin-badge--ingame'
                                      : 'sa-admin-badge--offline'
                                }`}
                              >
                                {user.status === 'in-game' ? 'In-game' : user.status}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="sa-admin-actions">
                              <Link
                                to={paths.player(user.id)}
                                className="sa-admin-btn sa-admin-btn--ghost"
                                title="Ver perfil"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden />
                              </Link>
                              <button
                                type="button"
                                className={`sa-admin-btn${isActive ? ' sa-admin-btn--danger' : ' sa-admin-btn--primary'}`}
                                disabled={isSelf}
                                title={
                                  isSelf
                                    ? 'Não é possível desativar a própria conta'
                                    : isActive
                                      ? 'Desativar conta'
                                      : 'Ativar conta'
                                }
                                onClick={() =>
                                  confirmToggleAccount(user.id, user.nickname, isActive)
                                }
                              >
                                <UserX className="w-3.5 h-3.5" aria-hidden />
                                {isActive ? 'Desativar conta' : 'Ativar conta'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {tab === 'teams' && (
          <section className="sa-admin-panel" aria-label="Gestão de equipes">
            <div className="sa-admin-toolbar">
              <div className="sa-admin-search">
                <Search className="sa-admin-search__icon" aria-hidden />
                <input
                  className="sa-admin-search__input"
                  type="search"
                  placeholder="Buscar nome, TAG ou capitão…"
                  value={teamQuery}
                  onChange={(e) => setTeamQuery(e.target.value)}
                  aria-label="Buscar equipes"
                />
              </div>
              <div className="sa-admin-filters" role="group" aria-label="Filtros de equipe">
                {(
                  [
                    ['all', 'Todas'],
                    ['full', 'Completas'],
                    ['incomplete', 'Incompletas'],
                    ['titled', 'Com títulos'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sa-admin-chip${teamFilter === key ? ' sa-admin-chip--active' : ''}`}
                    onClick={() => setTeamFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sa-admin-table-wrap">
              {filteredTeams.length === 0 ? (
                <div className="sa-admin-empty">Nenhuma equipe encontrada.</div>
              ) : (
                <table className="sa-admin-table">
                  <thead>
                    <tr>
                      <th>Equipe</th>
                      <th>Capitão</th>
                      <th>Membros</th>
                      <th>Títulos</th>
                      <th>Criada em</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => {
                      const isFull = team.members.length >= team.maxMembers;
                      return (
                        <tr key={team.id}>
                          <td>
                            <div className="sa-admin-user">
                              {isImageSrc(team.logo) ? (
                                <img
                                  className="sa-admin-user__avatar"
                                  src={team.logo}
                                  alt=""
                                />
                              ) : (
                                <span className="sa-admin-team-logo" aria-hidden>
                                  {team.logo || '🛡️'}
                                </span>
                              )}
                              <div className="sa-admin-user__meta">
                                <div className="sa-admin-user__nick">[{team.tag}]</div>
                                <div className="sa-admin-user__name">{team.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="sa-admin-email">{team.captainNickname}</span>
                          </td>
                          <td>
                            <span
                              className={
                                isFull ? 'sa-admin-badge sa-admin-badge--online' : 'sa-admin-email'
                              }
                            >
                              {team.members.length}/{team.maxMembers}
                            </span>
                          </td>
                          <td>{team.stats.titles}</td>
                          <td>
                            <span className="sa-admin-email">{team.createdAt}</span>
                          </td>
                          <td>
                            <div className="sa-admin-actions">
                              <Link
                                to={paths.team(team.id)}
                                className="sa-admin-btn sa-admin-btn--ghost"
                                title="Ver página da equipe"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden />
                                Ver
                              </Link>
                              <button
                                type="button"
                                className="sa-admin-btn sa-admin-btn--danger"
                                title="Remover equipe"
                                onClick={() =>
                                  confirmDeleteTeam(team.id, team.name, team.tag)
                                }
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden />
                                Remover
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {tab === 'tournaments' && (
          <section className="sa-admin-panel" aria-label="Gestão de torneios">
            <div className="sa-admin-toolbar">
              <div className="sa-admin-search">
                <Search className="sa-admin-search__icon" aria-hidden />
                <input
                  className="sa-admin-search__input"
                  type="search"
                  placeholder="Buscar nome ou tag do torneio…"
                  value={tourQuery}
                  onChange={(e) => setTourQuery(e.target.value)}
                  aria-label="Buscar torneios"
                />
              </div>
              <div className="sa-admin-filters" role="group" aria-label="Filtros de torneio">
                {(
                  [
                    ['all', 'Todos'],
                    ['open', 'Inscrições'],
                    ['active', 'Ativos'],
                    ['finished', 'Finalizados'],
                    ['draft', 'Rascunho'],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`sa-admin-chip${tourFilter === key ? ' sa-admin-chip--active' : ''}`}
                    onClick={() => setTourFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sa-admin-table-wrap">
              {filteredTournaments.length === 0 ? (
                <div className="sa-admin-empty">Nenhum torneio encontrado.</div>
              ) : (
                <table className="sa-admin-table">
                  <thead>
                    <tr>
                      <th>Torneio</th>
                      <th>Estrutura</th>
                      <th>Times</th>
                      <th>Período</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTournaments.map((tour) => (
                      <tr key={tour.id}>
                        <td>
                          <div className="sa-admin-tour-name">{tour.name}</div>
                          <div className="sa-admin-tour-meta">
                            {tour.tag} · {tour.format} · {tour.prizePool}
                          </div>
                        </td>
                        <td>
                          <span className="sa-admin-email">
                            {tour.structure
                              ? TOURNAMENT_STRUCTURE_LABELS[tour.structure]
                              : '—'}
                          </span>
                        </td>
                        <td>
                          {getConfirmedTeams(tour.registeredTeams).length}/{tour.maxTeams}
                        </td>
                        <td>
                          <span className="sa-admin-email">
                            {tour.startDate} — {tour.endDate}
                          </span>
                        </td>
                        <td>
                          <div className="sa-admin-actions" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                            <span className={`sa-admin-badge ${STATUS_BADGE[tour.status]}`}>
                              {STATUS_LABEL[tour.status]}
                            </span>
                            <select
                              className="sa-admin-select"
                              value={tour.status}
                              aria-label={`Status de ${tour.name}`}
                              onChange={(e) =>
                                updateTournament(tour.id, {
                                  status: e.target.value as TournamentStatus,
                                })
                              }
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td>
                          <div className="sa-admin-actions">
                            <Link
                              to={`/admin/torneios/${tour.id}/editar`}
                              className="sa-admin-btn sa-admin-btn--primary"
                              title="Editar torneio"
                            >
                              <Pencil className="w-3.5 h-3.5" aria-hidden />
                              Editar torneio
                            </Link>
                            <Link
                              to={`/torneios/${tour.id}`}
                              className="sa-admin-btn"
                              title="Ver torneio"
                            >
                              <Eye className="w-3.5 h-3.5" aria-hidden />
                              Ver
                            </Link>
                            <button
                              type="button"
                              className="sa-admin-btn sa-admin-btn--danger"
                              title="Excluir torneio"
                              onClick={() => confirmDeleteTournament(tour.id, tour.name)}
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {tab === 'maps' && (
          <AdminMapsPanel maps={maps} createMap={createMap} updateMap={updateMap} />
        )}
      </div>
    </div>
  );
};
