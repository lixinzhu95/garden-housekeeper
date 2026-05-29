export type CareType = 'watering' | 'fertilizing';
export type CareTaskGroup = 'overdue' | 'today' | 'next3days';
export type View = 'tasks' | 'archive' | 'detail';

export interface CareLog {
  id: string;
  plantId: string;
  type: CareType;
  date: string;
}

export interface Plant {
  id: string;
  name: string;
  image?: string;
  wateringIntervalDays: number;
  fertilizingIntervalDays: number | null;
  nextWateringDate: string;
  nextFertilizingDate: string | null;
  careLogs: CareLog[];
}

export interface CareTask {
  id: string;
  plantId: string;
  plantName: string;
  plantImage?: string;
  type: CareType;
  dueDate: string;
  group: CareTaskGroup;
}

export interface PlantFormValues {
  name: string;
  image?: string;
  wateringIntervalDays: number;
  fertilizingIntervalDays: number | null;
}
