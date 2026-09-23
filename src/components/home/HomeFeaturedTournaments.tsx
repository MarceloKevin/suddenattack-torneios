import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Tournament } from '../../types';
import { TournamentCard } from '../tournament/TournamentCard';
import '../tournament/Tournaments.css';

interface HomeFeaturedTournamentsProps {
  tournaments: Tournament[];
}

export const HomeFeaturedTournaments: React.FC<HomeFeaturedTournamentsProps> = ({
  tournaments,
}) => {
  const featured = tournaments.slice(0, 3);

  return (
    <section className="sa-home-featured" aria-label="Torneios em destaque">
      <div className="sa-home__container">
        <div className="sa-home-featured__head">
          <div>
            <span className="sa-home-featured__kicker">ARENA DE COMPETIÇÕES</span>
            <h2 className="sa-home-featured__title">TORNEIOS EM DESTAQUE</h2>
          </div>
          <Link to="/torneios" className="sa-home-featured__all">
            VER TODOS OS TORNEIOS
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="sa-home-featured__cards">
          {featured.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </section>
  );
};
