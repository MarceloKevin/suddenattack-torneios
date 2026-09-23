import React from 'react';
import { PlayedMapResult } from '../../types';
import { getMapImageByName } from '../../utils/matchHelpers';

const mapThumbSrc = (mapName: string, image?: string) => {
  if (image) return image;
  return getMapImageByName(mapName);
};

const orderLabel = (order: number) => `${order}º MAPA`;

const statusLabel = (status: PlayedMapResult['status']) => {
  switch (status) {
    case 'PICKED':
      return 'PICK';
    case 'VETO':
      return 'VETO';
    default:
      return 'NÃO JOGADO';
  }
};

export interface PlayedMapsProps {
  maps: PlayedMapResult[];
  team1: { name: string; tag: string; logo: string };
  team2: { name: string; tag: string; logo: string };
}

export const PlayedMaps: React.FC<PlayedMapsProps> = ({ maps, team1, team2 }) => {
  if (!maps.length) return null;

  return (
    <section className="sa-played" aria-label="Mapas jogados">
      <div className="sa-played__head">
        <span className="sa-played__bar" aria-hidden />
        <h2 className="sa-played__title font-display">Mapas jogados</h2>
      </div>

      <div className="sa-played__grid">
        {maps.map((entry) => {
          const played = entry.status !== 'NOT_PLAYED';
          const thumb = mapThumbSrc(entry.map, entry.image);
          const s1 = entry.team1Score;
          const s2 = entry.team2Score;
          const t1Win = played && s1 !== null && s2 !== null && s1 > s2;
          const t2Win = played && s1 !== null && s2 !== null && s2 > s1;

          return (
            <article
              key={`${entry.order}-${entry.map}`}
              className={`sa-played-card ${
                !played
                  ? 'sa-played-card--idle'
                  : t1Win
                    ? 'sa-played-card--win'
                    : t2Win
                      ? 'sa-played-card--loss'
                      : ''
              }`}
            >
              <div className="sa-played-card__thumb">
                {thumb ? (
                  <img src={thumb} alt="" />
                ) : (
                  <span className="sa-played-card__thumb-fallback">
                    {entry.map.slice(0, 3)}
                  </span>
                )}
                <span className="sa-played-card__thumb-shade" aria-hidden />
              </div>

              <div className="sa-played-card__body">
                <div className="sa-played-card__top">
                  <div className="min-w-0">
                    <h3 className="sa-played-card__map font-display">{entry.map}</h3>
                    <span
                      className={`sa-played-card__status sa-played-card__status--${
                        entry.status === 'PICKED'
                          ? 'pick'
                          : entry.status === 'VETO'
                            ? 'veto'
                            : 'idle'
                      }`}
                    >
                      {statusLabel(entry.status)}
                    </span>
                  </div>
                  <span className="sa-played-card__order">{orderLabel(entry.order)}</span>
                </div>

                <div className="sa-played-card__score">
                  <span className="sa-played-card__team" title={team1.name}>
                    {team1.tag}
                  </span>
                  <span
                    className={`sa-played-card__num font-display ${
                      t1Win ? 'is-win' : t2Win ? 'is-loss' : ''
                    }`}
                  >
                    {played && s1 !== null ? s1 : '–'}
                  </span>
                  <span className="sa-played-card__sep">:</span>
                  <span
                    className={`sa-played-card__num font-display ${
                      t2Win ? 'is-win' : t1Win ? 'is-loss' : ''
                    }`}
                  >
                    {played && s2 !== null ? s2 : '–'}
                  </span>
                  <span className="sa-played-card__team is-right" title={team2.name}>
                    {team2.tag}
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
