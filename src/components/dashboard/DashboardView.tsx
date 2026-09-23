import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Plus,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { RecentMatch, Team, User } from '../../types';
import { EmptyState } from '../ui/EmptyState';
import { FORMAT_TITLES, isImageSrc } from '../profile/shared';
import rankingBg from '../../assets/ranking-bg.png';
import { paths } from '../../utils/paths';
import './Dashboard.css';

const ROLE_LABEL: Record<User['role'], string> = {
  player: 'PLAYER',
  captain: 'CAPITÃO',
  coach: 'COACH',
  admin: 'ADMIN',
};

const TROPHY_CLASS: Record<string, string> = {
  'MIX DO TS': 'sa-dash-trophy--mix',
  DRAFT: 'sa-dash-trophy--draft',
  'SERIE A': 'sa-dash-trophy--serie-a',
  'SERIE B': 'sa-dash-trophy--serie-b',
};

interface DashboardViewProps {
  user: User;
  team: Team | null;
  recentMatches: RecentMatch[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  team,
  recentMatches,
}) => {
  const navigate = useNavigate();
  const { stats } = user;
  const firstName = user.name.split(' ')[0];
  const accountId = user.accountId || `#SA-${user.id.slice(-4)}`;
  const teamRole =
    team?.captainId === user.id
      ? 'CAPITÃO'
      : user.role === 'captain'
        ? 'CAPITÃO'
        : 'PLAYER';

  const maxMatches = Math.max(stats.matches, 1);
  const winPct = Math.max(0, Math.min(100, stats.winRate));
  const winsBar = (stats.wins / maxMatches) * 100;
  const lossesBar = (stats.losses / maxMatches) * 100;

  return (
    <div className="sa-dash">
      <div className="sa-dash__bg" aria-hidden>
        <div
          className="sa-dash__bg-image"
          style={{ backgroundImage: `url(${rankingBg})` }}
        />
        <div className="sa-dash__bg-base" />
        <div className="sa-dash__bg-grid" />
      </div>

      <div className="sa-dash__inner">
        {/* Header */}
        <header className="sa-dash-header">
          <div>
            <span className="sa-dash-header__label">
              Centro de comando // SA Dashboard
            </span>
            <h1 className="sa-dash-header__title font-display">
              Olá, {firstName}
            </h1>
            <p className="sa-dash-header__subtitle">
              Pronto para a próxima partida? Verifique seus dados táticos e o
              calendário de torneios.
            </p>
          </div>
          <div className="sa-dash-header__actions">
            <Link to="/torneios" className="sa-dash-btn sa-dash-btn--primary">
              Ver torneios
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              to={team ? paths.team(team.id) : '/time'}
              className="sa-dash-btn sa-dash-btn--secondary"
            >
              Meu time
            </Link>
          </div>
        </header>

        {/* Profile + Team */}
        <section className="sa-dash-top" aria-label="Perfil e time">
          <article className="sa-dash-panel sa-dash-profile">
            <div className="sa-dash-profile__top">
              <div className="sa-dash-profile__identity">
                <div className="sa-dash-avatar">
                  {isImageSrc(user.avatar) ? (
                    <img src={user.avatar} alt={user.nickname} />
                  ) : (
                    <span className="sa-dash-avatar__fallback">
                      {user.nickname.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span
                    className={`sa-dash-avatar__status sa-dash-avatar__status--${user.status}`}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <div className="sa-dash-profile__nick-row">
                    <h2 className="sa-dash-profile__nick font-display">
                      <Link
                        to={paths.player(user.id)}
                        className="hover:text-[#2DD4BF] transition-colors"
                      >
                        {user.nickname}
                      </Link>
                    </h2>
                    {user.isAdmin && <span className="sa-dash-badge">Admin</span>}
                  </div>
                  <p className="sa-dash-profile__name">{user.name}</p>
                  <div className="sa-dash-profile__meta">
                    <span className="sa-dash-profile__online">
                      <span className="sa-dash-profile__online-dot" aria-hidden />
                      {user.status}
                    </span>
                    <span>Função in-game: {ROLE_LABEL[user.role]}</span>
                  </div>
                </div>
              </div>

              <div className="sa-dash-profile__account">
                <div>
                  Membro desde
                  <strong>{user.joinedAt}</strong>
                </div>
                <div>
                  ID conta
                  <strong>{accountId}</strong>
                </div>
              </div>
            </div>

            <div className="sa-dash-trophies">
              <div className="sa-dash-trophies__head">
                <Trophy aria-hidden />
                <h3 className="font-display">Troféus</h3>
              </div>
              <div className="sa-dash-trophies__grid">
                {FORMAT_TITLES.map((trophy) => (
                  <div
                    key={trophy.label}
                    className={`sa-dash-trophy ${TROPHY_CLASS[trophy.label] ?? ''}`}
                  >
                    <span className="sa-dash-trophy__label">{trophy.label}</span>
                    <span className="sa-dash-trophy__count font-display">
                      {trophy.count}X
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {team ? (
            <article className="sa-dash-panel sa-dash-team">
              <div className="sa-dash-team__head">
                <h3 className="sa-dash-team__title">
                  <Users aria-hidden />
                  Meu time
                </h3>
                <span className="sa-dash-team__tag">TAG: [{team.tag}]</span>
              </div>

              <div className="sa-dash-team__brand">
                <div className="sa-dash-team__logo">
                  {isImageSrc(team.logo) ? (
                    <img src={team.logo} alt={team.name} />
                  ) : (
                    <span>{team.logo}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="sa-dash-team__name font-display">
                    <Link
                      to={paths.team(team.id)}
                      className="hover:text-[#2DD4BF] transition-colors"
                    >
                      {team.name}
                    </Link>
                  </h4>
                  <div className="sa-dash-team__roles">
                    <span>
                      Cargo: <strong>{teamRole}</strong>
                    </span>
                    <span>
                      Capitão: <strong>{team.captainNickname}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <p className="sa-dash-team__desc">{team.description}</p>

              <div className="sa-dash-team__stats">
                <div className="sa-dash-mini">
                  <span className="sa-dash-mini__label">Lineup oficial</span>
                  <span className="sa-dash-mini__value">
                    {team.members.length} / {team.maxMembers} jogadores
                  </span>
                </div>
                <div className="sa-dash-mini">
                  <span className="sa-dash-mini__label">Títulos oficiais</span>
                  <span className="sa-dash-mini__value sa-dash-mini__value--gold">
                    <Trophy className="w-3.5 h-3.5" aria-hidden />
                    {team.stats.titles} campeonatos
                  </span>
                </div>
              </div>

              <div className="sa-dash-team__footer">
                <Link to={paths.team(team.id)} className="sa-dash-btn sa-dash-btn--block">
                  Ver time completo
                  <ArrowRight className="w-4 h-4" aria-hidden />
                </Link>
              </div>
            </article>
          ) : (
            <article className="sa-dash-panel sa-dash-team sa-dash-team--empty">
              <div className="sa-dash-team__empty-icon">
                <Users className="w-6 h-6" aria-hidden />
              </div>
              <h3 className="sa-dash-team__empty-title font-display">
                Você ainda não faz parte de um time
              </h3>
              <p className="sa-dash-team__empty-desc">
                Entre para uma equipe existente ou crie seu próprio time para
                começar a disputar campeonatos oficiais de Sudden Attack.
              </p>
              <div className="sa-dash-team__empty-actions">
                <Link to="/time" className="sa-dash-btn sa-dash-btn--secondary">
                  Buscar time
                </Link>
                <Link to="/time" className="sa-dash-btn sa-dash-btn--primary">
                  <Plus className="w-4 h-4" aria-hidden />
                  Criar um time
                </Link>
              </div>
            </article>
          )}
        </section>

        {/* Stats */}
        <section aria-label="Estatísticas do jogador">
          <div className="sa-dash-section__head">
            <div>
              <span className="sa-dash-section__label">Desempenho individual</span>
              <h2 className="sa-dash-section__title font-display">
                Estatísticas do jogador
              </h2>
            </div>
          </div>

          <div className="sa-dash-stats__grid">
            <div className="sa-dash-stat">
              <div className="sa-dash-stat__top">
                <span className="sa-dash-stat__label">Partidas</span>
                <span className="sa-dash-stat__icon sa-dash-stat__icon--neutral">
                  <Activity aria-hidden />
                </span>
              </div>
              <div className="sa-dash-stat__value font-display">{stats.matches}</div>
              <div className="sa-dash-stat__sub">Disputadas</div>
              <div className="sa-dash-stat__bar">
                <span style={{ width: '100%' }} />
              </div>
            </div>

            <div className="sa-dash-stat sa-dash-stat--wins">
              <div className="sa-dash-stat__top">
                <span className="sa-dash-stat__label">Vitórias</span>
                <span className="sa-dash-stat__icon sa-dash-stat__icon--green">
                  <Trophy aria-hidden />
                </span>
              </div>
              <div className="sa-dash-stat__value font-display">{stats.wins}</div>
              <div className="sa-dash-stat__sub">Conquistadas</div>
              <div className="sa-dash-stat__bar">
                <span style={{ width: `${winsBar}%` }} />
              </div>
            </div>

            <div className="sa-dash-stat sa-dash-stat--losses">
              <div className="sa-dash-stat__top">
                <span className="sa-dash-stat__label">Derrotas</span>
                <span className="sa-dash-stat__icon sa-dash-stat__icon--red">
                  <Target aria-hidden />
                </span>
              </div>
              <div className="sa-dash-stat__value font-display">{stats.losses}</div>
              <div className="sa-dash-stat__sub">Revés</div>
              <div className="sa-dash-stat__bar">
                <span style={{ width: `${lossesBar}%` }} />
              </div>
            </div>

            <div className="sa-dash-stat sa-dash-stat--rate">
              <div className="sa-dash-stat__top">
                <span className="sa-dash-stat__label">Win rate</span>
                <span className="sa-dash-stat__icon sa-dash-stat__icon--red">
                  <Zap aria-hidden />
                </span>
              </div>
              <div className="sa-dash-stat__value font-display">{stats.winRate}%</div>
              <div className="sa-dash-stat__sub">Taxa de vitória</div>
              <div className="sa-dash-stat__bar">
                <span style={{ width: `${winPct}%` }} />
              </div>
            </div>
          </div>
        </section>

        {/* Recent matches */}
        <section aria-label="Partidas recentes">
          <div className="sa-dash-section__head">
            <div>
              <span className="sa-dash-section__label">Últimos confrontos</span>
              <h2 className="sa-dash-section__title font-display">
                Partidas recentes
              </h2>
            </div>
            <Link to="/torneios" className="sa-dash-btn sa-dash-btn--ghost">
              Ver tabelas
              <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>

          {recentMatches.length > 0 ? (
            <div className="sa-dash-matches">
              <div className="sa-dash-matches__scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Campeonato</th>
                      <th>Mapa</th>
                      <th>Adversário</th>
                      <th className="is-center">Resultado</th>
                      <th className="is-center">Placar</th>
                      <th className="is-right">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMatches.map((match) => {
                      const isWin = match.result === 'VITÓRIA';
                      const matchPath = paths.tournamentMatch(
                        match.tournamentId,
                        match.matchId,
                      );
                      return (
                        <tr
                          key={match.id}
                          className="sa-dash-matches__row"
                          role="link"
                          tabIndex={0}
                          aria-label={`Abrir partida contra ${match.opponent.name}`}
                          onClick={() => navigate(matchPath)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(matchPath);
                            }
                          }}
                        >
                          <td>
                            <Link
                              to={paths.tournament(match.tournamentId)}
                              className="sa-dash-matches__tournament"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {match.tournamentName}
                            </Link>
                          </td>
                          <td>
                            <span className="sa-dash-matches__map">{match.map}</span>
                          </td>
                          <td>
                            <span className="sa-dash-matches__opp">
                              <span>{match.opponent.logo}</span>
                              <span>{match.opponent.name}</span>
                              <span className="sa-dash-matches__opp-tag">
                                [{match.opponent.tag}]
                              </span>
                            </span>
                          </td>
                          <td className="is-center">
                            <span
                              className={`sa-dash-pill ${
                                isWin ? 'sa-dash-pill--win' : 'sa-dash-pill--loss'
                              }`}
                            >
                              {match.result}
                            </span>
                          </td>
                          <td className="is-center">
                            <span className="sa-dash-score">
                              <span
                                className={
                                  isWin ? 'sa-dash-score--win' : 'sa-dash-score--loss'
                                }
                              >
                                {match.myScore}
                              </span>
                              <span className="sa-dash-score__sep">x</span>
                              <span
                                className={
                                  isWin ? 'sa-dash-score--muted' : 'sa-dash-score--win'
                                }
                              >
                                {match.opponentScore}
                              </span>
                            </span>
                          </td>
                          <td className="is-right">
                            <span className="sa-dash-matches__date">{match.date}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<Swords className="w-8 h-8" />}
              title="VOCÊ AINDA NÃO JOGOU NENHUMA PARTIDA"
              description="Suas partidas aparecerão aqui quando você participar de um campeonato oficial."
              actionText="INSCREVER EM TORNEIO"
              onAction={() => {
                window.location.href = '/torneios';
              }}
            />
          )}
        </section>
      </div>
    </div>
  );
};
