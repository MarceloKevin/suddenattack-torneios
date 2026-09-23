import { MatchBracketGame, Tournament, isDoubleElimStructure } from '../types';

export type MatchSlot = 'team1' | 'team2';

export type BracketMatchResultInput = {
  score1: number;
  score2: number;
  winner: MatchSlot;
  wo?: boolean;
  /** Data/hora exibida na chave (ex.: 20 SET 2026 - 19:00) */
  date?: string;
};

const WINNERS_ORDER: MatchBracketGame['round'][] = [
  'OITAVAS',
  'QUARTAS',
  'SEMIFINAL',
  'FINAL',
];

const LOSERS_ORDER: MatchBracketGame['round'][] = [
  'LB_R1',
  'LB_R2',
  'LB_R3',
  'LB_R4',
  'LB_R5',
  'LB_R6',
  'LB_FINAL',
];

const isPlaceholder = (id: string) =>
  !id || id === 'tbd' || id.startsWith('tbd-') || id.startsWith('bye-');

export const canEditBracketMatch = (match: MatchBracketGame) =>
  !isPlaceholder(match.team1.id) && !isPlaceholder(match.team2.id);

const sideTeam = (match: MatchBracketGame, side: MatchSlot) =>
  side === 'team1' ? match.team1 : match.team2;

const placeTeamInSlot = (
  brackets: MatchBracketGame[],
  matchId: string,
  slot: MatchSlot,
  team: { id: string; name: string; tag: string; logo: string }
) => {
  const idx = brackets.findIndex((b) => b.id === matchId);
  if (idx < 0) return;
  brackets[idx] = {
    ...brackets[idx],
    [slot]: {
      id: team.id,
      name: team.name,
      tag: team.tag,
      logo: team.logo,
      score: brackets[idx][slot].score || 0,
      isWinner: false,
    },
  };
};

const placeInFirstOpenSlot = (
  brackets: MatchBracketGame[],
  candidates: MatchBracketGame[],
  team: { id: string; name: string; tag: string; logo: string }
) => {
  for (const match of candidates) {
    if (isPlaceholder(match.team1.id)) {
      placeTeamInSlot(brackets, match.id, 'team1', team);
      return true;
    }
    if (isPlaceholder(match.team2.id)) {
      placeTeamInSlot(brackets, match.id, 'team2', team);
      return true;
    }
  }
  return false;
};

const advanceWithinSide = (
  brackets: MatchBracketGame[],
  completed: MatchBracketGame,
  winnerTeam: { id: string; name: string; tag: string; logo: string },
  roundOrder: MatchBracketGame['round'][]
) => {
  const roundIdx = roundOrder.indexOf(completed.round);
  if (roundIdx < 0 || roundIdx >= roundOrder.length - 1) return false;

  const nextRound = roundOrder[roundIdx + 1];
  const currentRound = brackets
    .filter((b) => b.round === completed.round)
    .sort((a, b) => a.matchNumber - b.matchNumber);
  const nextRoundMatches = brackets
    .filter((b) => b.round === nextRound)
    .sort((a, b) => a.matchNumber - b.matchNumber);

  const idxInRound = currentRound.findIndex((b) => b.id === completed.id);
  if (idxInRound < 0 || nextRoundMatches.length === 0) return false;

  const nextMatch = nextRoundMatches[Math.floor(idxInRound / 2)];
  if (!nextMatch) return false;

  const slot: MatchSlot = idxInRound % 2 === 0 ? 'team1' : 'team2';
  placeTeamInSlot(brackets, nextMatch.id, slot, winnerTeam);
  return true;
};

/** Todas as partidas com times definidos estão encerradas e a final decisiva tem vencedor. */
export const isBracketFullyFilled = (brackets: MatchBracketGame[]) => {
  const playable = brackets.filter(canEditBracketMatch);
  if (playable.length === 0) return false;

  const isDouble = brackets.some(
    (b) => b.bracketSide === 'losers' || b.round === 'GRAND_FINAL'
  );

  const decisive = isDouble
    ? brackets.find((b) => b.round === 'GRAND_FINAL')
    : brackets.find((b) => b.round === 'FINAL' && (b.bracketSide ?? 'winners') === 'winners');

  if (
    !decisive ||
    !canEditBracketMatch(decisive) ||
    decisive.status !== 'COMPLETED' ||
    (!decisive.team1.isWinner && !decisive.team2.isWinner)
  ) {
    return false;
  }

  return playable.every((m) => m.status === 'COMPLETED');
};

