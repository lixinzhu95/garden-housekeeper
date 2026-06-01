import type { Plant, CareLog } from './types';

const apiUrl = '/api/plants';
const userKey = 'garden-housekeeper-user';

function plantsKey(user: string): string {
  return `garden-housekeeper-plants-${user}`;
}

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

function loadLocal(user: string): Plant[] {
  try {
    const rawValue = localStorage.getItem(plantsKey(user));
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    return isValidPlantArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function getCurrentUser(): string | null {
  return localStorage.getItem(userKey);
}

export function setCurrentUser(name: string | null): void {
  if (name === null) {
    localStorage.removeItem(userKey);
  } else {
    localStorage.setItem(userKey, name);
  }
}

export function getMemberList(): string[] {
  try {
    const raw = localStorage.getItem('garden-housekeeper-members');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMemberList(members: string[]): void {
  localStorage.setItem('garden-housekeeper-members', JSON.stringify(members));
}

export function loadPlants(): Plant[] {
  const user = getCurrentUser();
  if (!user) return [];
  return loadLocal(user);
}

export function savePlants(plants: Plant[]): void {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(plantsKey(user), JSON.stringify(plants));
  try {
    fetch(`${apiUrl}?user=${encodeURIComponent(user)}`, {
      method: 'POST',
      body: JSON.stringify(plants),
    }).catch(() => {});
  } catch {}
}

export async function syncFromServer(user: string): Promise<Plant[] | null> {
  try {
    const res = await fetch(`${apiUrl}?user=${encodeURIComponent(user)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!isValidPlantArray(data)) return null;
    localStorage.setItem(plantsKey(user), JSON.stringify(data));
    return data;
  } catch {
    return null;
  }
}