import React from 'react';
import { LayoutGrid, Swords, Users } from 'lucide-react';
import { TeamTab } from './shared';

const TABS: { id: TeamTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'geral', label: 'Informações gerais', icon: LayoutGrid },
  { id: 'historico', label: 'Players', icon: Users },
  { id: 'partidas', label: 'Partidas', icon: Swords },
];

interface TeamNavigationProps {
  active: TeamTab;
  onChange: (tab: TeamTab) => void;
}

export const TeamNavigation: React.FC<TeamNavigationProps> = ({ active, onChange }) => (
  <nav
    className="rounded-xl bg-[#0D1118] border border-[#1D2633] px-2 sm:px-3 overflow-x-auto"
    aria-label="Navegação do time"
  >
    <div className="flex items-center gap-1 min-w-max">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wide transition-colors duration-200 ${
              isActive ? 'text-white' : 'text-[#8B93A7] hover:text-white'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${isActive ? 'text-[#E31B23]' : 'text-[#4A5568]'}`}
              aria-hidden
            />
            {tab.label}
            {isActive && (
              <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-[#E31B23] rounded-full shadow-[0_0_8px_rgba(227,27,35,0.5)]" />
            )}
          </button>
        );
      })}
    </div>
  </nav>
);
