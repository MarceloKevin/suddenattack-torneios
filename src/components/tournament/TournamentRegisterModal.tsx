import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, CheckCircle2, AlertCircle } from 'lucide-react';
import { Team, TeamMember, Tournament } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getRosterSlot, LINEUP_MAX, RESERVA_MAX } from '../../utils/rosterHelpers';
import { isImageSrc } from '../profile/shared';

type SlotChoice = 'LINEUP' | 'RESERVA' | 'NONE';

interface TournamentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  team: Team | null;
  alreadyRegistered: boolean;
  onConfirm: (roster: {
    lineupPlayerIds: string[];
    reservePlayerIds: string[];
  }) => { ok: boolean; message?: string };
}

const initialSlots = (members: TeamMember[]): Record<string, SlotChoice> => {
  const map: Record<string, SlotChoice> = {};
  let lineupCount = 0;
  let reserveCount = 0;

  const sorted = [...members].sort((a, b) => {
    const order = (m: TeamMember) => {
      const s = getRosterSlot(m);
      if (m.role === 'CAPITÃO') return 0;
      if (s === 'LINEUP') return 1;
      if (s === 'RESERVA') return 2;
      return 3;
    };
    return order(a) - order(b);
  });

  for (const member of sorted) {
    const slot = getRosterSlot(member);
    if (slot === 'LINEUP' && lineupCount < LINEUP_MAX) {
      map[member.userId] = 'LINEUP';
      lineupCount += 1;
    } else if (slot === 'RESERVA' && reserveCount < RESERVA_MAX) {
      map[member.userId] = 'RESERVA';
      reserveCount += 1;
    } else if (lineupCount < LINEUP_MAX && (slot === 'LINEUP' || member.role === 'PLAYER')) {
      map[member.userId] = 'LINEUP';
      lineupCount += 1;
    } else {
      map[member.userId] = 'NONE';
    }
  }

  return map;
};

