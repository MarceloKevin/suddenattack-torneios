import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FriendList } from '../components/chat/FriendList';
import { useAuth } from '../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#050608] text-[#F2F2F2]">
      <Header />
      <main className={`flex-1 min-w-0 ${currentUser ? 'lg:pr-[68px]' : ''}`}>
        <Outlet />
      </main>
      <Footer />
      {currentUser && <FriendList />}
    </div>
  );
};
