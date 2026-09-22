import React, { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TournamentStatus } from '../components/tournament/TournamentStatus';
import { TournamentBracket } from '../components/tournament/TournamentBracket';
import { GroupStandingsTable } from '../components/tournament/GroupStandingsTable';
import { TournamentMatchesList } from '../components/tournament/TournamentMatchesList';
import { Modal } from '../components/ui/Modal';
import { getTournamentMatches } from '../utils/matchHelpers';
import {
  Calendar,
  Users,
  Trophy,
  Shield,
  ArrowLeft,
  CheckCircle2,
  FileText,
  AlertCircle,
  Share2,
  Swords,
} from 'lucide-react';

type TournamentTab = 'geral' | 'teams' | 'tabela' | 'bracket' | 'partidas' | 'rules';

const isTournamentTab = (value: string | null): value is TournamentTab =>
  value === 'geral' ||
  value === 'teams' ||
  value === 'tabela' ||
  value === 'bracket' ||
  value === 'partidas' ||
  value === 'rules';

export const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { tournaments, currentTeam } = useAuth();
  const initialTab = isTournamentTab(searchParams.get('tab')) ? searchParams.get('tab')! : 'geral';
  const [activeTab, setActiveTab] = useState<TournamentTab>(initialTab);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const tournament = tournaments.find((t) => t.id === id) || tournaments[0];
  const groups = tournament.groups ?? [];
  const allMatches = useMemo(() => getTournamentMatches(tournament), [tournament]);

  const handleRegisterTeam = () => {
    setRegisteredSuccess(true);
    setTimeout(() => {
      setIsRegisterModalOpen(false);
      setRegisteredSuccess(false);
      alert('Sua equipe foi confirmada na chave do torneio!');
    }, 1500);
  };

  const tabClass = (tab: typeof activeTab) =>
    `pb-3 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
      activeTab === tab
        ? 'border-[#E31B23] text-white'
        : 'border-transparent text-[#9298A5] hover:text-white'
    }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* BACK BUTTON */}
      <div>
        <Link
          to="/torneios"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#9298A5] hover:text-[#E31B23] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          VOLTAR PARA TORNEIOS
        </Link>
      </div>

      {/* HEADER DO CAMPEONATO */}
      <Card
        variant="primary"
        hasHudCorners
        className="p-6 sm:p-8 border-[#272B35] relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <TournamentStatus status={tournament.status} />
            </div>

            <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white">
              {tournament.name}
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {tournament.status === 'open' && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsRegisterModalOpen(true)}
              >
                INSCREVER MEU TIME
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Share2 className="w-4 h-4" />}
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                alert('Link do campeonato copiado para a área de transferência!');
              }}
            >
              COMPARTILHAR TORNEIO
            </Button>
          </div>
        </div>
      </Card>

      {/* TABS DE NAVEGAÇÃO INTERNA */}
      <div className="flex border-b border-[#272B35] gap-4 overflow-x-auto">
        <button onClick={() => setActiveTab('geral')} className={tabClass('geral')}>
          GERAL
        </button>
        <button onClick={() => setActiveTab('teams')} className={tabClass('teams')}>
          TIMES ({tournament.registeredTeams.length})
        </button>
        <button onClick={() => setActiveTab('tabela')} className={tabClass('tabela')}>
          TABELA
        </button>
        <button onClick={() => setActiveTab('bracket')} className={tabClass('bracket')}>
          MATA-MATA
        </button>
        <button onClick={() => setActiveTab('partidas')} className={tabClass('partidas')}>
          PARTIDAS ({allMatches.length})
        </button>
        <button onClick={() => setActiveTab('rules')} className={tabClass('rules')}>
          REGULAMENTO OFICIAL
        </button>
      </div>

      {/* TAB CONTENT: GERAL */}
      {activeTab === 'geral' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            INFORMAÇÕES GERAIS
          </h2>

          <Card variant="primary" hasHudCorners className="p-6 sm:p-8 border-[#272B35] space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-mono bg-[#181B23] border border-[#272B35] px-2.5 py-0.5 text-zinc-300">
                FORMATO: {tournament.format}
              </span>
              <span className="text-xs font-mono text-zinc-500">TAG: [{tournament.tag}]</span>
            </div>

            <p className="text-xs sm:text-sm text-[#9298A5] max-w-3xl leading-relaxed">
              {tournament.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#272B35]">
              <div className="p-3.5 bg-[#0E1016] border border-[#272B35]">
                <span className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#E31B23]" /> PERÍODO OFICIAL
                </span>
                <span className="text-sm font-bold text-white block mt-1">
                  {tournament.startDate} — {tournament.endDate}
                </span>
              </div>

              <div className="p-3.5 bg-[#0E1016] border border-[#272B35]">
                <span className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#E31B23]" /> VAGAS / TIMES
                </span>
                <span className="text-sm font-bold text-emerald-400 block mt-1">
                  {tournament.registeredTeams.length} / {tournament.maxTeams} EQUIPES
                </span>
              </div>

              <div className="p-3.5 bg-[#0E1016] border border-[#272B35]">
                <span className="text-[10px] font-mono uppercase text-[#9298A5] flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#E31B23]" /> SERVIDOR HOMOLOGADO
                </span>
                <span className="text-xs font-mono text-zinc-300 block mt-1 truncate">
                  {tournament.server}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#272B35] space-y-3">
              <h3 className="text-lg font-display uppercase text-yellow-400 flex items-center gap-2">
                <Trophy className="w-4 h-4" /> PREMIAÇÃO
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-[#0E1016] border border-yellow-500/40">
                  <span className="text-[10px] font-mono uppercase text-yellow-400 font-bold block">
                    1º COLOCADO
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {tournament.firstPlacePrize}
                  </span>
                </div>
                <div className="p-3.5 bg-[#0E1016] border border-[#272B35]">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
                    2º COLOCADO
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {tournament.secondPlacePrize}
                  </span>
                </div>
                <div className="p-3.5 bg-[#0E1016] border border-[#272B35]">
                  <span className="text-[10px] font-mono uppercase text-amber-600 font-bold block">
                    3º COLOCADO
                  </span>
                  <span className="text-sm font-bold text-white block mt-1">
                    {tournament.thirdPlacePrize}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: TIMES */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            TIMES INSCRITOS
          </h2>

          {tournament.registeredTeams.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tournament.registeredTeams.map((team, idx) => (
                <Card
                  key={team.id}
                  variant="primary"
                  className="p-4 border-[#272B35] hover:border-[#E31B23]/40 transition-colors flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 bg-[#181B23] border border-[#272B35] flex items-center justify-center text-2xl shrink-0">
                    {team.logo}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-zinc-500 font-bold">
                        #{idx + 1}
                      </span>
                      <h3 className="text-base font-display uppercase text-white truncate">
                        {team.name}
                      </h3>
                    </div>
                    <div className="text-xs font-mono text-[#9298A5]">
                      TAG: [{team.tag}] • {team.playersCount || 5} players
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card variant="primary" hasHudCorners className="p-10 border-[#272B35] text-center">
              <Users className="w-10 h-10 mx-auto text-[#9298A5] mb-2" />
              <h3 className="text-lg font-display uppercase tracking-wider text-white">
                NENHUM TIME INSCRITO
              </h3>
              <p className="text-xs text-[#9298A5] max-w-sm mx-auto mt-1">
                As equipes inscritas neste campeonato aparecerão aqui.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: TABELA */}
      {activeTab === 'tabela' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              FASE DE GRUPOS
            </h2>
            {groups.length > 0 && (
              <span className="text-[10px] font-mono uppercase text-[#9298A5]">
                J = Jogos · V = Vitórias · E = Empates · D = Derrotas · RF/RA = Rounds · SG = Saldo · Pts = Pontos
              </span>
            )}
          </div>

          {groups.length > 0 ? (
            <GroupStandingsTable groups={groups} />
          ) : (
            <Card variant="primary" hasHudCorners className="p-10 border-[#272B35] text-center">
              <AlertCircle className="w-10 h-10 mx-auto text-[#9298A5] mb-2" />
              <h3 className="text-lg font-display uppercase tracking-wider text-white">
                TABELA AINDA NÃO DISPONÍVEL
              </h3>
              <p className="text-xs text-[#9298A5] max-w-sm mx-auto mt-1">
                A classificação da fase de grupos será publicada assim que os confrontos forem definidos.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: CHAVEAMENTO */}
      {activeTab === 'bracket' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              ÁRVORE DE ELIMINATÓRIAS
            </h2>
            <span className="text-xs font-mono text-[#9298A5]">
              ARRASTE HORIZONTALMENTE SE NECESSÁRIO →
            </span>
          </div>

          <Card variant="primary" hasHudCorners className="p-6 border-[#272B35]">
            {tournament.brackets && tournament.brackets.length > 0 ? (
              <TournamentBracket
                brackets={tournament.brackets}
                championName={tournament.championTeam?.name}
                championLogo={tournament.championTeam?.logo}
                championTag={tournament.championTeam?.tag}
              />
            ) : (
              <div className="text-center py-16">
                <AlertCircle className="w-10 h-10 mx-auto text-[#9298A5] mb-2" />
                <h3 className="text-lg font-display uppercase tracking-wider text-white">
                  CHAVEAMENTO EM SORTEIO
                </h3>
                <p className="text-xs text-[#9298A5] max-w-sm mx-auto mt-1">
                  As chaves e confrontos serão gerados assim que o limite de 16 equipes for atingido ou as inscrições se encerrarem.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB CONTENT: PARTIDAS */}
      {activeTab === 'partidas' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              TODAS AS PARTIDAS
            </h2>
            <span className="text-xs font-mono text-[#9298A5]">
              {allMatches.length} CONFRONTOS REGISTRADOS
            </span>
          </div>

          {allMatches.length > 0 ? (
            <TournamentMatchesList matches={allMatches} tournamentId={tournament.id} />
          ) : (
            <Card variant="primary" hasHudCorners className="p-10 border-[#272B35] text-center">
              <Swords className="w-10 h-10 mx-auto text-[#9298A5] mb-2" />
              <h3 className="text-lg font-display uppercase tracking-wider text-white">
                NENHUMA PARTIDA REGISTRADA
              </h3>
              <p className="text-xs text-[#9298A5] max-w-sm mx-auto mt-1">
                As partidas deste campeonato aparecerão aqui assim que forem disputadas.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT: REGULAMENTO */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            LIVRO DE REGRAS E DIRETRIZES
          </h2>

          <Card variant="primary" hasHudCorners className="p-6 sm:p-8 border-[#272B35] space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-display uppercase text-[#E31B23] flex items-center gap-2">
                <FileText className="w-4 h-4" /> FORMATO E PONTUAÇÃO
              </h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-300 space-y-2 leading-relaxed">
                {tournament.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Inscrição de Equipe */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="CONFIRMAR INSCRIÇÃO DA EQUIPE"
      >
        {currentTeam ? (
          <div className="space-y-4 text-xs">
            <p className="text-zinc-300">
              Você está prestes a inscrever a equipe abaixo no <strong>{tournament.name}</strong>:
            </p>

            <div className="p-4 bg-[#181B23] border border-[#272B35] flex items-center gap-3">
              <span className="text-3xl">{currentTeam.logo}</span>
              <div>
                <span className="font-bold text-white text-sm block">{currentTeam.name}</span>
                <span className="text-[#9298A5] font-mono">TAG: [{currentTeam.tag}] • {currentTeam.members.length} Jogadores</span>
              </div>
            </div>

            <p className="text-[#9298A5]">
              Ao confirmar, seu clã compromete-se a comparecer nos horários estipulados sob pena de W.O.
            </p>

            <Button
              variant="primary"
              fullWidth
              size="md"
              disabled={registeredSuccess}
              onClick={handleRegisterTeam}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {registeredSuccess ? 'CONFIRMANDO...' : 'CONFIRMAR INSCRIÇÃO'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-xs text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-[#E31B23]" />
            <p className="text-zinc-300">
              Você precisa possuir ou ser capitão de um time para inscrever-se em torneios de Sudden Attack.
            </p>
            <Link to="/time">
              <Button variant="primary" fullWidth size="sm">
                CRIAR OU ENCONTRAR TIME
              </Button>
            </Link>
          </div>
        )}
      </Modal>
    </div>
  );
};
