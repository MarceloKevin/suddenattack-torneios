import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { Camera, CheckCircle2, ImagePlus, Users } from 'lucide-react';
import {
  SOCIAL_NETWORKS,
  SocialNetworkKey,
  UserSocialLinks,
  cleanSocialLinks,
} from '../utils/socialNetworks';
import { paths } from '../utils/paths';

const DEFAULT_BANNER =
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=500&fit=crop&q=80';

const EMPTY_SOCIALS: UserSocialLinks = {
  facebook: '',
  youtube: '',
  instagram: '',
  twitter: '',
  tiktok: '',
  twitch: '',
  kick: '',
};

const readImageFile = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Falha ao ler a imagem'));
    reader.readAsDataURL(file);
  });

export const Settings: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [knownAs, setKnownAs] = useState('');
  const [email, setEmail] = useState('');
  const [accountId, setAccountId] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [description, setDescription] = useState('');
  const [socialLinks, setSocialLinks] = useState<UserSocialLinks>(EMPTY_SOCIALS);
  const [avatar, setAvatar] = useState('');
  const [banner, setBanner] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name);
    setNickname(currentUser.nickname);
    setKnownAs(currentUser.knownAs || '');
    setEmail(currentUser.email);
    setAccountId(currentUser.accountId || '');
    setCustomUrl(currentUser.customUrl || '');
    setDescription(currentUser.description || '');
    setSocialLinks({ ...EMPTY_SOCIALS, ...currentUser.socialLinks });
    setAvatar(currentUser.avatar);
    setBanner(currentUser.banner || DEFAULT_BANNER);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="py-20 max-w-md mx-auto px-4">
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="ACESSO NÃO AUTORIZADO"
          description="Faça login para gerenciar as configurações da conta."
          actionText="FAZER LOGIN"
          onAction={() => (window.location.href = '/login')}
        />
      </div>
    );
  }

  const sanitizeCustomUrl = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '')
      .slice(0, 32);

  const updateSocial = (key: SocialNetworkKey, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !nickname.trim() || !email.trim()) {
      setError('Preencha nome, nickname e e-mail.');
      return;
    }
    const slug = sanitizeCustomUrl(customUrl);
    if (customUrl.trim() && slug.length < 3) {
      setError('A URL personalizada precisa ter pelo menos 3 caracteres (letras, números, - ou _).');
      return;
    }
    const cleanedSocials = cleanSocialLinks(socialLinks);
    setError('');
    updateUserProfile({
      name: name.trim(),
      nickname: nickname.trim(),
      knownAs: knownAs.trim() || undefined,
      email: email.trim(),
      accountId: accountId.trim() || undefined,
      customUrl: slug || undefined,
      description: description.trim() || undefined,
      socialLinks: cleanedSocials,
      avatar,
      banner: banner === DEFAULT_BANNER ? currentUser.banner : banner,
    });
    setCustomUrl(slug);
    setSocialLinks({ ...EMPTY_SOCIALS, ...cleanedSocials });
    setFeedback('Configurações salvas com sucesso');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-[#E31B23] font-bold">
          Conta
        </span>
        <h1 className="text-3xl font-display uppercase tracking-wide text-white mt-1">
          Configurações
        </h1>
        <p className="text-sm text-[#9298A5] mt-1">
          Gerencie os dados da conta, foto de perfil e banner.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-600 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </div>
      )}
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Visuals */}
        <Card variant="primary" className="p-5 sm:p-6 border-[#272B35] space-y-5">
          <div>
            <h2 className="text-sm font-display uppercase tracking-wide text-white">
              Aparência do perfil
            </h2>
            <p className="text-xs text-[#9298A5] mt-1">
              Foto e banner exibidos em `/perfil`.
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9298A5]">
                  Banner
                </span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide bg-[#181B23] border border-[#272B35] text-white hover:border-[#E31B23] transition-colors">
                  <ImagePlus className="w-3.5 h-3.5 text-[#E31B23]" />
                  Trocar banner
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBanner(await readImageFile(file));
                    }}
                  />
                </label>
              </div>
              <div className="relative h-36 sm:h-44 overflow-hidden border border-[#272B35] bg-[#0E1016]">
                <img
                  src={banner}
                  alt="Banner"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9298A5]">
                  Foto de perfil
                </span>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wide bg-[#181B23] border border-[#272B35] text-white hover:border-[#E31B23] transition-colors">
                  <Camera className="w-3.5 h-3.5 text-[#E31B23]" />
                  Trocar foto
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setAvatar(await readImageFile(file));
                    }}
                  />
                </label>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#272B35] bg-[#181B23] shrink-0">
                  <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <p className="text-xs text-[#9298A5]">
                  Use uma imagem quadrada para melhor resultado.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account data */}
        <Card variant="primary" className="p-5 sm:p-6 border-[#272B35] space-y-4">
          <div>
            <h2 className="text-sm font-display uppercase tracking-wide text-white">
              Dados da conta
            </h2>
            <p className="text-xs text-[#9298A5] mt-1">
              Informações básicas do jogador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <Input
              label="Conhecido como"
              value={knownAs}
              onChange={(e) => setKnownAs(e.target.value)}
              placeholder="Opcional"
            />
            <Input
              label="ID da Conta"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="Ex: #SA-1234"
            />
            <div className="sm:col-span-2">
              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="url-personalizada"
                className="block text-xs font-bold uppercase tracking-wider text-[#9298A5]"
              >
                URL personalizada
              </label>
              <div className="flex items-stretch border border-[#272B35] bg-[#0E1016] focus-within:border-[#E31B23] focus-within:ring-1 focus-within:ring-[#E31B23] transition-colors">
                <span className="shrink-0 px-3.5 py-2.5 text-sm text-[#9298A5] bg-[#181B23] border-r border-[#272B35] select-none font-mono">
                  /perfil/
                </span>
                <input
                  id="url-personalizada"
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(sanitizeCustomUrl(e.target.value))}
                  placeholder="seu-nick"
                  className="w-full bg-transparent px-3.5 py-2.5 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:outline-none"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <p className="text-xs text-[#9298A5]">
                Perfil canônico por ID:{' '}
                <Link to={paths.player(currentUser.id)} className="text-[#E31B23] hover:underline">
                  /perfil/{currentUser.id}
                </Link>
              </p>
              <p className="text-xs text-[#9298A5]">
                {customUrl
                  ? `Slug opcional (legado): /perfil/${customUrl}`
                  : 'Slug opcional — o acesso principal é pelo ID do jogador.'}
              </p>
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="descricao"
                className="block text-xs font-bold uppercase tracking-wider text-[#9298A5]"
              >
                Descrição
              </label>
              <textarea
                id="descricao"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 280))}
                placeholder="Conte um pouco sobre você, seu estilo de jogo, disponibilidade..."
                rows={4}
                className="w-full bg-[#0E1016] border border-[#272B35] px-3.5 py-2.5 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none focus:ring-1 focus:ring-[#E31B23] resize-none transition-colors"
              />
              <p className="text-xs text-[#9298A5] text-right">
                {description.length}/280
              </p>
            </div>
          </div>
        </Card>

        {/* Social networks */}
        <Card variant="primary" className="p-5 sm:p-6 border-[#272B35] space-y-4">
          <div>
            <h2 className="text-sm font-display uppercase tracking-wide text-white">
              Redes sociais
            </h2>
            <p className="text-xs text-[#9298A5] mt-1">
              Links exibidos no perfil do jogador.
            </p>
          </div>

          <div className="divide-y divide-[#272B35] border border-[#272B35]">
            {SOCIAL_NETWORKS.map((network) => (
              <div
                key={network.key}
                className="grid grid-cols-1 sm:grid-cols-[minmax(0,11rem)_minmax(0,10rem)_1fr] gap-2 sm:gap-4 items-center px-3 sm:px-4 py-3 bg-[#0E1016] hover:bg-[#12151C] transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {network.icon}
                  <span className="text-sm text-white truncate">{network.label}</span>
                </div>
                <span className="hidden sm:block text-sm text-[#9298A5] font-mono truncate">
                  {network.prefix}
                </span>
                <input
                  type="text"
                  value={socialLinks[network.key] || ''}
                  onChange={(e) => updateSocial(network.key, e.target.value)}
                  placeholder={network.placeholder}
                  className="w-full bg-[#181B23] border border-[#272B35] rounded px-3 py-2 text-sm text-[#F5F5F5] placeholder-[#9298A5]/50 focus:border-[#E31B23] focus:outline-none focus:ring-1 focus:ring-[#E31B23] transition-colors"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Link to={paths.player(currentUser.id)}>
            <Button variant="outline" size="md" fullWidth type="button">
              VER PERFIL
            </Button>
          </Link>
          <Button variant="primary" size="md" type="submit">
            SALVAR CONFIGURAÇÕES
          </Button>
        </div>
      </form>
    </div>
  );
};
