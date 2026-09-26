import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
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
import { paths } from '../utils/paths';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import rankingBg from '../assets/ranking-bg.png';

export const Profile: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const {
    currentUser,
    users,
    teams,
    recentMatches,
    tournaments,
    updateUserProfile,
  } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [tab, setTab] = useState<ProfileTab>('overview');

  const profileUser = useMemo(() => {
    if (!userId) return null;
    return users.find((u) => u.id === userId) ?? null;
  }, [users, userId]);

  const isOwnProfile = Boolean(currentUser && profileUser && currentUser.id === profileUser.id);

  const profileTeam = useMemo(() => {
    if (!profileUser?.teamId) return null;
    return teams.find((t) => t.id === profileUser.teamId) ?? null;
  }, [profileUser, teams]);

  const achievements = useMemo(() => {
    const fromTeam = mapTeamHistoryToAchievements(profileTeam?.history);
    return fromTeam.length > 0 ? fromTeam : FALLBACK_ACHIEVEMENTS;
  }, [profileTeam?.history]);

  const profileMatches = isOwnProfile ? recentMatches : [];

  const activities = useMemo(() => {
    const fromMatches = buildActivitiesFromMatches(profileMatches);
    if (profileTeam) {
      return [
        {
          id: 'act-team',
          title: `Membro de ${profileTeam.name}`,
          time: profileTeam.createdAt,
          type: 'team' as const,
          href: paths.team(profileTeam.id),
        },
        ...fromMatches,
      ].slice(0, 5);
    }
    return fromMatches;
  }, [profileMatches, profileTeam]);

  const sparkline = useMemo(() => {
    let score = 50;
    const points = [score];
    [...profileMatches].reverse().forEach((m) => {
      score += m.result === 'VITÓRIA' ? 8 : -6;
      points.push(Math.max(10, Math.min(100, score)));
    });
    return points;
  }, [profileMatches]);

  useEffect(() => {
    setTab('overview');
  }, [userId]);

  useDocumentTitle(
    profileUser?.nickname ? `${profileUser.nickname} - Perfil de player` : undefined
  );

  // /perfil sem ID → redireciona para o próprio perfil por ID
  if (!userId) {
    if (currentUser) return <Navigate to={paths.player(currentUser.id)} replace />;
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

  if (!profileUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="JOGADOR NÃO ENCONTRADO"
          description={`Não existe um jogador com o ID "${userId}".`}
          actionText="VOLTAR AO DASHBOARD"
          onAction={() => (window.location.href = '/dashboard')}
        />
      </div>
    );
  }

  const teamRole =
    profileTeam?.captainId === profileUser.id
      ? 'CAPITÃO'
      : profileUser.role === 'captain'
        ? 'CAPITÃO'
        : 'PLAYER';

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 2500);
  };

  return (
    <div className="relative isolate min-h-full overflow-hidden text-left">
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 opacity-40"
          style={{
            backgroundImage: `url(${rankingBg})`,
            filter: 'saturate(0.55) brightness(0.5)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(255,22,61,0.10), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(20,40,70,0.18), transparent 55%), linear-gradient(180deg, rgba(7,9,13,0.45) 0%, rgba(7,9,13,0.78) 50%, #07090D 100%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse 75% 60% at 50% 25%, black 15%, transparent 70%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 75% 60% at 50% 25%, black 15%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6 pb-16">
        {feedback && (
          <div
            role="status"
            className="rounded-xl p-3 bg-emerald-950/50 border border-emerald-700/60 text-emerald-300 text-xs"
          >
            {feedback}
          </div>
        )}

        <p className="text-[10px] font-mono uppercase tracking-widest text-[#5e6878]">
          ID do jogador:{' '}
          <span className="text-[#8b98aa]">{profileUser.id}</span>
          {profileTeam && (
            <>
              {' · '}
              Time:{' '}
              <Link to={paths.team(profileTeam.id)} className="text-[#E31B23] hover:underline">
                {profileTeam.id}
              </Link>
            </>
          )}
        </p>

        <ProfileHero
          user={profileUser}
          team={profileTeam}
          teamRole={teamRole}
          isEditable={isOwnProfile}
          onBannerChange={
            isOwnProfile
              ? (dataUrl) => {
                  updateUserProfile({ banner: dataUrl });
                  showFeedback('Banner atualizado');
                }
              : undefined
          }
          onAvatarChange={
            isOwnProfile
              ? (dataUrl) => {
                  updateUserProfile({ avatar: dataUrl });
                  showFeedback('Foto atualizada');
                }
              : undefined
          }
        />

        <ProfileNavigation active={tab} onChange={setTab} />

        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_260px] gap-4 lg:gap-5 items-start">
            <div className="lg:sticky lg:top-24">
              <SocialLinksCard socialLinks={profileUser.socialLinks} />
            </div>

            <div className="space-y-4 min-w-0">
              <AchievementsSection items={achievements} />
              <TitlesByFormat />
              <PlayerStats stats={profileUser.stats} sparkline={sparkline} />
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <RecentActivities items={activities} />
              <UpcomingTournaments tournaments={tournaments} />
            </div>
          </div>
        )}

        {tab === 'matches' && (
          <div className="space-y-4">
            <PlayerStats stats={profileUser.stats} sparkline={sparkline} />
            <RecentMatchesTable matches={profileMatches} />
          </div>
        )}

        {tab === 'stats' && (
          <div className="max-w-4xl">
            <PlayerStats stats={profileUser.stats} sparkline={sparkline} />
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
