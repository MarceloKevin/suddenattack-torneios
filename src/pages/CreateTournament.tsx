import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TournamentFormat, TournamentStatus } from '../types';
import {
  Trophy,
  Calendar,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CreateTournament: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, createTournament } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('05 NOV 2026');
  const [endDate, setEndDate] = useState('15 NOV 2026');
  const [maxTeams, setMaxTeams] = useState<number>(16);
  const [prizePool, setPrizePool] = useState('R$ 2.500');
  const [format, setFormat] = useState<TournamentFormat>('MD3');
  const [status, setStatus] = useState<TournamentStatus>('open');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If user is not admin, show guard or allow him to toggle admin
  const isAdmin = currentUser?.isAdmin;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do campeonato é obrigatório.');
      return;
    }

    setError('');
    const newId = createTournament({
      name,
      description: description || 'Torneio oficial Sudden Attack com eliminação direta.',
      startDate,
      endDate,
      maxTeams: Number(maxTeams),
      prizePool,
      format,
      status,
    });

    setSuccess(true);
    setTimeout(() => {
      navigate(`/torneios/${newId}`);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* BACK LINK */}
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
              <strong>Atenção:</strong> Você está visualizando o formulário administrativo sem estar em modo Admin. Você ainda pode salvar o torneio para teste.
            </span>
          </div>
        </div>
      )}

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
            Cadastre um novo campeonato competitivo de Sudden Attack, defina o regulamento, datas e premiação.
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
            <span>Torneio criado com sucesso! Redirecionando para a página do campeonato...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

            <Input
              label="Premiação Total"
              value={prizePool}
              onChange={(e) => setPrizePool(e.target.value)}
              placeholder="Ex: R$ 2.500"
              icon={<Trophy className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#9298A5] mb-1.5">
                Formato das Partidas
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-xs sm:text-sm text-[#F5F5F5] focus:border-[#E31B23] focus:outline-none"
              >
                <option value="MD1">MD1 (Melhor de 1 Mapa - Tiro Curto)</option>
                <option value="MD3">MD3 (Melhor de 3 Mapas - Padrão)</option>
                <option value="MD5">MD5 (Melhor de 5 Mapas - Maratona)</option>
              </select>
            </div>

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

          {/* Action Buttons */}
          <div className="pt-6 border-t border-[#272B35] flex flex-col sm:flex-row items-center justify-end gap-3">
            <Link to="/torneios" className="w-full sm:w-auto">
              <Button type="button" variant="secondary" size="md" fullWidth>
                CANCELAR
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              className="sm:w-auto"
            >
              CRIAR TORNEIO
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
