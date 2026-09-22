import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { Button } from '../components/ui/Button';
import { PlusCircle, Search, Trophy, CheckCircle, Flame } from 'lucide-react';

export const TournamentsPage: React.FC = () => {
  const { tournaments, currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'open' | 'finished'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeTournaments = tournaments.filter(
    (t) => t.status === 'active' || t.status === 'open'
  );
  const finishedTournaments = tournaments.filter((t) => t.status === 'finished');

  const filteredTournaments = tournaments.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && t.status === 'active';
    if (filter === 'open') return matchesSearch && t.status === 'open';
    if (filter === 'finished') return matchesSearch && t.status === 'finished';
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-left">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#272B35]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> CALENDÁRIO COMPETITIVO OFICIAL
          </span>
          <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white mt-1">
            TORNEIOS
          </h1>
          <p className="text-xs sm:text-sm text-[#9298A5] mt-1 max-w-xl">
            Dispute campeonatos e prove que seu time está entre os melhores do Sudden Attack.
          </p>
        </div>

        {/* Admin only button as requested */}
        {currentUser?.isAdmin && (
          <div className="shrink-0">
            <Link to="/admin/torneios/novo">
              <Button
                variant="primary"
                size="md"
                leftIcon={<PlusCircle className="w-4 h-4" />}
              >
                + CRIAR TORNEIO
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0E1016] p-4 border border-[#272B35]">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9298A5]" />
          <input
            type="text"
            placeholder="Buscar campeonato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#13161D] border border-[#272B35] pl-9 pr-3 py-2 text-xs text-white placeholder-[#9298A5]/60 focus:outline-none focus:border-[#E31B23]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${
              filter === 'all'
                ? 'bg-[#E31B23] text-white border-[#E31B23]'
                : 'bg-[#181B23] text-[#9298A5] border-[#272B35] hover:text-white'
            }`}
          >
            TODOS ({tournaments.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${
              filter === 'active'
                ? 'bg-[#E31B23] text-white border-[#E31B23]'
                : 'bg-[#181B23] text-[#9298A5] border-[#272B35] hover:text-white'
            }`}
          >
            ATIVOS
          </button>
          <button
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${
              filter === 'open'
                ? 'bg-[#E31B23] text-white border-[#E31B23]'
                : 'bg-[#181B23] text-[#9298A5] border-[#272B35] hover:text-white'
            }`}
          >
            INSCRIÇÕES
          </button>
          <button
            onClick={() => setFilter('finished')}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors border ${
              filter === 'finished'
                ? 'bg-[#E31B23] text-white border-[#E31B23]'
                : 'bg-[#181B23] text-[#9298A5] border-[#272B35] hover:text-white'
            }`}
          >
            FINALIZADOS
          </button>
        </div>
      </div>

      {/* SEÇÃO TORNEIOS ATIVOS */}
      {filter !== 'finished' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#272B35]">
            <Flame className="w-5 h-5 text-[#E31B23]" />
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              TORNEIOS ATIVOS &amp; INSCRIÇÕES ABERTAS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTournaments
              .filter((t) =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </div>
        </div>
      )}

      {/* SEÇÃO TORNEIOS FINALIZADOS */}
      {filter !== 'active' && filter !== 'open' && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#272B35]">
            <CheckCircle className="w-5 h-5 text-zinc-400" />
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              TORNEIOS FINALIZADOS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {finishedTournaments
              .filter((t) =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
          </div>
        </div>
      )}

      {filteredTournaments.length === 0 && (
        <div className="text-center py-16 border border-[#272B35] bg-[#0E1016]">
          <p className="text-base text-[#9298A5]">Nenhum torneio encontrado com os filtros atuais.</p>
        </div>
      )}
    </div>
  );
};
