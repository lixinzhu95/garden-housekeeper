import { useState } from 'react';
import type { Plant, PlantFormValues } from '../domain/types';

interface PlantFormProps {
  plant?: Plant;
  onSubmit: (values: PlantFormValues) => void;
  onCancel: () => void;
}

const maxImageSizeBytes = 20 * 1024 * 1024;
const maxImageDimension = 800;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result === null) {
        reject(new Error('Failed to read file'));
      } else {
        resolve(reader.result as string);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function compressImage(dataUrl: string): Promise<string> {
  // Skip in test environment (jsdom doesn't load images)
  if (import.meta.env.MODE === 'test') return Promise.resolve(dataUrl);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width <= maxImageDimension && height <= maxImageDimension) {
        resolve(dataUrl);
        return;
      }
      if (width > height) {
        height = Math.round(height * (maxImageDimension / width));
        width = maxImageDimension;
      } else {
        width = Math.round(width * (maxImageDimension / height));
        height = maxImageDimension;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

export default function PlantForm({ plant, onSubmit, onCancel }: PlantFormProps) {
  const [name, setName] = useState(plant?.name ?? '');
  const [image, setImage] = useState<string | undefined>(plant?.image);
  const [wateringIntervalDays, setWateringIntervalDays] = useState(String(plant?.wateringIntervalDays ?? 3));
  const [fertilizingEnabled, setFertilizingEnabled] = useState(plant?.fertilizingIntervalDays !== null);
  const [fertilizingIntervalDays, setFertilizingIntervalDays] = useState(String(plant?.fertilizingIntervalDays ?? 14));
  const [error, setError] = useState<string | null>(null);

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > maxImageSizeBytes) {
      setError('图片不能超过 20MB');
      return;
    }

    try {
      setError(null);
      const raw = await readFileAsDataUrl(file);
      const compressed = await compressImage(raw);
      setImage(compressed);
    } catch {
      setError('图片读取失败，请重试');
    }
  }

  function handleClearImage() {
    setImage(undefined);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('请输入花草名称');
      return;
    }

    const wateringDays = Number(wateringIntervalDays);
    if (!Number.isFinite(wateringDays) || wateringDays < 1) {
      setError('周期需要大于 0');
      return;
    }

    if (fertilizingEnabled) {
      const fertilizingDays = Number(fertilizingIntervalDays);
      if (!Number.isFinite(fertilizingDays) || fertilizingDays < 1) {
        setError('周期需要大于 0');
        return;
      }
    }

    onSubmit({
      name: trimmedName,
      image,
      wateringIntervalDays: wateringDays,
      fertilizingIntervalDays: fertilizingEnabled ? Number(fertilizingIntervalDays) : null,
    });
  }

  return (
    <form className="sheet-card form-stack" onSubmit={handleSubmit} aria-label={plant ? '编辑花草' : '新增花草'}>
      {error ? <p className="form-error" role="alert">{error}</p> : null}

      <label>
        花草名称
        <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="比如：绿萝" />
      </label>

      <label>
        浇水周期（天）
        <input
          type="number"
          min="1"
          value={wateringIntervalDays}
          onChange={(event) => setWateringIntervalDays(event.target.value)}
          required
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={fertilizingEnabled}
          onChange={(event) => setFertilizingEnabled(event.target.checked)}
        />
        需要施肥提醒
      </label>

      {fertilizingEnabled ? (
        <label>
          施肥周期（天）
          <input
            type="number"
            min="1"
            value={fertilizingIntervalDays}
            onChange={(event) => setFertilizingIntervalDays(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label>
        花草图片（可选）
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

      {image ? (
        <div className="image-preview-wrapper">
          <img className="image-preview" src={image} alt="花草预览" />
          <button className="ghost-button remove-image-btn" type="button" onClick={handleClearImage}>
            移除图片
          </button>
        </div>
      ) : null}

      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onCancel}>取消</button>
        <button className="primary-button" type="submit">保存</button>
      </div>
    </form>
  );
}
