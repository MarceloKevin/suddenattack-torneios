import React from 'react';
import { Settings } from 'lucide-react';
import { FormerTeamMember, TeamMember } from '../../types';
import { Button } from '../ui/Button';
import { PlayerCard } from './PlayerCard';
import { cardClass, SectionLabel, SectionTitle } from './shared';

interface TeamPlayersProps {
  lineup: TeamMember[];
  reservas: TeamMember[];
  fora: TeamMember[];
  formerMembers?: FormerTeamMember[];
  isCaptain: boolean;
  onManageLineup: () => void;
  canManage: boolean;
  onAssign: (userId: string, slot: 'LINEUP' | 'RESERVA') => void;
}

export const TeamPlayers: React.FC<TeamPlayersProps> = ({
  lineup,
  reservas,
  fora,
  formerMembers = [],
  isCaptain,
  onManageLineup,
  canManage,
  onAssign,
}) => {
  const active = [...lineup, ...reservas, ...fora];

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <SectionLabel>Elenco atual</SectionLabel>
            <SectionTitle className="mt-1">Players do time</SectionTitle>
            <p className="text-[12px] text-[#8B93A7] mt-1">
              Todos os jogadores vinculados à organização.
            </p>
          </div>
          {isCaptain && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Settings className="w-3.5 h-3.5" />}
              onClick={onManageLineup}
              className="rounded-lg shrink-0"
            >
              GERENCIAR LINE UP
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {active.map((member) => (
            <PlayerCard
              key={member.userId}
              member={member}
              canManage={canManage}
              onAssign={onAssign}
              variant="lineup"
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6B7280] font-bold">
            Ex-membros
          </span>
          <SectionTitle className="mt-1">Players que saíram</SectionTitle>
        </div>

        {formerMembers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {formerMembers.map((member) => (
              <div
                key={member.userId}
                className={`${cardClass} flex items-center gap-3.5 p-4 opacity-80 hover:opacity-100 transition-opacity`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0B0F15] border border-[#1D2633] shrink-0">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.nickname}
                      className="w-full h-full object-cover grayscale"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                      {member.nickname.slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-300 truncate">
                      {member.nickname}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border border-zinc-600 text-zinc-500">
                      Saiu
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                    {member.name} · {member.joinedDate} → {member.leftDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-mono text-zinc-600 py-8 border border-dashed border-[#1D2633] rounded-xl text-center">
            Nenhum player saiu do time ainda.
          </p>
        )}
      </section>
    </div>
  );
};
