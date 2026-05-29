import type { Plant } from './types';

function plantImage(emoji: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#dbeed2"/>
      <stop offset="100%" style="stop-color:#f8e9b6"/>
    </linearGradient></defs>
    <rect width="400" height="300" rx="24" fill="url(#g)"/>
    <text x="200" y="185" text-anchor="middle" font-size="80">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function createDemoData(): Plant[] {
  return [
    {
      id: 'demo-1',
      name: '蝴蝶兰',
      image: plantImage('🦋'),
      wateringIntervalDays: 7,
      fertilizingIntervalDays: 14,
      nextWateringDate: '2026-05-22',
      nextFertilizingDate: '2026-05-29',
      careLogs: [
        { id: 'log-d1', plantId: 'demo-1', type: 'watering', date: '2026-05-22' },
        { id: 'log-d2', plantId: 'demo-1', type: 'fertilizing', date: '2026-05-22' },
        { id: 'log-d3', plantId: 'demo-1', type: 'watering', date: '2026-05-15' },
      ],
    },
    {
      id: 'demo-2',
      name: '茉莉花',
      image: plantImage('🌼'),
      wateringIntervalDays: 3,
      fertilizingIntervalDays: null,
      nextWateringDate: '2026-05-29',
      nextFertilizingDate: null,
      careLogs: [
        { id: 'log-d4', plantId: 'demo-2', type: 'watering', date: '2026-05-29' },
        { id: 'log-d5', plantId: 'demo-2', type: 'watering', date: '2026-05-26' },
        { id: 'log-d6', plantId: 'demo-2', type: 'watering', date: '2026-05-23' },
      ],
    },
    {
      id: 'demo-3',
      name: '发财树',
      wateringIntervalDays: 5,
      fertilizingIntervalDays: 20,
      nextWateringDate: '2026-05-29',
      nextFertilizingDate: '2026-06-04',
      careLogs: [
        { id: 'log-d7', plantId: 'demo-3', type: 'watering', date: '2026-05-24' },
        { id: 'log-d8', plantId: 'demo-3', type: 'fertilizing', date: '2026-05-15' },
      ],
    },
    {
      id: 'demo-4',
      name: '多肉',
      image: plantImage('🌵'),
      wateringIntervalDays: 10,
      fertilizingIntervalDays: 30,
      nextWateringDate: '2026-06-01',
      nextFertilizingDate: '2026-05-28',
      careLogs: [
        { id: 'log-d9', plantId: 'demo-4', type: 'fertilizing', date: '2026-05-28' },
        { id: 'log-da', plantId: 'demo-4', type: 'watering', date: '2026-05-22' },
      ],
    },
    {
      id: 'demo-5',
      name: '彩叶芋',
      wateringIntervalDays: 2,
      fertilizingIntervalDays: 14,
      nextWateringDate: '2026-05-31',
      nextFertilizingDate: '2026-06-08',
      careLogs: [
        { id: 'log-db', plantId: 'demo-5', type: 'watering', date: '2026-05-29' },
        { id: 'log-dc', plantId: 'demo-5', type: 'fertilizing', date: '2026-05-25' },
        { id: 'log-dd', plantId: 'demo-5', type: 'watering', date: '2026-05-28' },
        { id: 'log-de', plantId: 'demo-5', type: 'watering', date: '2026-05-26' },
      ],
    },
    {
      id: 'demo-6',
      name: '绿萝',
      wateringIntervalDays: 3,
      fertilizingIntervalDays: null,
      nextWateringDate: '2026-05-26',
      nextFertilizingDate: null,
      careLogs: [
        { id: 'log-df', plantId: 'demo-6', type: 'watering', date: '2026-05-26' },
        { id: 'log-dg', plantId: 'demo-6', type: 'watering', date: '2026-05-23' },
      ],
    },
  ];
}
