import React from 'react';
import { TournamentGroup } from '../../types';
import { resolveTeamLogo } from '../../utils/teamLogo';
import { isImageSrc } from '../profile/shared';
import './TournamentDetails.css';

interface GroupStandingsTableProps {
  groups: TournamentGroup[];
}

export const GroupStandingsTable: React.FC<GroupStandingsTableProps> = ({ groups }) => {
  return (
    <div className="sa-td-groups">
      {groups.map((group) => {
        const standings = [...group.standings].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = a.roundsFor - a.roundsAgainst;
          const gdB = b.roundsFor - b.roundsAgainst;
          if (gdB !== gdA) return gdB - gdA;
          return b.roundsFor - a.roundsFor;
        });

        return (
          <article key={group.id} className="sa-td-group">
            <header className="sa-td-group__head">
              <h3 className="sa-td-group__title font-display">{group.name}</h3>
            </header>

            <div className="sa-td-group__scroll">
              <table className="sa-td-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Time</th>
                    <th className="is-center" style={{ width: 40 }}>
                      J
                    </th>
                    <th className="is-center" style={{ width: 40 }}>
                      V
                    </th>
                    <th className="is-center" style={{ width: 40 }}>
                      E
                    </th>
                    <th className="is-center" style={{ width: 40 }}>
                      D
                    </th>
                    <th className="is-center" style={{ width: 48 }}>
                      RF
                    </th>
                    <th className="is-center" style={{ width: 48 }}>
                      RA
                    </th>
                    <th className="is-center" style={{ width: 48 }}>
                      SG
                    </th>
                    <th className="is-center" style={{ width: 48 }}>
                      Pts
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const goalDiff = row.roundsFor - row.roundsAgainst;
                    const qualifies = idx < 2;
                    const logoSrc = resolveTeamLogo(row.teamId, row.teamLogo);

                    return (
                      <tr key={row.teamId} className={qualifies ? 'is-qualify' : undefined}>
                        <td>
                          <span className={`sa-td-pos ${qualifies ? 'sa-td-pos--hot' : ''}`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td>
                          <div className="sa-td-row-team">
                            <span className="sa-td-row-team__logo">
                              {isImageSrc(logoSrc) ? (
                                <img src={logoSrc} alt="" />
                              ) : (
                                logoSrc
                              )}
                            </span>
                            <div className="min-w-0">
                              <span className="sa-td-row-team__name font-display">
                                {row.teamName}
                              </span>
                              <span className="sa-td-row-team__tag">[{row.teamTag}]</span>
                            </div>
                          </div>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num">{row.played}</span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num sa-td-num--win">{row.wins}</span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num sa-td-num--muted">{row.draws}</span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num sa-td-num--loss">{row.losses}</span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num">{row.roundsFor}</span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num">{row.roundsAgainst}</span>
                        </td>
                        <td className="is-center">
                          <span
                            className={`sa-td-num ${
                              goalDiff > 0
                                ? 'sa-td-num--win'
                                : goalDiff < 0
                                  ? 'sa-td-num--loss'
                                  : 'sa-td-num--muted'
                            }`}
                          >
                            {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                          </span>
                        </td>
                        <td className="is-center">
                          <span className="sa-td-num sa-td-num--pts">{row.points}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        );
      })}
    </div>
  );
};
