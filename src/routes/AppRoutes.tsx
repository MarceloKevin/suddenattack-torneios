import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { Settings } from '../pages/Settings';
import { TeamPage } from '../pages/Team';
import { TournamentsPage } from '../pages/Tournaments';
import { TournamentDetails } from '../pages/TournamentDetails';
import { MatchDetails } from '../pages/MatchDetails';
import { CreateTournament } from '../pages/CreateTournament';
import { EditTournament } from '../pages/EditTournament';
import { Ranking } from '../pages/Ranking';
import { AdminDashboardPage } from '../pages/AdminDashboard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Rota Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />

        {/* Rotas Autenticadas / Principais */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Perfil — acesso por ID do jogador */}
        <Route path="/perfil" element={<Profile />} />
        <Route path="/perfil/:userId" element={<Profile />} />

        <Route path="/settings" element={<Settings />} />

        {/* Time — /time (criar/buscar) e /time/:teamId (detalhe por ID) */}
        <Route path="/time" element={<TeamPage />} />
        <Route path="/time/:teamId" element={<TeamPage />} />
        <Route path="/ranking" element={<Ranking />} />

        {/* Torneios — acesso por ID */}
        <Route path="/torneios" element={<TournamentsPage />} />
        <Route path="/torneios/:id" element={<TournamentDetails />} />
        <Route path="/torneios/:id/partidas/:matchId" element={<MatchDetails />} />

        {/* Admin */}
        <Route path="/dashboard_admin" element={<AdminDashboardPage />} />
        <Route path="/admin/torneios/novo" element={<CreateTournament />} />
        <Route path="/admin/torneios/:id/editar" element={<EditTournament />} />

        {/* Redirecionamento 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
