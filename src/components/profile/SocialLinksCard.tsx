import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { UserSocialLinks } from '../../types';
import { SOCIAL_NETWORKS, buildSocialUrl } from '../../utils/socialNetworks';
import { cardClass } from './shared';

interface SocialLinksCardProps {
  socialLinks?: UserSocialLinks;
}

export const SocialLinksCard: React.FC<SocialLinksCardProps> = ({ socialLinks }) => {
  const active = SOCIAL_NETWORKS.filter((n) => socialLinks?.[n.key]);

  return (
    <section className={`${cardClass} p-5 h-full`}>
      <h2 className="text-sm font-bold uppercase tracking-wide text-white">Redes sociais</h2>
      <p className="text-[11px] text-[#8B93A7] mt-1.5 leading-relaxed">
        Acompanhe meu conteúdo e fique por dentro das novidades.
      </p>

      <div className="mt-4 space-y-2">
        {active.length > 0 ? (
          active.map((network) => {
            const handle = socialLinks?.[network.key] || '';
            const href = buildSocialUrl(network.key, handle);
            return (
              <a
                key={network.key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-lg border border-[#1D2633] bg-[#0B0F15] px-3 py-2.5 hover:border-[#E31B23]/45 hover:bg-[#10151D] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E31B23]/50"
              >
                <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                  {network.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">{network.label}</p>
                  <p className="text-[11px] font-mono text-[#8B93A7] truncate mt-0.5 group-hover:text-cyan-300/80 transition-colors">
                    @{handle}
                  </p>
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#4A5568] group-hover:text-[#E31B23] transition-colors shrink-0"
                  aria-hidden
                />
              </a>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-[#1D2633] p-4 text-center">
            <p className="text-xs text-[#8B93A7]">
              Nenhuma rede cadastrada.{' '}
              <Link to="/settings" className="text-cyan-300 hover:underline">
                Adicionar
              </Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