const championFromDecisive = (brackets: MatchBracketGame[]) => {
  const isDouble = brackets.some(
    (b) => b.bracketSide === 'losers' || b.round === 'GRAND_FINAL'
  );
  const decisive = isDouble
    ? brackets.find((b) => b.round === 'GRAND_FINAL')
    : brackets.find((b) => b.round === 'FINAL' && (b.bracketSide ?? 'winners') === 'winners');

  if (!decisive) return undefined;
  const winner = decisive.team1.isWinner
    ? decisive.team1
    : decisive.team2.isWinner
      ? decisive.team2
      : null;
  if (!winner || isPlaceholder(winner.id)) return undefined;
  return {
    id: winner.id,
    name: winner.name,
    tag: winner.tag,
    logo: winner.logo,
  };
};

/**
 * Aplica placar/WO na partida e avança o vencedor (e perdedor na chave inferior, se DE).
 * O campeão só é definido quando a chave inteira estiver preenchida.
 */
export const applyBracketMatchResult = (
  tournament: Tournament,
  matchId: string,
  input: BracketMatchResultInput
): { ok: boolean; message?: string; tournament?: Tournament } => {
  const brackets = [...(tournament.brackets ?? [])];
  const matchIndex = brackets.findIndex((m) => m.id === matchId);
  if (matchIndex < 0) return { ok: false, message: 'Partida não encontrada.' };

  const match = brackets[matchIndex];
  if (!canEditBracketMatch(match)) {
    return { ok: false, message: 'Partida ainda sem confrontos definidos.' };
  }

  const { score1, score2, winner, wo, date } = input;
  if (!wo && score1 === score2) {
    return { ok: false, message: 'Informe um placar com vencedor (sem empate).' };
  }

  const winnerTeam = sideTeam(match, winner);
  const loserTeam = sideTeam(match, winner === 'team1' ? 'team2' : 'team1');
  const scheduledDate =
    date?.trim() && !/^a definir$/i.test(date.trim())
      ? date.trim()
      : match.date && !/^a definir$/i.test(match.date)
        ? match.date
        : undefined;

  const updatedMatch: MatchBracketGame = {
    ...match,
    status: 'COMPLETED',
    wo: Boolean(wo),
    date: scheduledDate || match.date || 'Encerrado',
    team1: {
      ...match.team1,
      score: wo ? (winner === 'team1' ? Math.max(score1, 1) : 0) : score1,
      isWinner: winner === 'team1',
    },
    team2: {
      ...match.team2,
      score: wo ? (winner === 'team2' ? Math.max(score2, 1) : 0) : score2,
      isWinner: winner === 'team2',
    },
  };

  brackets[matchIndex] = updatedMatch;

  const side = match.bracketSide ?? 'winners';
  const isDouble =
    isDoubleElimStructure(tournament.structure) ||
    brackets.some((b) => b.bracketSide === 'losers' || b.round === 'GRAND_FINAL');

  if (side === 'winners') {
    advanceWithinSide(brackets, updatedMatch, winnerTeam, WINNERS_ORDER);

    if (isDouble) {
      // Perdedor cai para a chave inferior
      const losersMatches = brackets
        .filter((b) => b.bracketSide === 'losers')
        .sort((a, b) => a.matchNumber - b.matchNumber);
      placeInFirstOpenSlot(brackets, losersMatches, loserTeam);

      // Campeão da chave superior vai para a grande final
      if (updatedMatch.round === 'FINAL') {
        const gf = brackets.find((b) => b.round === 'GRAND_FINAL');
        if (gf) placeTeamInSlot(brackets, gf.id, 'team1', winnerTeam);
      }
    }
  } else if (side === 'losers') {
    if (updatedMatch.round === 'LB_FINAL') {
      const gf = brackets.find((b) => b.round === 'GRAND_FINAL');
      if (gf) placeTeamInSlot(brackets, gf.id, 'team2', winnerTeam);
    } else {
      advanceWithinSide(brackets, updatedMatch, winnerTeam, LOSERS_ORDER);
    }
  }

  const fullyFilled = isBracketFullyFilled(brackets);
  const championTeam = fullyFilled ? championFromDecisive(brackets) : undefined;
  const status = fullyFilled
    ? 'finished'
    : tournament.status === 'finished'
      ? 'active'
      : tournament.status;

  return {
    ok: true,
    tournament: {
      ...tournament,
      brackets,
      championTeam,
      status,
    },
  };
};
