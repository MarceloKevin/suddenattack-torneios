import { TeamMember } from '../types';

export type RosterSlot = 'LINEUP' | 'RESERVA' | 'FORA';

export const TEAM_MAX_MEMBERS = 10;
export const OFFICIAL_ROSTER_MAX = 7;
export const LINEUP_MAX = 5;
export const RESERVA_MAX = 2;

export const getRosterSlot = (member: TeamMember): RosterSlot => {
  if (member.rosterSlot) return member.rosterSlot;
  if (member.role === 'RESERVA') return 'RESERVA';
  if (member.role === 'CAPITÃO' || member.role === 'PLAYER') return 'LINEUP';
  return 'FORA';
};

export const countBySlot = (members: TeamMember[]) => {
  const lineup = members.filter((m) => getRosterSlot(m) === 'LINEUP').length;
  const reserva = members.filter((m) => getRosterSlot(m) === 'RESERVA').length;
  const fora = members.filter((m) => getRosterSlot(m) === 'FORA').length;
  return {
    lineup,
    reserva,
    fora,
    official: lineup + reserva,
  };
};

export const canAssignRosterSlot = (
  members: TeamMember[],
  userId: string,
  nextSlot: RosterSlot
): { ok: boolean; message?: string } => {
  const current = members.find((m) => m.userId === userId);
  if (!current) return { ok: false, message: 'Jogador não encontrado.' };

  const currentSlot = getRosterSlot(current);
  if (currentSlot === nextSlot) return { ok: true };

  const counts = countBySlot(members);
  const withoutCurrent = {
    lineup: counts.lineup - (currentSlot === 'LINEUP' ? 1 : 0),
    reserva: counts.reserva - (currentSlot === 'RESERVA' ? 1 : 0),
  };

  if (nextSlot === 'LINEUP' && withoutCurrent.lineup >= LINEUP_MAX) {
    return { ok: false, message: `A Lineup já está completa (${LINEUP_MAX}/${LINEUP_MAX}).` };
  }
  if (nextSlot === 'RESERVA' && withoutCurrent.reserva >= RESERVA_MAX) {
    return { ok: false, message: `As reservas já estão completas (${RESERVA_MAX}/${RESERVA_MAX}).` };
  }
  if (
    (nextSlot === 'LINEUP' || nextSlot === 'RESERVA') &&
    withoutCurrent.lineup + withoutCurrent.reserva >= OFFICIAL_ROSTER_MAX
  ) {
    return {
      ok: false,
      message: `A escalação oficial já tem ${OFFICIAL_ROSTER_MAX} jogadores.`,
    };
  }

  return { ok: true };
};
