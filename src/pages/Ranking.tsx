import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Search,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Team } from '../types';
import rankingBg from '../assets/team-lineup-bg.jpg';
import { RankingPodium } from '../components/ranking/RankingPodium';

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const sortTeamsByRanking = (teams: Team[]) =>
  [...teams].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    if (b.stats.titles !== a.stats.titles) return b.stats.titles - a.stats.titles;
    return b.stats.winRate - a.stats.winRate;
  });

type FilterKey = 'todos' | 'ascendendo' | 'titulos' | 'pontos';

const PAGE_SIZE = 7;
const formatPts = (n: number) => n.toLocaleString('pt-BR');


const TableLogo: React.FC<{ logo: string; name: string }> = ({ logo, name }) => (
  <div className="w-[42px] h-[42px] rounded-full overflow-hidden border border-white/15 bg-[#0A1520] flex items-center justify-center shrink-0">
    {isImageSrc(logo) ? (
      <img src={logo} alt={name} className="w-full h-full object-cover" />
    ) : (
      <span className="text-sm">{logo}</span>
    )}
  </div>
);

export const Ranking: React.FC = () => {
  const { teams, currentTeam } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterKey>('todos');
  const [page, setPage] = useState(1);

  const ranked = useMemo(() => sortTeamsByRanking(teams), [teams]);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  const filteredRanked = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let list = ranked.map((team, index) => ({ team, place: index + 1 }));

    if (query) {
      list = list.filter(
        ({ team }) =>
          team.name.toLowerCase().includes(query) ||
          team.tag.toLowerCase().includes(query)
      );
    }

    if (filter === 'titulos') {
      list = [...list].sort((a, b) => b.team.stats.titles - a.team.stats.titles);
    } else if (filter === 'ascendendo') {
      list = [...list].sort((a, b) => a.team.stats.winRate - b.team.stats.winRate);
    }

    return list;
  }, [ranked, searchTerm, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRanked.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredRanked.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'ascendendo', label: 'Ascendendo' },
    { key: 'titulos', label: 'TÃ­tulos' },
    { key: 'pontos', label: 'Pontos' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Full-page cinematic background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url(${rankingBg})`,
          backgroundPosition: 'center top',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,15,24,0.35) 0%, rgba(3,15,24,0.55) 50%, rgba(3,15,24,0.82) 100%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 max-w-[1200px] mx-auto px-[34px] py-8 sm:py-10 space-y-7 text-left">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF174F]">
                Clubes competitivos
              </span>
              <span className="h-px w-10 bg-[#FF174F]" aria-hidden />
            </div>
            <h1 className="mt-2 font-display text-[40px] font-black uppercase tracking-wide text-white leading-[0.95]">
              Ranking
            </h1>
            <p className="mt-2.5 text-[13px] sm:text-[14px] text-[#9BB4C5] max-w-xl">
              ClassificaÃ§Ã£o oficial dos times ordenada pela quantidade de pontos.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-wide text-[#8EA9BB]">
              <span className="inline-flex items-center gap-1.5 text-[#00B4DC]">
                <Trophy className="w-3.5 h-3.5" aria-hidden />
                Ranking oficial
              </span>
              <span className="text-[#4A6070]">Â·</span>
              <span>Temporada 2026</span>
            </div>
          </div>

          <div
            className="shrink-0 inline-flex items-center rounded-full px-3.5 py-1.5 text-[12px] font-extrabold tabular-nums"
            style={{
              color: '#FF174F',
              border: '1px solid #FF174F',
              background: 'rgba(255,23,79,0.04)',
            }}
          >
            5/5
          </div>
        </header>
        <RankingPodium first={first} second={second} third={third} />


        {/* Classification */}
        <section className="space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF174F]">
                ClassificaÃ§Ã£o geral
              </span>
              <h2 className="mt-1 font-display text-[22px] sm:text-[26px] font-black uppercase tracking-wide text-white leading-none">
                Todos os clubes
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative w-full sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00B4DC] pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Pesquisar time..."
                  className="w-full rounded-xl bg-[rgba(3,15,24,0.85)] border border-[rgba(0,180,220,0.25)] pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#6B8494] focus:border-[#FF174F]/50 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {filters.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => {
                        setFilter(f.key);
                        setPage(1);
                      }}
                      className={`px-3.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        active
                          ? 'bg-[#FF174F] text-white border border-[#FF174F]'
                          : 'bg-[rgba(3,15,24,0.7)] text-[#9BB4C5] border border-white/15 hover:border-white/30'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            className="rounded-[15px] overflow-hidden"
            style={{
              background: 'rgba(3,15,24,0.78)',
              border: '1px solid rgba(0,180,220,0.35)',
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap min-w-[740px]">
                <thead>
                  <tr className="border-b border-[rgba(0,180,220,0.15)] text-[10px] font-bold uppercase tracking-[0.14em] text-[#8EA9BB]">
                    <th className="py-3.5 px-5 w-16">Pos</th>
                    <th className="py-3.5 px-4">Clube</th>
                    <th className="py-3.5 px-4 text-center">Pontos</th>
                    <th className="py-3.5 px-4 text-center">TÃ­tulos</th>
                    <th className="py-3.5 px-4 text-center">Partidas</th>
                    <th className="py-3.5 px-4 text-center">V / D</th>
                    <th className="py-3.5 px-5 text-right">Win rate</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 px-4 text-center text-sm text-[#8EA9BB]">
                        Nenhum time encontrado para â€œ{searchTerm.trim()}â€.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map(({ team, place }) => {
                      const isOwn = currentTeam?.id === team.id;
                      const crownColor =
                        place === 1
                          ? 'text-[#FFC107]'
                          : place === 2
                            ? 'text-zinc-300'
                            : place === 3
                              ? 'text-orange-400'
                              : '';

                      return (
                        <tr
                          key={team.id}
                          className="border-t border-[rgba(0,180,220,0.08)]"
                          style={
                            isOwn
                              ? {
                                  background: 'rgba(255,23,79,0.10)',
                                  boxShadow: 'inset 0 0 0 1px rgba(255,23,79,0.7)',
                                }
                              : undefined
                          }
                        >
                          <td className="py-3.5 px-5 font-extrabold tabular-nums text-[#F5F7FA]">
                            <span className="inline-flex items-center gap-1.5">
                              {place <= 3 && (
                                <Crown className={`w-3.5 h-3.5 ${crownColor}`} aria-hidden />
                              )}
                              {String(place).padStart(2, '0')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/time/${team.id}`}
                              className="flex items-center gap-3 group min-w-0"
                            >
                              <TableLogo logo={team.logo} name={team.name} />
                              <div className="min-w-0 flex items-center gap-2 flex-wrap">
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-white group-hover:text-[#FF174F] transition-colors truncate">
                                    {team.name}
                                  </p>
                                  <p className="text-[11px] font-medium text-[#8299AA]">
                                    [{team.tag}]
                                  </p>
                                </div>
                                {isOwn && (
                                  <span className="inline-flex px-2 py-0.5 rounded-full bg-[#FF174F] text-[9px] font-extrabold uppercase tracking-wider text-white">
                                    Seu time
                                  </span>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 text-center font-extrabold text-white tabular-nums">
                            {formatPts(team.stats.points)}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-white tabular-nums">
                            {team.stats.titles}
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-[#9BB4C5] tabular-nums">
                            {team.stats.matches}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-xs tabular-nums">
                            <span className="text-[#00B4DC]">{team.stats.wins}</span>
                            <span className="text-[#5A7080]"> / </span>
                            <span className="text-[#FF174F]">{team.stats.losses}</span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex flex-col items-end gap-1.5 min-w-[92px]">
                              <span className="font-extrabold text-white tabular-nums text-sm">
                                {team.stats.winRate.toFixed(1)}%
                              </span>
                              <div className="w-full h-1 rounded-full bg-white/[0.08] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#00B4DC]"
                                  style={{
                                    width: `${Math.max(0, Math.min(100, team.stats.winRate))}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-[rgba(0,180,220,0.12)]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-[rgba(3,15,24,0.9)] text-[#9BB4C5] flex items-center justify-center disabled:opacity-40"
                  aria-label="PÃ¡gina anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold ${
                      n === currentPage
                        ? 'bg-[#FF174F] text-white'
                        : 'border border-white/15 bg-[rgba(3,15,24,0.9)] text-[#9BB4C5]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg border border-white/15 bg-[rgba(3,15,24,0.9)] text-[#9BB4C5] flex items-center justify-center disabled:opacity-40"
                  aria-label="PrÃ³xima pÃ¡gina"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-[#8EA9BB]">
                {filteredRanked.length} de {ranked.length} times
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