export const TournamentRegisterModal: React.FC<TournamentRegisterModalProps> = ({
  isOpen,
  onClose,
  tournament,
  team,
  alreadyRegistered,
  onConfirm,
}) => {
  const [slots, setSlots] = useState<Record<string, SlotChoice>>({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isOpen || !team) return;
    setSlots(initialSlots(team.members));
    setError('');
    setSuccessMsg('');
    setSubmitting(false);
  }, [isOpen, team]);

  const lineupIds = useMemo(
    () => Object.entries(slots).filter(([, s]) => s === 'LINEUP').map(([id]) => id),
    [slots]
  );
  const reserveIds = useMemo(
    () => Object.entries(slots).filter(([, s]) => s === 'RESERVA').map(([id]) => id),
    [slots]
  );

  const setPlayerSlot = (userId: string, next: SlotChoice) => {
    setError('');
    setSlots((prev) => {
      const current = prev[userId] ?? 'NONE';
      if (current === next) return prev;

      const lineupCount = Object.values(prev).filter((s) => s === 'LINEUP').length;
      const reserveCount = Object.values(prev).filter((s) => s === 'RESERVA').length;
      const withoutSelfLineup = lineupCount - (current === 'LINEUP' ? 1 : 0);
      const withoutSelfReserve = reserveCount - (current === 'RESERVA' ? 1 : 0);

      if (next === 'LINEUP' && withoutSelfLineup >= LINEUP_MAX) {
        setError(`A Lineup já tem ${LINEUP_MAX} jogadores.`);
        return prev;
      }
      if (next === 'RESERVA' && withoutSelfReserve >= RESERVA_MAX) {
        setError(`As reservas já têm ${RESERVA_MAX} jogadores.`);
        return prev;
      }

      return { ...prev, [userId]: next };
    });
  };

  const canSubmit =
    !!team &&
    lineupIds.length === LINEUP_MAX &&
    reserveIds.length === RESERVA_MAX &&
    !submitting;

  const handleSubmit = () => {
    if (!team) return;
    if (lineupIds.length !== LINEUP_MAX || reserveIds.length !== RESERVA_MAX) {
      setError(`Selecione ${LINEUP_MAX} titulares e ${RESERVA_MAX} reservas.`);
      return;
    }

    setSubmitting(true);
    const result = onConfirm({
      lineupPlayerIds: lineupIds,
      reservePlayerIds: reserveIds,
    });

    if (!result.ok) {
      setError(result.message || 'Não foi possível confirmar a inscrição.');
      setSubmitting(false);
      return;
    }

    setSuccessMsg(result.message || 'Inscrição confirmada!');
    setTimeout(() => {
      setSubmitting(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CONFIRMAR INSCRIÇÃO DA EQUIPE"
      size="lg"
    >
      {!team ? (
        <div className="space-y-4 text-xs text-center">
          <AlertCircle className="w-8 h-8 mx-auto text-[#E31B23]" />
          <p className="text-zinc-300">
            Você precisa possuir ou ser capitão de um time para inscrever-se em
            torneios de Sudden Attack.
          </p>
          <Link to="/time">
            <Button variant="primary" fullWidth size="sm">
              CRIAR OU ENCONTRAR TIME
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-5 text-xs">
          <p className="text-zinc-300 leading-relaxed">
            {alreadyRegistered
              ? `Seu time já está inscrito em `
              : `Você está prestes a inscrever a equipe abaixo em `}
            <strong className="text-white">{tournament.name}</strong>. Selecione
            quem joga: <strong className="text-white">{LINEUP_MAX} titulares</strong> e{' '}
            <strong className="text-white">{RESERVA_MAX} reservas</strong>.
          </p>

          <div className="sa-td-modal-team">
            {isImageSrc(team.logo) ? (
              <img
                src={team.logo}
                alt=""
                className="sa-td-modal-team__logo-img"
              />
            ) : (
              <span className="sa-td-modal-team__logo">{team.logo}</span>
            )}
            <div>
              <span className="sa-td-modal-team__name">{team.name}</span>
              <span className="sa-td-modal-team__meta">
                TAG: [{team.tag}] • {team.members.length} jogadores disponíveis
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] font-mono uppercase tracking-wider">
            <span
              className={
                lineupIds.length === LINEUP_MAX ? 'text-[#2DD4BF]' : 'text-[#E31B23]'
              }
            >
              Lineup {lineupIds.length}/{LINEUP_MAX}
            </span>
            <span
              className={
                reserveIds.length === RESERVA_MAX ? 'text-[#2DD4BF]' : 'text-amber-300'
              }
            >
              Reservas {reserveIds.length}/{RESERVA_MAX}
            </span>
          </div>

          {error && (
            <div className="rounded-sm border border-red-800 bg-red-950/40 px-3 py-2 text-red-300">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="rounded-sm border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-emerald-300">
              {successMsg}
            </div>
          )}

          <div className="rounded-sm border border-[#272B35] bg-[#0B0D11] divide-y divide-[#1D2633] max-h-[46vh] overflow-y-auto">
            {team.members.map((member) => {
              const choice = slots[member.userId] ?? 'NONE';
              const isCaptain = member.role === 'CAPITÃO';

              return (
                <div
                  key={member.userId}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-3 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      src={member.avatar}
                      name={member.nickname}
                      size="sm"
                      status={member.status}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isCaptain && (
                          <Crown className="w-3.5 h-3.5 text-[#E31B23] shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-white truncate">
                          {member.nickname}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#858B96] uppercase tracking-wider">
                        {member.inGameRole || member.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPlayerSlot(member.userId, 'LINEUP')}
                      className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        choice === 'LINEUP'
                          ? 'bg-[#E31B23] border-[#E31B23] text-white'
                          : 'bg-transparent border-[#30343D] text-[#858B96] hover:border-[#E31B23] hover:text-white'
                      }`}
                    >
                      Lineup
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerSlot(member.userId, 'RESERVA')}
                      className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        choice === 'RESERVA'
                          ? 'bg-amber-500/90 border-amber-500 text-black'
                          : 'bg-transparent border-[#30343D] text-[#858B96] hover:border-amber-500 hover:text-amber-300'
                      }`}
                    >
                      Reserva
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayerSlot(member.userId, 'NONE')}
                      className={`px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                        choice === 'NONE'
                          ? 'bg-[#181B23] border-[#555B66] text-white'
                          : 'bg-transparent border-[#30343D] text-[#858B96] hover:border-[#555B66] hover:text-white'
                      }`}
                    >
                      Fora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[#9298A5] leading-relaxed">
            Ao confirmar, o clã compromete-se a jogar com esta escalação nos
            horários do campeonato, sob pena de W.O.
          </p>

          <Button
            variant="primary"
            fullWidth
            size="md"
            disabled={!canSubmit}
            onClick={handleSubmit}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            {submitting
              ? 'CONFIRMANDO...'
              : alreadyRegistered
                ? 'ATUALIZAR ESCALAÇÃO'
                : 'CONFIRMAR INSCRIÇÃO'}
          </Button>
        </div>
      )}
    </Modal>
  );
};
