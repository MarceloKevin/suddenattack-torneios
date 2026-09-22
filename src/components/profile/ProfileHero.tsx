import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Edit, ImagePlus, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Team, User } from '../../types';
import {
  BrazilFlag,
  DEFAULT_BANNER,
  cardClass,
  isImageSrc,
  readImageFile,
} from './shared';

interface ProfileHeroProps {
  user: User;
  team: Team | null;
  teamRole: string;
  onBannerChange: (dataUrl: string) => void;
  onAvatarChange: (dataUrl: string) => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  user,
  team,
  teamRole,
  onBannerChange,
  onAvatarChange,
}) => {
  const bannerSrc = user.banner || DEFAULT_BANNER;
  const accountId = user.accountId || `#SA-${user.id.slice(-4)}`;

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="relative min-h-[200px] sm:min-h-[220px]">
        <img
          src={bannerSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090D]/95 via-[#07090D]/75 to-[#07090D]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-black/20" />

        <label className="absolute top-4 right-4 z-20 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide rounded-lg bg-black/55 border border-white/15 text-white hover:border-[#E31B23] transition-colors">
          <ImagePlus className="w-3.5 h-3.5 text-[#E31B23]" aria-hidden />
          Banner
          <input
            type="file"
            accept="image/*"
            className="hidden"
            aria-label="Alterar banner"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onBannerChange(await readImageFile(file));
            }}
          />
        </label>

        <div className="relative z-10 px-5 sm:px-8 py-6 sm:py-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
          {/* Avatar + identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div
                className="w-[132px] h-[132px] sm:w-[152px] sm:h-[152px] rounded-full p-[3px] bg-[#E31B23]"
                style={{
                  boxShadow:
                    '0 0 0 4px rgba(7,9,13,0.9), 0 12px 40px rgba(0,0,0,0.5), 0 0 28px rgba(227,27,35,0.28)',
                }}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0F15]">
                  <img
                    src={user.avatar}
                    alt={`Avatar de ${user.nickname}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <label className="absolute bottom-1.5 right-1.5 cursor-pointer w-9 h-9 rounded-full bg-[#E31B23] border-2 border-[#07090D] flex items-center justify-center hover:bg-[#ff2a32] transition-colors">
                <Camera className="w-4 h-4 text-white" aria-hidden />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Alterar foto de perfil"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onAvatarChange(await readImageFile(file));
                  }}
                />
              </label>
            </div>

            <div className="text-center sm:text-left pb-1 space-y-2.5 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {user.nickname.toLowerCase()}
                </h1>
                <BrazilFlag />
              </div>

              {user.knownAs && (
                <p className="text-xs text-[#8B93A7]">conhecido como {user.knownAs}</p>
              )}
              {user.description && (
                <p className="text-sm text-[#B8BEC9] leading-relaxed max-w-lg mx-auto sm:mx-0">
                  {user.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-wider text-[#8B93A7]">
                <span>Membro desde: {user.joinedAt}</span>
                <span className="hidden sm:inline text-[#2A3444]">•</span>
                <span>ID. Conta: {accountId}</span>
              </div>

              <div className="pt-1">
                <Link to="/settings">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit className="w-3.5 h-3.5" />}
                    className="rounded-lg"
                  >
                    EDITAR PERFIL
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Team card — right side of hero */}
          <div className="w-full lg:w-[280px] shrink-0">
            <div className="rounded-xl bg-[#0B0F15]/85 border border-[#1D2633] backdrop-blur-sm p-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#E31B23] font-bold flex items-center gap-1.5 mb-3">
                <Shield className="w-3 h-3" aria-hidden />
                Meu time
              </span>

              {team ? (
                <Link
                  to={`/time/${team.id}`}
                  className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]/50 rounded-lg"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#10151D] border border-[#1D2633] overflow-hidden shrink-0 flex items-center justify-center">
                    {isImageSrc(team.logo) ? (
                      <img
                        src={team.logo}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl" aria-hidden>
                        {team.logo}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wide text-white group-hover:text-[#E31B23] transition-colors truncate">
                      {team.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#8B93A7] mt-0.5">
                      CARGO: <span className="text-cyan-300">{teamRole}</span>
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#8B93A7]">Sem time no momento.</p>
                  <Link to="/time">
                    <Button variant="outline" size="sm" fullWidth className="rounded-lg">
                      ENCONTRAR TIME
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
