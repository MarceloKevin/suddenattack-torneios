import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TournamentFormat, TournamentPrizeTier, TournamentStatus, TournamentStructure, TOURNAMENT_FORMAT_LABELS, TOURNAMENT_STRUCTURE_LABELS, isGroupsStructure } from '../types';
import {
  Trophy,
  Calendar,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Swords,
} from 'lucide-react';

type PrizeDraft = TournamentPrizeTier;

const newTierId = () => `prize-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const createDefaultTiers = (): PrizeDraft[] => [
  {
    id: newTierId(),
    type: 'single',
    from: 1,
    to: 1,
    reward: 'R$ 1.000 + 50k player + 300 pontos',
  },
  {
    id: newTierId(),
    type: 'single',
    from: 2,
    to: 2,
    reward: '100k de cache + 200 pontos',
  },
  {
    id: newTierId(),
    type: 'single',
    from: 3,
    to: 3,
    reward: '50k de cache + 100 pontos',
  },
  {
    id: newTierId(),
    type: 'range',
    from: 4,
    to: 8,
    reward: '80 pontos',
  },
  {
    id: newTierId(),
    type: 'range',
    from: 9,
    to: 32,
    reward: '50 pontos',
  },
];

const formatPlaceLabel = (tier: PrizeDraft) => {
  if (tier.type === 'single' || tier.from === tier.to) {
    return `${tier.from}º COLOCADO`;
  }
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

export const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, createTournament } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('05 NOV 2026');
  const [endDate, setEndDate] = useState('15 NOV 2026');
  const [maxTeams, setMaxTeams] = useState<number>(16);
  const [structure, setStructure] = useState<TournamentStructure>('groups_single_elim');
  const [groupFormat, setGroupFormat] = useState<TournamentFormat>('MD1');
  const [knockoutFormat, setKnockoutFormat] = useState<TournamentFormat>('MD3');
  const [finalFormat, setFinalFormat] = useState<TournamentFormat>('MD5');
  const [status, setStatus] = useState<TournamentStatus>('open');
  const [prizePoolSummary, setPrizePoolSummary] = useState('Premiação em cache, pontos e reais');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [prizeTiers, setPrizeTiers] = useState<PrizeDraft[]>(createDefaultTiers);

  const isAdmin = currentUser?.isAdmin;

  const updateTier = (id: string, patch: Partial<PrizeDraft>) => {
    setPrizeTiers((prev) =>
      prev.map((tier) => {
        if (tier.id !== id) return tier;
        const next = { ...tier, ...patch };

        if (patch.type === 'single') {
          next.to = next.from;
        }

        if (patch.from !== undefined && next.type === 'single') {
          next.to = patch.from;
        }

        return next;
      })
    );
  };

  const addTier = (type: 'single' | 'range' = 'single') => {
    const last = prizeTiers[prizeTiers.length - 1];
    const nextFrom = last ? Math.max(last.from, last.to) + 1 : 1;
    setPrizeTiers((prev) => [
      ...prev,
      {
        id: newTierId(),
        type,
        from: nextFrom,
        to: type === 'range' ? nextFrom + 3 : nextFrom,
        reward: '',
      },
    ]);
  };

  const removeTier = (id: string) => {
    setPrizeTiers((prev) => prev.filter((tier) => tier.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do campeonato é obrigatório.');
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

    if (cleaned.length === 0) {
      setError('Adicione ao menos uma premiação com descrição preenchida.');
      return;
    }

    for (const tier of cleaned) {
      if (tier.type === 'range' && tier.to < tier.from) {
        setError('Nos intervalos, a posição final deve ser maior ou igual à inicial.');
        return;
      }
    }

    setError('');
    const newId = createTournament({
      name,
      description: description || 'Torneio oficial Sudden Attack com eliminação direta.',
      startDate,
      endDate,
      maxTeams: Number(maxTeams),
      structure,
      prizePool: prizePoolSummary.trim() || cleaned[0].reward,
      firstPlacePrize: findRewardForPlace(cleaned, 1) || cleaned[0].reward,
      secondPlacePrize: findRewardForPlace(cleaned, 2) || '—',
      thirdPlacePrize: findRewardForPlace(cleaned, 3) || '—',
      prizeTiers: cleaned,
      format: knockoutFormat,
      phaseFormats: {
        groups: groupFormat,
        knockout: knockoutFormat,
        final: finalFormat,
      },
      status,
    });

    setSuccess(true);
    setTimeout(() => {
      navigate(`/torneios/${newId}`);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <Link
          to="/torneios"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9298A5] hover:text-[#E31B23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLTAR PARA TORNEIOS
        </Link>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-950/40 border border-amber-700/60 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Atenção:</strong> Você está visualizando o formulário administrativo sem estar
              em modo Admin. Você ainda pode salvar o torneio para teste.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card
          variant="primary"
          hasHudCorners
          className="p-6 sm:p-10 border-[#272B35] relative shadow-2xl"
        >
          <div className="mb-8 pb-6 border-b border-[#272B35]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> PAINEL DO ADMINISTRADOR
            </span>
            <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-1">
              CRIAR TORNEIO
            </h1>
            <p className="text-xs sm:text-sm text-[#9298A5] mt-1">
              Cadastre um novo campeonato competitivo de Sudden Attack e defina o regulamento e as
              datas.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/60 border border-emerald-600 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Torneio criado com sucesso! Redirecionando para a página do campeonato...
              </span>
            </div>
          )}

          <div className="space-y-6">
            <Input
              label="Nome do Torneio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SUDDEN ATTACK MASTER SERIES #02"
              icon={<Trophy className="w-4 h-4" />}
              required
            />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                Descrição do Torneio
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva detalhes, servidores, regras de mapa e dinâmica da competição..."
                rows={3}
                className="w-full bg-[#0E1016] border border-[#272B35] p-3 text-xs sm:text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Data de Início"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Ex: 05 NOV 2026"
                icon={<Calendar className="w-4 h-4" />}
                required
              />

              <Input
                label="Data de Término"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Ex: 15 NOV 2026"
                icon={<Calendar className="w-4 h-4" />}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Estrutura do Torneio
                </label>
                <div className="relative">
                  <Swords className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9298A5]" />
                  <select
                    value={structure}
                    onChange={(e) => setStructure(e.target.value as TournamentStructure)}
                    className="w-full bg-[#0E1016] border border-[#272B35] pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Quantidade Máxima de Times
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9298A5]" />
                  <select
                    value={maxTeams}
                    onChange={(e) => setMaxTeams(Number(e.target.value))}
                    className="w-full bg-[#0E1016] border border-[#272B35] pl-10 pr-3 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                  >
                    <option value={8}>8 Equipes (Quartas, Semifinal e Final)</option>
                    <option value={16}>16 Equipes (Chave Completa Padrão)</option>
                    <option value={32}>32 Equipes (Super Copa Nacional)</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 gap-4 ${
                isGroupsStructure(structure) ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
              }`}
            >
              {isGroupsStructure(structure) && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                    Formato — Fase de grupos
                  </label>
                  <select
                    value={groupFormat}
                    onChange={(e) => setGroupFormat(e.target.value as TournamentFormat)}
                    className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                  >
                    {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                      <option key={key} value={key}>
                        {TOURNAMENT_FORMAT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Formato — Mata-mata
                </label>
                <select
                  value={knockoutFormat}
                  onChange={(e) => setKnockoutFormat(e.target.value as TournamentFormat)}
                  className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                >
                  {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                    <option key={key} value={key}>
                      {TOURNAMENT_FORMAT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Formato — Final
                </label>
                <select
                  value={finalFormat}
                  onChange={(e) => setFinalFormat(e.target.value as TournamentFormat)}
                  className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                >
                  {(Object.keys(TOURNAMENT_FORMAT_LABELS) as TournamentFormat[]).map((key) => (
                    <option key={key} value={key}>
                      {TOURNAMENT_FORMAT_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                  Status Inicial
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TournamentStatus)}
                  className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                >
                  <option value="open">Aberto (Inscrições Disponíveis)</option>
                  <option value="draft">Rascunho (Não visível ao público)</option>
                  <option value="active">Em Andamento</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* PREMIAÇÃO FLEXÍVEL */}
        <Card
          variant="primary"
          hasHudCorners
          className="p-6 sm:p-10 border-[#272B35] relative shadow-2xl"
        >
          <div className="mb-6 pb-5 border-b border-[#272B35]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> PREMIAÇÃO
            </span>
            <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-white mt-1">
              TABELA DE PREMIAÇÃO
            </h2>
            <p className="text-xs sm:text-sm text-[#9298A5] mt-1 max-w-2xl">
              Monte a tabela livremente: posição única (1º, 2º, 3º…) ou intervalos (4–8, 9–32) com
              qualquer texto de prêmio (reais, cache, pontos, itens).
            </p>
          </div>

          <div className="mb-5">
            <Input
              label="Resumo da premiação (exibido nos cards)"
              value={prizePoolSummary}
              onChange={(e) => setPrizePoolSummary(e.target.value)}
              placeholder="Ex: R$ 3.500 + Cache + Pontos"
              icon={<Trophy className="w-4 h-4" />}
            />
          </div>

          <div className="space-y-3">
            {prizeTiers.map((tier, index) => (
              <div
                key={tier.id}
                className={`p-4 sm:p-5 bg-[#0E1016] border space-y-4 ${
                  tier.from === 1 && tier.to === 1
                    ? 'border-yellow-500/40'
                    : 'border-[#272B35]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-display uppercase tracking-wider text-white">
                    #{index + 1} · {formatPlaceLabel(tier)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTier(tier.id)}
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors"
                    disabled={prizeTiers.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                      Tipo
                    </label>
                    <select
                      value={tier.type}
                      onChange={(e) =>
                        updateTier(tier.id, {
                          type: e.target.value as 'single' | 'range',
                        })
                      }
                      className="w-full bg-[#13161D] border border-[#272B35] px-3 py-2.5 text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                    >
                      <option value="single">Posição única</option>
                      <option value="range">Intervalo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                      {tier.type === 'single' ? 'Colocação' : 'De (posição)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={128}
                      value={tier.from}
                      onChange={(e) => updateTier(tier.id, { from: Number(e.target.value) || 1 })}
                      className="w-full bg-[#13161D] border border-[#272B35] px-3 py-2.5 text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                      {tier.type === 'single' ? '—' : 'Até (posição)'}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={128}
                      value={tier.type === 'single' ? tier.from : tier.to}
                      disabled={tier.type === 'single'}
                      onChange={(e) => updateTier(tier.id, { to: Number(e.target.value) || 1 })}
                      className="w-full bg-[#13161D] border border-[#272B35] px-3 py-2.5 text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                    Premiação (texto livre)
                  </label>
                  <input
                    type="text"
                    value={tier.reward}
                    onChange={(e) => updateTier(tier.id, { reward: e.target.value })}
                    placeholder="Ex: R$ 1.000 + 50k player + 300 pontos"
                    className="w-full bg-[#13161D] border border-[#272B35] px-3 py-2.5 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => addTier('single')}
            >
              ADICIONAR POSIÇÃO
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => addTier('range')}
            >
              ADICIONAR INTERVALO
            </Button>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <Link to="/torneios" className="w-full sm:w-auto">
            <Button type="button" variant="secondary" size="md" fullWidth>
              CANCELAR
            </Button>
          </Link>
          <Button type="submit" variant="primary" size="md" fullWidth className="sm:w-auto">
            CRIAR TORNEIO
          </Button>
        </div>
      </form>
    </div>
  );
};
