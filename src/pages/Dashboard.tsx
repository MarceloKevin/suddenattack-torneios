import React from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/ui/EmptyState';
import { DashboardView } from '../components/dashboard/DashboardView';

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

  return (
    <DashboardView
      user={currentUser}
      team={currentTeam}
      recentMatches={recentMatches}
    />
  );
};
