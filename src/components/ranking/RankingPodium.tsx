import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { Team } from '../../types';
import podium1stBadge from '../../assets/podium-1st.png';
import podium2ndBadge from '../../assets/podium-2nd.png';
import podium3rdBadge from '../../assets/podium-3rd.png';
import podium1stPedestal from '../../assets/podium-1st-pedestal.png';
import podium2ndPedestal from '../../assets/podium-2nd-pedestal.png';
import podium3rdPedestal from '../../assets/podium-3rd-pedestal.png';
import './RankingPodium.css';

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const formatPts = (n: number) => n.toLocaleString('pt-BR');

interface RankingPodiumProps {
  first?: Team;
  second?: Team;
  third?: Team;
}

const TeamEmblem: React.FC<{
  team: Team;
  place: 1 | 2 | 3;
}> = ({ team, place }) => (
  <div className={`podium-emblem podium-emblem--${place}`}>
    {place !== 1 && <span className="podium-emblem__ring" aria-hidden />}
    <div className="podium-emblem__inner">
      {isImageSrc(team.logo) ? (
        <img src={team.logo} alt={team.name} />
      ) : (
        <span className="podium-emblem__emoji">{team.logo}</span>
      )}
    </div>
  </div>
);

const PositionBlock: React.FC<{
  team: Team;
  place: 1 | 2 | 3;
}> = ({ team, place }) => {
  const placeClass =
    place === 1 ? 'podium-first' : place === 2 ? 'podium-second' : 'podium-third';

  return (
    <div className={`podium-position ${placeClass}`}>
      <Link to={`/time/${team.id}`} className="podium-position__content">
        {place === 1 ? (
          <img
            src={podium1stBadge}
            alt="1º lugar"
            className="podium-1st-badge"
          />
        ) : place === 2 ? (
          <img
            src={podium2ndBadge}
            alt="2º lugar"
            className="podium-2nd-badge"
          />
        ) : (
          <img
            src={podium3rdBadge}
            alt="3º lugar"
            className="podium-3rd-badge"
          />
        )}

        <TeamEmblem team={team} place={place} />

        <h3 className="podium-team-name">{team.name}</h3>
        <p className="podium-team-tag">[{team.tag}]</p>

        <p className="podium-points">
          {formatPts(team.stats.points)}
          <span> pts</span>
        </p>

        <p className="podium-titles">
          <Trophy className="podium-titles__icon" aria-hidden />
          {team.stats.titles} {team.stats.titles === 1 ? 'título' : 'títulos'}
        </p>
      </Link>

      {place === 1 ? (
        <img
          src={podium1stPedestal}
          alt=""
          className="podium-pedestal podium-pedestal--1 podium-pedestal--1-img"
          aria-hidden
        />
      ) : place === 2 ? (
        <img
          src={podium2ndPedestal}
          alt=""
          className="podium-pedestal podium-pedestal--2 podium-pedestal--2-img"
          aria-hidden
        />
      ) : (
        <img
          src={podium3rdPedestal}
          alt=""
          className="podium-pedestal podium-pedestal--3 podium-pedestal--3-img"
          aria-hidden
        />
      )}
    </div>
  );
};

export const RankingPodium: React.FC<RankingPodiumProps> = ({
  first,
  second,
  third,
}) => {
  if (!first && !second && !third) return null;

  return (
    <section className="ranking-podium" aria-label="Pódio do ranking">
      <div className="podium-background-effects" aria-hidden>
        <span className="podium-bg-glow podium-bg-glow--center" />
        <span className="podium-bg-glow podium-bg-glow--left" />
        <span className="podium-bg-glow podium-bg-glow--right" />
        <span className="podium-bg-grid" />
        <span className="podium-bg-divider podium-bg-divider--left" />
        <span className="podium-bg-divider podium-bg-divider--right" />
      </div>

      {second && <PositionBlock team={second} place={2} />}
      {first && <PositionBlock team={first} place={1} />}
      {third && <PositionBlock team={third} place={3} />}
    </section>
  );
};
