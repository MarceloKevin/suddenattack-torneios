import React from 'react';
import { TournamentStatus as StatusType } from '../../types';
import { Badge } from '../ui/Badge';

interface TournamentStatusProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

export const TournamentStatus: React.FC<TournamentStatusProps> = ({ status, size = 'md' }) => {
  switch (status) {
    case 'active':
      return (
        <Badge variant="red" size={size} pulse>
          ATIVO
        </Badge>
      );
    case 'open':
      return (
        <Badge variant="green" size={size}>
          INSCRIÇÕES ABERTAS
        </Badge>
      );
    case 'finished':
      return (
        <Badge variant="slate" size={size}>
          FINALIZADO
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="amber" size={size}>
          RASCUNHO
        </Badge>
      );
    default:
      return null;
  }
};
