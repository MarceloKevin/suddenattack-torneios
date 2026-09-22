import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  PlusCircle,
  Trophy,
  Users,
  LayoutDashboard,
  Shield,
  ChevronDown,
  TrendingUp,
} from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, currentTeam, logout, toggleUserTeamState, toggleAdminState } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Meu Time', path: '/time', icon: Users },
    { label: 'Torneios', path: '/torneios', icon: Trophy },
    { label: 'Ranking', path: '/ranking', icon: TrendingUp },
  ];

  const guestNavLinks = [{ label: 'Ranking', path: '/ranking', icon: TrendingUp }];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderNavLink = (
    link: { label: string; path: string; icon: React.ComponentType<{ className?: string }> },
    options?: { onClick?: () => void; mobile?: boolean }
  ) => {
    const Icon = link.icon;
    const active = isActive(link.path);
    if (options?.mobile) {
      return (
        <Link
          key={link.path}
          to={link.path}
          onClick={options.onClick}
          className={`flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider ${
            active
              ? 'bg-[#E31B23]/10 text-white border-l-4 border-[#E31B23]'
              : 'text-[#9298A5] hover:text-white'
          }`}
        >
          <Icon className="w-4 h-4 text-[#E31B23]" />
          <span>{link.label}</span>
        </Link>
      );
    }
    return (
      <Link
        key={link.path}
        to={link.path}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-150 border-b-2 ${
          active
            ? 'border-[#E31B23] text-white bg-[#13161D]'
            : 'border-transparent text-[#9298A5] hover:text-white hover:bg-[#13161D]/50'
        }`}
      >
        <Icon className={`w-4 h-4 ${active ? 'text-[#E31B23]' : 'text-[#9298A5]'}`} />
        <span>{link.label}</span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08090D]/95 backdrop-blur-md border-b border-[#272B35]">
      {/* Top HUD line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#E31B23] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Logo size="md" />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {(currentUser ? navLinks : guestNavLinks).map((link) => renderNavLink(link))}
          </nav>

          {/* Right Header Section */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick simulation bar toggle (Evaluation Helper) */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="text-[11px] font-mono uppercase bg-[#181B23] hover:bg-[#202530] text-[#9298A5] hover:text-white border border-[#272B35] px-2.5 py-1.5 flex items-center gap-1.5 transition-colors"
                title="Alternar estados de teste"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#E31B23]"></span>
                MODO TESTE
                <ChevronDown className="w-3 h-3 text-[#9298A5]" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#13161D] border border-[#272B35] shadow-2xl py-2 z-50 text-left">
                  <div className="px-3 py-1 text-[10px] uppercase font-mono text-[#9298A5] border-b border-[#272B35] mb-1">
                    Simulação de Estados
                  </div>
                  <button
                    onClick={() => {
                      toggleUserTeamState();
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors flex items-center justify-between"
                  >
                    <span>Status do Time:</span>
                    <span className="font-bold">{currentTeam ? 'COM TIME' : 'SEM TIME'}</span>
                  </button>
                  <button
                    onClick={() => {
                      toggleAdminState();
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors flex items-center justify-between"
                  >
                    <span>Permissão Admin:</span>
                    <span className="font-bold">{currentUser?.isAdmin ? 'SIM' : 'NÃO'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admin Create Tournament button if Admin */}
            {currentUser?.isAdmin && (
              <Link to="/admin/torneios/novo">
                <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-[#E31B23]" />}>
                  + CRIAR TORNEIO
                </Button>
              </Link>
            )}

            {/* Authenticated User Menu or Guest Links */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 bg-[#13161D] hover:bg-[#181B23] border border-[#272B35] transition-all cursor-pointer"
                >
                  <Avatar
                    src={currentUser.avatar}
                    name={currentUser.nickname}
                    size="sm"
                    status={currentUser.status}
                  />
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                      <span>{currentUser.nickname}</span>
                      {currentUser.isAdmin && (
                        <span className="text-[9px] bg-[#E31B23] text-white px-1 py-0.2 font-mono">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono tracking-wider">
                      ● {currentUser.status.toUpperCase()}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#9298A5] ml-1" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#13161D] border border-[#272B35] shadow-2xl z-50 text-left py-1 divide-y divide-[#272B35]/50 animate-fadeIn">
                    <div className="px-4 py-3 bg-[#0E1016]/80">
                      <p className="text-xs text-[#9298A5]">Conectado como</p>
                      <p className="text-sm font-bold text-white tracking-wider">{currentUser.nickname}</p>
                      <p className="text-[11px] text-[#9298A5] truncate">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/perfil"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#9298A5]" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/time"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors"
                      >
                        <Users className="w-3.5 h-3.5 text-[#9298A5]" />
                        Meu Time {currentTeam ? `[${currentTeam.tag}]` : '(Nenhum)'}
                      </Link>
                      {currentUser.isAdmin && (
                        <Link
                          to="/admin/torneios/novo"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-[#E31B23]" />
                          Painel do Administrador
                        </Link>
                      )}
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#F5F5F5] hover:bg-[#181B23] hover:text-[#E31B23] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#9298A5]" />
                        Configurações
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/20 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    ENTRAR
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="primary" size="sm">
                    CRIAR CONTA
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#9298A5] hover:text-white bg-[#13161D] border border-[#272B35]"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0E1016] border-b border-[#272B35] px-4 pt-3 pb-6 space-y-4 animate-fadeIn">
          {currentUser ? (
            <>
              {/* User quick info */}
              <div className="flex items-center gap-3 p-3 bg-[#13161D] border border-[#272B35]">
                <Avatar
                  src={currentUser.avatar}
                  name={currentUser.nickname}
                  size="md"
                  status={currentUser.status}
                />
                <div className="text-left flex-1">
                  <div className="font-bold text-white text-sm">{currentUser.nickname}</div>
                  <div className="text-xs text-[#9298A5]">{currentUser.name}</div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    ● {currentUser.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Navigation links */}
              <div className="space-y-1">
                {navLinks.map((link) =>
                  renderNavLink(link, {
                    mobile: true,
                    onClick: () => setMobileMenuOpen(false),
                  })
                )}

                {currentUser.isAdmin && (
                  <Link
                    to="/admin/torneios/novo"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold uppercase tracking-wider text-[#E31B23]"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Criar Torneio (Admin)</span>
                  </Link>
                )}
              </div>

              {/* Simulation switchers for mobile testing */}
              <div className="pt-2 border-t border-[#272B35] space-y-2">
                <div className="text-[10px] uppercase font-mono text-[#9298A5]">
                  Alternador de Testes Rápido:
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleUserTeamState}
                    className="flex-1 py-1.5 text-[11px] font-bold bg-[#181B23] border border-[#272B35] text-white"
                  >
                    Time: {currentTeam ? 'Com Time' : 'Sem Time'}
                  </button>
                  <button
                    onClick={toggleAdminState}
                    className="flex-1 py-1.5 text-[11px] font-bold bg-[#181B23] border border-[#272B35] text-white"
                  >
                    Admin: {currentUser.isAdmin ? 'Ativo' : 'Inativo'}
                  </button>
                </div>
              </div>

              {/* Logout Button */}
              <div className="pt-2">
                <Button
                  variant="danger"
                  fullWidth
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  SAIR DA CONTA
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3 pt-2">
              <div className="space-y-1 pb-2">
                {guestNavLinks.map((link) =>
                  renderNavLink(link, {
                    mobile: true,
                    onClick: () => setMobileMenuOpen(false),
                  })
                )}
              </div>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" fullWidth size="md">
                  ENTRAR
                </Button>
              </Link>
              <Link to="/cadastro" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" fullWidth size="md">
                  CRIAR CONTA
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
