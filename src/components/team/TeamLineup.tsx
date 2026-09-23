import React from 'react';
import { Link } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { TeamMember } from '../../types';
import { getRosterSlot } from '../../utils/rosterHelpers';
import { paths } from '../../utils/paths';
import { BrazilFlag } from './shared';
import lineupBg from '../../assets/team-lineup-bg.jpg';

interface TeamLineupProps {
  members: TeamMember[];
  count: number;
  max: number;
}

/* Easily replaceable cinematic background asset */
export const LINEUP_BG = lineupBg;

const roleLabel = (member: TeamMember) => {
  if (member.role === 'CAPITÃO') return 'CAPITÃO';
  if (member.inGameRole) return member.inGameRole;
  if (member.role === 'RESERVA') return 'RESERVA';
  return 'PLAYER';
};

/* ─── Portrait ─── */

const PlayerPortrait: React.FC<{
  member: TeamMember;
  isLast: boolean;
}> = ({ member, isLast }) => {
  const isCaptain = member.role === 'CAPITÃO';
  const slot = getRosterSlot(member);
  const isTitular = slot === 'LINEUP';

  return (
    <article
      className={`group relative flex flex-col items-center transition-all duration-300 ${
        !isLast ? 'lg:border-r lg:border-cyan-400/[0.08]' : ''
      }`}
    >
      {/* Per-player ambient glow */}
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isCaptain
            ? 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(227,27,35,0.14),transparent_65%)]'
            : 'bg-[radial-gradient(ellipse_at_50%_40%,rgba(45,212,191,0.12),transparent_65%)]'
        }`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[12%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] opacity-40 group-hover:opacity-70 transition-opacity duration-300"
        style={{
          background: isCaptain
            ? 'radial-gradient(ellipse at center, rgba(227,27,35,0.22), transparent 70%)'
            : 'radial-gradient(ellipse at center, rgba(0,200,220,0.18), transparent 70%)',
        }}
        aria-hidden
      />

      {/* Portrait image */}
      <div className="relative z-10 w-full flex items-end justify-center pt-1 px-2 overflow-hidden">
        <div className="relative w-full max-w-[180px] h-[200px] sm:h-[220px] lg:h-[240px] flex items-end justify-center transition-transform duration-300 group-hover:scale-[1.03]">
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.nickname}
              className="w-full h-full object-contain object-bottom select-none"
              style={{
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 78%, transparent 100%)',
                filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.55))',
              }}
            />
          ) : (
            <div className="w-28 h-36 rounded-lg bg-[#0A1E2A]/80 border border-cyan-400/10 flex items-center justify-center text-2xl font-extrabold text-cyan-200/40">
              {member.nickname.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Info stack */}
      <div className="relative z-10 w-full px-3 pb-5 sm:pb-6 pt-1 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 -top-10 bottom-0 bg-gradient-to-t from-[#02070D]/95 via-[#02070D]/75 to-transparent"
          aria-hidden
        />

        <div className="relative space-y-1.5">
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {isCaptain && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-[4px] bg-[#E31B23] text-white shrink-0"
                title="Capitão"
              >
                <Crown className="w-3 h-3" aria-hidden />
              </span>
            )}
            <BrazilFlag className="w-[16px] h-[11px]" />
            <h3 className="text-[17px] sm:text-[19px] lg:text-[20px] font-extrabold uppercase tracking-wide text-white leading-none">
              <Link
                to={paths.player(member.userId)}
                className="hover:text-[#2DD4BF] transition-colors"
              >
                {member.nickname}
              </Link>
            </h3>
          </div>

          {member.name && (
            <p className="text-[12px] sm:text-[13px] font-medium text-[#8EA8BA] truncate">
              {member.name}
            </p>
          )}

          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#2DD4BF]">
            {roleLabel(member)}
          </p>

          <div className="pt-1.5">
            <span
              className={`inline-flex px-3.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-[0.12em] border ${
                isTitular
                  ? 'border-[#FF174F]/70 text-[#FF174F] bg-[#FF174F]/10'
                  : 'border-amber-500/50 text-amber-300 bg-amber-500/10'
              }`}
            >
              {isTitular ? 'Titular' : 'Reserva'}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

const EmptyPortrait: React.FC<{ index: number; isLast: boolean }> = ({
  index,
  isLast,
}) => (
  <div
    className={`relative flex flex-col items-center justify-end min-h-[280px] sm:min-h-[300px] opacity-50 ${
      !isLast ? 'lg:border-r lg:border-cyan-400/[0.08]' : ''
    }`}
  >
    <div className="flex-1 w-full flex items-center justify-center">
      <div className="w-24 h-32 rounded-lg border border-dashed border-cyan-400/20 bg-[#0A1E2A]/40 flex items-center justify-center">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#7F98AA]">
          Vago
        </span>
      </div>
    </div>
    <div className="pb-8 text-center">
      <span className="text-xs font-mono text-[#7F98AA]">
        #{String(index + 1).padStart(2, '0')}
      </span>
    </div>
  </div>
);

/* ─── Section ─── */

export const TeamLineup: React.FC<TeamLineupProps> = ({
  members,
  count,
  max,
}) => {
  const slots = Array.from({ length: max }, (_, index) => members[index] ?? null);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#0A1E2A]/80">
      {/* Full-section cinematic background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${LINEUP_BG})` }}
        aria-hidden
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(2,7,13,0.28) 0%, rgba(2,7,13,0.35) 45%, rgba(2,7,13,0.72) 100%), linear-gradient(90deg, rgba(2,7,13,0.25) 0%, transparent 22%, transparent 78%, rgba(2,7,13,0.25) 100%)',
        }}
        aria-hidden
      />
      {/* Tech lines — kept very light so the asset HUD remains primary */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(-32deg, transparent, transparent 28px, rgba(45,212,191,0.9) 28px, rgba(45,212,191,0.9) 29px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E31B23]/50 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#E31B23]">
                Escalação oficial
              </span>
              <span className="h-px w-8 sm:w-12 bg-[#E31B23]/85" aria-hidden />
            </div>
            <h2 className="mt-2 text-[2rem] sm:text-[2.35rem] md:text-[2.5rem] font-black uppercase tracking-[-0.02em] text-white leading-none">
              Lineup
            </h2>
            <p className="mt-2.5 text-sm sm:text-[15px] text-[#8EA8BA] leading-relaxed max-w-xl">
              Os {max} jogadores que entram em campo nas partidas oficiais.
            </p>
          </div>

          <div className="shrink-0 inline-flex items-center rounded-full border border-[#E31B23]/70 bg-[#02070D]/55 px-4 py-2 text-[13px] font-extrabold tabular-nums text-white tracking-wide backdrop-blur-sm">
            {count}/{max}
          </div>
        </div>

        {/* Unified roster panel */}
        <div
          className="relative overflow-hidden rounded-[18px] border border-cyan-400/15"
          style={{
            background: 'rgba(3, 15, 24, 0.38)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.35)',
          }}
        >
          {/* Faint watermark / vignette */}
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 50% 60% at 50% 35%, rgba(45,212,191,0.08), transparent 70%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
            aria-hidden
          />

          {/* Desktop: 5-col composition */}
          <div className="relative hidden lg:grid lg:grid-cols-5">
            {slots.map((member, index) =>
              member ? (
                <PlayerPortrait
                  key={member.userId}
                  member={member}
                  isLast={index === slots.length - 1}
                />
              ) : (
                <EmptyPortrait
                  key={`empty-${index}`}
                  index={index}
                  isLast={index === slots.length - 1}
                />
              )
            )}
          </div>

          {/* Tablet: 3 + 2 */}
          <div className="relative hidden sm:grid lg:hidden grid-cols-3">
            {slots.map((member, index) =>
              member ? (
                <PlayerPortrait
                  key={member.userId}
                  member={member}
                  isLast={(index + 1) % 3 === 0 || index === slots.length - 1}
                />
              ) : (
                <EmptyPortrait
                  key={`empty-${index}`}
                  index={index}
                  isLast={(index + 1) % 3 === 0 || index === slots.length - 1}
                />
              )
            )}
          </div>

          {/* Mobile: horizontal scroll to keep portraits large */}
          <div className="relative sm:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-thin">
            {slots.map((member, index) => (
              <div
                key={member?.userId ?? `empty-${index}`}
                className="w-[72%] max-w-[280px] shrink-0 snap-center border-r border-cyan-400/[0.08] last:border-r-0"
              >
                {member ? (
                  <PlayerPortrait
                    member={member}
                    isLast
                  />
                ) : (
                  <EmptyPortrait index={index} isLast />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
