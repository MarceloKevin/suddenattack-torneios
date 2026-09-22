import React from 'react';
import { TeamMember } from '../../types';
import { getRosterSlot } from '../../utils/rosterHelpers';
import { AssignSlotButtons, cardClass } from './shared';

interface PlayerCardProps {
  member: TeamMember;
  canManage?: boolean;
  onAssign?: (userId: string, slot: 'LINEUP' | 'RESERVA') => void;
  variant?: 'lineup' | 'roster';
}

const statusDot: Record<string, string> = {
  online: 'bg-emerald-400',
  'in-game': 'bg-cyan-400',
  offline: 'bg-zinc-500',
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  member,
  canManage = false,
  onAssign,
  variant = 'roster',
}) => {
  const slot = getRosterSlot(member);
  const isLineup = slot === 'LINEUP';
  const isCaptain = member.role === 'CAPITÃO';
  const badgeLabel = isLineup ? 'TITULAR' : 'RESERVA';
  const badgeClass = isLineup
    ? 'bg-[#E31B23]/15 text-[#ff4d55] border-[#E31B23]/40'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/35';

  return (
    <article
      className={`${cardClass} group flex flex-col items-center text-center p-5 h-full hover:border-[#E31B23]/45 hover:bg-[#10151D] transition-all duration-200`}
    >
      <div className="relative mb-4">
        <div
          className={`w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-full p-[2.5px] transition-transform duration-200 group-hover:scale-[1.04] ${
            isCaptain ? 'bg-[#E31B23]' : 'bg-[#2A3444]'
          }`}
          style={{
            boxShadow: isCaptain
              ? '0 0 20px rgba(227,27,35,0.25)'
              : '0 0 16px rgba(0,0,0,0.35)',
          }}
        >
          <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0F15] ring-2 ring-black/40">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.nickname}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-400">
                {member.nickname.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>
        <span
          className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#0D1118] ${
            statusDot[member.status] ?? statusDot.offline
          }`}
          title={member.status}
        />
      </div>

      <h3 className="text-sm sm:text-base font-display uppercase tracking-wide text-white truncate max-w-full">
        {member.nickname}
      </h3>

      {member.name && (
        <p className="mt-1 text-[11px] text-[#8B93A7] truncate max-w-full">{member.name}</p>
      )}

      <p className="mt-1.5 text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
        {isCaptain ? 'Capitão' : member.inGameRole || member.role}
      </p>

      <span
        className={`mt-3 inline-flex px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-full border ${badgeClass}`}
      >
        {badgeLabel}
      </span>

      {canManage && onAssign && variant === 'lineup' && (
        <div className="mt-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <AssignSlotButtons
            slot={slot}
            onAssign={(next) => onAssign(member.userId, next)}
          />
        </div>
      )}
    </article>
  );
};

interface EmptySlotProps {
  index: number;
}

export const EmptyPlayerSlot: React.FC<EmptySlotProps> = ({ index }) => (
  <div
    className={`${cardClass} flex flex-col items-center justify-center text-center p-5 h-full border-dashed opacity-70`}
  >
    <div className="w-[88px] h-[88px] sm:w-[96px] sm:h-[96px] rounded-full mb-4 border border-dashed border-[#2A3444] bg-[#0B0F15]/60 flex items-center justify-center">
      <span className="text-[10px] font-mono text-zinc-600 uppercase">Vago</span>
    </div>
    <span className="text-[10px] font-mono text-zinc-600">#{String(index + 1).padStart(2, '0')}</span>
  </div>
);
