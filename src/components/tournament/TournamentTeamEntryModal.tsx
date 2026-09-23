import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Crown, ExternalLink } from 'lucide-react';
import { Team, TeamMember, TournamentTeamRef } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { getRosterSlot } from '../../utils/rosterHelpers';
import { paths } from '../../utils/paths';
import { isImageSrc } from '../profile/shared';
import { resolveTeamLogo } from '../../utils/teamLogo';

interface TournamentTeamEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: TournamentTeamRef | null;
  catalogTeam: Team | null;
}

const pickByIds = (members: TeamMember[], ids?: string[]) => {
  if (!ids?.length) return [];
  return ids
    .map((id) => members.find((m) => m.userId === id))
    .filter((m): m is TeamMember => Boolean(m));
};

const resolveRoster = (
  entry: TournamentTeamRef,
  catalogTeam: Team | null
): { lineup: TeamMember[]; reserves: TeamMember[] } => {
  if (catalogTeam) {
    const fromIdsLineup = pickByIds(catalogTeam.members, entry.lineupPlayerIds);
    const fromIdsReserve = pickByIds(catalogTeam.members, entry.reservePlayerIds);
    if (fromIdsLineup.length > 0 || fromIdsReserve.length > 0) {
      return { lineup: fromIdsLineup, reserves: fromIdsReserve };
    }

    const lineup = catalogTeam.members
      .filter((m) => getRosterSlot(m) === 'LINEUP')
      .slice(0, 5);
    const reserves = catalogTeam.members
      .filter((m) => getRosterSlot(m) === 'RESERVA')
      .slice(0, 2);
    if (lineup.length || reserves.length) {
      return { lineup, reserves };
    }

    return {
      lineup: catalogTeam.members.slice(0, 5),
      reserves: catalogTeam.members.slice(5, 7),
    };
  }

  return { lineup: [], reserves: [] };
};

const PlayerRow: React.FC<{ member: TeamMember; reserve?: boolean }> = ({
  member,
  reserve,
}) => (
  <div className="flex items-center gap-3 py-2">
    <Avatar
      src={member.avatar}
      name={member.nickname}
      size="sm"
      status={member.status}
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1.5">
        {member.role === 'CAPITÃO' && (
          <Crown className="w-3.5 h-3.5 text-[#E31B23] shrink-0" aria-hidden />
        )}
        <span className="text-sm font-semibold text-white truncate">
          {member.nickname}
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-[#858B96]">
        {member.inGameRole || member.role}
        {reserve ? ' · Reserva' : ''}
      </span>
    </div>
  </div>
);

export const TournamentTeamEntryModal: React.FC<TournamentTeamEntryModalProps> = ({
  isOpen,
  onClose,
  entry,
  catalogTeam,
}) => {
  const isConfirmed = entry ? entry.confirmed !== false : false;
  const { lineup, reserves } = useMemo(() => {
    if (!entry) return { lineup: [], reserves: [] };
    return resolveRoster(entry, catalogTeam);
  }, [entry, catalogTeam]);

  if (!entry) return null;

  const logoSrc = resolveTeamLogo(entry.id, entry.logo, catalogTeam?.logo);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="INSCRIÇÃO DO TIME"
      size="lg"
    >
      <div className="space-y-5 text-xs">
        <div className="sa-td-modal-team">
          {isImageSrc(logoSrc) ? (
            <img src={logoSrc} alt="" className="sa-td-modal-team__logo-img" />
          ) : (
            <span className="sa-td-modal-team__logo">{logoSrc}</span>
          )}
          <div className="min-w-0 flex-1">
            <span className="sa-td-modal-team__name">{entry.name}</span>
            <span className="sa-td-modal-team__meta">
              TAG: [{entry.tag}]
              {entry.registeredAt ? ` • Inscrito em ${entry.registeredAt}` : ''}
            </span>
          </div>
          <span
            className={`sa-td-team__status sa-td-team__status--static ${
              isConfirmed
                ? 'sa-td-team__status--confirmed'
                : 'sa-td-team__status--pending'
            }`}
          >
            <span className="sa-td-team__status-dot" aria-hidden />
            {isConfirmed ? 'Confirmado' : 'Inscritos'}
          </span>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#E31B23] mb-1">
            Lineup ({lineup.length}/5)
          </h4>
          {lineup.length > 0 ? (
            <div className="divide-y divide-[#1D2633] border border-[#272B35] bg-[#0B0D11] px-3">
              {lineup.map((m) => (
                <PlayerRow key={m.userId} member={m} />
              ))}
            </div>
          ) : (
            <p className="text-[#858B96] py-2">Escalação de titulares não informada.</p>
          )}
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300 mb-1">
            Reservas ({reserves.length}/2)
          </h4>
          {reserves.length > 0 ? (
            <div className="divide-y divide-[#1D2633] border border-[#272B35] bg-[#0B0D11] px-3">
              {reserves.map((m) => (
                <PlayerRow key={m.userId} member={m} reserve />
              ))}
            </div>
          ) : (
            <p className="text-[#858B96] py-2">Reservas não informadas.</p>
          )}
        </div>

        <Link to={paths.team(entry.id)} onClick={onClose}>
          <Button
            variant="primary"
            fullWidth
            size="md"
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            ACESSAR PÁGINA DO TIME
          </Button>
        </Link>
      </div>
    </Modal>
  );
};
