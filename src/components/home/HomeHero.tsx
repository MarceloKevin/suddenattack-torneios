import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Trophy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { HomeStatsBar } from './HomeStatsBar';
import batalhaWordmark from '../../assets/hero-batalha.png';

export const HomeHero: React.FC = () => {
  const { currentUser } = useAuth();
  const primaryTo = currentUser ? '/dashboard' : '/login';

  return (
    <section className="sa-home-hero" aria-label="Hero">
      <div className="sa-home-hero__bg" aria-hidden />
      <div className="sa-home-hero__noise" aria-hidden />

      <div className="sa-home__container sa-home-hero__body">
        <div className="sa-home-hero__content">
          <div className="sa-home-hero__eyebrow">
            <span className="sa-home-hero__eyebrow-marks" aria-hidden>
              <span />
              <span />
            </span>
            COMPETIÇÕES • COMUNIDADE • EVOLUÇÃO
          </div>

          <h1 className="sa-home-hero__title">
            <span className="sa-home-hero__title-line">ENTRE NA</span>
            <span className="sa-home-hero__battle">
              <img
                src={batalhaWordmark}
                alt="BATALHA."
                className="sa-home-hero__battle-img"
                draggable={false}
              />
            </span>
          </h1>

          <p className="sa-home-hero__desc">
            Mostre seu time. Enfrente os melhores. Dispute campeonatos e escreva
            seu nome na história do Sudden Attack.
          </p>

          <div className="sa-home-hero__actions">
            <Link to={primaryTo} className="sa-home-btn sa-home-btn--primary">
              <Gamepad2 className="w-5 h-5" aria-hidden />
              IR PARA O DASHBOARD
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link to="/torneios" className="sa-home-btn sa-home-btn--secondary">
              <Trophy className="w-5 h-5" aria-hidden />
              EXPLORAR TORNEIOS
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>

      <div className="sa-home-hero__motto" aria-hidden>
        <span className="sa-home-hero__motto-marks">
          <span />
          <span />
        </span>
        JUNTOS / SOMOS / MAIS FORTES
      </div>

      <HomeStatsBar />
    </section>
  );
};
