/** Rotas canônicas por ID */
export const paths = {
  tournament: (id: string) => `/torneios/${id}`,
  tournamentMatch: (tournamentId: string, matchId: string) =>
    `/torneios/${tournamentId}/partidas/${matchId}`,
  tournamentEdit: (id: string) => `/admin/torneios/${id}/editar`,
  team: (id: string) => `/time/${id}`,
  player: (id: string) => `/perfil/${id}`,
} as const;
