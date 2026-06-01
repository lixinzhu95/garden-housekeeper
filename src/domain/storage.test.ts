import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Plant, CareLog } from './types';
import { loadPlants, savePlants, setCurrentUser } from './storage';

const validPlant: Plant = {
  id: 'plant-1',
  name: '绿萝',
  wateringIntervalDays: 3,
  fertilizingIntervalDays: null,
  nextWateringDate: '2026-05-11',
  nextFertilizingDate: null,
  careLogs: [],
};

const validCareLog: CareLog = {
  id: 'log-1',
  plantId: 'plant-1',
  type: 'watering',
  date: '2026-05-10',
};

const validPlantWithLog: Plant = {
  ...validPlant,
  careLogs: [validCareLog],
};

describe('plant storage', () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUser('test');
  });

  it('returns an empty list when storage is empty', () => {
    expect(loadPlants()).toEqual([]);
  });

  it('saves and loads plants', () => {
    savePlants([validPlant]);

    expect(loadPlants()).toEqual([validPlant]);
  });

  it('returns an empty list when storage contains invalid json', () => {
    localStorage.setItem('garden-housekeeper-plants', 'not json');

    expect(loadPlants()).toEqual([]);
  });

  it('non-array parsed JSON returns []', () => {
    localStorage.setItem('garden-housekeeper-plants', JSON.stringify({ plants: [] }));

    expect(loadPlants()).toEqual([]);
  });

  it('array with invalid plant objects returns []', () => {
    const invalidPlants = [
      { id: 123, name: 'test' }, // id should be string
      { name: 'missing-id' }, // missing id
      { id: 'valid-id', name: 'valid' }, // missing required fields
      'not an object',
    ];
    localStorage.setItem('garden-housekeeper-plants', JSON.stringify(invalidPlants));

    expect(loadPlants()).toEqual([]);
  });

  it('valid plant with valid care log loads successfully', () => {
    savePlants([validPlantWithLog]);

    const result = loadPlants();
    expect(result).toHaveLength(1);
    expect(result[0].careLogs).toHaveLength(1);
    expect(result[0].careLogs[0].type).toBe('watering');
  });

  it('getItem throwing returns []', () => {
    const error = new Error('Storage unavailable');
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw error;
    });

    const result = loadPlants();

    vi.restoreAllMocks();
    expect(result).toEqual([]);
  });

  it('setItem throwing does not throw from savePlants', () => {
    const error = new Error('Storage full');
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw error;
    });

    expect(() => savePlants([validPlant])).not.toThrow();

    vi.restoreAllMocks();
  });
});
