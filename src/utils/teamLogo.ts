import { isImageSrc } from '../components/profile/shared';

/** Fallback de logo (imagem) quando o registro do torneio ainda usa emoji. */
export const TEAM_LOGO_BY_ID: Record<string, string> = {
  'team-sk':
    'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=300&h=300&fit=crop&q=80',
  'team-dw':
    'https://images.unsplash.com/photo-1614680376576-c42917ad4c0a?w=300&h=300&fit=crop&q=80',
  'team-alpha':
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop&q=80',
  'team-beta':
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=300&fit=crop&q=80',
  'team-phantom':
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300&h=300&fit=crop&q=80',
  'team-redforce':
    'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=300&h=300&fit=crop&q=80',
  'team-cobra':
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=300&h=300&fit=crop&q=80',
  'team-storm':
    'https://api.dicebear.com/9.x/shapes/svg?seed=StormTroopers&backgroundColor=0b1520',
  'team-nexus':
    'https://api.dicebear.com/9.x/shapes/svg?seed=NexusGaming&backgroundColor=0b1520',
  'team-valkyrie':
    'https://api.dicebear.com/9.x/shapes/svg?seed=ValkyrieSA&backgroundColor=0b1520',
  'team-bullet':
    'https://api.dicebear.com/9.x/shapes/svg?seed=BulletProof&backgroundColor=0b1520',
  'team-apex':
    'https://api.dicebear.com/9.x/shapes/svg?seed=ApexLegendsSA&backgroundColor=0b1520',
  'team-titan':
    'https://api.dicebear.com/9.x/shapes/svg?seed=TitanBrasil&backgroundColor=0b1520',
  'team-iron':
    'https://api.dicebear.com/9.x/shapes/svg?seed=IronClan&backgroundColor=0b1520',
  'team-blitz':
    'https://api.dicebear.com/9.x/shapes/svg?seed=Blitzkrieg&backgroundColor=0b1520',
  'team-shadow':
    'https://api.dicebear.com/9.x/shapes/svg?seed=ShadowRunners&backgroundColor=0b1520',
};

export const resolveTeamLogo = (
  teamId: string,
  logo?: string,
  catalogLogo?: string
): string => {
  if (isImageSrc(catalogLogo)) return catalogLogo!;
  if (isImageSrc(logo)) return logo!;
  return TEAM_LOGO_BY_ID[teamId] || logo || TEAM_LOGO_BY_ID['team-sk'];
};
