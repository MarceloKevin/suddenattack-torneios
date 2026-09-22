import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TournamentCard } from '../components/tournament/TournamentCard';
import {
  Crosshair,
  Users,
  Trophy,
  Swords,
  ArrowRight,
  Flame,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { tournaments, currentUser } = useAuth();

  // Active / featured tournaments
  const featuredTournaments = tournaments.slice(0, 3);

  const steps = [
    {
      num: '01',
      title: 'CRIE SUA CONTA',
      desc: 'Cadastre seu nickname oficial, defina seu perfil de jogador e vincule suas estatísticas de Sudden Attack.',
      icon: Crosshair,
    },
    {
      num: '02',
      title: 'MONTE SEU TIME',
      desc: 'Reúna sua line competitiva de 5 a 7 membros ou encontre clãs ativos recrutando talentos no cenário nacional.',
      icon: Users,
    },
    {
      num: '03',
      title: 'ENTRE NOS TORNEIOS',
      desc: 'Inscreva seu clã em torneios semanais abertos, ligas de acesso ou copas fechadas com premiações reais.',
      icon: Swords,
    },
    {
      num: '04',
      title: 'DISPUTE O TÍTULO',
      desc: 'Suba no ranking competitivo oficial, vença os brackets eliminatórios e erga o troféu de campeão.',
      icon: Trophy,
    },
  ];

  const stats = [
    { label: 'Jogadores Registrados', value: '+120', sub: 'competidores' },
    { label: 'Equipes & Clãs', value: '+24', sub: 'lines oficiais' },
    { label: 'Campeonatos Concluídos', value: '+15', sub: 'temporadas' },
    { label: 'Partidas Disputadas', value: '+320', sub: 'confrontos' },
  ];

  return (
    <div className="space-y-20 pb-16">
      {/* HERO SECTION */}
      <section className="relative flex items-center justify-center overflow-hidden border-b border-[#272B35] px-4 sm:px-6 lg:px-8 py-14 sm:py-16 tactical-grid">
        {/* Tactical Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#E31B23]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-8 left-8 w-28 h-28 bg-[#272B35]/30 blur-[70px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge alert */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#13161D] border border-[#E31B23]/50 text-xs font-mono uppercase text-[#ff4d55] mb-4">
            <span className="w-2 h-2 rounded-full bg-[#E31B23] animate-ping" />
            <span className="font-bold">INSCRIÇÕES ABERTAS // TEMPORADA 2026</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight text-white leading-none">
            ENTRE NA <span className="text-[#E31B23]">BATALHA.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-4 text-sm sm:text-base lg:text-lg text-[#9298A5] max-w-2xl mx-auto font-normal leading-relaxed">
            Monte seu time. Enfrente os melhores. Dispute campeonatos e escreva seu nome na história do Sudden Attack.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {currentUser ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  IR PARA O DASHBOARD
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    ENTRAR
                  </Button>
                </Link>
                <Link to="/cadastro">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    CRIAR CONTA
                  </Button>
                </Link>
              </>
            )}
            <Link to="/torneios">
              <Button variant="outline" size="lg">
                EXPLORAR TORNEIOS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* TORNEIOS EM DESTAQUE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#272B35]">
          <div className="text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              ARENA DE CONFRONTOS
            </span>
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white mt-1">
              TORNEIOS EM DESTAQUE
            </h2>
          </div>
          <Link to="/torneios">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              VER TODOS OS TORNEIOS
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </section>

      {/* SEÇÃO "COMO FUNCIONA" */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#E31B23] mb-2 font-bold">
            <Flame className="w-4 h-4" /> GUIA RÁPIDO DO COMPETIDOR
          </div>
          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white">
            COMO FUNCIONA
          </h2>
          <p className="text-sm sm:text-base text-[#9298A5] max-w-xl mx-auto mt-2">
            Em quatro etapas simples seu clã sai do lobby casual direto para os playoffs transmitidos ao vivo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Card
                key={step.num}
                variant="primary"
                hasHudCorners
                className="p-6 text-left relative group hover:border-[#E31B23] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl font-display text-[#E31B23] font-bold group-hover:scale-110 transition-transform">
                    {step.num}
                  </span>
                  <div className="p-2.5 bg-[#181B23] border border-[#272B35] text-[#9298A5] group-hover:text-white group-hover:border-[#E31B23]/50 transition-colors">
                    <Icon className="w-5 h-5 text-[#E31B23]" />
                  </div>
                </div>

                <h3 className="text-xl font-display uppercase tracking-wider text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-[#9298A5] leading-relaxed">
                  {step.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-[#272B35]/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>ETAPA {step.num}</span>
                  <span className="text-[#E31B23]">PRONTO &gt;&gt;</span>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SEÇÃO DE DESTAQUE // ESTATÍSTICAS */}
      <section className="bg-[#0E1016] border-y border-[#272B35] py-16 tactical-dots">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              ESTATÍSTICAS DA ARENA
            </span>
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-wide text-white mt-1">
              COMPETIÇÃO DE VERDADE
            </h2>
            <p className="text-sm text-[#9298A5] max-w-lg mx-auto mt-2">
              Centenas de confrontos, rivalidades históricas e recordes registrados em nossa plataforma.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((item, idx) => (
              <Card
                key={idx}
                variant="primary"
                hasHudCorners
                className="p-6 text-center border-[#272B35] hover:border-[#E31B23]/60 transition-colors"
              >
                <div className="text-4xl sm:text-6xl font-display text-white font-bold tracking-tight mb-1 text-[#F5F5F5]">
                  {item.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#E31B23] mb-1">
                  {item.label}
                </div>
                <div className="text-[11px] font-mono text-[#9298A5] uppercase">
                  {item.sub}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative p-8 sm:p-14 bg-gradient-to-r from-[#181B23] via-[#13161D] to-[#181B23] border-2 border-[#E31B23] text-center overflow-hidden hud-corner shadow-2xl shadow-red-950/20">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#E31B23]/10 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-block text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold mb-3">
            O SERVIDOR AGUARDA SUA LINE
          </span>

          <h2 className="text-4xl sm:text-6xl font-display uppercase tracking-tight text-white mb-4">
            SEU TIME ESTÁ PRONTO?
          </h2>

          <p className="text-sm sm:text-base text-[#9298A5] max-w-2xl mx-auto mb-8">
            Reúna seus companheiros de equipe, inscreva-se na próxima copa e mostre quem manda no Third Supply Base e Dragon Road.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/cadastro">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                COMEÇAR AGORA
              </Button>
            </Link>
            <Link to="/torneios">
              <Button variant="secondary" size="lg">
                TABELA DE CAMPEONATOS
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
