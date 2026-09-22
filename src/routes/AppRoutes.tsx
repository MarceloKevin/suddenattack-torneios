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
import { Ranking } from '../pages/Ranking';

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
        <Route path="/perfil" element={<Profile />} />
        <Route path="/perfil/:customUrl" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/time" element={<TeamPage />} />
        <Route path="/time/:teamId" element={<TeamPage />} />
        <Route path="/ranking" element={<Ranking />} />

        {/* Torneios */}
        <Route path="/torneios" element={<TournamentsPage />} />
        <Route path="/torneios/:id" element={<TournamentDetails />} />
        <Route path="/torneios/:id/partidas/:matchId" element={<MatchDetails />} />

        {/* Admin */}
        <Route path="/admin/torneios/novo" element={<CreateTournament />} />

        {/* Redirecionamento 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
