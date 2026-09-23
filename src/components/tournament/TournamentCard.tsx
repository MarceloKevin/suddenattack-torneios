import React from 'react';
import { Link } from 'react-router-dom';
import { Tournament, getConfirmedTeams } from '../../types';
import { Calendar, Users, Trophy, ArrowRight } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const statusClass = (status: Tournament['status']) => {
  switch (status) {
    case 'active':
      return 'sa-tour-status--active';
    case 'open':
      return 'sa-tour-status--open';
    case 'finished':
      return 'sa-tour-status--finished';
    case 'draft':
      return 'sa-tour-status--draft';
    default:
      return 'sa-tour-status--finished';
  }
};

const statusLabel = (status: Tournament['status']) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'open':
      return 'Inscrições abertas';
    case 'finished':
      return 'Finalizado';
    case 'draft':
      return 'Rascunho';
    default:
      return status;
  }
};

const formatPeriod = (start: string, end: string) => {
  const s = start.split(' ').slice(0, 2).join(' ');
  const e = end.split(' ').slice(0, 2).join(' ');
  return `${s} — ${e}`;
};

const DEFAULT_CARD_BG =
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=500&fit=crop&q=70';

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const isFinished = tournament.status === 'finished';
  const confirmedTeams = getConfirmedTeams(tournament.registeredTeams);
  const isFull = confirmedTeams.length >= tournament.maxTeams;
  const logo =
    tournament.championTeam?.logo ||
    confirmedTeams[0]?.logo ||
    '🏆';
  const cardBg = tournament.banner || DEFAULT_CARD_BG;

  return (
    <article className="sa-tour-card">
      <div className="sa-tour-card__bg" aria-hidden>
        <img src={cardBg} alt="" />
        <span className="sa-tour-card__bg-shade" />
      </div>

      <div className="sa-tour-card__content">
      <div className="sa-tour-card__top">
        <span className={`sa-tour-status ${statusClass(tournament.status)}`}>
          <span className="sa-tour-status__dot" aria-hidden />
          {statusLabel(tournament.status)}
        </span>
        <span className="sa-tour-format">{tournament.format}</span>
      </div>

      <div className="sa-tour-card__brand">
        <div className="sa-tour-logo" aria-hidden>
          <span className="sa-tour-logo__glow" />
          <div className="sa-tour-logo__ring">
            {isImageSrc(logo) ? <img src={logo} alt="" /> : <span>{logo}</span>}
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="sa-tour-card__name font-display">{tournament.name}</h3>
          <p className="sa-tour-card__desc">{tournament.description}</p>
        </div>
      </div>

      {isFinished && tournament.championTeam && (
        <div className="sa-tour-champ">
          <div>
            <span className="sa-tour-champ__label">Campeão</span>
            <span className="sa-tour-champ__name">
              {tournament.championTeam.name} [{tournament.championTeam.tag}]
            </span>
          </div>
          <span className="sa-tour-champ__prize">{tournament.prizePool}</span>
        </div>
      )}

      <div className="sa-tour-meta">
        <div>
          <span className="sa-tour-meta__label">
            <Calendar aria-hidden /> Período
          </span>
          <span className="sa-tour-meta__value">
            {formatPeriod(tournament.startDate, tournament.endDate)}
          </span>
        </div>
        <div>
          <span className="sa-tour-meta__label">
            <Users aria-hidden /> Equipes
          </span>
          <span className={`sa-tour-meta__value ${isFull ? 'is-full' : ''}`}>
            {confirmedTeams.length} / {tournament.maxTeams} times
          </span>
        </div>
        <div className="sa-tour-meta__prize">
          <span className="sa-tour-meta__label">
            <Trophy aria-hidden /> Premiação total
          </span>
          <span className="sa-tour-meta__prize-value font-display">
            {tournament.prizePool}
          </span>
        </div>
      </div>

      <Link
        to={`/torneios/${tournament.id}`}
        className={`sa-tour-cta ${isFinished ? 'sa-tour-cta--secondary' : ''}`}
      >
        {isFinished ? 'Ver resultados' : 'Ver torneio'}
        <ArrowRight aria-hidden />
      </Link>
      </div>
    </article>
  );
};
