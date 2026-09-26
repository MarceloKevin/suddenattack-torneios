import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowLeftRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FolderInput,
  Plus,
  Pencil,
  RefreshCw,
  Save,
  Shield,
  ShieldOff,
  Swords,
  Trash2,
  Trophy,
  Unlock,
  Users,
  Calendar,
  LayoutGrid,
  ListOrdered,
  GitBranch,
  Map as MapIcon,
  ScrollText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  GroupStanding,
  MatchBracketGame,
  TournamentFormat,
  TournamentMatch,
  TournamentPhaseFormats,
  TournamentPrizeTier,
  TournamentRuleTopic,
  TournamentStatus,
  TournamentStructure,
  TOURNAMENT_FORMAT_LABELS,
  TOURNAMENT_STRUCTURE_LABELS,
  getConfirmedTeams,
  getPendingTeams,
  isGroupsStructure,
  resolvePhaseFormats,
} from '../types';
import { getTournamentMatches, matchStatusLabel, phaseLabel } from '../utils/matchHelpers';
import { formatGroupDistribution, teamToRef } from '../utils/tournamentGenerator';
import { canEditBracketMatch, MatchSlot } from '../utils/bracketHelpers';
import { TournamentBracket } from '../components/tournament/TournamentBracket';
import { Modal } from '../components/ui/Modal';
import { EditTournamentMapsPanel } from '../components/admin/EditTournamentMapsPanel';
import rankingBg from '../assets/ranking-bg.png';
import '../components/admin/AdminDashboard.css';
import '../components/admin/EditTournament.css';

type EditTab = 'info' | 'structure' | 'teams' | 'maps' | 'rules' | 'table' | 'bracket' | 'matches';

type PrizeDraft = TournamentPrizeTier;
type RuleTopicDraft = TournamentRuleTopic;

const newTierId = () => `prize-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const newRuleTopicId = () => `rule-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const countRuleItems = (topics: RuleTopicDraft[]) =>
  topics.reduce((sum, topic) => sum + topic.items.filter((i) => i.trim()).length, 0);

const formatPlaceLabel = (tier: PrizeDraft) => {
  if (tier.type === 'single' || tier.from === tier.to) return `${tier.from}º COLOCADO`;
  return `${tier.from}º — ${tier.to}º COLOCADO`;
};

const findRewardForPlace = (tiers: PrizeDraft[], place: number) => {
  const match = tiers.find((tier) => {
    const from = Math.min(tier.from, tier.to);
    const to = Math.max(tier.from, tier.to);
    return place >= from && place <= to;
  });
  return match?.reward?.trim() || '';
};

