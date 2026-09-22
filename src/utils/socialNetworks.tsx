import React from 'react';
import { UserSocialLinks } from '../types';

export type SocialNetworkKey = keyof UserSocialLinks;

export type { UserSocialLinks };

export interface SocialNetworkDef {
  key: SocialNetworkKey;
  label: string;
  prefix: string;
  baseUrl: string;
  placeholder: string;
  icon: React.ReactNode;
}

const IconWrap: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <span className={`inline-flex items-center justify-center w-5 h-5 shrink-0 ${className || ''}`}>
    {children}
  </span>
);

export const SOCIAL_NETWORKS: SocialNetworkDef[] = [
  {
    key: 'facebook',
    label: 'Facebook',
    prefix: 'facebook.com/',
    baseUrl: 'https://facebook.com/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" aria-hidden>
          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'youtube',
    label: 'YouTube',
    prefix: 'youtube.com/',
    baseUrl: 'https://youtube.com/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000" aria-hidden>
          <path d="M23.498 6.186a2.997 2.997 0 0 0-2.11-2.122C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.388.564A2.997 2.997 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.997 2.997 0 0 0 2.11 2.122C4.495 20.5 12 20.5 12 20.5s7.505 0 9.388-.564a2.997 2.997 0 0 0 2.11-2.122C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.568V8.432L15.818 12 9.75 15.568z" />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    prefix: 'instagram.com/',
    baseUrl: 'https://instagram.com/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
          <defs>
            <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F58529" />
              <stop offset="50%" stopColor="#DD2A7B" />
              <stop offset="100%" stopColor="#8134AF" />
            </linearGradient>
          </defs>
          <path
            fill="url(#igGrad)"
            d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"
          />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter',
    prefix: 'twitter.com/',
    baseUrl: 'https://twitter.com/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1DA1F2" aria-hidden>
          <path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.161a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z" />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'tiktok',
    label: 'Tiktok',
    prefix: 'tiktok.com/',
    baseUrl: 'https://tiktok.com/@',
    placeholder: 'Ex.: @MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FFFFFF" aria-hidden>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'twitch',
    label: 'Twitch',
    prefix: 'twitch.tv/',
    baseUrl: 'https://twitch.tv/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#9146FF" aria-hidden>
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
        </svg>
      </IconWrap>
    ),
  },
  {
    key: 'kick',
    label: 'Kick',
    prefix: 'kick.com/',
    baseUrl: 'https://kick.com/',
    placeholder: 'Ex.: MarceloKevin',
    icon: (
      <IconWrap>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#53FC18" aria-hidden>
          <path d="M2 2h6.5v7.5L15.5 2H22l-8 9 8 11h-6.5L8.5 13.5V22H2V2z" />
        </svg>
      </IconWrap>
    ),
  },
];

export const normalizeSocialHandle = (key: SocialNetworkKey, value: string): string => {
  let handle = value.trim();
  if (!handle) return '';
  handle = handle.replace(/^https?:\/\//i, '');
  handle = handle.replace(/^(www\.)?/i, '');
  const prefixes = [
    'facebook.com/',
    'youtube.com/',
    'instagram.com/',
    'twitter.com/',
    'x.com/',
    'tiktok.com/@',
    'tiktok.com/',
    'twitch.tv/',
    'kick.com/',
  ];
  for (const prefix of prefixes) {
    if (handle.toLowerCase().startsWith(prefix)) {
      handle = handle.slice(prefix.length);
      break;
    }
  }
  handle = handle.replace(/^\/+/, '').split(/[/?#]/)[0];
  if (key === 'tiktok') {
    handle = handle.replace(/^@+/, '');
  }
  return handle.slice(0, 64);
};

export const buildSocialUrl = (key: SocialNetworkKey, handle: string): string => {
  const network = SOCIAL_NETWORKS.find((n) => n.key === key);
  if (!network || !handle) return '';
  const clean = normalizeSocialHandle(key, handle);
  if (!clean) return '';
  return `${network.baseUrl}${clean}`;
};

export const cleanSocialLinks = (links: UserSocialLinks): UserSocialLinks | undefined => {
  const cleaned: UserSocialLinks = {};
  (Object.keys(links) as SocialNetworkKey[]).forEach((key) => {
    const value = links[key];
    if (!value) return;
    const handle = normalizeSocialHandle(key, value);
    if (handle) cleaned[key] = handle;
  });
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};
