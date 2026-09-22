import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Swords,
  Trophy,
  Users,
  Target,
  ArrowRight,
  Plus,
  Shield,
  Activity,
  Zap,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { currentUser, currentTeam, recentMatches } = useAuth();

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="ACESSO NÃO AUTORIZADO"
          description="Você precisa estar autenticado para acessar o painel de jogador."
          actionText="FAZER LOGIN"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  const { stats } = currentUser;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* HEADER DO DASHBOARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#272B35]">
        <div className="text-left">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
            CENTRO DE COMANDO // SA DASHBOARD
          </span>
          <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-1">
            OLÁ, {currentUser.name.split(' ')[0]}
          </h1>
          <p className="text-xs sm:text-sm text-[#9298A5] mt-0.5">
            Pronto para a próxima partida? Verifique seus dados táticos e o calendário de torneios.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/torneios">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              VER TORNEIOS
            </Button>
          </Link>
          <Link to="/time">
            <Button variant="secondary" size="sm">
              MEU TIME
            </Button>
          </Link>
        </div>
      </div>

      {/* TOP GRID: CARD DO JOGADOR + TIME DO USUÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CARD DO JOGADOR (7 COLS) */}
        <Card
          variant="primary"
          hasHudCorners
          className="lg:col-span-7 p-6 border-[#272B35] relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#272B35]/70">
            <div className="flex items-center gap-4 text-left">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.nickname}
                size="lg"
                status={currentUser.status}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-display uppercase tracking-wider text-white">
                    {currentUser.nickname}
                  </h2>
                  {currentUser.isAdmin && (
                    <span className="text-[10px] bg-[#E31B23] text-white px-2 py-0.5 font-mono uppercase font-bold">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#9298A5] font-medium">{currentUser.name}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-zinc-400">
                  <span className="text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {currentUser.status}
                  </span>
                  <span>•</span>
                  <span>FUNÇÃO IN-GAME: {currentUser.role.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="sm:text-right text-left text-xs font-mono text-[#9298A5] border-t sm:border-t-0 pt-3 sm:pt-0 border-[#272B35]">
              <div>MEMBRO DESDE: {currentUser.joinedAt}</div>
              <div className="text-zinc-400 font-bold mt-1">
                ID CONTA: {currentUser.accountId || `#SA-${currentUser.id.slice(-4)}`}
              </div>
            </div>
          </div>

          {/* TROFÉUS DO PLAYER */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <h3 className="text-sm font-display uppercase tracking-wider text-white">
                Troféus
              </h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { count: '5x', label: 'MIX DO TS', color: 'text-[#E31B23]' },
                { count: '3x', label: 'DRAFT', color: 'text-sky-400' },
                { count: '2x', label: 'SERIE A', color: 'text-yellow-400' },
                { count: '5x', label: 'SERIE B', color: 'text-emerald-400' },
              ].map((trophy) => (
                <div
                  key={trophy.label}
                  className="p-3 bg-[#0E1016] border border-[#272B35] text-center hover:border-[#E31B23]/40 transition-colors"
                >
                  <span className={`text-sm sm:text-base font-display uppercase tracking-wide font-bold block ${trophy.color}`}>
                    {trophy.label}
                  </span>
                  <span className="text-lg sm:text-xl font-display font-bold text-white mt-1 block">
                    {trophy.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* TIME DO USUÁRIO (5 COLS) - DOIS ESTADOS POSSÍVEIS */}
        <div className="lg:col-span-5 flex">
          {currentTeam ? (
            /* USUÁRIO COM TIME */
            <Card
              variant="primary"
              hasHudCorners
              className="p-6 w-full flex flex-col justify-between border-[#272B35] relative"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> MEU TIME
                  </span>
                  <span className="text-xs font-mono bg-[#181B23] border border-[#272B35] px-2 py-0.5 text-zinc-300">
                    TAG: [{currentTeam.tag}]
                  </span>
                </div>

                <div className="flex items-center gap-4 text-left mb-4">
                  <div className="w-14 h-14 bg-[#181B23] border border-[#272B35] flex items-center justify-center text-3xl overflow-hidden shrink-0">
                    {currentTeam.logo.startsWith('http') || currentTeam.logo.startsWith('data:') ? (
                      <img
                        src={currentTeam.logo}
                        alt={currentTeam.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{currentTeam.logo}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-display uppercase tracking-wider text-white">
                      {currentTeam.name}
                    </h3>
                    <div className="text-xs text-[#9298A5] flex items-center gap-2 mt-0.5">
                      <span>CARGO: <strong className="text-white">PLAYER</strong></span>
                      <span>•</span>
                      <span>CAPITÃO: <strong className="text-white">{currentTeam.captainNickname}</strong></span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#9298A5] text-left line-clamp-2 mb-4">
                  {currentTeam.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-left p-3 bg-[#0E1016] border border-[#272B35] mb-4">
                  <div>
                    <span className="text-[10px] font-mono text-[#9298A5] block">LINEUP OFICIAL</span>
                    <span className="text-xs font-bold text-white">
                      {currentTeam.members.length} / {currentTeam.maxMembers} JOGADORES
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#9298A5] block">TÍTULOS OFICIAIS</span>
                    <span className="text-xs font-bold text-yellow-400">
                      🏆 {currentTeam.stats.titles} CAMPEONATOS
                    </span>
                  </div>
                </div>
              </div>

              <Link to="/time">
                <Button variant="outline" fullWidth size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  VER TIME COMPLETO
                </Button>
              </Link>
            </Card>
          ) : (
            /* USUÁRIO SEM TIME */
            <Card
              variant="primary"
              hasHudCorners
              className="p-6 w-full flex flex-col justify-between border-dashed border-[#272B35] bg-[#0E1016]/60 text-center"
            >
              <div className="my-auto py-4">
                <div className="w-12 h-12 mx-auto mb-3 bg-[#181B23] border border-[#272B35] flex items-center justify-center text-[#E31B23]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-display uppercase tracking-wider text-white mb-2">
                  VOCÊ AINDA NÃO FAZ PARTE DE UM TIME
                </h3>
                <p className="text-xs text-[#9298A5] max-w-sm mx-auto mb-5 leading-relaxed">
                  Entre para uma equipe existente ou crie seu próprio time para começar a disputar campeonatos oficiais de Sudden Attack.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Link to="/time" className="w-full sm:w-auto">
                    <Button variant="secondary" size="sm" fullWidth>
                      BUSCAR TIME
                    </Button>
                  </Link>
                  <Link to="/time" className="w-full sm:w-auto">
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Plus className="w-4 h-4" />}>
                      CRIAR UM TIME
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ESTATÍSTICAS DETALHADAS DO JOGADOR */}
      <div>
        <div className="text-left mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
            DESEMPENHO INDIVIDUAL
          </span>
          <h2 className="text-2xl font-display uppercase tracking-wide text-white">
            ESTATÍSTICAS DO JOGADOR
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="PARTIDAS"
            value={stats.matches}
            subValue="DISPUTADAS"
            icon={<Activity className="w-4 h-4" />}
          />
          <StatCard
            label="VITÓRIAS"
            value={stats.wins}
            subValue="CONQUISTADAS"
            icon={<Trophy className="w-4 h-4 text-emerald-400" />}
          />
          <StatCard
            label="DERROTAS"
            value={stats.losses}
            subValue="REVÉS"
            icon={<Target className="w-4 h-4 text-red-400" />}
          />
          <StatCard
            label="WIN RATE"
            value={`${stats.winRate}%`}
            subValue="TAXA DE VITÓRIA"
            highlight
            icon={<Zap className="w-4 h-4 text-[#E31B23]" />}
          />
        </div>
      </div>

      {/* HISTÓRICO DE PARTIDAS RECENTES */}
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              ÚLTIMOS CONFRONTOS
            </span>
            <h2 className="text-2xl font-display uppercase tracking-wide text-white">
              PARTIDAS RECENTES
            </h2>
          </div>
          <Link to="/torneios">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              VER TABELAS
            </Button>
          </Link>
        </div>

        {recentMatches.length > 0 ? (
          <div className="bg-[#13161D] border border-[#272B35] overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0E1016] border-b border-[#272B35] text-[10px] font-mono uppercase tracking-wider text-[#9298A5]">
                <tr>
                  <th className="py-3 px-4">CAMPEONATO</th>
                  <th className="py-3 px-4">MAPA</th>
                  <th className="py-3 px-4">ADVERSÁRIO</th>
                  <th className="py-3 px-4 text-center">RESULTADO</th>
                  <th className="py-3 px-4 text-center">PLACAR</th>
                  <th className="py-3 px-4 text-right">DATA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272B35]/60">
                {recentMatches.map((match) => {
                  const isWin = match.result === 'VITÓRIA';
                  return (
                    <tr
                      key={match.id}
                      className="hover:bg-[#181B23]/70 transition-colors duration-150"
                    >
                      <td className="py-3.5 px-4 font-bold text-white text-xs sm:text-sm">
                        <Link
                          to={`/torneios/${match.tournamentId}`}
                          className="hover:text-[#E31B23] transition-colors"
                        >
                          {match.tournamentName}
                        </Link>
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
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded-none ${
                            isWin
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-700/50'
                              : 'bg-red-950/40 text-red-400 border border-red-800/60'
                          }`}
                        >
                          {match.result}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-sm font-bold">
                        <span className={isWin ? 'text-emerald-400' : 'text-red-400'}>
                          {match.myScore}
                        </span>{' '}
                        <span className="text-[#9298A5]">x</span>{' '}
                        <span className={!isWin ? 'text-emerald-400' : 'text-zinc-400'}>
                          {match.opponentScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-mono text-[#9298A5]">
                        {match.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<Swords className="w-8 h-8" />}
            title="VOCÊ AINDA NÃO JOGOU NENHUMA PARTIDA"
            description="Suas partidas aparecerão aqui quando você participar de um campeonato oficial."
            actionText="INSCREVER EM TORNEIO"
            onAction={() => (window.location.href = '/torneios')}
          />
        )}
      </div>
    </div>
  );
};
