import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HomeHero } from '../components/home/HomeHero';
import { HomeFeaturedTournaments } from '../components/home/HomeFeaturedTournaments';
import '../components/home/Home.css';

export const Home: React.FC = () => {
  const { tournaments } = useAuth();

  return (
    <div className="sa-home">
      <HomeHero />
      <HomeFeaturedTournaments tournaments={tournaments} />
    </div>
  );
};
