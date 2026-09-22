import React from 'react';
import { Award, BarChart3, LayoutGrid, Swords } from 'lucide-react';
import { ProfileTab } from './shared';

const TABS: { id: ProfileTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutGrid },
  { id: 'matches', label: 'Partidas', icon: Swords },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3 },
  { id: 'achievements', label: 'Conquistas', icon: Award },
];

interface ProfileNavigationProps {
  active: ProfileTab;
  onChange: (tab: ProfileTab) => void;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  active,
  onChange,
}) => (
  <nav
    className="rounded-xl bg-[#0D1118] border border-[#1D2633] px-2 sm:px-3 overflow-x-auto"
    aria-label="Navegação do perfil"
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
              isActive
                ? 'text-white'
                : 'text-[#8B93A7] hover:text-white'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${isActive ? 'text-[#E31B23]' : 'text-[#4A5568]'}`}
              aria-hidden
            />
            {tab.label}
            {isActive && (
              <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-[#E31B23] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  </nav>
);
