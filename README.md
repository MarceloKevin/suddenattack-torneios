# Sudden Attack Championship — Frontend

Frontend da plataforma de campeonatos competitivos de **Sudden Attack**: torneios, times, ranking, perfil de jogador e painel administrativo.

> Protótipo frontend com dados mockados (sem backend). Ideal para validar UX e fluxos de gestão de campeonatos.

## Stack

- **React 19** + **TypeScript**
- **Vite 7**
- **React Router 7**
- **Tailwind CSS 4**
- **Lucide React** (ícones)

## Pré-requisitos

- Node.js 20+ (recomendado)
- npm

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

### Outros comandos

```bash
npm run build    # build de produção
npm run preview  # preview do build
```

## Funcionalidades

### Jogador / comunidade

- Landing page e autenticação (login / cadastro — simulado)
- Dashboard do jogador
- Perfil (stats, títulos, partidas, links sociais)
- Time (lineup, reservas, histórico)
- Lista e detalhes de torneios (geral, times, tabela, mata-mata, partidas)
- Detalhe de partida (veto de mapas, placar)
- Ranking de times

### Administração

Acesse com um usuário admin (o usuário padrão do mock já é admin) ou use o alternador **Permissão Admin** no header.

| Área | Rota | O que faz |
|------|------|-----------|
| Painel admin | `/dashboard_admin` | Gerenciar usuários e torneios |
| Criar torneio | `/admin/torneios/novo` | Nome, estrutura, formato, premiação flexível |
| Editar torneio | `/admin/torneios/:id/editar` | Info, times, tabela, mata-mata, partidas |

**Gestão de torneio (admin):**

- Estruturas: eliminação única, dupla eliminação, grupos + mata-mata
- Times inscritos vs confirmados (com data/hora da inscrição)
- Geração automática de tabela de grupos
- Geração de chave mata-mata (simples ou dupla, conforme a estrutura)
- Edição de placar, W.O. e data/hora das partidas
- Campeão definido apenas quando a chave estiver completa

## Rotas principais

| Rota | Descrição |
|------|-----------|
| `/` | Landing |
| `/login` / `/cadastro` | Autenticação |
| `/dashboard` | Dashboard do jogador |
| `/perfil/:userId` | Perfil do jogador (por ID) |
| `/perfil` | Redireciona para o perfil do usuário logado |
| `/time/:teamId` | Detalhe do time (por ID) |
| `/time` | Criar / buscar time (redireciona ao seu time se já tiver) |
| `/torneios` | Lista de torneios |
| `/torneios/:id` | Detalhes do torneio (por ID) |
| `/torneios/:id/partidas/:matchId` | Detalhes da partida |
| `/ranking` | Ranking |
| `/dashboard_admin` | Painel do administrador |
| `/admin/torneios/novo` | Criar torneio |
| `/admin/torneios/:id/editar` | Editar torneio |

Helpers de URL em `src/utils/paths.ts` (`paths.tournament`, `paths.team`, `paths.player`).

## Estrutura do projeto

```
src/
├── components/     # UI, torneio, admin, perfil, time, dashboard
├── context/        # AuthContext (estado global + mocks)
├── data/           # mockData (usuários, times, torneios)
├── layouts/        # MainLayout
├── pages/          # Páginas por rota
├── routes/         # AppRoutes
├── types/          # Tipos TypeScript
└── utils/          # Geração de chave, helpers de partida, etc.
```

## Dados mock e demo

- Estado inicial em `src/data/mockData.ts`
- Lógica de sessão e CRUD em memória em `src/context/AuthContext.tsx`
- No header, o menu de testes rápidos permite:
  - Alternar **com time / sem time**
  - Alternar **permissão admin**
  - Trocar de usuário (quando disponível)

Alterações (placares, confirmação de times, novas chaves) valem apenas na sessão do browser — recarregar a página restaura os mocks.

## Observações

- Não há API real nesta versão; tudo é frontend.
- Visual alinhado à identidade Sudden Attack (HUD escuro, vermelho/ciano).
- Para produção, será necessário integrar autenticação e endpoints de torneios/times/partidas.

## Licença

Projeto privado — uso interno / demonstração.
