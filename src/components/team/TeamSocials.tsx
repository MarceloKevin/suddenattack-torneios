import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cardClass, SectionLabel } from './shared';

export interface TeamSocialLink {
  network: 'instagram' | 'youtube' | 'twitch' | 'twitter' | 'tiktok';
  url: string;
  label?: string;
}

const NETWORK_LABELS: Record<TeamSocialLink['network'], string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  twitch: 'Twitch',
  twitter: 'X / Twitter',
  tiktok: 'TikTok',
};

interface TeamSocialsProps {
  links?: TeamSocialLink[];
}

/** Renders only when social links exist — ready for future team.socialLinks data. */
export const TeamSocials: React.FC<TeamSocialsProps> = ({ links }) => {
  if (!links || links.length === 0) return null;

  return (
    <section className={`${cardClass} p-4 sm:p-5`}>
      <SectionLabel>Siga o time</SectionLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={`${link.network}-${link.url}`}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[#1D2633] bg-[#0B0F15] px-3 py-2 text-xs text-[#B8BEC9] hover:border-[#E31B23]/50 hover:text-white transition-colors duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#E31B23]" aria-hidden />
            {link.label || NETWORK_LABELS[link.network]}
          </a>
        ))}
      </div>
    </section>
  );
};
