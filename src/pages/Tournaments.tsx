import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TournamentCard } from '../components/tournament/TournamentCard';
import { PlusCircle, Search, Trophy } from 'lucide-react';
import rankingBg from '../assets/ranking-bg.png';
import '../components/tournament/Tournaments.css';

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

  const searchActive = (list: typeof tournaments) =>
    list.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="sa-tours">
      <div className="sa-tours__bg" aria-hidden>
        <div
          className="sa-tours__bg-image"
          style={{ backgroundImage: `url(${rankingBg})` }}
        />
        <div className="sa-tours__bg-overlay" />
        <div className="sa-tours__bg-grid" />
      </div>

      <div className="sa-tours__inner">
        <header className="sa-tours-header">
          <div>
            <span className="sa-tours-header__eyebrow">
              <Trophy aria-hidden />
              Calendário competitivo oficial
            </span>
            <h1 className="sa-tours-header__title font-display">Torneios</h1>
            <p className="sa-tours-header__desc">
              Dispute campeonatos e prove que seu time está entre os melhores do
              Sudden Attack.
            </p>
          </div>

          {currentUser?.isAdmin && (
            <Link to="/admin/torneios/novo" className="sa-tours-create">
              <PlusCircle aria-hidden />
              Criar torneio
            </Link>
          )}
        </header>

        <div className="sa-tours-filters">
          <div className="sa-tours-search">
            <Search aria-hidden />
            <input
              type="text"
              placeholder="Buscar campeonato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar campeonato"
            />
          </div>

          <div className="sa-tours-chips" role="group" aria-label="Filtros de torneio">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`sa-tours-chip ${filter === 'all' ? 'is-active' : ''}`}
            >
              Todos ({tournaments.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`sa-tours-chip ${filter === 'active' ? 'is-active' : ''}`}
            >
              Ativos
            </button>
            <button
              type="button"
              onClick={() => setFilter('open')}
              className={`sa-tours-chip ${filter === 'open' ? 'is-active' : ''}`}
            >
              Inscrições
            </button>
            <button
              type="button"
              onClick={() => setFilter('finished')}
              className={`sa-tours-chip ${filter === 'finished' ? 'is-active' : ''}`}
            >
              Finalizados
            </button>
          </div>
        </div>

        {filter !== 'finished' && (
          <section aria-label="Torneios ativos e inscrições">
            <div className="sa-tours-section__head">
              <span className="sa-tours-section__bar" aria-hidden />
              <h2 className="sa-tours-section__title font-display">
                Torneios ativos &amp; inscrições abertas
              </h2>
              <span className="sa-tours-section__line" aria-hidden />
            </div>

            <div className="sa-tours-grid">
              {searchActive(activeTournaments).map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}

        {filter !== 'active' && filter !== 'open' && (
          <section aria-label="Torneios finalizados">
            <div className="sa-tours-section__head">
              <span className="sa-tours-section__bar" aria-hidden />
              <h2 className="sa-tours-section__title font-display">
                Torneios finalizados
              </h2>
              <span className="sa-tours-section__line" aria-hidden />
            </div>

            <div className="sa-tours-grid">
              {searchActive(finishedTournaments).map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
          </section>
        )}

        {filteredTournaments.length === 0 && (
          <div className="sa-tours-empty">
            Nenhum torneio encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
};
