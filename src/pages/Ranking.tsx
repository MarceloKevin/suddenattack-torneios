import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Team } from '../types';
import { Crown, Medal, Search, Trophy, TrendingUp } from 'lucide-react';

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const sortTeamsByRanking = (teams: Team[]) =>
  [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.titles !== a.stats.titles) return b.stats.titles - a.stats.titles;
    return b.stats.winRate - a.stats.winRate;
  });

const TeamLogo: React.FC<{ logo: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({
  logo,
  name,
  size = 'md',
}) => {
  const dim =
    size === 'xl'
      ? 'w-28 h-28 sm:w-36 sm:h-36'
      : size === 'lg'
        ? 'w-20 h-20 sm:w-24 sm:h-24'
        : size === 'md'
          ? 'w-12 h-12'
          : 'w-9 h-9';

  return (
    <div
      className={`${dim} rounded-full overflow-hidden border-2 border-[#272B35] bg-[#181B23] flex items-center justify-center shrink-0`}
    >
      {isImageSrc(logo) ? (
        <img src={logo} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className={size === 'xl' || size === 'lg' ? 'text-3xl' : 'text-lg'}>{logo}</span>
      )}
    </div>
  );
};

const PodiumCard: React.FC<{
  team: Team;
  place: 1 | 2 | 3;
}> = ({ team, place }) => {
  const config = {
    1: {
      order: 'order-1 sm:order-2',
      height: 'sm:pt-2',
      ring: 'ring-2 ring-amber-400/70',
      placeText: 'text-amber-300',
      bar: 'h-16 sm:h-24 bg-gradient-to-t from-amber-500/40 to-amber-400/10 border-amber-400/40',
      label: '1º',
      icon: <Crown className="w-4 h-4 text-amber-300" />,
      logoSize: 'xl' as const,
      nameSize: 'text-xl sm:text-2xl',
    },
    2: {
      order: 'order-2 sm:order-1',
      height: 'sm:pt-10',
      ring: 'ring-2 ring-zinc-300/50',
      placeText: 'text-zinc-200',
      bar: 'h-12 sm:h-16 bg-gradient-to-t from-zinc-400/30 to-zinc-300/5 border-zinc-400/30',
      label: '2º',
      icon: <Medal className="w-4 h-4 text-zinc-300" />,
      logoSize: 'lg' as const,
      nameSize: 'text-lg sm:text-xl',
    },
    3: {
      order: 'order-3 sm:order-3',
      height: 'sm:pt-14',
      ring: 'ring-2 ring-amber-700/60',
      placeText: 'text-amber-600',
      bar: 'h-10 sm:h-12 bg-gradient-to-t from-amber-800/35 to-amber-700/5 border-amber-700/35',
      label: '3º',
      icon: <Medal className="w-4 h-4 text-amber-600" />,
      logoSize: 'lg' as const,
      nameSize: 'text-lg sm:text-xl',
    },
  }[place];

  return (
    <div className={`flex flex-col items-center ${config.order} ${config.height}`}>
      <Link
        to={`/time/${team.id}`}
        className="group flex flex-col items-center text-center w-full max-w-[220px]"
      >
        <span
          className={`mb-3 text-5xl sm:text-6xl font-display font-bold tracking-tight leading-none drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] ${config.placeText}`}
        >
          {config.label}
        </span>

        <div className="relative mb-3">
          <div className={`rounded-full ${config.ring} p-0.5`}>
            <TeamLogo logo={team.logo} name={team.name} size={config.logoSize} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          {config.icon}
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#9298A5]">
            [{team.tag}]
          </span>
        </div>
        <h3
          className={`${config.nameSize} font-display uppercase tracking-wide text-white group-hover:text-[#E31B23] transition-colors leading-tight`}
        >
          {team.name}
        </h3>
        <p className="mt-3 text-sm sm:text-base font-mono">
          <span className="text-white font-bold text-base sm:text-lg">{team.stats.points}</span>
          <span className="text-[#9298A5]"> pts</span>
          <span className="text-[#9298A5] mx-1.5">·</span>
          <span className="text-white font-bold text-base sm:text-lg">{team.stats.titles}</span>
          <span className="text-[#9298A5]">
            {' '}
            {team.stats.titles === 1 ? 'título' : 'títulos'}
          </span>
        </p>
      </Link>

      <div className={`mt-4 w-full max-w-[200px] border-t ${config.bar}`} />
    </div>
  );
};

export const Ranking: React.FC = () => {
  const { teams, currentTeam } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const ranked = useMemo(() => sortTeamsByRanking(teams), [teams]);
  const top3 = ranked.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const filteredRanked = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return ranked.map((team, index) => ({ team, place: index + 1 }));
    return ranked
      .map((team, index) => ({ team, place: index + 1 }))
      .filter(
        ({ team }) =>
          team.name.toLowerCase().includes(query) ||
          team.tag.toLowerCase().includes(query)
      );
  }, [ranked, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      <div className="pb-6 border-b border-[#272B35]">
        <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          Clãs competitivos
        </span>
        <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white mt-1">
          Ranking
        </h1>
        <p className="text-xs sm:text-sm text-[#9298A5] mt-1 max-w-xl">
          Classificação oficial dos times ordenada pela quantidade de pontos.
        </p>
      </div>

      {/* PÓDIO */}
      {top3.length > 0 && (
        <section className="relative overflow-hidden border border-[#272B35] bg-gradient-to-b from-[#181B23] via-[#13161D] to-[#0E1016] px-4 sm:px-8 pt-10 pb-6">
          <div className="absolute inset-0 tactical-grid opacity-30 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[360px] h-[160px] bg-amber-400/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative text-center mb-8">
            <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-300/90">
              <Trophy className="w-3.5 h-3.5" />
              Top 3 da temporada da temporada 01
            </span>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 items-end justify-items-center">
            {second && <PodiumCard team={second} place={2} />}
            {first && <PodiumCard team={first} place={1} />}
            {third && <PodiumCard team={third} place={3} />}
          </div>
        </section>
      )}

      {/* LISTA */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#272B35] pb-3">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5 min-w-0 flex-1">
            <div className="shrink-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E31B23]">
                Classificação geral
              </span>
              <h2 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-white mt-1">
                Todos os clãs
              </h2>
            </div>
            <div className="relative w-full sm:max-w-xs sm:mb-0.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9298A5] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar time..."
                className="w-full bg-[#0E1016] border border-[#272B35] pl-9 pr-3 py-2 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none focus:ring-1 focus:ring-[#E31B23] transition-colors"
              />
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase text-[#9298A5] shrink-0">
            {filteredRanked.length} {filteredRanked.length === 1 ? 'time' : 'times'}
          </span>
        </div>

        <div className="bg-[#13161D] border border-[#272B35] overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0E1016] border-b border-[#272B35] text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
              <tr>
                <th className="py-3 px-4 w-16">#</th>
                <th className="py-3 px-4">Clã</th>
                <th className="py-3 px-4 text-center">Pontos</th>
                <th className="py-3 px-4 text-center">Títulos</th>
                <th className="py-3 px-4 text-center">Partidas</th>
                <th className="py-3 px-4 text-center">V / D</th>
                <th className="py-3 px-4 text-right">Win rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272B35]/60">
              {filteredRanked.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 px-4 text-center text-sm text-[#9298A5]">
                    Nenhum time encontrado para “{searchTerm.trim()}”.
                  </td>
                </tr>
              ) : (
                filteredRanked.map(({ team, place }) => {
                const isOwn = currentTeam?.id === team.id;
                const placeTone =
                  place === 1
                    ? 'text-amber-300'
                    : place === 2
                      ? 'text-zinc-300'
                      : place === 3
                        ? 'text-amber-600'
                        : 'text-[#9298A5]';

                return (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      isOwn
                        ? 'bg-[#E31B23]/10 hover:bg-[#E31B23]/15'
                        : place <= 3
                          ? 'bg-[#181B23]/80 hover:bg-[#1c2029]'
                          : 'hover:bg-[#181B23]/70'
                    }`}
                  >
                    <td className={`py-3.5 px-4 font-display font-bold text-sm ${placeTone}`}>
                      {place}º
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/time/${team.id}`}
                        className="flex items-center gap-3 group min-w-0"
                      >
                        <TeamLogo logo={team.logo} name={team.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white group-hover:text-[#E31B23] transition-colors truncate">
                            {team.name}
                            {isOwn && (
                              <span className="ml-2 text-[9px] font-mono uppercase tracking-wider text-[#E31B23]">
                                Seu time
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] font-mono text-[#9298A5]">[{team.tag}]</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                      {team.stats.points.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-white">
                      {team.stats.titles}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-300">
                      {team.stats.matches}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      <span className="text-emerald-400">{team.stats.wins}</span>
                      <span className="text-[#9298A5]"> / </span>
                      <span className="text-red-400">{team.stats.losses}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                      {team.stats.winRate.toFixed(1)}%
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
