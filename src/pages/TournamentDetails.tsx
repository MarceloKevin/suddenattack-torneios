import React, { useMemo, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { TournamentBracket } from '../components/tournament/TournamentBracket';
import { GroupStandingsTable } from '../components/tournament/GroupStandingsTable';
import { TournamentMatchesList } from '../components/tournament/TournamentMatchesList';
import { TournamentRegisterModal } from '../components/tournament/TournamentRegisterModal';
import { TournamentTeamEntryModal } from '../components/tournament/TournamentTeamEntryModal';
import { getTournamentMatches } from '../utils/matchHelpers';
import {
  TOURNAMENT_STRUCTURE_LABELS,
  getConfirmedTeams,
  isGroupsStructure,
  resolvePhaseFormats,
  TournamentTeamRef,
} from '../types';
import {
  Calendar,
  Users,
  Trophy,
  Server,
  ArrowLeft,
  FileText,
  AlertCircle,
  Share2,
  Swords,
  UserPlus,
  Medal,
} from 'lucide-react';
import rankingBg from '../assets/ranking-bg.png';
import saelLogo from '../assets/sael-logo.png';
import { resolveTeamLogo } from '../utils/teamLogo';
import { isImageSrc } from '../components/profile/shared';
import '../components/tournament/TournamentDetails.css';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type TournamentTab = 'geral' | 'teams' | 'tabela' | 'bracket' | 'partidas' | 'rules';

const isTournamentTab = (value: string | null): value is TournamentTab =>
  value === 'geral' ||
  value === 'teams' ||
  value === 'tabela' ||
  value === 'bracket' ||
  value === 'partidas' ||
  value === 'rules';

const statusClass = (status: string) => {
  if (status === 'active') return 'sa-td-status sa-td-status--active';
  if (status === 'finished') return 'sa-td-status sa-td-status--finished';
  if (status === 'draft') return 'sa-td-status sa-td-status--draft';
  return 'sa-td-status';
};

const statusLabel = (status: string) => {
  if (status === 'active') return 'ATIVO';
  if (status === 'finished') return 'FINALIZADO';
  if (status === 'draft') return 'RASCUNHO';
  if (status === 'open') return 'INSCRIÇÕES ABERTAS';
  return status.toUpperCase();
};

export const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { tournaments, currentTeam, teams, registerTeamForTournament } = useAuth();
  const tabParam = searchParams.get('tab');
  const initialTab: TournamentTab = isTournamentTab(tabParam) ? tabParam : 'geral';
  const [activeTab, setActiveTab] = useState<TournamentTab>(initialTab);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TournamentTeamRef | null>(null);

  const tournament = tournaments.find((t) => t.id === id);
  useDocumentTitle(tournament?.name);

  const groups = tournament?.groups ?? [];
  const confirmedTeams = useMemo(
    () => getConfirmedTeams(tournament?.registeredTeams ?? []),
    [tournament]
  );
  const listedTeams = useMemo(() => {
    const list = tournament?.registeredTeams ?? [];
    return [...list].sort((a, b) => {
      const aOk = a.confirmed !== false ? 0 : 1;
      const bOk = b.confirmed !== false ? 0 : 1;
      if (aOk !== bOk) return aOk - bOk;
      return (a.seed ?? 999) - (b.seed ?? 999);
    });
  }, [tournament]);
  const allMatches = useMemo(
    () => (tournament ? getTournamentMatches(tournament) : []),
    [tournament]
  );
  const heroBg = tournament?.banner || rankingBg;
  const alreadyRegistered = Boolean(
    currentTeam && tournament?.registeredTeams.some((t) => t.id === currentTeam.id)
  );
  const selectedCatalogTeam = selectedEntry
    ? teams.find((t) => t.id === selectedEntry.id) ?? null
    : null;

  if (!tournament) {
    return (
      <div className="sa-td">
        <div className="sa-td__inner" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <h1 className="font-display text-2xl text-white mb-2">Torneio não encontrado</h1>
          <p className="text-[#8b98aa] text-sm mb-6">
            Não existe um torneio com o ID &quot;{id}&quot;.
          </p>
          <Link to="/torneios" className="sa-td-back">
            Voltar para torneios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sa-td">
      <div className="sa-td__bg" aria-hidden>
        <div
          className="sa-td__bg-image"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="sa-td__bg-overlay" />
        <div className="sa-td__bg-grid" />
      </div>

      <div className="sa-td__inner">
        <Link to="/torneios" className="sa-td-back">
          <ArrowLeft aria-hidden />
          VOLTAR PARA TORNEIOS
        </Link>

        <section className="sa-td-hero" aria-label="Cabeçalho do torneio">
          <div className="sa-td-hero__frame" aria-hidden />

          <div className="sa-td-hero__main">
            <div className="sa-td-hero__brand">
              <div className="sa-td-hero__crest">
                <img src={saelLogo} alt="" className="sa-td-hero__crest-img" />
              </div>

              <div className="sa-td-hero__copy">
                <span className={statusClass(tournament.status)}>
                  <span className="sa-td-status__dot" aria-hidden />
                  {statusLabel(tournament.status)}
                </span>
                <h1 className="sa-td-hero__title font-display">{tournament.name}</h1>
                <p className="sa-td-hero__subtitle">
                  O TORNEIO MAIS PRESTIGIADO DA COMUNIDADE SUDDEN ATTACK.
                  <br />
                  AS MELHORES EQUIPES DO CENÁRIO COMPETITIVO EM BUSCA DO TÍTULO.
                </p>
              </div>
            </div>

            <div className="sa-td-hero__actions">
              {tournament.status === 'open' && (
                <button
                  type="button"
                  className="sa-td-btn-primary"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <UserPlus aria-hidden />
                  {alreadyRegistered ? 'ATUALIZAR ESCALAÇÃO' : 'INSCREVER MEU TIME'}
                </button>
              )}
              <button
                type="button"
                className="sa-td-btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('Link do campeonato copiado para a área de transferência!');
                }}
              >
                <Share2 aria-hidden />
                COMPARTILHAR TORNEIO
              </button>
            </div>
          </div>
        </section>

        <nav className="sa-td-tabs" aria-label="Navegação do torneio">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`sa-td-tab ${activeTab === 'geral' ? 'is-active' : ''}`}
          >
            GERAL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`sa-td-tab ${activeTab === 'teams' ? 'is-active' : ''}`}
          >
            TIMES ({listedTeams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tabela')}
            className={`sa-td-tab ${activeTab === 'tabela' ? 'is-active' : ''}`}
          >
            TABELA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bracket')}
            className={`sa-td-tab ${activeTab === 'bracket' ? 'is-active' : ''}`}
          >
            MATA-MATA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('partidas')}
            className={`sa-td-tab ${activeTab === 'partidas' ? 'is-active' : ''}`}
          >
            PARTIDAS ({allMatches.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`sa-td-tab ${activeTab === 'rules' ? 'is-active' : ''}`}
          >
            REGULAMENTO OFICIAL
          </button>
        </nav>

        {activeTab === 'geral' && (
          <section className="sa-td-section sa-td-section--geral">
            <div className="sa-td-geral-head">
              <span className="sa-td-geral-head__bar" aria-hidden />
              <h2 className="sa-td-geral-head__title font-display">INFORMAÇÕES GERAIS</h2>
            </div>

            <div className="sa-td-panel sa-td-panel--geral">
              <div className="sa-td-chips">
                {(() => {
                  const phases = resolvePhaseFormats(tournament);
                  const hasGroups = isGroupsStructure(tournament.structure);
                  return (
                    <>
                      {hasGroups && (
                        <span className="sa-td-chip">GRUPOS: {phases.groups}</span>
                      )}
                      <span className="sa-td-chip">MATA-MATA: {phases.knockout}</span>
                      <span className="sa-td-chip">FINAL: {phases.final}</span>
                    </>
                  );
                })()}
                {tournament.structure && (
                  <span className="sa-td-chip sa-td-chip--soft">
                    ESTRUTURA: {TOURNAMENT_STRUCTURE_LABELS[tournament.structure]}
                  </span>
                )}
                <span className="sa-td-chip sa-td-chip--soft">TAG: [{tournament.tag}]</span>
              </div>

              <p className="sa-td-desc">{tournament.description}</p>

              <hr className="sa-td-divider" />

              <div className="sa-td-stats">
                <div className="sa-td-stat">
                  <span className="sa-td-stat__icon" aria-hidden>
                    <Calendar />
                  </span>
                  <div className="sa-td-stat__text">
                    <span className="sa-td-stat__label">PERÍODO OFICIAL</span>
                    <span className="sa-td-stat__value">
                      {tournament.startDate} — {tournament.endDate}
                    </span>
                  </div>
                </div>
                <div className="sa-td-stat">
                  <span className="sa-td-stat__icon" aria-hidden>
                    <Users />
                  </span>
                  <div className="sa-td-stat__text">
                    <span className="sa-td-stat__label">VAGAS / TIMES</span>
                    <span className="sa-td-stat__value sa-td-stat__value--teal">
                      {confirmedTeams.length} / {tournament.maxTeams} EQUIPES
                    </span>
                  </div>
                </div>
                <div className="sa-td-stat">
                  <span className="sa-td-stat__icon" aria-hidden>
                    <Server />
                  </span>
                  <div className="sa-td-stat__text">
                    <span className="sa-td-stat__label">SERVIDOR HOMOLOGADO</span>
                    <span className="sa-td-stat__value">{tournament.server}</span>
                  </div>
                </div>
              </div>

              <hr className="sa-td-divider" />

              <h3 className="sa-td-prize-head font-display">
                <Trophy aria-hidden /> PREMIAÇÃO
              </h3>

              {tournament.prizeTiers && tournament.prizeTiers.length > 0 ? (
                <div className="sa-td-prize-table">
                  {tournament.prizeTiers.map((tier) => {
                    const label =
                      tier.type === 'single' || tier.from === tier.to
                        ? `${tier.from}º COLOCADO`
                        : `${tier.from}º — ${tier.to}º`;
                    const isGold = tier.from === 1 && tier.to === 1;
                    return (
                      <div
                        key={tier.id}
                        className={`sa-td-prize-row ${isGold ? 'sa-td-prize-row--gold' : ''}`}
                      >
                        <span className="sa-td-prize-row__place">{label}</span>
                        <span className="sa-td-prize-row__reward">{tier.reward}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="sa-td-prizes">
                  <div className="sa-td-prize sa-td-prize--gold">
                    <span className="sa-td-prize__medal" aria-hidden>
                      <Medal />
                    </span>
                    <div>
                      <span className="sa-td-prize__place">1º COLOCADO</span>
                      <span className="sa-td-prize__value">{tournament.firstPlacePrize}</span>
                    </div>
                  </div>
                  <div className="sa-td-prize sa-td-prize--silver">
                    <span className="sa-td-prize__medal" aria-hidden>
                      <Medal />
                    </span>
                    <div>
                      <span className="sa-td-prize__place">2º COLOCADO</span>
                      <span className="sa-td-prize__value">{tournament.secondPlacePrize}</span>
                    </div>
                  </div>
                  <div className="sa-td-prize sa-td-prize--bronze">
                    <span className="sa-td-prize__medal" aria-hidden>
                      <Medal />
                    </span>
                    <div>
                      <span className="sa-td-prize__place">3º COLOCADO</span>
                      <span className="sa-td-prize__value">{tournament.thirdPlacePrize}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'teams' && (
          <section className="sa-td-section sa-td-section--teams">
            <div className="sa-td-teams-head">
              <span className="sa-td-teams-head__bar" aria-hidden />
              <h2 className="sa-td-teams-head__title font-display">TIMES INSCRITOS</h2>
            </div>

            {listedTeams.length > 0 ? (
              <div className="sa-td-teams">
                {listedTeams.map((team, idx) => {
                  const isConfirmed = team.confirmed !== false;
                  const rank = team.seed ?? idx + 1;
                  const catalogLogo = teams.find((t) => t.id === team.id)?.logo;
                  const logoSrc = resolveTeamLogo(team.id, team.logo, catalogLogo);

                  return (
                    <article
                      key={team.id}
                      className="sa-td-team"
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedEntry(team)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedEntry(team);
                        }
                      }}
                    >
                      <div className="sa-td-team__logo" aria-hidden>
                        {isImageSrc(logoSrc) ? (
                          <img src={logoSrc} alt="" />
                        ) : (
                          <span className="sa-td-team__logo-emoji">{logoSrc}</span>
                        )}
                      </div>

                      <div className="sa-td-team__body">
                        <span className="sa-td-team__rank">#{rank}</span>
                        <h3 className="sa-td-team__name font-display">{team.name}</h3>
                        <p className="sa-td-team__meta">
                          <span className="sa-td-team__tag">[{team.tag}]</span>
                          <span className="sa-td-team__dot" aria-hidden>
                            •
                          </span>
                          <span className="sa-td-team__players">
                            {team.playersCount || 5} players
                          </span>
                        </p>
                      </div>

                      <span
                        className={`sa-td-team__status ${
                          isConfirmed
                            ? 'sa-td-team__status--confirmed'
                            : 'sa-td-team__status--pending'
                        }`}
                      >
                        <span className="sa-td-team__status-dot" aria-hidden />
                        {isConfirmed ? 'Confirmado' : 'Inscritos'}
                      </span>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="sa-td-empty">
                <Users aria-hidden />
                <h3 className="sa-td-empty__title font-display">NENHUM TIME INSCRITO</h3>
                <p className="sa-td-empty__desc">
                  As equipes inscritas neste campeonato aparecerão aqui.
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'tabela' && (
          <section className="sa-td-section sa-td-section--tabela">
            <div className="sa-td-sec-head">
              <span className="sa-td-sec-head__bar" aria-hidden />
              <h2 className="sa-td-sec-head__title font-display">FASE DE GRUPOS</h2>
              {groups.length > 0 && (
                <span className="sa-td-sec-head__meta">
                  J = Jogos · V = Vitórias · E = Empates · D = Derrotas · RF/RA = Rounds · SG =
                  Saldo · Pts = Pontos
                </span>
              )}
            </div>

            {groups.length > 0 ? (
              <GroupStandingsTable groups={groups} />
            ) : (
              <div className="sa-td-empty">
                <AlertCircle aria-hidden />
                <h3 className="sa-td-empty__title font-display">TABELA AINDA NÃO DISPONÍVEL</h3>
                <p className="sa-td-empty__desc">
                  A classificação da fase de grupos será publicada assim que os confrontos forem
                  definidos.
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'bracket' && (
          <section className="sa-td-section sa-td-section--bracket">
            <div className="sa-td-sec-head">
              <span className="sa-td-sec-head__bar" aria-hidden />
              <h2 className="sa-td-sec-head__title font-display">ÁRVORE DE ELIMINATÓRIAS</h2>
              <span className="sa-td-sec-head__meta">ARRASTE HORIZONTALMENTE SE NECESSÁRIO →</span>
            </div>

            <div className="sa-td-panel sa-td-panel--bracket">
              {tournament.brackets && tournament.brackets.length > 0 ? (
                <TournamentBracket
                  brackets={tournament.brackets}
                  championName={tournament.championTeam?.name}
                  championLogo={tournament.championTeam?.logo}
                  championTag={tournament.championTeam?.tag}
                  championId={tournament.championTeam?.id}
                />
              ) : (
                <div className="sa-td-empty sa-td-empty--inset">
                  <AlertCircle aria-hidden />
                  <h3 className="sa-td-empty__title font-display">CHAVEAMENTO EM SORTEIO</h3>
                  <p className="sa-td-empty__desc">
                    As chaves e confrontos serão gerados assim que o limite de 16 equipes for
                    atingido ou as inscrições se encerrarem.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'partidas' && (
          <section className="sa-td-section sa-td-section--partidas">
            <div className="sa-td-sec-head">
              <span className="sa-td-sec-head__bar" aria-hidden />
              <h2 className="sa-td-sec-head__title font-display">TODAS AS PARTIDAS</h2>
              <span className="sa-td-sec-head__meta">
                {allMatches.length} CONFRONTOS REGISTRADOS
              </span>
            </div>

            {allMatches.length > 0 ? (
              <TournamentMatchesList matches={allMatches} tournamentId={tournament.id} />
            ) : (
              <div className="sa-td-empty">
                <Swords aria-hidden />
                <h3 className="sa-td-empty__title font-display">NENHUMA PARTIDA REGISTRADA</h3>
                <p className="sa-td-empty__desc">
                  As partidas deste campeonato aparecerão aqui assim que forem disputadas.
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'rules' && (
          <section className="sa-td-section">
            <div className="sa-td-section__head">
              <h2 className="sa-td-section__title font-display">REGULAMENTO OFICIAL</h2>
            </div>

            <div className="sa-td-rules">
              <article className="sa-td-rule">
                <h3 className="sa-td-rule__title font-display">
                  <FileText aria-hidden /> FORMATO
                </h3>
                <p className="sa-td-rule__body">
                  {(() => {
                    const phases = resolvePhaseFormats(tournament);
                    const hasGroups = isGroupsStructure(tournament.structure);
                    const parts = [
                      hasGroups ? `fase de grupos em ${phases.groups}` : null,
                      `mata-mata em ${phases.knockout}`,
                      `final em ${phases.final}`,
                    ].filter(Boolean);
                    return (
                      <>
                        Formatos oficiais deste campeonato: {parts.join(', ')}. Servidor
                        homologado: {tournament.server}.
                      </>
                    );
                  })()}
                </p>
              </article>

              {tournament.rules.length > 0 ? (
                tournament.rules.map((topic) => (
                  <article key={topic.id} className="sa-td-rule">
                    <h3 className="sa-td-rule__title font-display">
                      <FileText aria-hidden /> {topic.title}
                    </h3>
                    {topic.items.length > 0 ? (
                      <ul className="sa-td-rule__list">
                        {topic.items.map((rule, idx) => (
                          <li key={`${topic.id}-${idx}`}>{rule}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="sa-td-rule__body">Nenhuma regra neste tópico.</p>
                    )}
                  </article>
                ))
              ) : (
                <article className="sa-td-rule">
                  <h3 className="sa-td-rule__title font-display">
                    <FileText aria-hidden /> REGRAS
                  </h3>
                  <p className="sa-td-rule__body">Nenhuma regra adicional publicada.</p>
                </article>
              )}

              <article className="sa-td-rule">
                <h3 className="sa-td-rule__title font-display">
                  <Trophy aria-hidden /> PREMIAÇÃO
                </h3>
                <ul className="sa-td-rule__list">
                  {tournament.prizeTiers && tournament.prizeTiers.length > 0 ? (
                    tournament.prizeTiers.map((tier) => {
                      const label =
                        tier.type === 'single' || tier.from === tier.to
                          ? `${tier.from}º colocado`
                          : `${tier.from}º ao ${tier.to}º`;
                      return (
                        <li key={tier.id}>
                          {label}: {tier.reward}
                        </li>
                      );
                    })
                  ) : (
                    <>
                      <li>1º colocado: {tournament.firstPlacePrize}</li>
                      <li>2º colocado: {tournament.secondPlacePrize}</li>
                      <li>3º colocado: {tournament.thirdPlacePrize}</li>
                    </>
                  )}
                  <li>Resumo: {tournament.prizePool}</li>
                </ul>
              </article>
            </div>
          </section>
        )}
      </div>

      <TournamentRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        tournament={tournament}
        team={currentTeam}
        alreadyRegistered={alreadyRegistered}
        onConfirm={(roster) => registerTeamForTournament(tournament.id, roster)}
      />
      <TournamentTeamEntryModal
        isOpen={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
        catalogTeam={selectedCatalogTeam}
      />
    </div>
  );
};