export const EditTournament: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentUser,
    teams,
    tournaments,
    maps,
    updateTournament,
    createMap,
    generateTournamentTable,
    generateTournamentBracket,
    setBracketMatchResult,
    releaseMatch,
  } = useAuth();

  const tournament = tournaments.find((t) => t.id === id);

  const [tab, setTab] = useState<EditTab>('info');
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<MatchBracketGame | null>(null);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [winnerSide, setWinnerSide] = useState<MatchSlot>('team1');
  const [isWo, setIsWo] = useState(false);
  const [matchDateTime, setMatchDateTime] = useState('');

  // Info form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxTeams, setMaxTeams] = useState(16);
  const [structure, setStructure] = useState<TournamentStructure>('groups_single_elim');
  const [groupCount, setGroupCount] = useState(4);
  const [qualifyPerGroup, setQualifyPerGroup] = useState(2);
  const [groupFormat, setGroupFormat] = useState<TournamentFormat>('MD1');
  const [knockoutFormat, setKnockoutFormat] = useState<TournamentFormat>('MD3');
  const [finalFormat, setFinalFormat] = useState<TournamentFormat>('MD5');
  const [status, setStatus] = useState<TournamentStatus>('open');
  const [server, setServer] = useState('');
  const [prizePoolSummary, setPrizePoolSummary] = useState('');
  const [prizeTiers, setPrizeTiers] = useState<PrizeDraft[]>([]);
  const [ruleTopics, setRuleTopics] = useState<RuleTopicDraft[]>([]);
  const [selectedMapIds, setSelectedMapIds] = useState<string[]>([]);
  const [swapSource, setSwapSource] = useState<{
    groupId: string;
    groupName: string;
    teamId: string;
    teamTag: string;
    teamName: string;
  } | null>(null);
  const [moveGroupSource, setMoveGroupSource] = useState<{
    groupId: string;
    groupName: string;
    teamId: string;
    teamTag: string;
    teamName: string;
  } | null>(null);

  // Sync form when tournament loads / changes id
  useEffect(() => {
    if (!tournament) return;
    setName(tournament.name);
    setDescription(tournament.description);
    setStartDate(tournament.startDate);
    setEndDate(tournament.endDate);
    setMaxTeams(tournament.maxTeams);
    setStructure(tournament.structure || 'groups_single_elim');
    setGroupCount(tournament.groupCount ?? 4);
    setQualifyPerGroup(tournament.qualifyPerGroup ?? 2);
    const phases = resolvePhaseFormats(tournament);
    setGroupFormat(phases.groups);
    setKnockoutFormat(phases.knockout);
    setFinalFormat(phases.final);
    setStatus(tournament.status);
    setServer(tournament.server);
    setPrizePoolSummary(tournament.prizePool);
    setPrizeTiers(
      tournament.prizeTiers && tournament.prizeTiers.length > 0
        ? tournament.prizeTiers.map((t) => ({ ...t }))
        : [
            {
              id: newTierId(),
              type: 'single',
              from: 1,
              to: 1,
              reward: tournament.firstPlacePrize,
            },
            {
              id: newTierId(),
              type: 'single',
              from: 2,
              to: 2,
              reward: tournament.secondPlacePrize,
            },
            {
              id: newTierId(),
              type: 'single',
              from: 3,
              to: 3,
              reward: tournament.thirdPlacePrize,
            },
          ]
    );
    setRuleTopics(
      tournament.rules.length > 0
        ? tournament.rules.map((topic) => ({
            ...topic,
            items: [...topic.items],
          }))
        : [{ id: newRuleTopicId(), title: 'Geral', items: [''] }]
    );
    setSelectedMapIds(
      tournament.mapIds?.length
        ? [...tournament.mapIds]
        : maps.map((m) => m.id)
    );
  }, [tournament?.id, maps]); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingTeams = useMemo(
    () => (tournament ? getPendingTeams(tournament.registeredTeams) : []),
    [tournament]
  );
  const confirmedTeams = useMemo(
    () => (tournament ? getConfirmedTeams(tournament.registeredTeams) : []),
    [tournament]
  );

  const availableTeams = useMemo(() => {
    if (!tournament) return [];
    const registered = new Set(tournament.registeredTeams.map((t) => t.id));
    return teams.filter((t) => !registered.has(t.id));
  }, [teams, tournament]);

  const allMatches = useMemo(
    () => (tournament ? getTournamentMatches(tournament) : []),
    [tournament]
  );

  const teamsInGroups = useMemo(() => {
    const list: {
      teamId: string;
      teamTag: string;
      teamName: string;
      teamLogo: string;
      groupId: string;
      groupName: string;
    }[] = [];
    for (const group of tournament?.groups ?? []) {
      for (const s of group.standings) {
        list.push({
          teamId: s.teamId,
          teamTag: s.teamTag,
          teamName: s.teamName,
          teamLogo: s.teamLogo,
          groupId: group.id,
          groupName: group.name,
        });
      }
    }
    return list;
  }, [tournament?.groups]);

  /** Usa a estrutura salva; se ainda não houver, considera o valor do formulário */
  const hasGroupStage = isGroupsStructure(tournament?.structure ?? structure);
  const draftHasGroupStage = isGroupsStructure(structure);
  const groupDistributionText = useMemo(
    () => formatGroupDistribution(Number(maxTeams) || 0, Number(groupCount) || 0),
    [maxTeams, groupCount]
  );

  useEffect(() => {
    if (!hasGroupStage && tab === 'table') {
      setTab('bracket');
    }
  }, [hasGroupStage, tab]);

  const flash = (type: 'ok' | 'err', text: string) => {
    setMessage({ type, text });
    window.setTimeout(() => setMessage(null), 3500);
  };

  if (!currentUser?.isAdmin) {
    return (
      <div className="sa-admin">
        <div className="sa-admin__bg" aria-hidden>
          <div className="sa-admin__bg-base" />
        </div>
        <div className="sa-admin-gate">
          <ShieldOff className="sa-admin-gate__icon" aria-hidden />
          <h1>Sem permissão</h1>
          <p>Apenas administradores podem editar torneios.</p>
          <Link to="/dashboard_admin" className="sa-admin-btn sa-admin-btn--primary">
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="sa-admin">
        <div className="sa-admin__bg" aria-hidden>
          <div className="sa-admin__bg-base" />
        </div>
        <div className="sa-admin-gate">
          <Trophy className="sa-admin-gate__icon" aria-hidden />
          <h1>Torneio não encontrado</h1>
          <p>O campeonato solicitado não existe ou foi removido.</p>
          <Link to="/dashboard_admin" className="sa-admin-btn sa-admin-btn--primary">
            Voltar ao painel
          </Link>
        </div>
      </div>
    );
  }

  const updateTier = (tierId: string, patch: Partial<PrizeDraft>) => {
    setPrizeTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== tierId) return tier;
        const next = { ...tier, ...patch };
        if (patch.type === 'single') next.to = next.from;
        if (patch.from !== undefined && next.type === 'single') next.to = patch.from;
        return next;
      })
    );
  };

  const toggleMap = (mapId: string) => {
    setSelectedMapIds((prev) =>
      prev.includes(mapId) ? prev.filter((id) => id !== mapId) : [...prev, mapId]
    );
  };

  const selectAllMaps = () => setSelectedMapIds(maps.map((m) => m.id));
  const clearMaps = () => setSelectedMapIds([]);

  const saveMaps = () => {
    if (selectedMapIds.length === 0) {
      flash('err', 'Selecione ao menos um mapa para o torneio.');
      return;
    }
    updateTournament(tournament.id, { mapIds: selectedMapIds });
    flash('ok', 'Mapas do torneio salvos.');
  };

  const handleMapCreated = (mapId: string) => {
    setSelectedMapIds((prev) => (prev.includes(mapId) ? prev : [...prev, mapId]));
    flash('ok', 'Mapa cadastrado e incluído no pool. Salve para confirmar.');
  };

  const saveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      flash('err', 'O nome do torneio é obrigatório.');
      return;
    }

    const cleaned = prizeTiers
      .map((tier) => {
        const from = Math.max(1, Math.min(tier.from, tier.to));
        const to = Math.max(1, Math.max(tier.from, tier.to));
        return {
          ...tier,
          from,
          to: tier.type === 'single' ? from : to,
          reward: tier.reward.trim(),
        };
      })
      .filter((tier) => tier.reward.length > 0)
      .sort((a, b) => a.from - b.from || a.to - b.to);

    updateTournament(tournament.id, {
      name: name.trim(),
      description: description.trim() || tournament.description,
      startDate,
      endDate,
      status,
      server: server.trim() || tournament.server,
      prizePool: prizePoolSummary.trim() || cleaned[0]?.reward || tournament.prizePool,
      firstPlacePrize: findRewardForPlace(cleaned, 1) || tournament.firstPlacePrize,
      secondPlacePrize: findRewardForPlace(cleaned, 2) || tournament.secondPlacePrize,
      thirdPlacePrize: findRewardForPlace(cleaned, 3) || tournament.thirdPlacePrize,
      prizeTiers: cleaned,
      tag: name.trim().substring(0, 8).toUpperCase().replace(/\s+/g, '') || tournament.tag,
    });
    flash('ok', 'Informações do torneio salvas.');
  };

  const saveStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const phaseFormats: TournamentPhaseFormats = {
      groups: groupFormat,
      knockout: knockoutFormat,
      final: finalFormat,
    };
    const withGroups = isGroupsStructure(structure);
    updateTournament(tournament.id, {
      maxTeams: Math.max(2, Math.floor(Number(maxTeams) || 2)),
      structure,
      format: knockoutFormat,
      phaseFormats,
      groupCount: withGroups ? Math.max(2, Math.min(8, Number(groupCount) || 4)) : undefined,
      qualifyPerGroup: withGroups
        ? Math.max(1, Math.min(4, Number(qualifyPerGroup) || 2))
        : undefined,
    });
    flash('ok', 'Estrutura e formatos das partidas salvos.');
  };

  const saveRules = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = ruleTopics
      .map((topic) => ({
        id: topic.id,
        title: topic.title.trim(),
        items: topic.items.map((item) => item.trim()).filter(Boolean),
      }))
      .filter((topic) => topic.title.length > 0 && topic.items.length > 0);

    if (cleaned.length === 0) {
      flash('err', 'Adicione ao menos um tópico com título e uma regra.');
      return;
    }

    updateTournament(tournament.id, { rules: cleaned });
    setRuleTopics(cleaned);
    flash('ok', 'Regras do torneio salvas.');
  };

  const updateRuleTopic = (topicId: string, patch: Partial<RuleTopicDraft>) => {
    setRuleTopics((prev) =>
      prev.map((topic) => (topic.id === topicId ? { ...topic, ...patch } : topic))
    );
  };

  const updateRuleItem = (topicId: string, index: number, value: string) => {
    setRuleTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        const items = [...topic.items];
        items[index] = value;
        return { ...topic, items };
      })
    );
  };

  const addRuleItem = (topicId: string) => {
    setRuleTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId ? { ...topic, items: [...topic.items, ''] } : topic
      )
    );
  };

  const removeRuleItem = (topicId: string, index: number) => {
    setRuleTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        if (topic.items.length <= 1) return { ...topic, items: [''] };
        return { ...topic, items: topic.items.filter((_, i) => i !== index) };
      })
    );
  };

  const addRuleTopic = () => {
    setRuleTopics((prev) => [
      ...prev,
      { id: newRuleTopicId(), title: '', items: [''] },
    ]);
  };

  const removeRuleTopic = (topicId: string) => {
    setRuleTopics((prev) => {
      if (prev.length <= 1) {
        return [{ id: newRuleTopicId(), title: '', items: [''] }];
      }
      return prev.filter((topic) => topic.id !== topicId);
    });
  };

  const addTeam = (teamId: string) => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return;
    updateTournament(tournament.id, {
      registeredTeams: [
        ...tournament.registeredTeams,
        teamToRef(team, { confirmed: false }),
      ],
    });
    flash('ok', `${team.tag} inscrito (aguardando confirmação).`);
  };

  const confirmTeam = (teamId: string) => {
    if (confirmedTeams.length >= tournament.maxTeams) {
      flash('err', 'Limite máximo de times confirmados atingido.');
      return;
    }
    updateTournament(tournament.id, {
      registeredTeams: tournament.registeredTeams.map((t) =>
        t.id === teamId ? { ...t, confirmed: true } : t
      ),
    });
    flash('ok', 'Time confirmado no torneio.');
  };

  const unconfirmTeam = (teamId: string) => {
    updateTournament(tournament.id, {
      registeredTeams: tournament.registeredTeams.map((t) =>
        t.id === teamId ? { ...t, confirmed: false } : t
      ),
    });
    flash('ok', 'Time movido de volta para inscritos.');
  };

  const removeTeam = (teamId: string) => {
    if (!window.confirm('Remover este time do torneio?')) return;
    updateTournament(tournament.id, {
      registeredTeams: tournament.registeredTeams.filter((t) => t.id !== teamId),
    });
    flash('ok', 'Time removido.');
  };

  const handleGenerateTable = () => {
    if (!hasGroupStage) {
      flash(
        'err',
        'Este torneio não tem fase de grupos. Altere a estrutura na aba Estrutura para incluir grupos.'
      );
      return;
    }
    if (
      !window.confirm(
        'Gerar tabela automática? Isso substitui grupos, partidas de grupo e a chave atuais.'
      )
    ) {
      return;
    }
    const result = generateTournamentTable(tournament.id);
    if (!result.ok) {
      flash('err', result.message || 'Não foi possível gerar a tabela.');
      return;
    }
    flash('ok', 'Tabela gerada com sucesso.');
    setTab('table');
  };

  const handleGenerateBracket = () => {
    if (
      !window.confirm(
        'Gerar tabela MATA-MATA aleatória? Isso substitui a chave atual com um novo sorteio dos times confirmados.'
      )
    ) {
      return;
    }
    const result = generateTournamentBracket(tournament.id);
    if (!result.ok) {
      flash('err', result.message || 'Não foi possível gerar o mata-mata.');
      return;
    }
    flash('ok', 'Chave mata-mata gerada com sorteio aleatório.');
    setTab('bracket');
  };

  const openMatchEditor = (match: MatchBracketGame) => {
    if (!canEditBracketMatch(match)) {
      flash('err', 'Esta partida ainda não tem os dois times definidos.');
      return;
    }
    setSelectedMatch(match);
    setScore1(match.team1.score || 0);
    setScore2(match.team2.score || 0);
    setWinnerSide(
      match.team1.isWinner ? 'team1' : match.team2.isWinner ? 'team2' : 'team1'
    );
    setIsWo(Boolean(match.wo));
    setMatchDateTime(
      match.date && !/^a definir$/i.test(match.date.trim()) ? match.date : ''
    );
  };

  const openMatchScoreFromList = (match: TournamentMatch) => {
    const bracketMatch = (tournament.brackets ?? []).find((b) => b.id === match.id);
    if (bracketMatch) {
      openMatchEditor(bracketMatch);
      return;
    }

    const asBracket: MatchBracketGame = {
      id: match.id,
      round: 'QUARTAS',
      matchNumber: match.matchNumber,
      team1: match.team1,
      team2: match.team2,
      status: match.status,
      date: match.date,
      playedMaps: match.playedMaps,
      evidence: match.evidence,
      chatMessages: match.chatMessages,
      adminCalled: match.adminCalled,
      adminCalledAt: match.adminCalledAt,
      adminCalledBy: match.adminCalledBy,
    };
    openMatchEditor(asBracket);
  };

  const closeMatchEditor = () => {
    setSelectedMatch(null);
  };

  const saveMatchResult = () => {
    if (!selectedMatch) return;

    let winner: MatchSlot = winnerSide;
    if (!isWo) {
      if (score1 === score2) {
        flash('err', 'Placar empatado — defina um vencedor ou marque W.O.');
        return;
      }
      winner = score1 > score2 ? 'team1' : 'team2';
    }

    const result = setBracketMatchResult(tournament.id, selectedMatch.id, {
      score1: isWo ? (winner === 'team1' ? Math.max(score1, 1) : 0) : score1,
      score2: isWo ? (winner === 'team2' ? Math.max(score2, 1) : 0) : score2,
      winner,
      wo: isWo,
      date: matchDateTime.trim() || selectedMatch.date,
    });

    if (!result.ok) {
      flash('err', result.message || 'Não foi possível salvar o placar.');
      return;
    }

    flash(
      'ok',
      result.championSet
        ? 'Chave completa. Campeão do torneio definido.'
        : isWo
          ? 'Partida encerrada por W.O. O campeão só será definido ao final da chave.'
          : 'Placar salvo. O campeão só será definido quando toda a chave estiver preenchida.'
    );
    closeMatchEditor();
  };

  const handleRelease = (matchId: string) => {
    const result = releaseMatch(tournament.id, matchId);
    if (!result.ok) {
      flash('err', result.message || 'Falha ao liberar partida.');
      return;
    }
    flash('ok', 'Partida liberada (ao vivo).');
  };

  const patchStanding = (
    groupId: string,
    teamId: string,
    field: keyof GroupStanding,
    value: number
  ) => {
    const groups = (tournament.groups ?? []).map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        standings: g.standings
          .map((s) => (s.teamId === teamId ? { ...s, [field]: value } : s))
          .sort((a, b) => b.points - a.points || b.roundsFor - b.roundsAgainst - (a.roundsFor - a.roundsAgainst)),
      };
    });
    updateTournament(tournament.id, { groups });
  };

  const swapGroupTeams = (sourceTeamId: string, targetTeamId: string) => {
    if (sourceTeamId === targetTeamId) {
      setSwapSource(null);
      return;
    }

    const groups = (tournament.groups ?? []).map((g) => ({
      ...g,
      standings: g.standings.map((s) => ({ ...s })),
    }));

    type Loc = { groupIndex: number; standingIndex: number };
    let sourceLoc: Loc | undefined;
    let targetLoc: Loc | undefined;

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const standings = groups[groupIndex].standings;
      for (let standingIndex = 0; standingIndex < standings.length; standingIndex += 1) {
        const teamId = standings[standingIndex].teamId;
        if (teamId === sourceTeamId) sourceLoc = { groupIndex, standingIndex };
        if (teamId === targetTeamId) targetLoc = { groupIndex, standingIndex };
      }
    }

    if (!sourceLoc || !targetLoc) {
      flash('err', 'Não foi possível localizar as equipes nos grupos.');
      setSwapSource(null);
      return;
    }

    const sourceStanding = groups[sourceLoc.groupIndex].standings[sourceLoc.standingIndex];
    const targetStanding = groups[targetLoc.groupIndex].standings[targetLoc.standingIndex];
    groups[sourceLoc.groupIndex].standings[sourceLoc.standingIndex] = targetStanding;
    groups[targetLoc.groupIndex].standings[targetLoc.standingIndex] = sourceStanding;

    const remapSide = <
      T extends { id: string; name: string; tag: string; logo: string },
    >(
      side: T
    ): T => {
      if (side.id === sourceTeamId) {
        return {
          ...side,
          id: targetStanding.teamId,
          name: targetStanding.teamName,
          tag: targetStanding.teamTag,
          logo: targetStanding.teamLogo,
        };
      }
      if (side.id === targetTeamId) {
        return {
          ...side,
          id: sourceStanding.teamId,
          name: sourceStanding.teamName,
          tag: sourceStanding.teamTag,
          logo: sourceStanding.teamLogo,
        };
      }
      return side;
    };

    const matches = (tournament.matches ?? []).map((match) => ({
      ...match,
      team1: remapSide(match.team1),
      team2: remapSide(match.team2),
    }));

    const brackets = (tournament.brackets ?? []).map((match) => ({
      ...match,
      team1: remapSide(match.team1),
      team2: remapSide(match.team2),
    }));

    updateTournament(tournament.id, { groups, matches, brackets });
    flash(
      'ok',
      `Troca feita: [${sourceStanding.teamTag}] ↔ [${targetStanding.teamTag}].`
    );
    setSwapSource(null);
  };

  const moveTeamToGroup = (teamId: string, targetGroupId: string) => {
    const groups = (tournament.groups ?? []).map((g) => ({
      ...g,
      standings: g.standings.map((s) => ({ ...s })),
    }));

    const sourceGroup = groups.find((g) => g.standings.some((s) => s.teamId === teamId));
    const targetGroup = groups.find((g) => g.id === targetGroupId);

    if (!sourceGroup || !targetGroup) {
      flash('err', 'Não foi possível localizar o grupo de destino.');
      setMoveGroupSource(null);
      return;
    }

    if (sourceGroup.id === targetGroup.id) {
      setMoveGroupSource(null);
      return;
    }

    const standingIndex = sourceGroup.standings.findIndex((s) => s.teamId === teamId);
    if (standingIndex < 0) {
      flash('err', 'Time não encontrado no grupo atual.');
      setMoveGroupSource(null);
      return;
    }

    const [standing] = sourceGroup.standings.splice(standingIndex, 1);
    const movedStanding: GroupStanding = {
      ...standing,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      roundsFor: 0,
      roundsAgainst: 0,
      points: 0,
    };
    targetGroup.standings.push(movedStanding);

    const groupPhases = new Set(groups.map((g) => g.name));
    const remainingMatches = (tournament.matches ?? []).filter((m) => {
      const involves = m.team1.id === teamId || m.team2.id === teamId;
      if (involves && groupPhases.has(m.phase)) return false;
      return true;
    });

    let nextMatchNumber = remainingMatches.reduce(
      (max, m) => Math.max(max, m.matchNumber),
      0
    );
    const newMatches: TournamentMatch[] = [];
    for (const opponent of targetGroup.standings) {
      if (opponent.teamId === teamId) continue;
      nextMatchNumber += 1;
      newMatches.push({
        id: `${tournament.id}-m-${nextMatchNumber}-${Date.now()}-${opponent.teamId}`,
        phase: targetGroup.name,
        matchNumber: nextMatchNumber,
        team1: {
          id: movedStanding.teamId,
          name: movedStanding.teamName,
          tag: movedStanding.teamTag,
          logo: movedStanding.teamLogo,
          score: 0,
          isWinner: false,
        },
        team2: {
          id: opponent.teamId,
          name: opponent.teamName,
          tag: opponent.teamTag,
          logo: opponent.teamLogo,
          score: 0,
          isWinner: false,
        },
        status: 'SCHEDULED',
        format: 'MD1',
      });
    }

    updateTournament(tournament.id, {
      groups,
      matches: [...remainingMatches, ...newMatches],
    });
    flash(
      'ok',
      `[${movedStanding.teamTag}] movido de ${sourceGroup.name} para ${targetGroup.name}.`
    );
    setMoveGroupSource(null);
  };

  return (
    <div className="sa-admin sa-edit">
      <div className="sa-admin__bg" aria-hidden>
        <div
          className="sa-admin__bg-image"
          style={{ backgroundImage: `url(${rankingBg})` }}
        />
        <div className="sa-admin__bg-base" />
        <div className="sa-admin__bg-grid" />
      </div>

      <div className="sa-admin__inner">
        <div className="sa-edit-nav">
          <Link to="/dashboard_admin" className="sa-edit-back">
            <ArrowLeft className="w-4 h-4" aria-hidden />
            Painel Admin
          </Link>
          <Link to={`/torneios/${tournament.id}`} className="sa-admin-btn sa-admin-btn--ghost">
            <Eye className="w-3.5 h-3.5" aria-hidden />
            Ver página pública
          </Link>
        </div>

        <header className="sa-admin-header">
          <div>
            <span className="sa-admin-header__label">
              <Shield className="w-3 h-3 inline" aria-hidden /> Admin // Editar torneio
            </span>
            <h1 className="sa-admin-header__title font-display">{tournament.name}</h1>
            <p className="sa-admin-header__subtitle">
              {confirmedTeams.length}/{tournament.maxTeams} confirmados ·{' '}
              {pendingTeams.length} aguardando ·{' '}
              {TOURNAMENT_STRUCTURE_LABELS[tournament.structure || 'single_elim']}
            </p>
          </div>
          <div className="sa-admin-header__actions">
            {hasGroupStage && (
              <button
                type="button"
                className="sa-admin-btn sa-admin-btn--primary"
                onClick={handleGenerateTable}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                Gerar tabela automática
              </button>
            )}
          </div>
        </header>

        {message && (
          <div
            className={`sa-edit-flash sa-edit-flash--${message.type}`}
            role="status"
          >
            {message.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4" aria-hidden />
            ) : (
              <ShieldOff className="w-4 h-4" aria-hidden />
            )}
            {message.text}
          </div>
        )}

        <div className="sa-admin-tabs" role="tablist">
          {(
            [
              ['info', 'Informações', Trophy],
              ['structure', 'Estrutura', Swords],
              ['teams', 'Times', Users],
              ['maps', 'Mapas', MapIcon],
              ['rules', 'Regras', ScrollText],
              ...(hasGroupStage
                ? ([['table', 'Tabela', LayoutGrid]] as const)
                : []),
              ['bracket', 'Mata-mata', GitBranch],
              ['matches', 'Partidas', ListOrdered],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              className={`sa-admin-tab${tab === key ? ' sa-admin-tab--active' : ''}`}
              onClick={() => setTab(key as EditTab)}
            >
              <Icon className="w-4 h-4" aria-hidden />
              {label}
              {key === 'teams' && (
                <span className="sa-admin-tab__count">
                  {confirmedTeams.length}/{tournament.maxTeams}
                </span>
              )}
              {key === 'maps' && (
                <span className="sa-admin-tab__count">{selectedMapIds.length}</span>
              )}
              {key === 'rules' && (
                <span className="sa-admin-tab__count">{countRuleItems(ruleTopics)}</span>
              )}
              {key === 'table' && (
                <span className="sa-admin-tab__count">
                  {(tournament.groups ?? []).length}
                </span>
              )}
              {key === 'bracket' && (
                <span className="sa-admin-tab__count">
                  {(tournament.brackets ?? []).length}
                </span>
              )}
              {key === 'matches' && (
                <span className="sa-admin-tab__count">{allMatches.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── INFO ── */}
        {tab === 'info' && (
          <form onSubmit={saveInfo} className="sa-admin-panel sa-edit-panel">
            <div className="sa-edit-panel__body space-y-5">
              <div>
                <label className="sa-edit-label">Nome do Torneio</label>
                <div className="sa-edit-field">
                  <Trophy className="sa-edit-field__icon" aria-hidden />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="sa-edit-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="sa-edit-label">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="sa-edit-textarea"
                />
              </div>

              <div className="sa-edit-grid-2">
                <div>
                  <label className="sa-edit-label">Data de início</label>
                  <div className="sa-edit-field">
                    <Calendar className="sa-edit-field__icon" aria-hidden />
                    <input
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="sa-edit-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="sa-edit-label">Data de término</label>
                  <div className="sa-edit-field">
                    <Calendar className="sa-edit-field__icon" aria-hidden />
                    <input
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="sa-edit-input"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="sa-edit-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                  className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                >
                  <option value="draft">Rascunho</option>
                  <option value="open">Inscrições abertas</option>
                  <option value="active">Em andamento</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>

              <div>
                <label className="sa-edit-label">Servidor</label>
                <input
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="sa-edit-input sa-edit-input--full"
                />
              </div>

              <div className="sa-edit-divider">
                <span>Premiação</span>
              </div>

              <div>
                <label className="sa-edit-label">Resumo da premiação</label>
                <input
                  value={prizePoolSummary}
                  onChange={(e) => setPrizePoolSummary(e.target.value)}
                  className="sa-edit-input sa-edit-input--full"
                />
              </div>

              <div className="space-y-3">
                {prizeTiers.map((tier, index) => (
                  <div key={tier.id} className="sa-edit-prize">
                    <div className="sa-edit-prize__head">
                      <span>
                        #{index + 1} · {formatPlaceLabel(tier)}
                      </span>
                      <button
                        type="button"
                        className="sa-admin-btn sa-admin-btn--danger"
                        disabled={prizeTiers.length <= 1}
                        onClick={() =>
                          setPrizeTiers((prev) => prev.filter((t) => t.id !== tier.id))
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>
                    <div className="sa-edit-grid-3">
                      <select
                        value={tier.type}
                        onChange={(e) =>
                          updateTier(tier.id, {
                            type: e.target.value as 'single' | 'range',
                          })
                        }
                        className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                      >
                        <option value="single">Posição única</option>
                        <option value="range">Intervalo</option>
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={tier.from}
                        onChange={(e) =>
                          updateTier(tier.id, { from: Number(e.target.value) || 1 })
                        }
                        className="sa-edit-input sa-edit-input--full"
                      />
                      <input
                        type="number"
                        min={1}
                        value={tier.type === 'single' ? tier.from : tier.to}
                        disabled={tier.type === 'single'}
                        onChange={(e) =>
                          updateTier(tier.id, { to: Number(e.target.value) || 1 })
                        }
                        className="sa-edit-input sa-edit-input--full"
                      />
                    </div>
                    <input
                      value={tier.reward}
                      onChange={(e) => updateTier(tier.id, { reward: e.target.value })}
                      placeholder="Texto da premiação"
                      className="sa-edit-input sa-edit-input--full"
                    />
                  </div>
                ))}
              </div>

              <div className="sa-admin-actions">
                <button
                  type="button"
                  className="sa-admin-btn"
                  onClick={() =>
                    setPrizeTiers((prev) => {
                      const last = prev[prev.length - 1];
                      const nextFrom = last ? Math.max(last.from, last.to) + 1 : 1;
                      return [
                        ...prev,
                        {
                          id: newTierId(),
                          type: 'single',
                          from: nextFrom,
                          to: nextFrom,
                          reward: '',
                        },
                      ];
                    })
                  }
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden />
                  Posição
                </button>
                <button
                  type="button"
                  className="sa-admin-btn"
                  onClick={() =>
                    setPrizeTiers((prev) => {
                      const last = prev[prev.length - 1];
                      const nextFrom = last ? Math.max(last.from, last.to) + 1 : 1;
                      return [
                        ...prev,
                        {
                          id: newTierId(),
                          type: 'range',
                          from: nextFrom,
                          to: nextFrom + 3,
                          reward: '',
                        },
                      ];
                    })
                  }
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden />
                  Intervalo
                </button>
              </div>
            </div>

            <div className="sa-edit-panel__footer">
              <button
                type="button"
                className="sa-admin-btn"
                onClick={() => navigate('/dashboard_admin')}
              >
                Cancelar
              </button>
              <button type="submit" className="sa-admin-btn sa-admin-btn--primary">
                <Save className="w-3.5 h-3.5" aria-hidden />
                Salvar informações
              </button>
            </div>
          </form>
        )}

        {/* ── STRUCTURE ── */}
        {tab === 'structure' && (
          <form onSubmit={saveStructure} className="sa-admin-panel sa-edit-panel">
            <div className="sa-edit-panel__body space-y-5">
              <div className="sa-edit-maps-hero">
                <div>
                  <span className="sa-admin-header__label">Chave e séries</span>
                  <h2 className="sa-edit-section-title" style={{ display: 'block', marginTop: 6 }}>
                    Estrutura e formatos
                  </h2>
                  <p className="sa-edit-maps__hint" style={{ marginTop: 8, maxWidth: 560 }}>
                    Defina se o campeonato tem fase de grupos e o formato MD de cada etapa: grupos,
                    mata-mata e final.
                  </p>
                </div>
              </div>

              <div className="sa-edit-structure-stack">
                <div className="sa-edit-structure-field">
                  <label className="sa-edit-label sa-edit-label--emphasis" htmlFor="edit-max-teams">
                    Máx. de times
                  </label>
                  <p className="sa-edit-structure-field__desc">
                    Limite de equipes confirmadas que o campeonato pode receber.
                  </p>
                  <div className="sa-edit-field">
                    <Users className="sa-edit-field__icon" aria-hidden />
                    <input
                      id="edit-max-teams"
                      type="number"
                      min={2}
                      step={1}
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className="sa-edit-input"
                      required
                    />
                  </div>
                </div>

                <div className="sa-edit-structure-field">
                  <label className="sa-edit-label sa-edit-label--emphasis" htmlFor="edit-structure">
                    Estrutura do torneio
                  </label>
                  <p className="sa-edit-structure-field__desc">
                    Define se haverá fase de grupos e o tipo de chave eliminatória.
                  </p>
                  <div className="sa-edit-field">
                    <Swords className="sa-edit-field__icon" aria-hidden />
                    <select
                      id="edit-structure"
                      value={structure}
                      onChange={(e) => setStructure(e.target.value as TournamentStructure)}
                      className="sa-edit-input sa-edit-input--select"
                    >
                      {(Object.keys(TOURNAMENT_STRUCTURE_LABELS) as TournamentStructure[]).map(
                        (key) => (
                          <option key={key} value={key}>
                            {TOURNAMENT_STRUCTURE_LABELS[key]}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                {draftHasGroupStage && (
                  <>
                    <div className="sa-edit-divider">
                      <span>Configuração da fase de grupos</span>
                    </div>

                    <div className="sa-edit-structure-field">
                      <label
                        className="sa-edit-label sa-edit-label--emphasis"
                        htmlFor="edit-group-count"
                      >
                        Quantidade de grupos
                      </label>
                      <p className="sa-edit-structure-field__desc">
                        Quantos grupos a fase classificatória terá (A, B, C…).
                      </p>
                      <select
                        id="edit-group-count"
                        value={groupCount}
                        onChange={(e) => setGroupCount(Number(e.target.value))}
                        className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                      >
                        {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} grupos
                          </option>
                        ))}
                      </select>
                      {groupDistributionText && (
                        <p className="sa-edit-group-distribution">{groupDistributionText}</p>
                      )}
                    </div>

                    <div className="sa-edit-structure-field">
                      <label
                        className="sa-edit-label sa-edit-label--emphasis"
                        htmlFor="edit-qualify-per-group"
                      >
                        Quantos passam por grupo
                      </label>
                      <p className="sa-edit-structure-field__desc">
                        Quantas equipes de cada grupo avançam para o mata-mata.
                      </p>
                      <select
                        id="edit-qualify-per-group"
                        value={qualifyPerGroup}
                        onChange={(e) => setQualifyPerGroup(Number(e.target.value))}
                        className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                      >
                        {[1, 2, 3, 4].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'equipe' : 'equipes'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="sa-edit-divider">
                  <span>Formato das partidas por fase</span>
                </div>

                {draftHasGroupStage && (
                  <div className="sa-edit-structure-field">
                    <label className="sa-edit-label sa-edit-label--emphasis" htmlFor="edit-format-groups">
                      Fase de grupos
                    </label>
                    <p className="sa-edit-structure-field__desc">
                      Formato das partidas disputadas na fase de grupos.
                    </p>
                    <select
                      id="edit-format-groups"
                      value={groupFormat}
                      onChange={(e) => setGroupFormat(e.target.value as TournamentFormat)}
                      className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                    >
                      {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                        <option key={key} value={key}>
                          {TOURNAMENT_FORMAT_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="sa-edit-structure-field">
                  <label className="sa-edit-label sa-edit-label--emphasis" htmlFor="edit-format-knockout">
                    Mata-mata
                  </label>
                  <p className="sa-edit-structure-field__desc">
                    Formato das partidas eliminatórias (oitavas, quartas, semifinal etc.).
                  </p>
                  <select
                    id="edit-format-knockout"
                    value={knockoutFormat}
                    onChange={(e) => setKnockoutFormat(e.target.value as TournamentFormat)}
                    className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                  >
                    {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                      <option key={key} value={key}>
                        {TOURNAMENT_FORMAT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sa-edit-structure-field">
                  <label className="sa-edit-label sa-edit-label--emphasis" htmlFor="edit-format-final">
                    Final
                  </label>
                  <p className="sa-edit-structure-field__desc">
                    Formato da decisão: FINAL, LB_FINAL e GRAND_FINAL.
                  </p>
                  <select
                    id="edit-format-final"
                    value={finalFormat}
                    onChange={(e) => setFinalFormat(e.target.value as TournamentFormat)}
                    className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                  >
                    {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                      <option key={key} value={key}>
                        {TOURNAMENT_FORMAT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="sa-edit-panel__footer">
              <p className="sa-edit-toolbar-hint">
                Salvar estrutura pode alterar as abas Tabela / Mata-mata disponíveis.
              </p>
              <button
                type="button"
                className="sa-admin-btn"
                onClick={() => navigate('/dashboard_admin')}
              >
                Cancelar
              </button>
              <button type="submit" className="sa-admin-btn sa-admin-btn--primary">
                <Save className="w-3.5 h-3.5" aria-hidden />
                Salvar estrutura
              </button>
            </div>
          </form>
        )}

        {/* ── MAPS ── */}
        {tab === 'maps' && (
          <EditTournamentMapsPanel
            maps={maps}
            selectedMapIds={selectedMapIds}
            onToggleMap={toggleMap}
            onSelectAll={selectAllMaps}
            onClear={clearMaps}
            onSave={saveMaps}
            createMap={createMap}
            onMapCreated={handleMapCreated}
          />
        )}

        {/* ── RULES ── */}
        {tab === 'rules' && (
          <form onSubmit={saveRules} className="sa-admin-panel sa-edit-panel">
            <div className="sa-edit-panel__body space-y-5">
              <div className="sa-edit-maps-hero">
                <div>
                  <span className="sa-admin-header__label">Regulamento</span>
                  <h2 className="sa-edit-section-title" style={{ display: 'block', marginTop: 6 }}>
                    Regras do torneio
                  </h2>
                  <p className="sa-edit-maps__hint" style={{ marginTop: 8, maxWidth: 520 }}>
                    Organize o regulamento em tópicos (ex.: Formato, Armas, Pontualidade). Cada
                    tópico pode ter várias regras.
                  </p>
                </div>
                <button type="button" className="sa-admin-btn sa-admin-btn--primary" onClick={addRuleTopic}>
                  <Plus className="w-3.5 h-3.5" aria-hidden />
                  Novo tópico
                </button>
              </div>

              <div className="sa-edit-rules">
                {ruleTopics.map((topic, topicIndex) => (
                  <div key={topic.id} className="sa-edit-rule-topic">
                    <div className="sa-edit-rule-topic__head">
                      <span className="sa-edit-rule-topic__index">Tópico {topicIndex + 1}</span>
                      <button
                        type="button"
                        className="sa-admin-btn sa-admin-btn--danger"
                        title="Remover tópico"
                        onClick={() => removeRuleTopic(topic.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </div>

                    <div>
                      <label className="sa-edit-label">Título do tópico</label>
                      <input
                        value={topic.title}
                        onChange={(e) => updateRuleTopic(topic.id, { title: e.target.value })}
                        className="sa-edit-input sa-edit-input--full"
                        placeholder="Ex.: Formato de jogo"
                        required
                      />
                    </div>

                    <div className="sa-edit-rule-topic__items">
                      <label className="sa-edit-label">Regras do tópico</label>
                      {topic.items.map((item, itemIndex) => (
                        <div key={`${topic.id}-${itemIndex}`} className="sa-edit-rule-item">
                          <input
                            value={item}
                            onChange={(e) => updateRuleItem(topic.id, itemIndex, e.target.value)}
                            className="sa-edit-input sa-edit-input--full"
                            placeholder={`Regra ${itemIndex + 1}`}
                          />
                          <button
                            type="button"
                            className="sa-admin-btn sa-admin-btn--ghost"
                            title="Remover regra"
                            onClick={() => removeRuleItem(topic.id, itemIndex)}
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="sa-admin-btn"
                        onClick={() => addRuleItem(topic.id)}
                      >
                        <Plus className="w-3.5 h-3.5" aria-hidden />
                        Adicionar regra
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sa-edit-panel__footer">
              <span className="sa-edit-toolbar-hint">
                {ruleTopics.length} tópico{ruleTopics.length === 1 ? '' : 's'} ·{' '}
                {countRuleItems(ruleTopics)} regra
                {countRuleItems(ruleTopics) === 1 ? '' : 's'}
              </span>
              <button type="submit" className="sa-admin-btn sa-admin-btn--primary">
                <Save className="w-3.5 h-3.5" aria-hidden />
                Salvar regras
              </button>
            </div>
          </form>
        )}

        {/* ── TEAMS ── */}
        {tab === 'teams' && (
          <div className="sa-edit-teams">
            <div className="sa-edit-split">
              <section className="sa-admin-panel">
                <div className="sa-admin-toolbar">
                  <strong className="sa-edit-section-title">
                    Times inscritos ({pendingTeams.length})
                  </strong>
                </div>
                <div className="sa-admin-table-wrap">
                  {pendingTeams.length === 0 ? (
                    <div className="sa-admin-empty">
                      Nenhum time aguardando confirmação.
                    </div>
                  ) : (
                    <table className="sa-admin-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Inscrição</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingTeams.map((team) => (
                          <tr key={team.id}>
                            <td>
                              <div className="sa-admin-user">
                                <span className="sa-edit-team-logo">{team.logo}</span>
                                <div className="sa-admin-user__meta">
                                  <div className="sa-admin-user__nick">[{team.tag}]</div>
                                  <div className="sa-admin-user__name">
                                    {team.name} · {team.playersCount} jogadores
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="sa-edit-datetime">
                                {team.registeredAt || '—'}
                              </span>
                            </td>
                            <td>
                              <div className="sa-admin-actions">
                                <button
                                  type="button"
                                  className="sa-admin-btn sa-admin-btn--primary"
                                  onClick={() => confirmTeam(team.id)}
                                  title="Confirmar no torneio"
                                >
                                  Confirmar
                                  <ChevronRight className="w-3.5 h-3.5" aria-hidden />
                                </button>
                                <button
                                  type="button"
                                  className="sa-admin-btn sa-admin-btn--danger"
                                  onClick={() => removeTeam(team.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              <section className="sa-admin-panel">
                <div className="sa-admin-toolbar">
                  <strong className="sa-edit-section-title">
                    Times confirmados ({confirmedTeams.length}/{tournament.maxTeams})
                  </strong>
                </div>
                <div className="sa-admin-table-wrap">
                  {confirmedTeams.length === 0 ? (
                    <div className="sa-admin-empty">
                      Nenhum time confirmado. Confirme inscritos à esquerda.
                    </div>
                  ) : (
                    <table className="sa-admin-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Time</th>
                          <th>Inscrição</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {confirmedTeams.map((team, idx) => (
                          <tr key={team.id}>
                            <td>{idx + 1}</td>
                            <td>
                              <div className="sa-admin-user">
                                <span className="sa-edit-team-logo">{team.logo}</span>
                                <div className="sa-admin-user__meta">
                                  <div className="sa-admin-user__nick">[{team.tag}]</div>
                                  <div className="sa-admin-user__name">
                                    {team.name} · {team.playersCount} jogadores
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="sa-edit-datetime">
                                {team.registeredAt || '—'}
                              </span>
                            </td>
                            <td>
                              <div className="sa-admin-actions">
                                <button
                                  type="button"
                                  className="sa-admin-btn"
                                  onClick={() => unconfirmTeam(team.id)}
                                  title="Voltar para inscritos"
                                >
                                  <ChevronLeft className="w-3.5 h-3.5" aria-hidden />
                                  Desconfirmar
                                </button>
                                <button
                                  type="button"
                                  className="sa-admin-btn sa-admin-btn--danger"
                                  onClick={() => removeTeam(team.id)}
                                >
                                  <Trash2 className="w-3.5 h-3.5" aria-hidden />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </div>

            <section className="sa-admin-panel">
              <div className="sa-admin-toolbar">
                <strong className="sa-edit-section-title">
                  Nova inscrição ({availableTeams.length} times no catálogo)
                </strong>
              </div>
              <div className="sa-admin-table-wrap">
                {availableTeams.length === 0 ? (
                  <div className="sa-admin-empty">
                    Todos os times do catálogo já estão no torneio.
                  </div>
                ) : (
                  <table className="sa-admin-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Membros</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableTeams.map((team) => (
                        <tr key={team.id}>
                          <td>
                            <div className="sa-admin-user">
                              <span className="sa-edit-team-logo">{team.logo}</span>
                              <div className="sa-admin-user__meta">
                                <div className="sa-admin-user__nick">[{team.tag}]</div>
                                <div className="sa-admin-user__name">{team.name}</div>
                              </div>
                            </div>
                          </td>
                          <td>{team.members.length}</td>
                          <td>
                            <button
                              type="button"
                              className="sa-admin-btn sa-admin-btn--primary"
                              onClick={() => addTeam(team.id)}
                            >
                              <Plus className="w-3.5 h-3.5" aria-hidden />
                              Inscrever
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          </div>
        )}

        {/* ── TABLE ── */}
        {tab === 'table' && hasGroupStage && (
          <section className="sa-admin-panel">
            <div className="sa-admin-toolbar">
              <div>
                <strong className="sa-edit-section-title">Grupos e classificação</strong>
                <p className="sa-edit-toolbar-hint">
                  Estrutura com fase de grupos:{' '}
                  {TOURNAMENT_STRUCTURE_LABELS[tournament.structure ?? structure]}.
                </p>
              </div>
              <button
                type="button"
                className="sa-admin-btn sa-admin-btn--primary"
                onClick={handleGenerateTable}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                Gerar tabela automática
              </button>
            </div>

            {(tournament.groups ?? []).length === 0 ? (
              <div className="sa-admin-empty">
                Nenhuma tabela de grupos. Use &quot;Gerar tabela automática&quot; após confirmar
                os times inscritos.
              </div>
            ) : (
              <div className="sa-edit-groups">
                {(tournament.groups ?? []).map((group) => (
                  <div key={group.id} className="sa-edit-group">
                    <h3 className="sa-edit-group__title">{group.name}</h3>
                    <div className="sa-admin-table-wrap">
                      <table className="sa-admin-table">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>J</th>
                            <th>V</th>
                            <th>E</th>
                            <th>D</th>
                            <th>RP</th>
                            <th>RC</th>
                            <th>Pts</th>
                            <th>Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.standings.map((s) => (
                            <tr key={s.teamId}>
                              <td>
                                <span className="sa-admin-user__nick">
                                  [{s.teamTag}] {s.teamName}
                                </span>
                              </td>
                              {(
                                [
                                  'played',
                                  'wins',
                                  'draws',
                                  'losses',
                                  'roundsFor',
                                  'roundsAgainst',
                                  'points',
                                ] as const
                              ).map((field) => (
                                <td key={field}>
                                  <input
                                    type="number"
                                    min={0}
                                    className="sa-edit-num"
                                    value={s[field]}
                                    onChange={(e) =>
                                      patchStanding(
                                        group.id,
                                        s.teamId,
                                        field,
                                        Number(e.target.value) || 0
                                      )
                                    }
                                    aria-label={`${field} ${s.teamTag}`}
                                  />
                                </td>
                              ))}
                              <td>
                                <div className="sa-edit-group-actions">
                                  <button
                                    type="button"
                                    className="sa-admin-btn"
                                    title="Trocar com outra equipe"
                                    onClick={() =>
                                      setSwapSource({
                                        groupId: group.id,
                                        groupName: group.name,
                                        teamId: s.teamId,
                                        teamTag: s.teamTag,
                                        teamName: s.teamName,
                                      })
                                    }
                                  >
                                    <ArrowLeftRight className="w-3.5 h-3.5" aria-hidden />
                                    Trocar
                                  </button>
                                  {(tournament.groups ?? []).length > 1 && (
                                    <button
                                      type="button"
                                      className="sa-admin-btn"
                                      title="Mudar para outro grupo"
                                      onClick={() =>
                                        setMoveGroupSource({
                                          groupId: group.id,
                                          groupName: group.name,
                                          teamId: s.teamId,
                                          teamTag: s.teamTag,
                                          teamName: s.teamName,
                                        })
                                      }
                                    >
                                      <FolderInput className="w-3.5 h-3.5" aria-hidden />
                                      Mudar grupo
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(tournament.brackets ?? []).length > 0 && (
              <div className="sa-edit-bracket-note">
                Chave mata-mata: {tournament.brackets.length} jogo(s) — gerencie em{' '}
                <button type="button" className="sa-edit-link" onClick={() => setTab('bracket')}>
                  Mata-mata
                </button>
                .
              </div>
            )}
          </section>
        )}

        <Modal
          isOpen={Boolean(swapSource)}
          onClose={() => setSwapSource(null)}
          title="Trocar equipe de grupo"
          size="lg"
        >
          {swapSource && (
            <div className="sa-edit-swap">
              <p className="sa-edit-swap__intro">
                Selecione a equipe que vai ocupar o lugar de{' '}
                <strong>
                  [{swapSource.teamTag}] {swapSource.teamName}
                </strong>{' '}
                no <strong>{swapSource.groupName}</strong>. As duas equipes trocam de posição
                (e de grupo, se forem diferentes).
              </p>

              <div className="sa-edit-swap__list">
                {teamsInGroups
                  .filter((t) => t.teamId !== swapSource.teamId)
                  .map((t) => (
                    <button
                      key={t.teamId}
                      type="button"
                      className="sa-edit-swap__item"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Trocar [${swapSource.teamTag}] (${swapSource.groupName}) com [${t.teamTag}] (${t.groupName})?\n\nAs equipes vão ocupar o lugar uma da outra.`
                        );
                        if (!confirmed) return;
                        swapGroupTeams(swapSource.teamId, t.teamId);
                      }}
                    >
                      <span className="sa-edit-swap__item-main">
                        <span className="sa-edit-team-logo">{t.teamLogo}</span>
                        <span className="sa-edit-swap__item-text">
                          <span className="sa-admin-user__nick">[{t.teamTag}]</span>
                          <span className="sa-admin-user__name">{t.teamName}</span>
                        </span>
                      </span>
                      <span className="sa-edit-swap__group-badge">{t.groupName}</span>
                    </button>
                  ))}
              </div>

              <div className="sa-edit-score__actions">
                <button
                  type="button"
                  className="sa-admin-btn"
                  onClick={() => setSwapSource(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          isOpen={Boolean(moveGroupSource)}
          onClose={() => setMoveGroupSource(null)}
          title="Mudar time de grupo"
          size="md"
        >
          {moveGroupSource && (
            <div className="sa-edit-swap">
              <p className="sa-edit-swap__intro">
                Escolha o novo grupo para{' '}
                <strong>
                  [{moveGroupSource.teamTag}] {moveGroupSource.teamName}
                </strong>{' '}
                (hoje em <strong>{moveGroupSource.groupName}</strong>). Os confrontos da fase
                de grupos serão recalculados para o time.
              </p>

              <div className="sa-edit-swap__list">
                {(tournament.groups ?? [])
                  .filter((g) => g.id !== moveGroupSource.groupId)
                  .map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className="sa-edit-swap__item"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Mover [${moveGroupSource.teamTag}] de ${moveGroupSource.groupName} para ${g.name}?\n\nOs confrontos de grupo deste time serão regenerados.`
                        );
                        if (!confirmed) return;
                        moveTeamToGroup(moveGroupSource.teamId, g.id);
                      }}
                    >
                      <span className="sa-edit-swap__item-main">
                        <span className="sa-edit-swap__item-text">
                          <span className="sa-admin-user__nick">{g.name}</span>
                          <span className="sa-admin-user__name">
                            {g.standings.length}{' '}
                            {g.standings.length === 1 ? 'time' : 'times'} no grupo
                          </span>
                        </span>
                      </span>
                      <span className="sa-edit-swap__group-badge">Selecionar</span>
                    </button>
                  ))}
              </div>

              <div className="sa-edit-score__actions">
                <button
                  type="button"
                  className="sa-admin-btn"
                  onClick={() => setMoveGroupSource(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </Modal>

        {tab === 'table' && !hasGroupStage && (
          <section className="sa-admin-panel">
            <div className="sa-admin-empty">
              Este torneio não possui fase de grupos. Na aba{' '}
              <button type="button" className="sa-edit-link" onClick={() => setTab('structure')}>
                Estrutura
              </button>
              , escolha uma estrutura com &quot;Fase de grupos&quot;, ou use a aba{' '}
              <button type="button" className="sa-edit-link" onClick={() => setTab('bracket')}>
                Mata-mata
              </button>
              .
            </div>
          </section>
        )}

        {/* ── MATA-MATA ── */}
        {tab === 'bracket' && (
          <section className="sa-admin-panel">
            <div className="sa-admin-toolbar">
              <div>
                <strong className="sa-edit-section-title">Chave mata-mata</strong>
                <p className="sa-edit-toolbar-hint">
                  Sorteia aleatoriamente os {confirmedTeams.length} times confirmados na chave
                  eliminatória
                  {tournament.structure === 'double_elim' ||
                  tournament.structure === 'groups_double_elim'
                    ? ' (dupla eliminação: superior + inferior + grande final)'
                    : ' (eliminação única)'}
                  . Salve a estrutura na aba Estrutura antes de gerar.
                </p>
              </div>
              <button
                type="button"
                className="sa-admin-btn sa-admin-btn--primary"
                onClick={handleGenerateBracket}
              >
                <Swords className="w-3.5 h-3.5" aria-hidden />
                Gerar tabela MATA-MATA
              </button>
            </div>

            {(tournament.brackets ?? []).length === 0 ? (
              <div className="sa-admin-empty">
                Nenhuma chave gerada. Confirme ao menos 2 times e clique em &quot;Gerar tabela
                MATA-MATA&quot;.
              </div>
            ) : (
              <div className="sa-edit-bracket-preview">
                <p className="sa-edit-toolbar-hint" style={{ marginBottom: 12 }}>
                  Clique em uma partida para informar o placar ou registrar W.O.
                </p>
                <TournamentBracket
                  brackets={tournament.brackets}
                  championName={tournament.championTeam?.name || 'A DEFINIR'}
                  championLogo={tournament.championTeam?.logo || '🏆'}
                  championTag={tournament.championTeam?.tag || '—'}
                  championId={tournament.championTeam?.id || 'tbd'}
                  onMatchClick={openMatchEditor}
                />
              </div>
            )}
          </section>
        )}

        <Modal
          isOpen={Boolean(selectedMatch)}
          onClose={closeMatchEditor}
          title={
            selectedMatch
              ? `${phaseLabel(
                  allMatches.find((m) => m.id === selectedMatch.id)?.phase ||
                    selectedMatch.round
                )} · Jogo ${selectedMatch.matchNumber}`
              : 'Placar'
          }
        >
          {selectedMatch && (
            <div className="sa-edit-score">
              <div className="sa-edit-score__teams">
                <div className="sa-edit-score__side">
                  <span className="sa-edit-score__tag">[{selectedMatch.team1.tag}]</span>
                  <strong>{selectedMatch.team1.name}</strong>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    className="sa-edit-num sa-edit-score__input"
                    value={score1}
                    disabled={isWo}
                    onChange={(e) => setScore1(Number(e.target.value) || 0)}
                    aria-label={`Placar ${selectedMatch.team1.tag}`}
                  />
                </div>
                <span className="sa-edit-score__vs">VS</span>
                <div className="sa-edit-score__side">
                  <span className="sa-edit-score__tag">[{selectedMatch.team2.tag}]</span>
                  <strong>{selectedMatch.team2.name}</strong>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    className="sa-edit-num sa-edit-score__input"
                    value={score2}
                    disabled={isWo}
                    onChange={(e) => setScore2(Number(e.target.value) || 0)}
                    aria-label={`Placar ${selectedMatch.team2.tag}`}
                  />
                </div>
              </div>

              <div>
                <label className="sa-edit-label">Data e hora do jogo</label>
                <input
                  type="text"
                  className="sa-edit-input sa-edit-input--full"
                  value={matchDateTime}
                  onChange={(e) => setMatchDateTime(e.target.value)}
                  placeholder="Ex: 20 SET 2026 - 19:00"
                />
              </div>

              <label className="sa-edit-check">
                <input
                  type="checkbox"
                  checked={isWo}
                  onChange={(e) => {
                    const next = e.target.checked;
                    setIsWo(next);
                    if (next) {
                      setScore1(winnerSide === 'team1' ? 1 : 0);
                      setScore2(winnerSide === 'team2' ? 1 : 0);
                    }
                  }}
                />
                <span>Jogo decidido por W.O. (walkover)</span>
              </label>

              {isWo && (
                <div className="sa-edit-score__wo-winner">
                  <span className="sa-edit-label">Vencedor do W.O.</span>
                  <div className="sa-admin-actions">
                    <button
                      type="button"
                      className={`sa-admin-btn${winnerSide === 'team1' ? ' sa-admin-btn--primary' : ''}`}
                      onClick={() => {
                        setWinnerSide('team1');
                        setScore1(1);
                        setScore2(0);
                      }}
                    >
                      [{selectedMatch.team1.tag}]
                    </button>
                    <button
                      type="button"
                      className={`sa-admin-btn${winnerSide === 'team2' ? ' sa-admin-btn--primary' : ''}`}
                      onClick={() => {
                        setWinnerSide('team2');
                        setScore1(0);
                        setScore2(1);
                      }}
                    >
                      [{selectedMatch.team2.tag}]
                    </button>
                  </div>
                </div>
              )}

              <p className="sa-edit-toolbar-hint">
                O campeão só é definido quando todas as partidas da chave forem preenchidas.
              </p>

              <div className="sa-edit-score__actions">
                <button type="button" className="sa-admin-btn" onClick={closeMatchEditor}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="sa-admin-btn sa-admin-btn--primary"
                  onClick={saveMatchResult}
                >
                  Salvar placar
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ── MATCHES ── */}
        {tab === 'matches' && (
          <section className="sa-admin-panel">
            <div className="sa-admin-toolbar">
              <strong className="sa-edit-section-title">
                Partidas ({allMatches.length})
              </strong>
              {hasGroupStage ? (
                <button
                  type="button"
                  className="sa-admin-btn sa-admin-btn--primary"
                  onClick={handleGenerateTable}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                  Regenerar jogos
                </button>
              ) : (
                <button
                  type="button"
                  className="sa-admin-btn sa-admin-btn--primary"
                  onClick={handleGenerateBracket}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                  Regenerar chave
                </button>
              )}
            </div>

            <div className="sa-admin-table-wrap">
              {allMatches.length === 0 ? (
                <div className="sa-admin-empty">
                  Nenhuma partida. Gere a tabela automática após inscrever os times.
                </div>
              ) : (
                <table className="sa-admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fase</th>
                      <th>Confronto</th>
                      <th>Placar</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMatches.map((match) => {
                      const statusMeta = matchStatusLabel(match.status);
                      return (
                        <tr key={match.id}>
                          <td>{match.matchNumber}</td>
                          <td>
                            <span className="sa-admin-email">{phaseLabel(match.phase)}</span>
                          </td>
                          <td>
                            <div className="sa-admin-tour-name">
                              [{match.team1.tag}] vs [{match.team2.tag}]
                            </div>
                            <div className="sa-admin-tour-meta">
                              {match.team1.name} × {match.team2.name}
                            </div>
                          </td>
                          <td>
                            {match.team1.score} — {match.team2.score}
                          </td>
                          <td>
                            <span className={statusMeta.className}>{statusMeta.text}</span>
                          </td>
                          <td>
                            <div className="sa-admin-actions">
                              <button
                                type="button"
                                className="sa-admin-btn sa-admin-btn--primary"
                                title="Informar placar"
                                onClick={() => openMatchScoreFromList(match)}
                              >
                                <Pencil className="w-3.5 h-3.5" aria-hidden />
                                Placar
                              </button>
                              {match.status === 'SCHEDULED' && (
                                <button
                                  type="button"
                                  className="sa-admin-btn"
                                  onClick={() => handleRelease(match.id)}
                                >
                                  <Unlock className="w-3.5 h-3.5" aria-hidden />
                                  Liberar partida
                                </button>
                              )}
                              <Link
                                to={`/torneios/${tournament.id}/partidas/${match.id}`}
                                className="sa-admin-btn"
                              >
                                <Eye className="w-3.5 h-3.5" aria-hidden />
                                Ver
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
