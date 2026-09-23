import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Trophy, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { paths } from '../../utils/paths';

export const Footer: React.FC = () => {
  const { currentTeam } = useAuth();
  const teamHref = currentTeam ? paths.team(currentTeam.id) : '/time';

  return (
    <footer className="bg-[#08090D] border-t border-[#272B35] text-[#9298A5] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#272B35]/70">
          {/* Logo & description */}
          <div className="md:col-span-2 space-y-4 text-left">
            <Logo size="md" showSubtitle={false} />
            <p className="text-sm text-[#9298A5] max-w-sm leading-relaxed">
              Plataforma competitiva oficial para jogadores e equipes de Sudden Attack.
              Organização de campeonatos, rankings de clãs, estatísticas detalhadas e disputa por premiações reais.
            </p>
          </div>

          {/* Platform Links */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5] font-display">
              Navegação
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-[#E31B23] transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/torneios" className="hover:text-[#E31B23] transition-colors">
                  Torneios Ativos
                </Link>
              </li>
              <li>
                <Link to={teamHref} className="hover:text-[#E31B23] transition-colors">
                  Times & Clãs
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#E31B23] transition-colors">
                  Área do Jogador
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Rules Links */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5] font-display">
              Regulamento & Suporte
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#termos" onClick={(e) => { e.preventDefault(); alert('Termos de Uso Oficiais do Campeonato Sudden Attack: Fair play estrito, uso de gravadores de tela e proibição de scripts.'); }} className="hover:text-[#E31B23] transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#privacidade" onClick={(e) => { e.preventDefault(); alert('Política de Privacidade: Seus dados estão seguros e são utilizados exclusivamente para identificação no ranking.'); }} className="hover:text-[#E31B23] transition-colors">
                  Privacidade
                </a>
              </li>
              <li>
                <a href="#regras" onClick={(e) => { e.preventDefault(); alert('Regras de Partida: 5v5 Search & Destroy em mapas clássicos (Third Supply, Dragon Road, White Squall).'); }} className="hover:text-[#E31B23] transition-colors">
                  Livro de Regras Oficiais
                </a>
              </li>
              <li>
                <a href="#contato" onClick={(e) => { e.preventDefault(); alert('Contato com a Organização: suporte@campeonatosuddenattack.com.br'); }} className="hover:text-[#E31B23] transition-colors">
                  Contato com a Staff
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#9298A5] gap-4">
          <p>© 2026 Campeonato Sudden Attack. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#E31B23] font-bold">
              <Flame className="w-3.5 h-3.5" /> SUDDEN ATTACK BRASIL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" /> TEMPORADA 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
