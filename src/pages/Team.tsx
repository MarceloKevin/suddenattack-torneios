import React, { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paths } from '../utils/paths';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TeamView, type TeamTab, type TeamMatchView } from '../components/team';
import { LINEUP_MAX } from '../utils/rosterHelpers';
import {
  Plus,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const { teamId } = useParams<{ teamId?: string }>();
  const { currentUser, currentTeam, teams, createTeam, leaveTeam, updateMemberRosterSlot, updateTeamProfile, recentMatches, tournaments } = useAuth();

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
  const [teamTab, setTeamTab] = useState<TeamTab>('geral');

  const viewedTeam = teamId ? teams.find((t) => t.id === teamId) ?? null : currentTeam;
  useDocumentTitle(viewedTeam?.name ? `${viewedTeam.name} - Perfil de equipe` : undefined);

  // /time sem ID e com time → redireciona para /time/:teamId
  if (!teamId && currentTeam) {
    return <Navigate to={paths.team(currentTeam.id)} replace />;
  }

  const isOwnTeam = !!viewedTeam && !!currentTeam && viewedTeam.id === currentTeam.id;

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
    const newId = createTeam({
      name: newTeamName,
      tag: newTeamTag,
      description: newTeamDesc || 'Time competitivo de Sudden Attack em busca da glória.',
      logo: newTeamLogo,
    });
    setFormSuccess('Time criado com sucesso!');
    if (newId) {
      setTimeout(() => navigate(paths.team(newId)), 600);
    }
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
        matchId: match.matchId || match.id,
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
      <TeamView
        team={viewedTeam}
        isOwnTeam={isOwnTeam}
        isCaptain={!!isCaptain}
        teamTab={teamTab}
        onTabChange={setTeamTab}
        teamMatches={teamMatches as TeamMatchView[]}
        feedbackMsg={feedbackMsg}
        rosterError={rosterError}
        onAssignRoster={handleAssignRoster}
        onBannerChange={(dataUrl) => {
          updateTeamProfile(viewedTeam.id, { banner: dataUrl });
          setFeedbackMsg('Banner atualizado');
          setTimeout(() => setFeedbackMsg(''), 2500);
        }}
        onLogoChange={(dataUrl) => {
          updateTeamProfile(viewedTeam.id, { logo: dataUrl });
          setFeedbackMsg('Logo atualizada');
          setTimeout(() => setFeedbackMsg(''), 2500);
        }}
        onLeave={() => {
          if (confirm('Tem certeza que deseja sair deste time?')) {
            leaveTeam();
          }
        }}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editName={editName}
        setEditName={setEditName}
        editTag={editTag}
        setEditTag={setEditTag}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editLogo={editLogo}
        setEditLogo={setEditLogo}
        editBanner={editBanner}
        setEditBanner={setEditBanner}
        onSaveEdit={() => {
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
        isManageModalOpen={isManageModalOpen}
        setIsManageModalOpen={setIsManageModalOpen}
        isLineupModalOpen={isLineupModalOpen}
        setIsLineupModalOpen={setIsLineupModalOpen}
      />
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