import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Team } from '../../types';
import {
  countBySlot,
  getRosterSlot,
  LINEUP_MAX,
} from '../../utils/rosterHelpers';
import { TeamHero } from './TeamHero';
import { TeamNavigation } from './TeamNavigation';
import { TeamLineup } from './TeamLineup';
import { TeamOverview } from './TeamOverview';
import { TeamStats } from './TeamStats';
import { TeamAchievements } from './TeamAchievements';
import { TeamRecentMatches } from './TeamRecentMatches';
import { TeamPlayers } from './TeamPlayers';
import { TeamSocials, TeamSocialLink } from './TeamSocials';
import {
  AssignSlotButtons,
  isImageSrc,
  readImageFile,
  TeamMatchView,
  TeamTab,
} from './shared';

interface TeamViewProps {
  team: Team;
  isOwnTeam: boolean;
  isCaptain: boolean;
  teamTab: TeamTab;
  onTabChange: (tab: TeamTab) => void;
  teamMatches: TeamMatchView[];
  feedbackMsg: string;
  rosterError: string;
  onAssignRoster: (userId: string, slot: 'LINEUP' | 'RESERVA') => void;
  onBannerChange: (dataUrl: string) => void;
  onLogoChange: (dataUrl: string) => void;
  onLeave: () => void;
  // Edit modal
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  editName: string;
  setEditName: (v: string) => void;
  editTag: string;
  setEditTag: (v: string) => void;
  editDesc: string;
  setEditDesc: (v: string) => void;
  editLogo: string;
  setEditLogo: (v: string) => void;
  editBanner: string;
  setEditBanner: (v: string) => void;
  onSaveEdit: () => void;
  // Manage / lineup modals
  isManageModalOpen: boolean;
  setIsManageModalOpen: (open: boolean) => void;
  isLineupModalOpen: boolean;
  setIsLineupModalOpen: (open: boolean) => void;
  /** Optional social links when backend provides them */
  socialLinks?: TeamSocialLink[];
}

