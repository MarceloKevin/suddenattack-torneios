import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  GroupStanding,
  MatchBracketGame,
  TournamentFormat,
  TournamentPrizeTier,
  TournamentStatus,
  TournamentStructure,
  TOURNAMENT_STRUCTURE_LABELS,
  getConfirmedTeams,
  getPendingTeams,
} from '../types';
import { getTournamentMatches, matchStatusLabel, phaseLabel } from '../utils/matchHelpers';
import { teamToRef } from '../utils/tournamentGenerator';
import { canEditBracketMatch, MatchSlot } from '../utils/bracketHelpers';
import { TournamentBracket } from '../components/tournament/TournamentBracket';
import { Modal } from '../components/ui/Modal';
import rankingBg from '../assets/ranking-bg.png';
import '../components/admin/AdminDashboard.css';
import '../components/admin/EditTournament.css';

type EditTab = 'info' | 'teams' | 'table' | 'bracket' | 'matches';

type PrizeDraft = TournamentPrizeTier;

const newTierId = () => `prize-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
    updateTournament,
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
  const [format, setFormat] = useState<TournamentFormat>('MD3');
  const [status, setStatus] = useState<TournamentStatus>('open');
  const [server, setServer] = useState('');
  const [prizePoolSummary, setPrizePoolSummary] = useState('');
  const [prizeTiers, setPrizeTiers] = useState<PrizeDraft[]>([]);
  const [rulesText, setRulesText] = useState('');

  // Sync form when tournament loads / changes id
  useEffect(() => {
    if (!tournament) return;
    setName(tournament.name);
    setDescription(tournament.description);
    setStartDate(tournament.startDate);
    setEndDate(tournament.endDate);
    setMaxTeams(tournament.maxTeams);
    setStructure(tournament.structure || 'groups_single_elim');
    setFormat(tournament.format);
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
    setRulesText(tournament.rules.join('\n'));
  }, [tournament?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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
      maxTeams: Number(maxTeams),
      structure,
      format,
      status,
      server: server.trim() || tournament.server,
      prizePool: prizePoolSummary.trim() || cleaned[0]?.reward || tournament.prizePool,
      firstPlacePrize: findRewardForPlace(cleaned, 1) || tournament.firstPlacePrize,
      secondPlacePrize: findRewardForPlace(cleaned, 2) || tournament.secondPlacePrize,
      thirdPlacePrize: findRewardForPlace(cleaned, 3) || tournament.thirdPlacePrize,
      prizeTiers: cleaned,
      rules: rulesText
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
      tag: name.trim().substring(0, 8).toUpperCase().replace(/\s+/g, '') || tournament.tag,
    });
    flash('ok', 'Informações do torneio salvas.');
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
            <button
              type="button"
              className="sa-admin-btn sa-admin-btn--primary"
              onClick={handleGenerateTable}
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden />
              Gerar tabela automática
            </button>
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
              ['teams', 'Times', Users],
              ['table', 'Tabela', LayoutGrid],
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
              onClick={() => setTab(key)}
            >
              <Icon className="w-4 h-4" aria-hidden />
              {label}
              {key === 'teams' && (
                <span className="sa-admin-tab__count">
                  {confirmedTeams.length}/{tournament.maxTeams}
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

              <div className="sa-edit-grid-2">
                <div>
                  <label className="sa-edit-label">Estrutura</label>
                  <div className="sa-edit-field">
                    <Swords className="sa-edit-field__icon" aria-hidden />
                    <select
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
                <div>
                  <label className="sa-edit-label">Máx. de times</label>
                  <div className="sa-edit-field">
                    <Users className="sa-edit-field__icon" aria-hidden />
                    <select
                      value={maxTeams}
                      onChange={(e) => setMaxTeams(Number(e.target.value))}
                      className="sa-edit-input sa-edit-input--select"
                    >
                      <option value={8}>8 equipes</option>
                      <option value={16}>16 equipes</option>
                      <option value={32}>32 equipes</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="sa-edit-grid-2">
                <div>
                  <label className="sa-edit-label">Formato das partidas</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                    className="sa-edit-input sa-edit-input--select sa-edit-input--full"
                  >
                    <option value="MD1">MD1</option>
                    <option value="MD3">MD3</option>
                    <option value="MD5">MD5</option>
                  </select>
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
              </div>

              <div>
                <label className="sa-edit-label">Servidor</label>
                <input
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  className="sa-edit-input sa-edit-input--full"
                />
              </div>

              <div>
                <label className="sa-edit-label">Regras (uma por linha)</label>
                <textarea
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  rows={4}
                  className="sa-edit-textarea"
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
        {tab === 'table' && (
          <section className="sa-admin-panel">
            <div className="sa-admin-toolbar">
              <strong className="sa-edit-section-title">Grupos e classificação</strong>
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
                Nenhuma tabela de grupos. Use &quot;Gerar tabela automática&quot; ou confira se a
                estrutura inclui fase de grupos.
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
                  . Salve a estrutura nas Informações antes de gerar.
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
              ? `${selectedMatch.round} · Jogo ${selectedMatch.matchNumber}`
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
              <button
                type="button"
                className="sa-admin-btn sa-admin-btn--primary"
                onClick={handleGenerateTable}
              >
                <RefreshCw className="w-3.5 h-3.5" aria-hidden />
                Regenerar jogos
              </button>
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
                              {match.status === 'SCHEDULED' && (
                                <button
                                  type="button"
                                  className="sa-admin-btn sa-admin-btn--primary"
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
