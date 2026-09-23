import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Map as MapIcon,
  PlusCircle,
  Save,
  X,
} from 'lucide-react';
import { GameMap } from '../../types';
import { readImageFile } from '../profile/shared';

interface EditTournamentMapsPanelProps {
  maps: GameMap[];
  selectedMapIds: string[];
  onToggleMap: (mapId: string) => void;
  onSelectAll: () => void;
  onClear: () => void;
  onSave: () => void;
  createMap: (data: { name: string; image: string }) => {
    ok: boolean;
    message?: string;
    id?: string;
  };
  onMapCreated: (mapId: string) => void;
}

export const EditTournamentMapsPanel: React.FC<EditTournamentMapsPanelProps> = ({
  maps,
  selectedMapIds,
  onToggleMap,
  onSelectAll,
  onClear,
  onSave,
  createMap,
  onMapCreated,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setName('');
    setImage('');
    setError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setError('');
  };

  const handleImagePick = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem válido.');
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      setImage(dataUrl);
      setError('');
    } catch {
      setError('Não foi possível ler a imagem.');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const result = createMap({ name, image });
    setSaving(false);

    if (!result.ok || !result.id) {
      setError(result.message || 'Não foi possível adicionar o mapa.');
      return;
    }

    onMapCreated(result.id);
    setModalOpen(false);
  };

  return (
    <section className="sa-admin-panel sa-edit-panel" aria-label="Mapas do torneio">
      <div className="sa-edit-panel__body space-y-5">
        <div className="sa-edit-maps-hero">
          <div>
            <span className="sa-admin-header__label">Pool do campeonato</span>
            <h2 className="sa-edit-section-title" style={{ display: 'block', marginTop: 6 }}>
              Mapas do torneio
            </h2>
            <p className="sa-edit-maps__hint" style={{ marginTop: 8, maxWidth: 520 }}>
              Defina quais mapas entram no veto e nas partidas deste campeonato. Você pode
              selecionar mapas do catálogo ou cadastrar um novo mapa agora.
            </p>
          </div>
          <button
            type="button"
            className="sa-admin-btn sa-admin-btn--primary"
            onClick={openCreate}
          >
            <PlusCircle className="w-3.5 h-3.5" aria-hidden />
            Adicionar mapa
          </button>
        </div>

        <div className="sa-edit-maps">
          <div className="sa-edit-maps__head">
            <p className="sa-edit-maps__hint">
              {selectedMapIds.length} mapa{selectedMapIds.length === 1 ? '' : 's'} no pool deste
              torneio.
            </p>
            <div className="sa-admin-actions">
              <button
                type="button"
                className="sa-admin-btn"
                onClick={onSelectAll}
                disabled={maps.length === 0 || selectedMapIds.length === maps.length}
              >
                Todos
              </button>
              <button
                type="button"
                className="sa-admin-btn"
                onClick={onClear}
                disabled={selectedMapIds.length === 0}
              >
                Limpar
              </button>
            </div>
          </div>

          {maps.length === 0 ? (
            <div className="sa-edit-maps__empty">
              Nenhum mapa cadastrado. Clique em <strong>Adicionar mapa</strong> para criar o
              primeiro.
            </div>
          ) : (
            <div className="sa-edit-maps__grid" role="group" aria-label="Seleção de mapas">
              {maps.map((map) => {
                const checked = selectedMapIds.includes(map.id);
                return (
                  <label
                    key={map.id}
                    className={`sa-edit-map-card${checked ? ' sa-edit-map-card--active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="sa-edit-map-card__check"
                      checked={checked}
                      onChange={() => onToggleMap(map.id)}
                    />
                    <span className="sa-edit-map-card__thumb">
                      <img src={map.image} alt="" />
                    </span>
                    <span className="sa-edit-map-card__meta">
                      <MapIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                      <span className="sa-edit-map-card__name">{map.name}</span>
                    </span>
                  </label>
                );
              })}

              <button
                type="button"
                className="sa-edit-map-card sa-edit-map-card--add"
                onClick={openCreate}
              >
                <span className="sa-edit-map-card__add-icon">
                  <PlusCircle className="w-7 h-7" aria-hidden />
                </span>
                <span className="sa-edit-map-card__name">Novo mapa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="sa-edit-panel__footer">
        <span className="sa-edit-toolbar-hint">
          Alterações no pool só entram em vigor ao salvar.
        </span>
        <button type="button" className="sa-admin-btn sa-admin-btn--primary" onClick={onSave}>
          <Save className="w-3.5 h-3.5" aria-hidden />
          Salvar mapas
        </button>
      </div>

      {modalOpen && (
        <div
          className="sa-admin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-edit-map-modal-title"
          onClick={closeModal}
        >
          <div className="sa-admin-modal__panel" onClick={(e) => e.stopPropagation()}>
            <header className="sa-admin-modal__head">
              <div>
                <span className="sa-admin-header__label">Catálogo de mapas</span>
                <h2 id="sa-edit-map-modal-title" className="sa-admin-modal__title">
                  Adicionar mapa
                </h2>
              </div>
              <button
                type="button"
                className="sa-admin-btn sa-admin-btn--ghost"
                aria-label="Fechar"
                onClick={closeModal}
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </header>

            <form className="sa-admin-modal__body" onSubmit={handleCreate}>
              <label className="sa-admin-field">
                <span className="sa-admin-field__label">Nome do mapa</span>
                <input
                  className="sa-admin-field__input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: White Squall"
                  autoFocus
                  required
                />
              </label>

              <div className="sa-admin-field">
                <span className="sa-admin-field__label">Imagem</span>
                <div className="sa-admin-map-upload">
                  <div className="sa-admin-map-upload__preview">
                    {image ? (
                      <img src={image} alt="Pré-visualização do mapa" />
                    ) : (
                      <div className="sa-admin-map-upload__placeholder">
                        <MapIcon className="w-8 h-8" aria-hidden />
                        <span>Sem imagem</span>
                      </div>
                    )}
                  </div>
                  <div className="sa-admin-map-upload__actions">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => handleImagePick(e.target.files?.[0])}
                    />
                    <button
                      type="button"
                      className="sa-admin-btn sa-admin-btn--primary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="w-3.5 h-3.5" aria-hidden />
                      {image ? 'Trocar imagem' : 'Enviar imagem'}
                    </button>
                    <input
                      className="sa-admin-field__input"
                      type="url"
                      value={image.startsWith('data:') ? '' : image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="Ou cole a URL da imagem…"
                      aria-label="URL da imagem do mapa"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="sa-admin-modal__error">{error}</p>}

              <div className="sa-admin-modal__footer">
                <button
                  type="button"
                  className="sa-admin-btn"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sa-admin-btn sa-admin-btn--primary"
                  disabled={saving}
                >
                  Adicionar e incluir no pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
