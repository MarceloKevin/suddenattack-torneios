import React from 'react';
import { BarChart3, Trophy, Users } from 'lucide-react';

const STATS = [
  {
    value: '12.8K',
    label: 'Jogadores Ativos',
    icon: Users,
  },
  {
    value: '247',
    label: 'Torneios Realizados',
    icon: Trophy,
  },
  {
    value: '1.2K',
    label: 'Times Cadastrados',
    icon: Users,
  },
  {
    value: 'TOP 100',
    label: 'Ranking Geral',
    icon: BarChart3,
  },
] as const;

export const HomeStatsBar: React.FC = () => {
  return (
    <section className="sa-home-stats" aria-label="Estatísticas da plataforma">
      <div className="sa-home__container">
        <div className="sa-home-stats__grid">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="sa-home-stats__item">
                <div className="sa-home-stats__icon">
                  <Icon className="w-6 h-6" aria-hidden strokeWidth={2.25} />
                </div>
                <div className="sa-home-stats__copy">
                  <span className="sa-home-stats__value">{stat.value}</span>
                  <span className="sa-home-stats__label">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
