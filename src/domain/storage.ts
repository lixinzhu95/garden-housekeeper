import type { Plant, CareLog } from './types';

const storageKey = 'garden-housekeeper-plants';

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

export function loadPlants(): Plant[] {
  try {
    const rawValue = localStorage.getItem(storageKey);
    if (!rawValue) return [];

    const parsedValue = JSON.parse(rawValue);
    return isValidPlantArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function savePlants(plants: Plant[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(plants));
  } catch {
    // Silently fail on storage write errors
  }
}
