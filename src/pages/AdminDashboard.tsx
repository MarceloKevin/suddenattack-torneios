import React from 'react';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const AdminDashboardPage: React.FC = () => {
  useDocumentTitle('Painel administrativo');
  return <AdminDashboard />;
};
