import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormerTeamMember, TeamMember } from '../types';
import {
  countBySlot,
  getRosterSlot,
  LINEUP_MAX,
  RosterSlot,
} from '../utils/rosterHelpers';
import {
  Plus,
  Edit,
  Settings,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ImagePlus,
  Camera,
  Swords,
} from 'lucide-react';

const isImageSrc = (value?: string) =>
  !!value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('/'));

const BrazilFlag: React.FC<{ className?: string }> = ({ className }) => (
  <span
    className={`inline-block rounded-[1px] overflow-hidden shrink-0 border border-black/30 align-middle ${className ?? 'w-5 h-3.5'}`}
    title="Brasil"
    aria-label="Brasil"
  >
    <svg viewBox="0 0 22 15" className="w-full h-full block">
      <rect width="22" height="15" fill="#009B3A" />
      <polygon points="11,1.5 20,7.5 11,13.5 2,7.5" fill="#FEDF00" />
      <circle cx="11" cy="7.5" r="3.2" fill="#002776" />
      <path
        d="M8.2 7.1c.7-.35 1.6-.55 2.8-.55 1.2 0 2.1.2 2.8.55-.15.55-.7 1-1.4 1.2-.45.12-.95.18-1.4.18-.45 0-.95-.06-1.4-.18-.7-.2-1.25-.65-1.4-1.2z"
        fill="#FFFFFF"
        opacity="0.9"
      />
    </svg>
  </span>
);

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    reader.readAsDataURL(file);
  });

const AssignSlotButtons: React.FC<{
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
        className={`px-2 h-7 text-[10px] font-mono font-bold border transition-colors ${
          slot === 'LINEUP'
            ? 'border-[#E31B23] bg-[#E31B23]/25 text-[#ff4d55]'
            : 'border-[#272B35] text-[#9298A5] hover:border-[#E31B23]/50 hover:text-white'
        }`}
      >
        Lineup
      </button>
      <button
        type="button"
        title="Reserva"
        onClick={() => onAssign('RESERVA')}
        className={`px-2 h-7 text-[10px] font-mono font-bold border transition-colors ${
          isReserva
            ? 'border-amber-500 bg-amber-500/20 text-amber-300'
            : 'border-[#272B35] text-[#9298A5] hover:border-[#E31B23]/50 hover:text-white'
        }`}
      >
        Reserva
      </button>
    </div>
  );
};

