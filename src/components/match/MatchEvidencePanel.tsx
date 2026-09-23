import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, MessageSquareText, Send, Upload, X } from 'lucide-react';
import { MatchEvidence } from '../../types';
import { readImageFile } from '../profile/shared';
import { Button } from '../ui/Button';

interface MatchEvidencePanelProps {
  evidence: MatchEvidence[];
  onSubmit: (data: {
    imageUrl: string;
    comment: string;
  }) => { ok: boolean; message?: string };
}

export const MatchEvidencePanel: React.FC<MatchEvidencePanelProps> = ({
  evidence,
  onSubmit,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    meta?: string;
  } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Envie apenas imagens (PNG, JPG, WEBP…).');
      return;
    }
    setError('');
    setFileName(file.name);
    setPreview(await readImageFile(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview) {
      setError('Selecione um print da partida.');
      return;
    }

    setSending(true);
    const result = onSubmit({ imageUrl: preview, comment });
    setSending(false);

    if (!result.ok) {
      setError(result.message || 'Não foi possível enviar o print.');
      return;
    }

    setPreview(null);
    setFileName('');
    setComment('');
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section className="sa-match-evidence" aria-label="Prints da partida">
      <div className="sa-match-section__head">
        <div className="sa-match-section__label-row">
          <span className="sa-match-section__label">Provas</span>
          <span className="sa-match-section__label-line" aria-hidden />
        </div>
        <h2 className="sa-match-section__title font-display">Prints da partida</h2>
        <p className="sa-match-evidence__hint">
          Envie prints do resultado para o administrador validar o placar. É
          possível enviar mais de um print. Clique no print para ampliar.
        </p>
      </div>

      <form className="sa-match-evidence__form" onSubmit={handleSubmit}>
        <div className="sa-match-evidence__fields">
          <label className="sa-match-evidence__file">
            <span className="sa-match-evidence__field-label">
              <ImagePlus className="w-3.5 h-3.5" aria-hidden />
              Selecionar print
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <span className="sa-match-evidence__file-btn">
              <Upload className="w-4 h-4" aria-hidden />
              {fileName || 'Escolher imagem…'}
            </span>
          </label>

          <label className="sa-match-evidence__comment">
            <span className="sa-match-evidence__field-label">
              <MessageSquareText className="w-3.5 h-3.5" aria-hidden />
              Comentário
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Ex.: Placar final do mapa 2 — Crossport 13x9"
              className="sa-match-evidence__textarea"
            />
          </label>
        </div>

        {preview && (
          <button
            type="button"
            className="sa-match-evidence__preview"
            onClick={() =>
              setLightbox({
                src: preview,
                alt: 'Pré-visualização do print',
              })
            }
          >
            <img src={preview} alt="Pré-visualização do print" />
          </button>
        )}

        {error && <p className="sa-match-evidence__error">{error}</p>}

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={sending || !preview}
          leftIcon={<Send className="w-4 h-4" />}
        >
          {sending ? 'ENVIANDO…' : 'ENVIAR PRINT'}
        </Button>
      </form>

      <div className="sa-match-evidence__list">
        {evidence.length === 0 ? (
          <p className="sa-match-evidence__empty">
            Nenhum print enviado ainda.
          </p>
        ) : (
          evidence.map((item) => (
            <article key={item.id} className="sa-match-evidence__item">
              <div className="sa-match-evidence__item-meta">
                <time dateTime={item.uploadedAt}>{item.uploadedAt}</time>
                {item.uploadedBy && (
                  <span className="sa-match-evidence__item-by">
                    por {item.uploadedBy}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="sa-match-evidence__item-img"
                onClick={() =>
                  setLightbox({
                    src: item.imageUrl,
                    alt: `Print enviado em ${item.uploadedAt}`,
                    meta: [
                      item.uploadedAt,
                      item.uploadedBy ? `por ${item.uploadedBy}` : null,
                      item.comment || null,
                    ]
                      .filter(Boolean)
                      .join(' · '),
                  })
                }
              >
                <img
                  src={item.imageUrl}
                  alt={`Print enviado em ${item.uploadedAt}`}
                />
              </button>
              {item.comment ? (
                <p className="sa-match-evidence__item-comment">{item.comment}</p>
              ) : (
                <p className="sa-match-evidence__item-comment sa-match-evidence__item-comment--muted">
                  Sem comentário
                </p>
              )}
            </article>
          ))
        )}
      </div>

      {lightbox && (
        <div
          className="sa-match-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Print ampliado"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="sa-match-lightbox__close"
            aria-label="Fechar"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="sa-match-lightbox__content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={lightbox.src} alt={lightbox.alt} />
            {lightbox.meta && (
              <p className="sa-match-lightbox__meta">{lightbox.meta}</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
