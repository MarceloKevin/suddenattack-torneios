import React, { useMemo, useRef, useState } from 'react';
import { ImagePlus, Map as MapIcon, Pencil, PlusCircle, Search, X } from 'lucide-react';
import { GameMap } from '../../types';
import { readImageFile } from '../profile/shared';

interface AdminMapsPanelProps {
  maps: GameMap[];
  createMap: (data: { name: string; image: string }) => {
    ok: boolean;
    message?: string;
    id?: string;
  };
  updateMap: (
    mapId: string,
    data: Partial<Pick<GameMap, 'name' | 'image'>>
  ) => { ok: boolean; message?: string };
}

type MapFormMode = 'create' | 'edit';

export const AdminMapsPanel: React.FC<AdminMapsPanelProps> = ({
  maps,
  createMap,
  updateMap,
}) => {
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<MapFormMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMaps = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return maps;
    return maps.filter((m) => m.name.toLowerCase().includes(q));
  }, [maps, query]);

  const openCreate = () => {
    setMode('create');
    setEditingId(null);
    setName('');
    setImage('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (map: GameMap) => {
    setMode('edit');
    setEditingId(map.id);
    setName(map.name);
    setImage(map.image);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const result =
      mode === 'create'
        ? createMap({ name, image })
        : editingId
          ? updateMap(editingId, { name, image })
          : { ok: false, message: 'Mapa inválido.' };

    setSaving(false);

    if (!result.ok) {
      setError(result.message || 'Não foi possível salvar o mapa.');
      return;
    }

    setModalOpen(false);
  };

  return (
    <section className="sa-admin-panel" aria-label="Gestão de mapas">
      <div className="sa-admin-toolbar">
        <div className="sa-admin-search">
          <Search className="sa-admin-search__icon" aria-hidden />
          <input
            className="sa-admin-search__input"
            type="search"
            placeholder="Buscar mapa…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar mapas"
          />
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

      <div className="sa-admin-table-wrap">
        {filteredMaps.length === 0 ? (
          <div className="sa-admin-empty">
            {maps.length === 0
              ? 'Nenhum mapa cadastrado. Adicione o primeiro mapa do pool.'
              : 'Nenhum mapa encontrado.'}
          </div>
        ) : (
          <table className="sa-admin-table">
            <thead>
              <tr>
                <th>Mapa</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaps.map((map) => (
                <tr key={map.id}>
                  <td>
                    <div className="sa-admin-map">
                      <img
                        className="sa-admin-map__thumb"
                        src={map.image}
                        alt=""
                      />
                    </div>
                  </td>
                  <td>
                    <div className="sa-admin-tour-name">{map.name}</div>
                    <div className="sa-admin-tour-meta">{map.id}</div>
                  </td>
                  <td>
                    <div className="sa-admin-actions">
                      <button
                        type="button"
                        className="sa-admin-btn sa-admin-btn--primary"
                        title="Editar mapa"
                        onClick={() => openEdit(map)}
                      >
                        <Pencil className="w-3.5 h-3.5" aria-hidden />
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div
          className="sa-admin-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sa-admin-map-modal-title"
          onClick={closeModal}
        >
          <div
            className="sa-admin-modal__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="sa-admin-modal__head">
              <div>
                <span className="sa-admin-header__label">Catálogo de mapas</span>
                <h2 id="sa-admin-map-modal-title" className="sa-admin-modal__title">
                  {mode === 'create' ? 'Adicionar mapa' : 'Editar mapa'}
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

            <form className="sa-admin-modal__body" onSubmit={handleSubmit}>
              <label className="sa-admin-field">
                <span className="sa-admin-field__label">Nome do mapa</span>
                <input
                  className="sa-admin-field__input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Crossport"
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
                  {mode === 'create' ? 'Adicionar mapa' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