const LineupShowcase: React.FC<{
  members: TeamMember[];
  count: number;
  max: number;
  canManage: boolean;
  onAssign: (userId: string, slot: 'LINEUP' | 'RESERVA') => void;
}> = ({ members, count, max, canManage, onAssign }) => {
  const slots = Array.from({ length: max }, (_, index) => members[index] ?? null);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-px w-6 bg-[#E31B23]" />
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#E31B23] font-bold">
              Titulares
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-display uppercase tracking-wide text-white">
            Lineup
          </h3>
          <p className="text-[11px] text-[#9298A5] mt-0.5">
            Os {max} jogadores que entram em campo nas partidas oficiais.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-[#E31B23]">
          {count}/{max}
        </span>
      </div>

      <div className="relative overflow-hidden border border-[#E31B23]/35 bg-[#08090D]">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 120%, rgba(227,27,35,0.28), transparent 55%), linear-gradient(180deg, #12151c 0%, #08090D 55%, #050607 100%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E31B23] to-transparent" />
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#E31B23]/10 to-transparent" />

        <div className="relative px-3 sm:px-6 pt-6 pb-5 sm:pt-8 sm:pb-7">
          <div className="flex items-end justify-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto pb-1">
            {slots.map((member, index) => {
              const isCaptain = member?.role === 'CAPITÃO';
              const sizeClass =
                index === 2
                  ? 'w-[112px] h-[112px] sm:w-[128px] sm:h-[128px]'
                  : 'w-[96px] h-[96px] sm:w-[112px] sm:h-[112px]';

              return (
                <div
                  key={member?.userId ?? `empty-${index}`}
                  className={`flex flex-col items-center text-center shrink-0 min-w-[108px] sm:min-w-[124px] ${
                    index === 2 ? 'sm:-translate-y-2' : ''
                  }`}
                >
                  <span className="text-[10px] font-mono text-[#9298A5] mb-2 tracking-widest">
                    #{String(index + 1).padStart(2, '0')}
                  </span>

                  {member ? (
                    <>
                      <div
                        className={`relative ${sizeClass} rounded-full p-[3px] mb-3 transition-transform duration-300 hover:scale-[1.03] ${
                          isCaptain
                            ? 'bg-[#B8F000] shadow-[0_0_24px_rgba(184,240,0,0.25)]'
                            : 'bg-[#B8F000]'
                        }`}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden bg-[#0E1016] ring-2 ring-black/50">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.nickname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl font-display text-zinc-400">
                              {member.nickname.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="text-sm sm:text-base font-display uppercase tracking-wide text-white truncate max-w-full">
                        {member.nickname}
                      </span>

                      {canManage && (
                        <div className="mt-2.5">
                          <AssignSlotButtons
                            slot={getRosterSlot(member)}
                            onAssign={(next) => onAssign(member.userId, next)}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div
                        className={`${sizeClass} rounded-full mb-3 border border-dashed border-[#3a3f4c] bg-[#0E1016]/60 flex items-center justify-center`}
                      >
                        <span className="text-[10px] font-mono text-zinc-600 uppercase">Vago</span>
                      </div>
                      <span className="text-xs font-mono text-zinc-600">—</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser, currentTeam, teams, createTeam, leaveTeam, updateMemberRosterSlot, updateTeamProfile, recentMatches, tournaments } = useAuth();

  const viewedTeam = teamId ? teams.find((t) => t.id === teamId) ?? null : currentTeam;
  const isOwnTeam = !!viewedTeam && !!currentTeam && viewedTeam.id === currentTeam.id;

  // Form state for creating team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamTag, setNewTeamTag] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [newTeamLogo, setNewTeamLogo] = useState('⚡');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [teamSearch, setTeamSearch] = useState('');
  const [rosterError, setRosterError] = useState('');

  // Modals for manage/edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [editName, setEditName] = useState('');
  const [editTag, setEditTag] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editLogo, setEditLogo] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [teamTab, setTeamTab] = useState<'geral' | 'historico' | 'partidas'>('geral');

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamTag.trim()) {
      setFormError('Preencha pelo menos o Nome e a TAG do time.');
      return;
    }
    if (newTeamTag.length > 5) {
      setFormError('A TAG do time deve ter no máximo 5 caracteres.');
      return;
    }

    setFormError('');
    createTeam({
      name: newTeamName,
      tag: newTeamTag,
      description: newTeamDesc || 'Time competitivo de Sudden Attack em busca da glória.',
      logo: newTeamLogo,
    });
    setFormSuccess('Time criado com sucesso!');
  };

  const handleJoinRequest = (teamId: string) => {
    if (pendingRequests.includes(teamId)) return;
    setPendingRequests((prev) => [...prev, teamId]);
    setFeedbackMsg('Solicitação enviada');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const searchTerm = teamSearch.trim().toLowerCase();
  const filteredTeams = teams.filter((t) => {
    if (!searchTerm) return true;
    return (
      t.name.toLowerCase().includes(searchTerm) ||
      t.tag.toLowerCase().includes(searchTerm) ||
      t.captainNickname.toLowerCase().includes(searchTerm)
    );
  });

  const handleAssignRoster = (userId: string, slot: 'LINEUP' | 'RESERVA') => {
    if (!viewedTeam || !isOwnTeam) return;

    let result = updateMemberRosterSlot(viewedTeam.id, userId, slot);
    // Se a reserva oficial estiver cheia, move para fora da escalação (ainda exibido como Reserva)
    if (!result.ok && slot === 'RESERVA') {
      result = updateMemberRosterSlot(viewedTeam.id, userId, 'FORA');
    }

    if (!result.ok) {
      const message =
        slot === 'LINEUP'
          ? `A Lineup já possui ${LINEUP_MAX} players. Remova alguém da Lineup antes de adicionar outro.`
          : result.message || 'Não foi possível atualizar a escalação.';
      alert(message);
      setRosterError(message);
      setTimeout(() => setRosterError(''), 3500);
      return;
    }
    setRosterError('');
    setFeedbackMsg(
      slot === 'LINEUP' ? 'Jogador movido para a Lineup' : 'Jogador movido para Reserva'
    );
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  // ==========================================
  // ESTADO 2 — VISUALIZAÇÃO DE TIME (próprio ou por ID)
  // ==========================================
  if (teamId && !viewedTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-3">
        <h1 className="text-2xl font-display uppercase text-white">Time não encontrado</h1>
        <p className="text-sm text-[#9298A5]">Esse clã não existe ou foi removido.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/torneios')}>
          VOLTAR AOS TORNEIOS
        </Button>
      </div>
    );
  }

  if (viewedTeam) {
    const isCaptain = isOwnTeam && currentUser?.id === viewedTeam.captainId;
    const rosterCounts = countBySlot(viewedTeam.members);
    const lineupMembers = viewedTeam.members.filter((m) => getRosterSlot(m) === 'LINEUP');
    const reservaMembers = viewedTeam.members.filter((m) => getRosterSlot(m) === 'RESERVA');
    const foraMembers = viewedTeam.members.filter((m) => getRosterSlot(m) === 'FORA');

    const teamMatches = (() => {
      const fromTournaments = tournaments.flatMap((tournament) =>
        (tournament.matches ?? [])
          .filter(
            (match) =>
              match.team1.id === viewedTeam.id || match.team2.id === viewedTeam.id
          )
          .map((match) => {
            const isTeam1 = match.team1.id === viewedTeam.id;
            const me = isTeam1 ? match.team1 : match.team2;
            const opponent = isTeam1 ? match.team2 : match.team1;
            const result =
              match.status !== 'COMPLETED'
                ? null
                : me.isWinner
                  ? ('VITÓRIA' as const)
                  : opponent.isWinner
                    ? ('DERROTA' as const)
                    : null;

            return {
              id: `${tournament.id}-${match.id}`,
              tournamentName: tournament.name,
              tournamentId: tournament.id,
              matchId: match.id,
              opponent: {
                name: opponent.name,
                tag: opponent.tag,
                logo: opponent.logo,
              },
              result,
              myScore: me.score,
              opponentScore: opponent.score,
              map: match.map || '—',
              date: match.date || '—',
              status: match.status,
              phase: match.phase,
            };
          })
      );

      if (fromTournaments.length > 0) return fromTournaments;

      // Fallback: partidas recentes só no próprio time
      if (!isOwnTeam) return [];

      return recentMatches.map((match) => ({
        id: match.id,
        tournamentName: match.tournamentName,
        tournamentId: match.tournamentId,
        matchId: match.id,
        opponent: match.opponent,
        result: match.result,
        myScore: match.myScore,
        opponentScore: match.opponentScore,
        map: match.map,
        date: match.date,
        status: 'COMPLETED' as const,
        phase: undefined as string | undefined,
      }));
    })();

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
        {feedbackMsg && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* HERO DO TIME: banner + logo + nome */}
        <section className="relative">
          <div className="relative h-40 sm:h-52 md:h-64 overflow-hidden bg-[#0E1016] border border-[#1a1d24]">
            {isImageSrc(viewedTeam.banner) ? (
              <img
                src={viewedTeam.banner}
                alt={`Banner ${viewedTeam.name}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, #1a0a0c 0%, #12151c 40%, #0E1016 100%), radial-gradient(ellipse at 70% 40%, rgba(227,27,35,0.35), transparent 55%)',
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-transparent to-black/20" />

            {isCaptain && (
              <label className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide bg-black/65 border border-white/15 text-white hover:border-[#E31B23] transition-colors">
                <ImagePlus className="w-3.5 h-3.5 text-[#E31B23]" />
                Banner
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataUrl = await readImageFile(file);
                    updateTeamProfile(viewedTeam.id, { banner: dataUrl });
                    setFeedbackMsg('Banner atualizado');
                    setTimeout(() => setFeedbackMsg(''), 2500);
                  }}
                />
              </label>
            )}
          </div>

          <div className="flex flex-col items-center -mt-12 sm:-mt-14 relative z-10 px-4">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#0E1016] border-2 border-[#272B35] shadow-2xl overflow-hidden flex items-center justify-center text-4xl">
                {isImageSrc(viewedTeam.logo) ? (
                  <img
                    src={viewedTeam.logo}
                    alt={viewedTeam.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{viewedTeam.logo || '🛡️'}</span>
                )}
              </div>
              {isCaptain && (
                <label className="absolute -bottom-1 -right-1 cursor-pointer w-8 h-8 bg-[#E31B23] border border-black flex items-center justify-center hover:bg-[#ff2a32] transition-colors">
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const dataUrl = await readImageFile(file);
                      updateTeamProfile(viewedTeam.id, { logo: dataUrl });
                      setFeedbackMsg('Logo atualizada');
                      setTimeout(() => setFeedbackMsg(''), 2500);
                    }}
                  />
                </label>
              )}
            </div>

            <h1 className="mt-4 text-2xl sm:text-3xl font-semibold text-white text-center tracking-tight inline-flex items-center justify-center gap-2">
              {viewedTeam.name}
              <BrazilFlag className="w-[22px] h-[15px]" />
            </h1>
            <p className="mt-1 text-sm text-[#9298A5] font-medium tracking-wide">
              {viewedTeam.tag}
            </p>

            {isOwnTeam && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setEditName(viewedTeam.name);
                    setEditTag(viewedTeam.tag);
                    setEditDesc(viewedTeam.description);
                    setEditLogo(viewedTeam.logo);
                    setEditBanner(viewedTeam.banner || '');
                    setIsEditModalOpen(true);
                  }}
                >
                  EDITAR TIME
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Settings className="w-3.5 h-3.5" />}
                  onClick={() => setIsManageModalOpen(true)}
                >
                  GERENCIAR
                </Button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja sair deste time?')) {
                      leaveTeam();
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-mono underline px-2"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ESCALAÇÃO OFICIAL */}
        <div className="space-y-4">
          {rosterError && (
            <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
              {rosterError}
            </div>
          )}

          <div className="space-y-6">
            <LineupShowcase
              members={lineupMembers}
              count={rosterCounts.lineup}
              max={LINEUP_MAX}
              canManage={!!isCaptain}
              onAssign={handleAssignRoster}
            />
          </div>
        </div>

        {/* ABAS */}
        <div className="space-y-5">
          <div className="flex justify-center border-b border-[#272B35] gap-8 sm:gap-12">
            {(
              [
                { key: 'geral' as const, label: 'Informações gerais' },
                { key: 'historico' as const, label: 'Players' },
                { key: 'partidas' as const, label: 'Partidas' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setTeamTab(tab.key)}
                className={`pb-3.5 text-sm sm:text-base font-display font-bold uppercase tracking-wide whitespace-nowrap border-b-[3px] transition-colors ${
                  teamTab === tab.key
                    ? 'border-[#E31B23] text-white'
                    : 'border-transparent text-[#9298A5] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {teamTab === 'geral' && (
            <div className="space-y-6">
              <Card variant="primary" className="p-5 sm:p-6 border-[#272B35] space-y-5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                    Sobre o clã
                  </span>
                  <p className="mt-2 text-sm text-[#9298A5] leading-relaxed">
                    {viewedTeam.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0E1016] border border-[#272B35] text-center">
                    <span className="text-[10px] uppercase font-mono text-[#9298A5] block">Títulos</span>
                    <span className="text-xl font-display text-yellow-400 font-bold">
                      {viewedTeam.stats.titles}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0E1016] border border-[#272B35] text-center">
                    <span className="text-[10px] uppercase font-mono text-[#9298A5] block">Partidas</span>
                    <span className="text-xl font-display text-white font-bold">
                      {viewedTeam.stats.matches}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0E1016] border border-[#272B35] text-center">
                    <span className="text-[10px] uppercase font-mono text-[#9298A5] block">Win rate</span>
                    <span className="text-xl font-display text-emerald-400 font-bold">
                      {viewedTeam.stats.winRate}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#0E1016] border border-[#272B35] text-center">
                    <span className="text-[10px] uppercase font-mono text-[#9298A5] block">Criado em</span>
                    <span className="text-xs font-mono text-white mt-1.5 block">
                      {viewedTeam.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-mono text-[#9298A5]">
                  <span>
                    Capitão: <strong className="text-white">{viewedTeam.captainNickname}</strong>
                  </span>
                  <span>
                    Jogadores: <strong className="text-white">{viewedTeam.members.length}/{viewedTeam.maxMembers}</strong>
                  </span>
                </div>
              </Card>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                    Palmarés
                  </span>
                  <h2 className="text-xl font-display uppercase tracking-wide text-white">
                    Campeonatos disputados
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {viewedTeam.history.map((hist) => {
                    const isChamp = hist.result === 'CAMPEÃO';
                    return (
                      <Card
                        key={hist.id}
                        variant="primary"
                        hasHudCorners={isChamp}
                        className={`p-5 border transition-all ${
                          isChamp
                            ? 'border-yellow-500/70 bg-gradient-to-br from-[#181B23] to-[#13161D] shadow-lg shadow-yellow-950/20'
                            : 'border-[#272B35]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono text-[#9298A5] mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#E31B23]" />
                            {hist.date}
                          </span>
                          {hist.prize && (
                            <span className="text-emerald-400 font-bold">{hist.prize}</span>
                          )}
                        </div>

                        <h3 className="text-lg font-display uppercase tracking-wide text-white mb-3">
                          {hist.tournamentName}
                        </h3>

                        <div className="pt-2 border-t border-[#272B35]/70 flex items-center justify-between">
                          <span className="text-xs text-[#9298A5] font-mono">RESULTADO:</span>
                          {isChamp ? (
                            <span className="text-sm font-display font-black tracking-wider text-yellow-400 flex items-center gap-1 bg-yellow-500/15 px-3 py-1 border border-yellow-500/40">
                              🏆 CAMPEÃO
                            </span>
                          ) : (
                            <Badge variant="slate" size="sm">
                              {hist.result}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {teamTab === 'historico' && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                      Elenco atual
                    </span>
                    <h2 className="text-xl font-display uppercase tracking-wide text-white">
                      Players do time
                    </h2>
                  </div>
                  {isCaptain && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Settings className="w-3.5 h-3.5" />}
                      onClick={() => setIsLineupModalOpen(true)}
                    >
                      GERENCIAR LINE UP
                    </Button>
                  )}
                </div>

                <div className="border border-[#272B35] bg-[#0E1016] divide-y divide-[#1a1d24]">
                  {[...lineupMembers, ...reservaMembers, ...foraMembers].map((member) => {
                    const slot = getRosterSlot(member);
                    const slotLabel = slot === 'LINEUP' ? 'Lineup' : 'Reserva';
                    const slotClass =
                      slot === 'LINEUP'
                        ? 'text-[#ff4d55] border-[#E31B23]/40 bg-[#E31B23]/10'
                        : 'text-amber-300 border-amber-500/40 bg-amber-500/10';

                    return (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 px-3 sm:px-4 py-3"
                      >
                        <Avatar
                          src={member.avatar}
                          name={member.nickname}
                          size="md"
                          status={member.status}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white truncate">
                              {member.nickname}
                            </span>
                            {member.role === 'CAPITÃO' && (
                              <span className="text-[9px] font-mono font-bold bg-[#E31B23] text-white px-1.5 py-0.5">
                                CAP
                              </span>
                            )}
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 border ${slotClass}`}>
                              {slotLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9298A5] truncate">
                            {member.name} · desde {member.joinedDate}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-bold">
                    Ex-membros
                  </span>
                  <h2 className="text-xl font-display uppercase tracking-wide text-white">
                    Players que saíram
                  </h2>
                </div>

                {(viewedTeam.formerMembers?.length ?? 0) > 0 ? (
                  <div className="border border-[#272B35] bg-[#0E1016]/70 divide-y divide-[#1a1d24]">
                    {viewedTeam.formerMembers!.map((member: FormerTeamMember) => (
                      <div
                        key={member.userId}
                        className="flex items-center gap-3 px-3 sm:px-4 py-3 opacity-80"
                      >
                        <Avatar src={member.avatar} name={member.nickname} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-zinc-300 truncate">
                              {member.nickname}
                            </span>
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-zinc-600 text-zinc-500">
                              Saiu
                            </span>
                          </div>
                          <p className="text-[11px] text-[#9298A5] truncate">
                            {member.name} · {member.joinedDate} → {member.leftDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-zinc-600 py-6 border border-[#272B35] text-center">
                    Nenhum player saiu do time ainda.
                  </p>
                )}
              </div>
            </div>
          )}

          {teamTab === 'partidas' && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                  Confrontos
                </span>
                <h2 className="text-xl font-display uppercase tracking-wide text-white">
                  Partidas da equipe
                </h2>
                <p className="text-xs text-[#9298A5] mt-1">
                  Histórico de jogos disputados por {viewedTeam.name}.
                </p>
              </div>

              {teamMatches.length > 0 ? (
                <div className="bg-[#13161D] border border-[#272B35] overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#0E1016] border-b border-[#272B35] text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                      <tr>
                        <th className="py-3 px-4">Campeonato</th>
                        <th className="py-3 px-4">Mapa</th>
                        <th className="py-3 px-4">Adversário</th>
                        <th className="py-3 px-4 text-center">Resultado</th>
                        <th className="py-3 px-4 text-center">Placar</th>
                        <th className="py-3 px-4 text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#272B35]/60">
                      {teamMatches.map((match) => {
                        const isWin = match.result === 'VITÓRIA';
                        const isLoss = match.result === 'DERROTA';
                        const detailsPath = `/torneios/${match.tournamentId}/partidas/${match.matchId}`;
                        return (
                          <tr
                            key={match.id}
                            role="link"
                            tabIndex={0}
                            onClick={() => navigate(detailsPath)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                navigate(detailsPath);
                              }
                            }}
                            className="hover:bg-[#181B23]/70 hover:border-l-[#E31B23] transition-colors duration-150 cursor-pointer border-l-2 border-l-transparent"
                          >
                            <td className="py-3.5 px-4 font-bold text-white text-xs sm:text-sm">
                              <span className="group-hover:text-[#E31B23]">{match.tournamentName}</span>
                              {match.phase && (
                                <span className="block text-[10px] font-mono font-normal text-[#9298A5] mt-0.5">
                                  {match.phase}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono text-zinc-300">
                              {match.map}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold text-white">
                              <div className="flex items-center gap-2">
                                <span>{match.opponent.logo}</span>
                                <span>{match.opponent.name}</span>
                                <span className="text-[10px] font-mono text-[#9298A5]">
                                  [{match.opponent.tag}]
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {match.result ? (
                                <span
                                  className={`inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider ${
                                    isWin
                                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-700/50'
                                      : isLoss
                                        ? 'bg-red-950/40 text-red-400 border border-red-800/60'
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-600'
                                  }`}
                                >
                                  {match.result}
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider bg-amber-950/40 text-amber-300 border border-amber-700/50">
                                  {match.status === 'LIVE' ? 'AO VIVO' : 'AGENDADA'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono text-sm text-white">
                              <span className={isWin ? 'text-emerald-400' : isLoss ? 'text-red-400' : ''}>
                                {match.myScore}
                              </span>
                              <span className="text-[#9298A5] mx-1">×</span>
                              <span>{match.opponentScore}</span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-xs font-mono text-[#9298A5]">
                              <span className="inline-flex items-center gap-2 justify-end">
                                {match.date}
                                <span className="text-[#E31B23] hidden sm:inline">→</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-[#272B35] bg-[#0E1016] py-12 text-center space-y-2">
                  <Swords className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-xs font-mono text-zinc-600">
                    Nenhuma partida registrada para este time.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

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
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                  Logo do time
                </span>
                <div className="h-28 border border-dashed border-[#272B35] bg-[#0E1016] flex items-center justify-center overflow-hidden hover:border-[#E31B23]/60 transition-colors">
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
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                  Banner de fundo
                </span>
                <div className="h-28 border border-dashed border-[#272B35] bg-[#0E1016] flex items-center justify-center overflow-hidden hover:border-[#E31B23]/60 transition-colors">
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

            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => {
                updateTeamProfile(viewedTeam.id, {
                  name: editName.trim() || viewedTeam.name,
                  tag: editTag.trim() || viewedTeam.tag,
                  description: editDesc.trim() || viewedTeam.description,
                  logo: editLogo || viewedTeam.logo,
                  banner: editBanner || undefined,
                });
                setIsEditModalOpen(false);
                setFeedbackMsg('Time atualizado');
                setTimeout(() => setFeedbackMsg(''), 2500);
              }}
            >
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
            <p className="text-xs text-[#9298A5] leading-relaxed">
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
              <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
                {rosterError}
              </div>
            )}

            <div className="border border-[#272B35] bg-[#0E1016] divide-y divide-[#1a1d24] max-h-[50vh] overflow-y-auto">
              {[...lineupMembers, ...reservaMembers, ...foraMembers].map((member) => {
                const slot = getRosterSlot(member);
                return (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
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
                      <span className="text-[10px] font-mono text-[#9298A5]">
                        {slot === 'LINEUP' ? 'Lineup' : 'Reserva'}
                      </span>
                    </div>
                    {isCaptain ? (
                      <AssignSlotButtons
                        slot={slot}
                        onAssign={(next) => handleAssignRoster(member.userId, next)}
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
          <div className="space-y-4 text-xs text-[#9298A5]">
            <p>Envie um convite direto para o nickname de outro jogador registrado no Sudden Attack:</p>
            <Input placeholder="Nickname do jogador (Ex: SNIPER_SA)" />
            <Button
              variant="primary"
              fullWidth
              size="sm"
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
  }

  // ==========================================
  // ESTADO 1 — USUÁRIO SEM TIME (LAYOUT DIVIDIDO)
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {feedbackMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TOP BANNER */}
      <div className="p-4 bg-[#181B23] border-l-4 border-[#E31B23] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#E31B23] font-bold block">
            ESTADO DO JOGADOR: AVULSO / SEM TIME
          </span>
          <p className="text-xs text-zinc-300 mt-0.5">
            Para se inscrever nos campeonatos, escolha um clã abaixo para solicitar entrada ou registre sua própria organização.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LADO ESQUERDO: LISTA DE TIMES (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="min-w-0">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
                COMUNIDADE & RECRUTAMENTO
              </span>
              <h1 className="text-3xl font-display uppercase tracking-wide text-white mt-0.5">
                ENCONTRE SEU TIME
              </h1>
              <p className="text-xs sm:text-sm text-[#9298A5]">
                Encontre uma equipe e solicite sua entrada para disputar os torneios oficiais.
              </p>
            </div>

            <div className="w-full sm:w-64 shrink-0">
              <Input
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Buscar time ou TAG..."
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredTeams.length > 0 ? (
              filteredTeams.map((t) => (
              <Card
                key={t.id}
                variant="primary"
                hasHudCorners
                className="p-5 border-[#272B35] hover:border-[#E31B23]/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-[#181B23] border border-[#272B35] flex items-center justify-center text-2xl shrink-0">
                      {t.logo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display uppercase tracking-wide text-white">
                          {t.name}
                        </h3>
                        <span className="text-xs font-mono bg-[#181B23] text-zinc-400 border border-[#272B35] px-1.5 py-0.2">
                          [{t.tag}]
                        </span>
                      </div>
                      <p className="text-xs text-[#9298A5] mt-1 line-clamp-2">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-zinc-400">
                        <span>
                          <strong className="text-white">{t.members.length} / {t.maxMembers}</strong> jogadores
                        </span>
                        <span>•</span>
                        <span>Capitão: <strong className="text-white">{t.captainNickname}</strong></span>
                        {t.stats.titles > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400 font-bold">🏆 {t.stats.titles} Título(s)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      variant={pendingRequests.includes(t.id) ? 'secondary' : 'primary'}
                      size="sm"
                      disabled={pendingRequests.includes(t.id)}
                      onClick={() => handleJoinRequest(t.id)}
                    >
                      {pendingRequests.includes(t.id) ? 'SOLICITAÇÃO ENVIADA' : 'SOLICITAR ENTRADA'}
                    </Button>
                  </div>
                </div>
              </Card>
              ))
            ) : (
              <Card variant="primary" className="p-8 border-[#272B35] text-center">
                <p className="text-sm font-display uppercase tracking-wide text-white">
                  Nenhum time encontrado
                </p>
                <p className="text-xs text-[#9298A5] mt-1">
                  Tente outro nome ou TAG na busca.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* LADO DIREITO: FORMULÁRIO CRIAR NOVO TIME (5 COLS) */}
        <div className="lg:col-span-5">
          <Card
            variant="primary"
            hasHudCorners
            className="p-6 border-[#272B35] bg-[#0E1016]/80 sticky top-24 shadow-2xl"
          >
            <div className="mb-5 pb-4 border-b border-[#272B35]">
              <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> FUNDAÇÃO DE CLÃ
              </span>
              <h2 className="text-2xl font-display uppercase tracking-wide text-white mt-1">
                CRIAR NOVO TIME
              </h2>
              <p className="text-xs text-[#9298A5] mt-0.5">
                Torne-se capitão, escolha a TAG e convoque seus aliados.
              </p>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-700 text-xs text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4">
              <Input
                label="Nome do Time"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Ex: TACTICAL SNIPERS"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="TAG (Até 5 letras)"
                  value={newTeamTag}
                  onChange={(e) => setNewTeamTag(e.target.value.toUpperCase())}
                  placeholder="Ex: TS"
                  maxLength={5}
                  required
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                    Logo / Emblema
                  </label>
                  <select
                    value={newTeamLogo}
                    onChange={(e) => setNewTeamLogo(e.target.value)}
                    className="w-full bg-[#0E1016] border border-[#272B35] px-3 py-2 text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                  >
                    <option value="⚡">⚡ Raio Alpha</option>
                    <option value="👑">👑 Coroa Imperial</option>
                    <option value="🐺">🐺 Lobo Alfa</option>
                    <option value="🎯">🎯 Retícula Mira</option>
                    <option value="👻">👻 Fantasma Tático</option>
                    <option value="🛡️">🛡️ Escudo Bélico</option>
                    <option value="⚔️">⚔️ Espadas Cruzadas</option>
                    <option value="🦅">🦅 Águia Dourada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  placeholder="Escreva sobre a proposta competitiva, rotina de treinos e requisitos para entrar..."
                  rows={3}
                  className="w-full bg-[#0E1016] border border-[#272B35] p-3 text-xs text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  CRIAR TIME
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};
