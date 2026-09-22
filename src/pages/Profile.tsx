import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/ui/EmptyState';
import { Users } from 'lucide-react';
import { ProfileHero } from '../components/profile/ProfileHero';
import { ProfileNavigation } from '../components/profile/ProfileNavigation';
import { SocialLinksCard } from '../components/profile/SocialLinksCard';
import {
  AchievementsSection,
  FALLBACK_ACHIEVEMENTS,
  mapTeamHistoryToAchievements,
} from '../components/profile/AchievementsSection';
import { TitlesByFormat } from '../components/profile/TitlesByFormat';
import { PlayerStats } from '../components/profile/PlayerStats';
import {
  RecentActivities,
  buildActivitiesFromMatches,
} from '../components/profile/RecentActivities';
import { UpcomingTournaments } from '../components/profile/UpcomingTournaments';
import { RecentMatchesTable } from '../components/profile/RecentMatchesTable';
import { ProfileTab } from '../components/profile/shared';

export const Profile: React.FC = () => {
  const {
    currentUser,
    currentTeam,
    recentMatches,
    tournaments,
    updateUserProfile,
  } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [tab, setTab] = useState<ProfileTab>('overview');

  const achievements = useMemo(() => {
    const fromTeam = mapTeamHistoryToAchievements(currentTeam?.history);
    return fromTeam.length > 0 ? fromTeam : FALLBACK_ACHIEVEMENTS;
  }, [currentTeam?.history]);

  const activities = useMemo(() => {
    const fromMatches = buildActivitiesFromMatches(recentMatches);
    if (currentTeam) {
      return [
        {
          id: 'act-team',
          title: `Membro de ${currentTeam.name}`,
          time: currentTeam.createdAt,
          type: 'team' as const,
          href: `/time/${currentTeam.id}`,
        },
        ...fromMatches,
      ].slice(0, 5);
    }
    return fromMatches;
  }, [recentMatches, currentTeam]);

  const sparkline = useMemo(() => {
    let score = 50;
    const points = [score];
    [...recentMatches].reverse().forEach((m) => {
      score += m.result === 'VITÓRIA' ? 8 : -6;
      points.push(Math.max(10, Math.min(100, score)));
    });
    return points;
  }, [recentMatches]);

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="ACESSO NÃO AUTORIZADO"
          description="Faça login para visualizar o perfil do jogador."
          actionText="FAZER LOGIN"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  const teamRole =
    currentTeam?.captainId === currentUser.id
      ? 'CAPITÃO'
      : currentUser.role === 'captain'
        ? 'CAPITÃO'
        : 'PLAYER';

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div className="min-h-full bg-[#05070A] text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6 pb-16">
        {feedback && (
          <div
            role="status"
            className="rounded-xl p-3 bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 text-xs"
          >
            {feedback}
          </div>
        )}

        <ProfileHero
          user={currentUser}
          team={currentTeam}
          teamRole={teamRole}
          onBannerChange={(dataUrl) => {
            updateUserProfile({ banner: dataUrl });
            showFeedback('Banner atualizado');
          }}
          onAvatarChange={(dataUrl) => {
            updateUserProfile({ avatar: dataUrl });
            showFeedback('Foto atualizada');
          }}
        />

        <ProfileNavigation active={tab} onChange={setTab} />

        {/* OVERVIEW — 3 column grid like reference */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_260px] gap-4 lg:gap-5 items-start">
            {/* Left */}
            <div className="lg:sticky lg:top-24">
              <SocialLinksCard socialLinks={currentUser.socialLinks} />
            </div>

            {/* Center */}
            <div className="space-y-4 min-w-0">
              <AchievementsSection items={achievements} />
              <TitlesByFormat />
              <PlayerStats stats={currentUser.stats} sparkline={sparkline} />
            </div>

            {/* Right */}
            <div className="space-y-4 lg:sticky lg:top-24">
              <RecentActivities items={activities} />
              <UpcomingTournaments tournaments={tournaments} />
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <div className="space-y-4">
            <PlayerStats stats={currentUser.stats} sparkline={sparkline} />
            <RecentMatchesTable matches={recentMatches} />
          </div>
        )}

        {tab === 'stats' && (
          <div className="max-w-4xl">
            <PlayerStats stats={currentUser.stats} sparkline={sparkline} />
          </div>
        )}

        {tab === 'achievements' && (
          <div className="space-y-4 max-w-5xl">
            <AchievementsSection items={achievements} />
            <TitlesByFormat />
          </div>
        )}
      </div>
    </div>
  );
};
