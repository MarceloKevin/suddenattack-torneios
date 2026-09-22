import React from 'react';
import { RosterSlot } from '../../utils/rosterHelpers';

export { cardClass, BrazilFlag, isImageSrc, readImageFile, DEFAULT_BANNER } from '../profile/shared';

export type TeamTab = 'geral' | 'historico' | 'partidas';

export interface TeamMatchView {
  id: string;
  tournamentName: string;
  tournamentId: string;
  matchId: string;
  opponent: {
    name: string;
    tag: string;
    logo: string;
  };
  result: 'VITÓRIA' | 'DERROTA' | null;
  myScore: number;
  opponentScore: number;
  map: string;
  date: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED';
  phase?: string;
}

export const AssignSlotButtons: React.FC<{
  slot: RosterSlot;
  onAssign: (slot: 'LINEUP' | 'RESERVA') => void;
}> = ({ slot, onAssign }) => {
  const isReserva = slot === 'RESERVA' || slot === 'FORA';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Lineup"
        onClick={() => onAssign('LINEUP')}
        className={`px-2.5 h-7 text-[10px] font-mono font-bold rounded-lg border transition-colors duration-200 ${
          slot === 'LINEUP'
            ? 'border-[#E31B23] bg-[#E31B23]/25 text-[#ff4d55]'
            : 'border-[#1D2633] text-[#8B93A7] hover:border-[#E31B23]/50 hover:text-white'
        }`}
      >
        Lineup
      </button>
      <button
        type="button"
        title="Reserva"
        onClick={() => onAssign('RESERVA')}
        className={`px-2.5 h-7 text-[10px] font-mono font-bold rounded-lg border transition-colors duration-200 ${
          isReserva
            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
            : 'border-[#1D2633] text-[#8B93A7] hover:border-[#E31B23]/50 hover:text-white'
        }`}
      >
        Reserva
      </button>
    </div>
  );
};

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E31B23] font-bold">
    {children}
  </span>
);

export const SectionTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <h2 className={`text-lg sm:text-xl font-display uppercase tracking-wide text-white ${className}`}>
    {children}
  </h2>
);
