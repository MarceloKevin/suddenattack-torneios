import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/layout/Logo';
import { User, Mail, Lock, ShieldCheck, UserCheck, Hash, Crosshair } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [accountId, setAccountId] = useState('');
  const [knownAs, setKnownAs] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !accountId || !knownAs || !nickname || !email || !password || !confirmPassword) {
      setError('Por favor preencha todos os campos obrigatórios.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (!agreeTerms) {
      setError('Você deve concordar com os termos de uso da plataforma.');
      return;
    }

    setError('');
    setLoading(true);

    setTimeout(() => {
      register(name, nickname, email, knownAs, accountId);
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 tactical-grid">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#0E1016] border border-[#272B35] shadow-2xl overflow-hidden hud-corner">
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-left">
          <div className="mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              NOVO RECRUTA
            </span>
            <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white mt-1">
              CRIAR CONTA
            </h1>
            <p className="text-xs sm:text-sm text-[#9298A5] mt-1">
              Junte-se ao ranking oficial de Sudden Attack e dispute os maiores prêmios.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-950/40 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Nome Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="ID da Conta"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value.replace(/\D/g, '').slice(0, 20))}
                placeholder="Ex: 123456789"
                icon={<Hash className="w-4 h-4" />}
                inputMode="numeric"
                required
              />
            </div>

            <Input
              label="Como você é conhecido no Sudden"
              value={knownAs}
              onChange={(e) => setKnownAs(e.target.value)}
              placeholder="Ex: o sniper da Dragon Road"
              icon={<Crosshair className="w-4 h-4" />}
              required
            />

            <Input
              label="Nickname atual"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ex: VIPER_BR"
              icon={<UserCheck className="w-4 h-4" />}
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 dígitos"
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirmar Senha"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                icon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-[#9298A5] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded-none border-[#272B35] bg-[#08090D] text-[#E31B23] focus:ring-[#E31B23]"
                />
                <span>
                  Aceito os termos de uso, regras do anti-cheat e o regulamento de conduta em campeonatos de Sudden Attack.
                </span>
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                disabled={loading}
              >
                {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-5 border-t border-[#272B35] text-center text-xs text-[#9298A5]">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-[#E31B23] font-bold hover:underline">
              Já tenho uma conta
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#13161D] border-t lg:border-t-0 lg:border-l border-[#272B35] p-6 sm:p-10 flex flex-col justify-between text-left">
          <div>
            <Logo size="sm" />

            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-display uppercase tracking-wider text-white">
                VANTAGENS COMPETITIVAS
              </h2>
              <p className="text-xs text-[#9298A5] leading-relaxed">
                Ao criar seu perfil oficial, você ganha acesso a todo o ecossistema competitivo de Sudden Attack:
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <div className="p-3 bg-[#181B23] border border-[#272B35] text-xs">
                <span className="font-bold text-white block">HISTÓRICO PERMANENTE</span>
                <span className="text-[#9298A5] text-[11px]">Registro de títulos conquistados e K/D histórico por mapa.</span>
              </div>

              <div className="p-3 bg-[#181B23] border border-[#272B35] text-xs">
                <span className="font-bold text-white block">SISTEMA DE CLÃS & LINES</span>
                <span className="text-[#9298A5] text-[11px]">Crie sua própria equipe ou receba convites de capitães.</span>
              </div>

              <div className="p-3 bg-[#181B23] border border-[#272B35] text-xs">
                <span className="font-bold text-white block">TORNEIOS SEMANAIS</span>
                <span className="text-[#9298A5] text-[11px]">Jogue torneios semanais e leve seu time ao topo do ranking</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-mono text-[#9298A5]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PROTEÇÃO CONTRA SMURFING &amp; MULTICONTAS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
