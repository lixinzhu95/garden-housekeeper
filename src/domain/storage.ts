import type { Plant, CareLog } from './types';

const storageKey = 'garden-housekeeper-plants';
const apiUrl = '/api/plants';

function isValidCareLog(log: unknown): log is CareLog {
  if (typeof log !== 'object' || log === null) return false;
  const obj = log as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.plantId === 'string' &&
    (obj.type === 'watering' || obj.type === 'fertilizing') &&
    typeof obj.date === 'string'
  );
}

function isValidPlant(plant: unknown): plant is Plant {
  if (typeof plant !== 'object' || plant === null) return false;
  const obj = plant as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    (obj.image === undefined || typeof obj.image === 'string') &&
    typeof obj.wateringIntervalDays === 'number' &&
    (obj.fertilizingIntervalDays === null || typeof obj.fertilizingIntervalDays === 'number') &&
    typeof obj.nextWateringDate === 'string' &&
    (obj.nextFertilizingDate === null || typeof obj.nextFertilizingDate === 'string') &&
    Array.isArray(obj.careLogs) &&
    obj.careLogs.every(isValidCareLog)
  );
}

function isValidPlantArray(value: unknown): value is Plant[] {
  return Array.isArray(value) && value.every(isValidPlant);
}

function loadLocal(): Plant[] {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return isValidPlantArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function loadPlants(): Plant[] {
  return loadLocal();
}

export function savePlants(plants: Plant[]): void {
  localStorage.setItem(storageKey, JSON.stringify(plants));
  try {
    fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(plants),
    }).catch(() => {});
  } catch {}
}

export async function syncFromServer(): Promise<Plant[] | null> {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const data = await res.json();
    if (!isValidPlantArray(data)) return null;
    localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}