import { addDaysToString } from './dates';
import type { CareLog, CareType, Plant, PlantFormValues } from './types';

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2);
  return `${timestamp}-${random}`;
}

export function createPlant(values: PlantFormValues, today: string, makeId: () => string = createId): Plant {
  return {
    id: makeId(),
    name: values.name.trim(),
    image: values.image,
    wateringIntervalDays: values.wateringIntervalDays,
    fertilizingIntervalDays: values.fertilizingIntervalDays,
    nextWateringDate: addDaysToString(today, values.wateringIntervalDays),
    nextFertilizingDate: values.fertilizingIntervalDays === null ? null : addDaysToString(today, values.fertilizingIntervalDays),
    careLogs: [],
  };
}

export function updatePlant(plant: Plant, values: PlantFormValues, today: string): Plant {
  return {
    ...plant,
    name: values.name.trim(),
    image: values.image,
    wateringIntervalDays: values.wateringIntervalDays,
    fertilizingIntervalDays: values.fertilizingIntervalDays,
    nextWateringDate: addDaysToString(today, values.wateringIntervalDays),
    nextFertilizingDate: values.fertilizingIntervalDays === null ? null : addDaysToString(today, values.fertilizingIntervalDays),
  };
}

export function hasSameDayCareLog(plant: Plant, type: CareType, date: string): boolean {
  return plant.careLogs.some((log) => log.type === type && log.date === date);
}

export function deletePlant(plants: Plant[], plantId: string): Plant[] {
  return plants.filter((p) => p.id !== plantId);
}

export function deleteCareLog(plant: Plant, logId: string): Plant {
  return {
    ...plant,
    careLogs: plant.careLogs.filter((log) => log.id !== logId),
  };
}

export function recordCare(plant: Plant, type: CareType, today: string, makeId: () => string = createId): Plant {
  const log: CareLog = {
    id: makeId(),
    plantId: plant.id,
    type,
    date: today,
  };

  if (type === 'watering') {
    return {
      ...plant,
      nextWateringDate: addDaysToString(today, plant.wateringIntervalDays),
      careLogs: [log, ...plant.careLogs],
    };
  }

  if (plant.fertilizingIntervalDays === null) {
    throw new Error('Cannot record fertilizing when fertilizing is disabled');
  }

  return {
    ...plant,
    nextFertilizingDate: addDaysToString(today, plant.fertilizingIntervalDays),
    careLogs: [log, ...plant.careLogs],
  };
}
