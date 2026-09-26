import React, { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Check, X, ZoomIn } from 'lucide-react';
import { Button } from './Button';
import { getCroppedImageDataUrl } from '../../utils/cropImage';
import './ImageCropModal.css';

export interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  title?: string;
  /** Proporção do recorte (ex.: 16/5 para banner 1600×500) */
  aspect?: number;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Ajustar imagem',
  aspect = 16 / 5,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError('');
    setSaving(false);
  }, [isOpen, imageSrc]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setSaving(true);
    setError('');
    try {
      const dataUrl = await getCroppedImageDataUrl(imageSrc, croppedAreaPixels);
      onConfirm(dataUrl);
    } catch {
      setError('Não foi possível cortar a imagem. Tente outra foto.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="sa-crop-modal" role="dialog" aria-modal="true" aria-labelledby="sa-crop-title">
      <div className="sa-crop-modal__panel">
        <div className="sa-crop-modal__header">
          <h3 id="sa-crop-title" className="sa-crop-modal__title font-display">
            {title}
          </h3>
          <button
            type="button"
            className="sa-crop-modal__close"
            onClick={onCancel}
            aria-label="Fechar"
          >
            <X className="w-5 h-5" aria-hidden />
          </button>
        </div>

        <p className="sa-crop-modal__hint">
          Arraste para posicionar e use o zoom para enquadrar o banner como quiser. A área clara é
          o que será exibido.
        </p>

        <div className="sa-crop-modal__stage">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
            objectFit="horizontal-cover"
          />
        </div>

        <div className="sa-crop-modal__zoom">
          <ZoomIn className="w-4 h-4 text-[#9298A5] shrink-0" aria-hidden />
          <label className="sr-only" htmlFor="sa-crop-zoom">
            Zoom
          </label>
          <input
            id="sa-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="sa-crop-modal__range"
          />
          <span className="sa-crop-modal__zoom-val">{zoom.toFixed(1)}×</span>
        </div>

        {error && <p className="sa-crop-modal__error">{error}</p>}

        <div className="sa-crop-modal__actions">
          <Button variant="outline" size="md" onClick={onCancel} disabled={saving} className="rounded-lg">
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            disabled={saving || !croppedAreaPixels}
            leftIcon={<Check className="w-4 h-4" />}
            className="rounded-lg"
          >
            {saving ? 'Salvando…' : 'Aplicar corte'}
          </Button>
        </div>
      </div>
    </div>
  );
};
