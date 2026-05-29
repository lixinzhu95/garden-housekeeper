import { describe, expect, it } from 'vitest';
import type { Plant } from './types';
import { countTodayTasks, getCareTasks, getTasksByGroup } from './careTasks';

const plants: Plant[] = [
  {
    id: 'rose',
    name: '小玫瑰',
    wateringIntervalDays: 2,
    fertilizingIntervalDays: 10,
    nextWateringDate: '2026-05-07',
    nextFertilizingDate: '2026-05-08',
    careLogs: [],
  },
  {
    id: 'mint',
    name: '薄荷',
    wateringIntervalDays: 3,
    fertilizingIntervalDays: null,
    nextWateringDate: '2026-05-10',
    nextFertilizingDate: null,
    careLogs: [],
  },
  {
    id: 'orchid',
    name: '兰花',
    wateringIntervalDays: 7,
    fertilizingIntervalDays: 20,
    nextWateringDate: '2026-05-12',
    nextFertilizingDate: '2026-05-11',
    careLogs: [],
  },
];

describe('care task grouping', () => {
  it('creates separate watering and fertilizing tasks', () => {
    const tasks = getCareTasks(plants, '2026-05-08');

    expect(tasks).toEqual([
      {
        id: 'rose-watering',
        plantId: 'rose',
        plantName: '小玫瑰',
        plantImage: undefined,
        type: 'watering',
        dueDate: '2026-05-07',
        group: 'overdue',
      },
      {
        id: 'rose-fertilizing',
        plantId: 'rose',
        plantName: '小玫瑰',
        plantImage: undefined,
        type: 'fertilizing',
        dueDate: '2026-05-08',
        group: 'today',
      },
      {
        id: 'mint-watering',
        plantId: 'mint',
        plantName: '薄荷',
        plantImage: undefined,
        type: 'watering',
        dueDate: '2026-05-10',
        group: 'next3days',
      },
      {
        id: 'orchid-fertilizing',
        plantId: 'orchid',
        plantName: '兰花',
        plantImage: undefined,
        type: 'fertilizing',
        dueDate: '2026-05-11',
        group: 'next3days',
      },
    ]);
  });

  it('filters tasks by selected group', () => {
    expect(getTasksByGroup(plants, '2026-05-08', 'overdue')).toHaveLength(1);
    expect(getTasksByGroup(plants, '2026-05-08', 'today')).toHaveLength(1);
    expect(getTasksByGroup(plants, '2026-05-08', 'next3days')).toHaveLength(2);
  });

  it('counts today tasks for the homepage status card', () => {
    expect(countTodayTasks(plants, '2026-05-08')).toBe(1);
  });
});
