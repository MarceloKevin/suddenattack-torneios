import React from 'react';
import { Camera, Edit, ImagePlus, LogOut, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Team } from '../../types';
import { BrazilFlag, cardClass, isImageSrc, readImageFile, DEFAULT_BANNER } from './shared';

interface TeamHeroProps {
  team: Team;
  isOwnTeam: boolean;
  isCaptain: boolean;
  onBannerChange: (dataUrl: string) => void;
  onLogoChange: (dataUrl: string) => void;
  onEdit: () => void;
  onManage: () => void;
  onLeave: () => void;
}

export const TeamHero: React.FC<TeamHeroProps> = ({
  team,
  isOwnTeam,
  isCaptain,
  onBannerChange,
  onLogoChange,
  onEdit,
  onManage,
  onLeave,
}) => {
  const bannerSrc = isImageSrc(team.banner) ? team.banner! : DEFAULT_BANNER;

  return (
    <section className={`${cardClass} overflow-hidden`}>
      <div className="relative min-h-[240px] sm:min-h-[280px] md:min-h-[320px]">
        {isImageSrc(team.banner) ? (
          <img
            src={bannerSrc}
            alt={`Banner ${team.name}`}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, #1a0a0c 0%, #12151c 40%, #0E1016 100%), radial-gradient(ellipse at 70% 40%, rgba(227,27,35,0.35), transparent 55%)',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07090D]/95 via-[#07090D]/70 to-[#07090D]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07090D] via-transparent to-black/25" />

        {isCaptain && (
          <label className="absolute top-4 right-4 z-20 cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide rounded-lg bg-black/55 border border-white/15 text-white hover:border-[#E31B23] transition-colors">
            <ImagePlus className="w-3.5 h-3.5 text-[#E31B23]" aria-hidden />
            Banner
            <input
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Alterar banner do time"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                onBannerChange(await readImageFile(file));
              }}
            />
          </label>
        )}

        <div className="relative z-10 px-5 sm:px-8 py-7 sm:py-9 flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-7">
          <div className="relative shrink-0">
            <div
              className="w-[128px] h-[128px] sm:w-[152px] sm:h-[152px] rounded-full p-[3px] bg-[#E31B23]"
              style={{
                boxShadow:
                  '0 0 0 4px rgba(7,9,13,0.9), 0 12px 40px rgba(0,0,0,0.5), 0 0 28px rgba(227,27,35,0.28)',
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0B0F15] flex items-center justify-center">
                {isImageSrc(team.logo) ? (
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">{team.logo || '🛡️'}</span>
                )}
              </div>
            </div>
            {isCaptain && (
              <label className="absolute bottom-1.5 right-1.5 cursor-pointer w-9 h-9 rounded-full bg-[#E31B23] border-2 border-[#07090D] flex items-center justify-center hover:bg-[#ff2a32] transition-colors">
                <Camera className="w-4 h-4 text-white" aria-hidden />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  aria-label="Alterar logo do time"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    onLogoChange(await readImageFile(file));
                  }}
                />
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left space-y-3 pb-1">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <h1 className="text-4xl sm:text-5xl md:text-[3.25rem] font-display uppercase text-white tracking-wide leading-none">
                {team.name}
              </h1>
              <BrazilFlag className="w-[22px] h-[15px]" />
            </div>

            <p className="text-lg sm:text-xl font-bold text-[#E31B23] tracking-[0.18em] uppercase font-mono">
              {team.tag}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1.5 text-sm sm:text-base font-semibold uppercase tracking-wide text-[#D5D8DE]">
              <span className="text-white">Brasil</span>
              <span className="hidden sm:inline text-[#E31B23]" aria-hidden>
                •
              </span>
              <span>
                Fundado em{' '}
                <span className="text-white font-bold">{team.createdAt}</span>
              </span>
              <span className="hidden sm:inline text-[#E31B23]" aria-hidden>
                •
              </span>
              <span>
                <span className="text-white font-bold tabular-nums">
                  {team.members.length}/{team.maxMembers}
                </span>{' '}
                jogadores
              </span>
            </div>

            {isOwnTeam && (
              <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit className="w-3.5 h-3.5" />}
                  onClick={onEdit}
                  className="rounded-lg"
                >
                  EDITAR TIME
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Settings className="w-3.5 h-3.5" />}
                  onClick={onManage}
                  className="rounded-lg"
                >
                  GERENCIAR
                </Button>
                <button
                  type="button"
                  onClick={onLeave}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono text-[#8B93A7] hover:text-red-400 transition-colors rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
