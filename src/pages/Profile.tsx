import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Activity,
  ArrowRight,
  Camera,
  Edit,
  ImagePlus,
  Shield,
  Swords,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { SOCIAL_NETWORKS, buildSocialUrl } from '../utils/socialNetworks';

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&q=80';

const BrazilFlag: React.FC = () => (
  <span
    className="inline-block w-[18px] h-[13px] rounded-[1px] overflow-hidden shrink-0 border border-black/30 align-middle"
    title="Brasil"
    aria-label="Brasil"
  >
    <svg viewBox="0 0 22 15" className="w-full h-full block">
      <rect width="22" height="15" fill="#009B3A" />
      <polygon points="11,1.5 20,7.5 11,13.5 2,7.5" fill="#FEDF00" />
      <circle cx="11" cy="7.5" r="3.2" fill="#002776" />
    </svg>
  </span>
);

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    reader.readAsDataURL(file);
  });

const TROPHIES = [
  { label: 'MIX DO TS', count: '5X', highlight: true },
  { label: 'DRAFT', count: '3X', highlight: false },
  { label: 'SERIE A', count: '2X', highlight: false },
  { label: 'SERIE B', count: '5X', highlight: false },
];

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentTeam, recentMatches, updateUserProfile } = useAuth();
  const [feedback, setFeedback] = useState('');

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="ACESSO NÃO AUTORIZADO"
          description="Faça login para visualizar o perfil do jogador."
          actionText="FAZER LOGIN"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  const { stats } = currentUser;
  const accountId = currentUser.accountId || `#SA-${currentUser.id.slice(-4)}`;
  const bannerSrc = currentUser.banner || DEFAULT_BANNER;
  const teamRole =
    currentTeam?.captainId === currentUser.id
      ? 'CAPITÃO'
      : currentUser.role === 'captain'
        ? 'CAPITÃO'
        : 'PLAYER';

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs">
          {feedback}
        </div>
      )}

      {/* BANNER + SIDEBAR + TROFÉUS */}
      <section className="relative">
        {/* Neon banner — maior */}
        <div
          className="relative h-52 sm:h-64 md:h-72 overflow-hidden"
          style={{
            padding: 2,
            background:
              'linear-gradient(90deg, #f5d565 0%, #e31b7a 35%, #7c3aed 65%, #22d3ee 100%)',
          }}
        >
          <div className="relative w-full h-full overflow-hidden bg-[#0E1016]">
            <img
              src={bannerSrc}
              alt="Banner do perfil"
              className="absolute inset-0 w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/25" />

            <label className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide bg-black/70 border border-white/15 text-white hover:border-[#E31B23] transition-colors z-10">
              <ImagePlus className="w-3.5 h-3.5 text-[#E31B23]" />
              Banner
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const dataUrl = await readImageFile(file);
                  updateUserProfile({ banner: dataUrl });
                  showFeedback('Banner atualizado');
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-5 lg:gap-8 relative z-10 px-1 sm:px-3">
          {/* LEFT IDENTITY */}
          <aside className="flex flex-col items-center lg:items-start -mt-20 sm:-mt-24 lg:pl-4">
            <div className="relative mx-auto lg:mx-0 mb-5">
              <div
                className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-[3px]"
                style={{
                  background:
                    'conic-gradient(from 200deg, #38bdf8, #818cf8, #e879f9, #38bdf8)',
                  boxShadow: '0 0 28px rgba(56,189,248,0.35)',
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0E1016] ring-2 ring-black/60">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.nickname}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <label className="absolute bottom-1 right-1 cursor-pointer w-9 h-9 bg-[#E31B23] border border-black flex items-center justify-center hover:bg-[#ff2a32] transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await readImageFile(file);
                    updateUserProfile({ avatar: dataUrl });
                    showFeedback('Foto atualizada');
                  }}
                />
              </label>
            </div>

            <div className="w-full space-y-4 px-1 lg:pl-2">
              <div className="space-y-1.5 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight inline-flex items-center gap-2">
                    {currentUser.nickname.toLowerCase()}
                    <BrazilFlag />
                  </h1>
                </div>
                {currentUser.knownAs && (
                  <p className="text-xs text-[#9298A5]">conhecido como {currentUser.knownAs}</p>
                )}
                {currentUser.description && (
                  <p className="text-sm text-[#C8CCD4] leading-relaxed max-w-md mx-auto lg:mx-0">
                    {currentUser.description}
                  </p>
                )}
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                  Membro desde: {currentUser.joinedAt}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  ID Conta: {accountId}
                </p>
                <Link to="/settings" className="inline-block mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                  >
                    EDITAR PERFIL
                  </Button>
                </Link>
              </div>

              <div className="border border-[#272B35] bg-[#0E1016]/80 p-3 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
                  <Shield className="w-3 h-3" />
                  Meu time
                </span>
                {currentTeam ? (
                  <Link
                    to={`/time/${currentTeam.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-11 h-11 bg-[#181B23] border border-[#272B35] overflow-hidden shrink-0 flex items-center justify-center text-xl">
                      {currentTeam.logo.startsWith('http') ||
                      currentTeam.logo.startsWith('data:') ? (
                        <img
                          src={currentTeam.logo}
                          alt={currentTeam.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{currentTeam.logo}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-display uppercase tracking-wide text-white group-hover:text-[#E31B23] transition-colors truncate">
                        {currentTeam.name}
                      </p>
                      <p className="text-[10px] font-mono text-[#9298A5] mt-0.5">
                        CARGO: <span className="text-white">{teamRole}</span>
                      </p>
                    </div>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#9298A5]">Sem time no momento.</p>
                    <Link to="/time">
                      <Button variant="outline" size="sm" fullWidth>
                        ENCONTRAR TIME
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT: TAB + TROPHIES — abaixo do banner */}
          <div className="pt-5 lg:pt-6 space-y-4 min-w-0">
            <div className="flex border-b border-[#272B35]">
              <button
                type="button"
                className="px-4 pb-2.5 text-sm font-semibold text-sky-300 border-b-2 border-sky-400"
              >
                Meu Perfil
              </button>
            </div>

            {currentUser.socialLinks &&
              Object.values(currentUser.socialLinks).some(Boolean) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h2 className="text-sm font-display uppercase tracking-wider text-white">
                      Redes sociais
                    </h2>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {SOCIAL_NETWORKS.filter(
                      (network) => currentUser.socialLinks?.[network.key]
                    ).map((network) => {
                      const handle = currentUser.socialLinks?.[network.key] || '';
                      const href = buildSocialUrl(network.key, handle);
                      return (
                        <a
                          key={network.key}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${network.label}: ${handle}`}
                          className="inline-flex items-center gap-2.5 px-3 py-2 border border-[#272B35] bg-[#0E1016] hover:border-[#E31B23] transition-colors"
                        >
                          {network.icon}
                          <span className="text-xs text-[#C8CCD4] font-mono truncate max-w-[10rem]">
                            {network.prefix}
                            {handle}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-display uppercase tracking-wider text-white">
                  Troféus
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {TROPHIES.map((trophy) => (
                  <div
                    key={trophy.label}
                    className={`p-3.5 bg-[#0E1016] border text-center transition-colors ${
                      trophy.highlight
                        ? 'border-[#E31B23]/70 shadow-[0_0_18px_rgba(227,27,35,0.15)]'
                        : 'border-[#272B35] hover:border-[#E31B23]/35'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-display uppercase tracking-wide font-bold text-white block">
                      {trophy.label}
                    </span>
                    <span className="text-lg sm:text-xl font-display font-bold text-white mt-1 block">
                      {trophy.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div className="mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
            Desempenho individual
          </span>
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            Estatísticas do jogador
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="PARTIDAS"
            value={stats.matches}
            subValue="DISPUTADAS"
            icon={<Activity className="w-4 h-4" />}
          />
          <StatCard
            label="VITÓRIAS"
            value={stats.wins}
            subValue="CONQUISTADAS"
            icon={<Trophy className="w-4 h-4 text-emerald-400" />}
          />
          <StatCard
            label="DERROTAS"
            value={stats.losses}
            subValue="REVÉS"
            icon={<Target className="w-4 h-4 text-red-400" />}
          />
          <StatCard
            label="WIN RATE"
            value={`${stats.winRate}%`}
            subValue="TAXA DE VITÓRIA"
            highlight
            icon={<Zap className="w-4 h-4 text-[#E31B23]" />}
          />
        </div>
      </section>

      {/* RECENT MATCHES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              Últimos confrontos
            </span>
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              Partidas recentes
            </h2>
          </div>
          <Link to="/torneios">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              VER TABELAS
            </Button>
          </Link>
        </div>

        {recentMatches.length > 0 ? (
          <div className="bg-[#13161D] border border-[#272B35] overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0E1016] border-b border-[#272B35] text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                <tr>
                  <th className="py-3 px-4">Campeonato</th>
                  <th className="py-3 px-4">Mapa</th>
                  <th className="py-3 px-4">Adversário</th>
                  <th className="py-3 px-4 text-center">Formato</th>
                  <th className="py-3 px-4 text-center">Placar</th>
                  <th className="py-3 px-4 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272B35]/60">
                {recentMatches.map((match) => {
                  const isWin = match.result === 'VITÓRIA';
                  const detailsPath = `/torneios/${match.tournamentId}/partidas/${match.matchId}`;
                  return (
                    <tr
                      key={match.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => navigate(detailsPath)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(detailsPath);
                        }
                      }}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isWin
                          ? 'bg-emerald-950/55 hover:bg-emerald-900/70'
                          : 'bg-red-950/50 hover:bg-red-900/65'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-white text-xs sm:text-sm">
                        <Link
                          to={`/torneios/${match.tournamentId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-[#E31B23] transition-colors"
                        >
                          {match.tournamentName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-zinc-300">
                        {match.map}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <BrazilFlag />
                          <span>{match.opponent.name}</span>
                          <span className="text-[10px] font-mono text-[#9298A5]">
                            [{match.opponent.tag}]
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-mono font-bold tracking-wider text-white">
                        MD1
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-sm font-bold">
                        <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
                          {match.myScore}
                        </span>{' '}
                        <span className="text-[#9298A5]">x</span>{' '}
                        <span className={!isWin ? 'text-emerald-400' : 'text-zinc-400'}>
                          {match.opponentScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-mono text-[#9298A5]">
                        {match.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Card variant="primary" className="p-8 border-[#272B35]">
            <EmptyState
              icon={<Swords className="w-8 h-8" />}
              title="Nenhuma partida recente"
              description="Suas partidas aparecerão aqui quando você disputar um campeonato."
              actionText="VER TORNEIOS"
              onAction={() => (window.location.href = '/torneios')}
            />
          </Card>
        )}
      </section>
    </div>
  );
};
