import React from 'react';
import { Link } from 'react-router-dom';
import { Tournament } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TournamentStatus } from './TournamentStatus';
import { Calendar, Users, Trophy, ChevronRight } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({ tournament }) => {
  const isFinished = tournament.status === 'finished';
  const isFull = tournament.registeredTeams.length >= tournament.maxTeams;

  return (
    <Card
      variant="primary"
      hasHudCorners
      glow
      className="p-5 flex flex-col justify-between border-[#272B35] hover:border-[#E31B23]/50 transition-all duration-300"
    >
      <div>
        {/* Top bar with Status and Format */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <TournamentStatus status={tournament.status} />
          <span className="text-[11px] font-mono uppercase bg-[#181B23] border border-[#272B35] px-2 py-0.5 text-zinc-400">
            {tournament.format}
          </span>
        </div>

        {/* Tournament Title */}
        <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-white mb-2 line-clamp-1 text-left">
          {tournament.name}
        </h3>

        <p className="text-xs text-[#9298A5] line-clamp-2 text-left mb-4">
          {tournament.description}
        </p>

        {/* Finished Champion Banner */}
        {isFinished && tournament.championTeam && (
          <div className="bg-[#181B23] border-l-2 border-yellow-500 p-2.5 mb-4 text-left flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-mono text-yellow-500 font-bold block">
                🏆 CAMPEÃO
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span>{tournament.championTeam.logo}</span>
                <span>{tournament.championTeam.name}</span>
                <span className="text-xs text-zinc-500">[{tournament.championTeam.tag}]</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-mono text-[#9298A5] block">PREMIAÇÃO</span>
              <span className="text-xs font-bold text-emerald-400">{tournament.prizePool}</span>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-[#272B35]/60 mb-4 text-left">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-[#9298A5] flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#E31B23]" />
              PERÍODO
            </span>
            <span className="text-xs font-semibold text-white block">
              {tournament.startDate.split(' ')[0]} {tournament.startDate.split(' ')[1]} — {tournament.endDate.split(' ')[0]} {tournament.endDate.split(' ')[1]}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-mono text-[#9298A5] flex items-center gap-1">
              <Users className="w-3 h-3 text-[#E31B23]" />
              EQUIPES
            </span>
            <span className="text-xs font-semibold text-white block">
              <span className={isFull ? 'text-amber-400' : 'text-emerald-400'}>
                {tournament.registeredTeams.length}
              </span>
              {' / '}
              <span>{tournament.maxTeams} TIMES</span>
            </span>
          </div>

          <div className="col-span-2 pt-1 flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono text-[#9298A5] flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              PREMIAÇÃO TOTAL
            </span>
            <span className="text-base font-display text-emerald-400 font-bold tracking-wide">
              {tournament.prizePool}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-1">
        <Link to={`/torneios/${tournament.id}`}>
          <Button
            variant={isFinished ? 'secondary' : 'primary'}
            fullWidth
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            {isFinished ? 'VER RESULTADOS' : 'VER TORNEIO'}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
