import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Eye,
  Pencil,
  PlusCircle,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  TournamentStatus,
  TOURNAMENT_STRUCTURE_LABELS,
  UserRole,
  getConfirmedTeams,
} from '../../types';
import rankingBg from '../../assets/ranking-bg.png';
import './AdminDashboard.css';

type AdminTab = 'users' | 'tournaments';
type UserFilter = 'all' | 'admins' | 'players' | 'no-team';
type TourFilter = 'all' | TournamentStatus;

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'player', label: 'Player' },
  { value: 'captain', label: 'Capitão' },
  { value: 'coach', label: 'Coach' },
  { value: 'admin', label: 'Admin' },
];

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
    adminUpdateUser,
    deleteUser,
    updateTournament,
    deleteTournament,
  } = useAuth();

  const [tab, setTab] = useState<AdminTab>('users');
  const [userQuery, setUserQuery] = useState('');
  const [userFilter, setUserFilter] = useState<UserFilter>('all');
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
    tournaments: tournaments.length,
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

  const confirmDeleteUser = (id: string, nickname: string) => {
    if (id === currentUser.id) return;
    if (window.confirm(`Remover o usuário ${nickname}? Esta ação não pode ser desfeita.`)) {
      deleteUser(id);
    }
  };

  const confirmDeleteTournament = (id: string, name: string) => {
    if (window.confirm(`Excluir o torneio "${name}"? Esta ação não pode ser desfeita.`)) {
      deleteTournament(id);
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
              Gerencie usuários cadastrados e torneios criados na plataforma.
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
            <div className="sa-admin-stat__label">Torneios</div>
            <div className="sa-admin-stat__value">{stats.tournaments}</div>
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
            aria-selected={tab === 'tournaments'}
            className={`sa-admin-tab${tab === 'tournaments' ? ' sa-admin-tab--active' : ''}`}
            onClick={() => setTab('tournaments')}
          >
            <Trophy className="w-4 h-4" aria-hidden />
            Torneios
            <span className="sa-admin-tab__count">{tournaments.length}</span>
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
                      <th>Função</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Admin</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => {
                      const isSelf = user.id === currentUser.id;
                      return (
                        <tr key={user.id}>
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
                              className="sa-admin-select"
                              value={user.role}
                              aria-label={`Função de ${user.nickname}`}
                              onChange={(e) =>
                                adminUpdateUser(user.id, {
                                  role: e.target.value as UserRole,
                                })
                              }
                            >
                              {ROLE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <span className="sa-admin-email">
                              {user.teamId
                                ? teamNameById.get(user.teamId) || user.teamId
                                : '—'}
                            </span>
                          </td>
                          <td>
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
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`sa-admin-btn${user.isAdmin ? ' sa-admin-btn--primary' : ''}`}
                              disabled={isSelf && user.isAdmin}
                              title={
                                isSelf && user.isAdmin
                                  ? 'Você não pode remover o próprio admin'
                                  : undefined
                              }
                              onClick={() =>
                                adminUpdateUser(user.id, { isAdmin: !user.isAdmin })
                              }
                            >
                              {user.isAdmin ? (
                                <>
                                  <Shield className="w-3.5 h-3.5" aria-hidden />
                                  Sim
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="w-3.5 h-3.5" aria-hidden />
                                  Não
                                </>
                              )}
                            </button>
                          </td>
                          <td>
                            <div className="sa-admin-actions">
                              <Link
                                to="/perfil"
                                className="sa-admin-btn sa-admin-btn--ghost"
                                title="Ver perfil"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden />
                              </Link>
                              <button
                                type="button"
                                className="sa-admin-btn sa-admin-btn--danger"
                                disabled={isSelf}
                                title={isSelf ? 'Não é possível remover a si mesmo' : 'Remover'}
                                onClick={() => confirmDeleteUser(user.id, user.nickname)}
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden />
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
      </div>
    </div>
  );
};