export const TeamView: React.FC<TeamViewProps> = ({
  team,
  isOwnTeam,
  isCaptain,
  teamTab,
  onTabChange,
  teamMatches,
  feedbackMsg,
  rosterError,
  onAssignRoster,
  onBannerChange,
  onLogoChange,
  onLeave,
  isEditModalOpen,
  setIsEditModalOpen,
  editName,
  setEditName,
  editTag,
  setEditTag,
  editDesc,
  setEditDesc,
  editLogo,
  setEditLogo,
  editBanner,
  setEditBanner,
  onSaveEdit,
  isManageModalOpen,
  setIsManageModalOpen,
  isLineupModalOpen,
  setIsLineupModalOpen,
  socialLinks,
}) => {
  const rosterCounts = countBySlot(team.members);
  const lineupMembers = team.members.filter((m) => getRosterSlot(m) === 'LINEUP');
  const reservaMembers = team.members.filter((m) => getRosterSlot(m) === 'RESERVA');
  const foraMembers = team.members.filter((m) => getRosterSlot(m) === 'FORA');

  const openEdit = () => {
    setEditName(team.name);
    setEditTag(team.tag);
    setEditDesc(team.description);
    setEditLogo(team.logo);
    setEditBanner(team.banner || '');
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8 text-left">
      {feedbackMsg && (
        <div className="rounded-xl p-3 bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      <TeamHero
        team={team}
        isOwnTeam={isOwnTeam}
        isCaptain={isCaptain}
        onBannerChange={onBannerChange}
        onLogoChange={onLogoChange}
        onEdit={openEdit}
        onManage={() => setIsManageModalOpen(true)}
        onLeave={onLeave}
      />

      <TeamNavigation active={teamTab} onChange={onTabChange} />

      {rosterError && (
        <div className="rounded-xl p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
          {rosterError}
        </div>
      )}

      {teamTab === 'geral' && (
        <div className="space-y-6 sm:space-y-8">
          <TeamLineup
            members={lineupMembers}
            count={rosterCounts.lineup}
            max={LINEUP_MAX}
          />

          <TeamSocials links={socialLinks} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <TeamOverview team={team} />
            <TeamStats team={team} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            <TeamAchievements history={team.history} />
            <TeamRecentMatches
              teamName={team.name}
              teamLogo={team.logo}
              teamTag={team.tag}
              matches={teamMatches}
              limit={5}
            />
          </div>
        </div>
      )}

      {teamTab === 'historico' && (
        <TeamPlayers
          lineup={lineupMembers}
          reservas={reservaMembers}
          fora={foraMembers}
          formerMembers={team.formerMembers}
          isCaptain={!!isCaptain}
          onManageLineup={() => setIsLineupModalOpen(true)}
          canManage={!!isCaptain}
          onAssign={onAssignRoster}
        />
      )}

      {teamTab === 'partidas' && (
        <TeamRecentMatches
          teamName={team.name}
          teamLogo={team.logo}
          teamTag={team.tag}
          matches={teamMatches}
        />
      )}

      {/* Modal Editar Time */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="EDITAR DETALHES DO TIME"
      >
        <div className="space-y-4">
          <Input
            label="Nome do Time"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="TAG do Time"
            value={editTag}
            onChange={(e) => setEditTag(e.target.value)}
          />
          <Input
            label="Descrição do Clã"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block space-y-1.5 cursor-pointer">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">
                Logo do time
              </span>
              <div className="h-28 rounded-xl border border-dashed border-[#1D2633] bg-[#0B0F15] flex items-center justify-center overflow-hidden hover:border-[#E31B23]/60 transition-colors">
                {isImageSrc(editLogo) ? (
                  <img src={editLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">{editLogo || '🛡️'}</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setEditLogo(await readImageFile(file));
                }}
              />
            </label>

            <label className="block space-y-1.5 cursor-pointer">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">
                Banner de fundo
              </span>
              <div className="h-28 rounded-xl border border-dashed border-[#1D2633] bg-[#0B0F15] flex items-center justify-center overflow-hidden hover:border-[#E31B23]/60 transition-colors">
                {isImageSrc(editBanner) ? (
                  <img src={editBanner} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-mono text-zinc-600">Selecionar imagem</span>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setEditBanner(await readImageFile(file));
                }}
              />
            </label>
          </div>

          <Button variant="primary" fullWidth size="md" onClick={onSaveEdit} className="rounded-lg">
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </Modal>

      {/* Modal Gerenciar Line Up */}
      <Modal
        isOpen={isLineupModalOpen}
        onClose={() => setIsLineupModalOpen(false)}
        title="GERENCIAR LINE UP"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#8B93A7] leading-relaxed">
            Defina quem entra na Lineup ({LINEUP_MAX}) e quem fica como Reserva.
            {isCaptain
              ? ' Use os botões ao lado de cada player.'
              : ' Apenas o capitão pode alterar a escalação.'}
          </p>

          <div className="flex gap-3 text-[10px] font-mono">
            <span className="text-[#ff4d55]">
              Lineup {rosterCounts.lineup}/{LINEUP_MAX}
            </span>
            <span className="text-amber-300">
              Reserva {rosterCounts.reserva + rosterCounts.fora}
            </span>
          </div>

          {rosterError && (
            <div className="rounded-xl p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
              {rosterError}
            </div>
          )}

          <div className="rounded-xl border border-[#1D2633] bg-[#0B0F15] divide-y divide-[#1D2633] max-h-[50vh] overflow-y-auto">
            {[...lineupMembers, ...reservaMembers, ...foraMembers].map((member) => {
              const slot = getRosterSlot(member);
              return (
                <div key={member.userId} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar
                    src={member.avatar}
                    name={member.nickname}
                    size="sm"
                    status={member.status}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white truncate block">
                      {member.nickname}
                    </span>
                    <span className="text-[10px] font-mono text-[#8B93A7]">
                      {slot === 'LINEUP' ? 'Lineup' : 'Reserva'}
                    </span>
                  </div>
                  {isCaptain ? (
                    <AssignSlotButtons
                      slot={slot}
                      onAssign={(next) => onAssignRoster(member.userId, next)}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={() => setIsLineupModalOpen(false)}
            className="rounded-lg"
          >
            FECHAR
          </Button>
        </div>
      </Modal>

      {/* Modal Gerenciar Convites */}
      <Modal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        title="GERENCIAR ROSTER E CONVITES"
      >
        <div className="space-y-4 text-xs text-[#8B93A7]">
          <p>
            Envie um convite direto para o nickname de outro jogador registrado no Sudden Attack:
          </p>
          <Input placeholder="Nickname do jogador (Ex: SNIPER_SA)" />
          <Button
            variant="primary"
            fullWidth
            size="sm"
            className="rounded-lg"
            onClick={() => {
              alert('Convite enviado para o jogador com sucesso!');
              setIsManageModalOpen(false);
            }}
          >
            ENVIAR CONVITE DE ENTRADA
          </Button>
        </div>
      </Modal>
    </div>
  );
};
