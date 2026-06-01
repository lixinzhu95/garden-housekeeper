import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import type { Plant } from './domain/types';
import { setCurrentUser } from './domain/storage';

function setPlants(plants: Plant[]) {
  localStorage.setItem('garden-housekeeper-plants-test', JSON.stringify(plants));
}

describe('Garden Housekeeper app', () => {
  beforeEach(() => {
    localStorage.clear();
    setCurrentUser('test');
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 8));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('creates a plant and shows it in the archive', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '新增花草' }));
    fireEvent.change(screen.getByLabelText('花草名称'), { target: { value: '绿萝' } });
    fireEvent.change(screen.getByLabelText('浇水周期（天）'), { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('绿萝')).toBeInTheDocument();
    expect(screen.getByText('下次浇水：2026-05-11')).toBeInTheDocument();
  });

  it('shows overdue, today, and next 3 days task groups', async () => {
    setPlants([
      {
        id: 'plant-1',
        name: '小玫瑰',
        wateringIntervalDays: 2,
        fertilizingIntervalDays: 10,
        nextWateringDate: '2026-05-07',
        nextFertilizingDate: '2026-05-08',
        careLogs: [],
      },
      {
        id: 'plant-2',
        name: '薄荷',
        wateringIntervalDays: 3,
        fertilizingIntervalDays: null,
        nextWateringDate: '2026-05-10',
        nextFertilizingDate: null,
        careLogs: [],
      },
    ]);

    render(<App />);

    expect(screen.getByText('今天有 1 件养护小事')).toBeInTheDocument();
    expect(screen.getByText('施肥 · 今天')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '逾期' }));
    expect(screen.getByText('浇水 · 已逾期 1 天')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: '未来 3 天' }));
    expect(screen.getByText('薄荷')).toBeInTheDocument();
    expect(screen.getByText('浇水 · 2 天后')).toBeInTheDocument();
  });

  it('records care from the homepage and updates detail history', async () => {
    setPlants([
      {
        id: 'plant-1',
        name: '小玫瑰',
        wateringIntervalDays: 2,
        fertilizingIntervalDays: null,
        nextWateringDate: '2026-05-08',
        nextFertilizingDate: null,
        careLogs: [],
      },
    ]);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '浇水' }));
    act(() => { vi.advanceTimersByTime(600); });
    expect(screen.getByText('🌼 这几天它们都还好')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '花草档案' }));
    fireEvent.click(screen.getByRole('button', { name: /小玫瑰/ }));

    expect(screen.getByText('2026-05-08')).toBeInTheDocument();
    expect(screen.getByText('浇水')).toBeInTheDocument();
  });

  it('deletes a care log from the detail page', () => {
    setPlants([
      {
        id: 'plant-1',
        name: '小玫瑰',
        wateringIntervalDays: 2,
        fertilizingIntervalDays: null,
        nextWateringDate: '2026-05-08',
        nextFertilizingDate: null,
        careLogs: [
          { id: 'log-1', plantId: 'plant-1', type: 'watering', date: '2026-05-07' },
        ],
      },
    ]);

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: '花草档案' }));
    fireEvent.click(screen.getByRole('button', { name: /小玫瑰/ }));

    expect(screen.getByText('2026-05-07')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '删除2026-05-07的浇水记录' }));

    expect(screen.queryByText('2026-05-07')).toBeNull();
    expect(screen.getByText('📋 还没有记录')).toBeInTheDocument();
  });

  it('persists plants after reload', () => {
    setPlants([
      {
        id: 'plant-1',
        name: '绿萝',
        wateringIntervalDays: 3,
        fertilizingIntervalDays: null,
        nextWateringDate: '2026-05-11',
        nextFertilizingDate: null,
        careLogs: [],
      },
    ]);

    render(<App />);

    expect(localStorage.getItem('garden-housekeeper-plants-test')).toContain('绿萝');
  });
});
