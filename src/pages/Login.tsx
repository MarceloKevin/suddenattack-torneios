import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Logo } from '../components/layout/Logo';
import { Mail, Lock, LogIn, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('marcelo.kevin@suddenattack.com');
  const [password, setPassword] = useState('password123');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor preencha todos os campos.');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      login(email);
      setLoading(false);
      navigate('/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 tactical-grid">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-[#0E1016] border border-[#272B35] shadow-2xl overflow-hidden hud-corner">
        {/* Lado Esquerdo / Formulário */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center text-left">
          <div className="mb-8">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#E31B23] font-bold">
              AUTENTICAÇÃO TÁTICA
            </span>
            <h1 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-white mt-1">
              ENTRAR NA ARENA
            </h1>
            <p className="text-xs sm:text-sm text-[#9298A5] mt-1">
              Acesse sua conta para gerenciar seu time e disputar campeonatos.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-800 text-xs text-red-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@exemplo.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#9298A5] cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded-none border-[#272B35] bg-[#08090D] text-[#E31B23] focus:ring-[#E31B23]"
                />
                <span>Lembrar-me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Um link de recuperação fictício foi enviado para seu email!')}
                className="text-[#9298A5] hover:text-[#E31B23] transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="md"
                disabled={loading}
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
              </Button>
            </div>

            {/* Quick autofill helper for evaluating */}
            <div className="pt-2 text-center">
              <p className="text-[11px] font-mono text-[#9298A5]">
                Dica de demonstração: Faça login direto clicando em <strong>ENTRAR</strong>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[#272B35] text-center text-xs text-[#9298A5]">
            Não tem uma conta ainda?{' '}
            <Link to="/cadastro" className="text-[#E31B23] font-bold hover:underline">
              Criar uma conta
            </Link>
          </div>
        </div>

        {/* Lado Direito / Composição Visual Lateral FPS */}
        <div className="lg:col-span-5 bg-[#13161D] border-t lg:border-t-0 lg:border-l border-[#272B35] p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden text-left">
          <div className="absolute inset-0 bg-gradient-to-b from-[#E31B23]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <Logo size="sm" />
            <div className="mt-8 space-y-4">
              <h2 className="text-xl font-display uppercase tracking-wider text-white">
                PLATAFORMA OFICIAL DE COMPETIÇÕES
              </h2>
              <p className="text-xs text-[#9298A5] leading-relaxed">
                Sudden Attack é um FPS tático rápido onde milissegundos definem o vencedor. Garanta sua vaga nos maiores confrontos do servidor brasileiro.
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#E31B23]" />
                <span>Brackets automáticos atualizados</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#E31B23]" />
                <span>Estatísticas de K/D e win rate</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-mono">
                <CheckCircle2 className="w-4 h-4 text-[#E31B23]" />
                <span>Premiações pagas imediatamente</span>
              </div>
            </div>
          </div>

          <Card variant="secondary" className="p-3 mt-8 relative z-10 border-[#272B35]">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#9298A5]">
              <span>SERVIDOR SP // LATÊNCIA</span>
              <span className="text-emerald-400 font-bold">12ms • ESTÁVEL</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
