import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Trophy,
  Users,
  LayoutDashboard,
  Shield,
  ChevronDown,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { paths } from '../../utils/paths';
import './Header.css';

const isImageSrc = (value?: string) =>
  !!value &&
  (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

export const Header: React.FC = () => {
  const { currentUser, currentTeam, logout, toggleUserTeamState, toggleAdminState } =
    useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const teamPath = currentTeam ? paths.team(currentTeam.id) : '/time';
  const profilePath = currentUser ? paths.player(currentUser.id) : '/perfil';

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, match: '/dashboard' },
    { label: 'Meu Time', path: teamPath, icon: Users, match: '/time' },
    { label: 'Torneios', path: '/torneios', icon: Trophy, match: '/torneios' },
    { label: 'Ranking', path: '/ranking', icon: TrendingUp, match: '/ranking' },
  ];

  const guestNavLinks = [
    { label: 'Torneios', path: '/torneios', icon: Trophy, match: '/torneios' },
    { label: 'Ranking', path: '/ranking', icon: TrendingUp, match: '/ranking' },
  ];

  const linkActive = (match: string) => location.pathname.startsWith(match);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const statusClass =
    currentUser?.status === 'online'
      ? ''
      : currentUser?.status === 'in-game'
        ? 'sa-header__status-dot--ingame'
        : 'sa-header__status-dot--offline';

  const statusLabel =
    currentUser?.status === 'in-game'
      ? 'IN-GAME'
      : currentUser?.status === 'offline'
        ? 'OFFLINE'
        : 'ONLINE';

  return (
    <header className="sa-header">
      <div className="sa-header__inner">
        <div className="sa-header__brand">
          <Logo size="sm" />
        </div>

        <nav className="sa-header__nav" aria-label="Principal">
          {(currentUser ? navLinks : guestNavLinks).map((link) => {
            const Icon = link.icon;
            const active = linkActive(link.match);
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`sa-header__link ${active ? 'sa-header__link--active' : ''}`}
              >
                <Icon className="sa-header__link-icon" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="sa-header__right">
          {currentUser ? (
            <>
              <button type="button" className="sa-header__bell" aria-label="Notificações">
                <Bell className="w-5 h-5" strokeWidth={2.25} />
                <span className="sa-header__bell-dot" aria-hidden />
              </button>

              <div className="sa-header__profile">
                <button
                  type="button"
                  className="sa-header__profile-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="sa-header__avatar">
                    {isImageSrc(currentUser.avatar) ? (
                      <img src={currentUser.avatar} alt={currentUser.nickname} />
                    ) : (
                      <span className="sa-header__avatar-fallback">
                        {currentUser.nickname.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="sa-header__profile-meta">
                    <div className="sa-header__profile-row">
                      <span className="sa-header__nick">{currentUser.nickname}</span>
                      {currentUser.isAdmin && (
                        <span className="sa-header__admin">ADMIN</span>
                      )}
                    </div>
                    <span className="sa-header__status">
                      <span className={`sa-header__status-dot ${statusClass}`} aria-hidden />
                      {statusLabel}
                    </span>
                  </div>
                  <ChevronDown className="sa-header__chevron" aria-hidden />
                </button>

                {dropdownOpen && (
                  <div className="sa-header__dropdown">
                    <div className="sa-header__dropdown-head">
                      <p>Conectado como</p>
                      <p>{currentUser.nickname}</p>
                    </div>
                    <Link to={profilePath} onClick={() => setDropdownOpen(false)}>
                      <User className="w-3.5 h-3.5" />
                      Meu Perfil
                    </Link>
                    <Link to={teamPath} onClick={() => setDropdownOpen(false)}>
                      <Users className="w-3.5 h-3.5" />
                      Meu Time {currentTeam ? `[${currentTeam.tag}]` : ''}
                    </Link>
                    {currentUser.isAdmin && (
                      <Link to="/dashboard_admin" onClick={() => setDropdownOpen(false)}>
                        <Shield className="w-3.5 h-3.5" />
                        Painel Admin
                      </Link>
                    )}
                    <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                      <Settings className="w-3.5 h-3.5" />
                      Configurações
                    </Link>
                    <div className="sa-header__dropdown-sep" />
                    <button
                      type="button"
                      className="sa-header__dropdown-item"
                      onClick={() => {
                        toggleUserTeamState();
                        setDropdownOpen(false);
                      }}
                    >
                      Time: {currentTeam ? 'Com time' : 'Sem time'}
                    </button>
                    <button
                      type="button"
                      className="sa-header__dropdown-item"
                      onClick={() => {
                        toggleAdminState();
                        setDropdownOpen(false);
                      }}
                    >
                      Admin: {currentUser.isAdmin ? 'Ativo' : 'Inativo'}
                    </button>
                    <div className="sa-header__dropdown-sep" />
                    <button
                      type="button"
                      className="sa-header__dropdown-item"
                      onClick={handleLogout}
                      style={{ color: '#ff6b6b' }}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="sa-header__guest">
              <Link to="/login" className="sa-header__guest-link sa-header__guest-link--ghost">
                Entrar
              </Link>
              <Link to="/cadastro" className="sa-header__guest-link sa-header__guest-link--solid">
                Criar Conta
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sa-header__mobile-toggle"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="sa-header__mobile">
          {(currentUser ? navLinks : guestNavLinks).map((link) => {
            const Icon = link.icon;
            const active = linkActive(link.match);
            return (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`sa-header__mobile-link ${
                  active ? 'sa-header__mobile-link--active' : ''
                }`}
              >
                <Icon className="w-4 h-4 text-[#ED1C24]" />
                {link.label}
              </Link>
            );
          })}
          {!currentUser && (
            <div className="flex gap-2 pt-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="sa-header__guest-link sa-header__guest-link--ghost flex-1 justify-center border border-[#30343D]"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="sa-header__guest-link sa-header__guest-link--solid flex-1 justify-center"
              >
                Criar Conta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
