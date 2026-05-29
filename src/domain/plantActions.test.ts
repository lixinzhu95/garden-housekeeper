import { describe, expect, it } from 'vitest';
import { createId, createPlant, deleteCareLog, hasSameDayCareLog, recordCare, updatePlant } from './plantActions';
import type { Plant } from './types';

const plantWithFertilizingDisabled: Plant = {
  id: 'plant-disabled',
  name: '仙人掌',
  wateringIntervalDays: 10,
  fertilizingIntervalDays: null,
  nextWateringDate: '2026-05-18',
  nextFertilizingDate: null,
  careLogs: [],
};

const basePlant: Plant = {
  id: 'plant-1',
  name: '绿萝',
  wateringIntervalDays: 3,
  fertilizingIntervalDays: 14,
  nextWateringDate: '2026-05-11',
  nextFertilizingDate: '2026-05-22',
  careLogs: [],
};

describe('plant actions', () => {
  it('creates a plant with next dates based on today', () => {
    const plant = createPlant(
      {
        name: '绿萝',
        wateringIntervalDays: 3,
        fertilizingIntervalDays: 14,
      },
      '2026-05-08',
      () => 'plant-1',
    );

    expect(plant).toEqual(basePlant);
  });

  it('creates a plant with fertilizing disabled', () => {
    const plant = createPlant(
      {
        name: '仙人掌',
        wateringIntervalDays: 10,
        fertilizingIntervalDays: null,
      },
      '2026-05-08',
      () => 'plant-2',
    );

    expect(plant.nextFertilizingDate).toBeNull();
  });

  it('records watering and recalculates from today', () => {
    const updated = recordCare(basePlant, 'watering', '2026-05-12', () => 'log-1');

    expect(updated.nextWateringDate).toBe('2026-05-15');
    expect(updated.careLogs).toEqual([
      {
        id: 'log-1',
        plantId: 'plant-1',
        type: 'watering',
        date: '2026-05-12',
      },
    ]);
  });

  it('records fertilizing and recalculates from today', () => {
    const updated = recordCare(basePlant, 'fertilizing', '2026-05-12', () => 'log-1');

    expect(updated.nextFertilizingDate).toBe('2026-05-26');
  });

  it('detects duplicate same-day care logs', () => {
    const updated = recordCare(basePlant, 'watering', '2026-05-12', () => 'log-1');

    expect(hasSameDayCareLog(updated, 'watering', '2026-05-12')).toBe(true);
    expect(hasSameDayCareLog(updated, 'fertilizing', '2026-05-12')).toBe(false);
  });

  it('updates plant profile and recalculates dates from today', () => {
    const updated = updatePlant(basePlant, {
      name: '窗边绿萝',
      wateringIntervalDays: 5,
      fertilizingIntervalDays: null,
      image: 'data:image/png;base64,abc',
    }, '2026-05-08');

    expect(updated.name).toBe('窗边绿萝');
    expect(updated.image).toBe('data:image/png;base64,abc');
    expect(updated.nextWateringDate).toBe('2026-05-13');
    expect(updated.nextFertilizingDate).toBeNull();
    expect(updated.careLogs).toEqual([]);
  });

  it('createId returns a non-empty string', () => {
    const id = createId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('recordCare throws when fertilizing is disabled', () => {
    expect(() => recordCare(plantWithFertilizingDisabled, 'fertilizing', '2026-05-12')).toThrow(
      'Cannot record fertilizing when fertilizing is disabled'
    );
  });

  it('recordCare prepends new log and preserves existing logs', () => {
    const plantWithLog: Plant = {
      ...basePlant,
      careLogs: [
        { id: 'log-old', plantId: 'plant-1', type: 'watering', date: '2026-05-10' },
      ],
    };
    const updated = recordCare(plantWithLog, 'watering', '2026-05-12', () => 'log-new');

    expect(updated.careLogs).toHaveLength(2);
    expect(updated.careLogs[0].id).toBe('log-new');
    expect(updated.careLogs[1].id).toBe('log-old');
  });

  it('updatePlant preserves existing careLogs', () => {
    const plantWithLog: Plant = {
      ...basePlant,
      careLogs: [
        { id: 'log-1', plantId: 'plant-1', type: 'watering', date: '2026-05-10' },
        { id: 'log-2', plantId: 'plant-1', type: 'fertilizing', date: '2026-05-11' },
      ],
    };
    const updated = updatePlant(plantWithLog, {
      name: '窗边绿萝',
      wateringIntervalDays: 5,
      fertilizingIntervalDays: 14,
      image: 'data:image/png;base64,xyz',
    }, '2026-05-08');

    expect(updated.careLogs).toEqual(plantWithLog.careLogs);
  });

  it('deletes a specific care log while preserving others', () => {
    const plantWithLogs: Plant = {
      ...basePlant,
      careLogs: [
        { id: 'log-1', plantId: 'plant-1', type: 'watering', date: '2026-05-10' },
        { id: 'log-2', plantId: 'plant-1', type: 'fertilizing', date: '2026-05-11' },
      ],
    };
    const updated = deleteCareLog(plantWithLogs, 'log-1');

    expect(updated.careLogs).toHaveLength(1);
    expect(updated.careLogs[0].id).toBe('log-2');
  });

  it('deleting the only log results in empty careLogs', () => {
    const plantWithOneLog: Plant = {
      ...basePlant,
      careLogs: [
        { id: 'log-1', plantId: 'plant-1', type: 'watering', date: '2026-05-10' },
      ],
    };
    const updated = deleteCareLog(plantWithOneLog, 'log-1');

    expect(updated.careLogs).toEqual([]);
  });
});
