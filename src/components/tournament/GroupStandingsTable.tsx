import React from 'react';
import { TournamentGroup } from '../../types';
import { Card } from '../ui/Card';

interface GroupStandingsTableProps {
  groups: TournamentGroup[];
}

export const GroupStandingsTable: React.FC<GroupStandingsTableProps> = ({ groups }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {groups.map((group) => {
        const standings = [...group.standings].sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          const gdA = a.roundsFor - a.roundsAgainst;
          const gdB = b.roundsFor - b.roundsAgainst;
          if (gdB !== gdA) return gdB - gdA;
          return b.roundsFor - a.roundsFor;
        });

        return (
          <Card key={group.id} variant="primary" hasHudCorners className="border-[#272B35] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#272B35] bg-[#0E1016]">
              <h3 className="text-lg font-display uppercase tracking-wider text-white">
                {group.name}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[520px]">
                <thead>
                  <tr className="text-[10px] font-mono uppercase tracking-wider text-[#9298A5] border-b border-[#272B35]">
                    <th className="px-3 py-2.5 font-medium w-10">#</th>
                    <th className="px-3 py-2.5 font-medium">Time</th>
                    <th className="px-2 py-2.5 font-medium text-center w-10">J</th>
                    <th className="px-2 py-2.5 font-medium text-center w-10">V</th>
                    <th className="px-2 py-2.5 font-medium text-center w-10">E</th>
                    <th className="px-2 py-2.5 font-medium text-center w-10">D</th>
                    <th className="px-2 py-2.5 font-medium text-center w-12">RF</th>
                    <th className="px-2 py-2.5 font-medium text-center w-12">RA</th>
                    <th className="px-2 py-2.5 font-medium text-center w-12">SG</th>
                    <th className="px-3 py-2.5 font-medium text-center w-12">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const goalDiff = row.roundsFor - row.roundsAgainst;
                    const qualifies = idx < 2;

                    return (
                      <tr
                        key={row.teamId}
                        className={`border-b border-[#272B35]/60 last:border-0 ${
                          qualifies ? 'bg-[#E31B23]/5' : ''
                        }`}
                      >
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs font-mono font-bold ${
                              qualifies ? 'text-[#E31B23]' : 'text-zinc-500'
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-lg shrink-0">{row.teamLogo}</span>
                            <div className="min-w-0">
                              <span className="text-sm font-display uppercase text-white block truncate">
                                {row.teamName}
                              </span>
                              <span className="text-[10px] font-mono text-[#9298A5]">
                                [{row.teamTag}]
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{row.played}</td>
                        <td className="px-2 py-3 text-center text-xs text-emerald-400">{row.wins}</td>
                        <td className="px-2 py-3 text-center text-xs text-zinc-400">{row.draws}</td>
                        <td className="px-2 py-3 text-center text-xs text-red-400">{row.losses}</td>
                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{row.roundsFor}</td>
                        <td className="px-2 py-3 text-center text-xs text-zinc-300">{row.roundsAgainst}</td>
                        <td
                          className={`px-2 py-3 text-center text-xs font-bold ${
                            goalDiff > 0
                              ? 'text-emerald-400'
                              : goalDiff < 0
                                ? 'text-red-400'
                                : 'text-zinc-400'
                          }`}
                        >
                          {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="text-sm font-display font-bold text-white">
                            {row.points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
