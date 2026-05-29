# Garden Housekeeper H5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal H5 flower care app that tracks watering/fertilizing schedules, local history, and overdue/today/next-3-days care tasks.

**Architecture:** Use a mobile-first Vite React TypeScript single-page app with pure domain modules for dates, task grouping, storage, and plant actions. UI state lives in the top-level React app and persists to `localStorage`; no backend, login, router, or external state library is needed for the MVP. Layouts default to single-column phone H5 views with fixed bottom navigation, safe-area spacing, and touch targets of at least 44px.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library, jsdom, browser `localStorage`, CSS modules via plain CSS.

---

## File Structure

Create these files:

- `package.json` — scripts and dependencies.
- `index.html` — Vite HTML entry.
- `vite.config.ts` — Vite + React + Vitest config.
- `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` — TypeScript config.
- `src/main.tsx` — React entry point.
- `src/App.tsx` — top-level app state, navigation, and modal orchestration.
- `src/App.test.tsx` — integration tests for key user flows.
- `src/styles.css` — hand-journal visual style.
- `src/test/setup.ts` — Testing Library setup.
- `src/domain/types.ts` — shared plant, care log, task, and form types.
- `src/domain/dates.ts` — date formatting, date math, and status labels.
- `src/domain/dates.test.ts` — tests for date rules.
- `src/domain/careTasks.ts` — generate and group watering/fertilizing tasks.
- `src/domain/careTasks.test.ts` — tests for task grouping.
- `src/domain/plantActions.ts` — create, update, and record-care pure functions.
- `src/domain/plantActions.test.ts` — tests for plant actions and duplicate same-day detection.
- `src/domain/storage.ts` — localStorage load/save helpers.
- `src/domain/storage.test.ts` — tests for persistence helpers.
- `src/components/TaskBoard.tsx` — homepage task tabs and task cards.
- `src/components/PlantArchive.tsx` — plant archive list and add entry.
- `src/components/PlantDetail.tsx` — plant detail, quick care actions, and history.
- `src/components/PlantForm.tsx` — add/edit plant form with optional image upload.

Keep domain files framework-free so most logic is unit-tested without rendering React.

---

### Task 1: Scaffold Vite React TypeScript App

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.app.json`
- Create: `tsconfig.node.json`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "garden-housekeeper-h5",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "latest",
    "@testing-library/react": "latest",
    "@testing-library/user-event": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "jsdom": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>花园管家</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript and Vite configs**

`vite.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
});
```

`tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

`tsconfig.app.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vite/client", "vitest/globals"]
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "skipLibCheck": true,
    "types": ["node"],
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create minimal React entry**

`src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

`src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">花园管家</p>
        <h1>今天也照顾好你的小花园</h1>
      </section>
    </main>
  );
}
```

`src/styles.css`:

```css
:root {
  color: #314137;
  background: #fbf6e9;
  font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(174, 214, 176, 0.32), transparent 32rem),
    #fbf6e9;
}

button,
input,
select {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  width: min(100%, 430px);
  min-height: 100vh;
  margin: 0 auto;
  padding: max(18px, env(safe-area-inset-top)) 14px calc(96px + env(safe-area-inset-bottom));
}

.hero-card {
  border: 1px solid rgba(119, 154, 122, 0.24);
  border-radius: 28px;
  padding: 22px;
  background: rgba(255, 252, 242, 0.88);
  box-shadow: 0 18px 48px rgba(83, 103, 79, 0.12);
}

.eyebrow {
  margin: 0 0 8px;
  color: #6d8f72;
  font-size: 14px;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
}
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 5: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and npm exits successfully.

- [ ] **Step 6: Run build**

Run:

```bash
npm run build
```

Expected: PASS and `dist/` is generated.

- [ ] **Step 7: Commit if the project is in git**

If `git status` reports a repository, run:

```bash
git add package.json package-lock.json index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json src/main.tsx src/App.tsx src/styles.css src/test/setup.ts
git commit -m "chore: scaffold garden housekeeper app"
```

If `git status` reports `not a git repository`, skip this commit step.

---

### Task 2: Date Utilities

**Files:**
- Create: `src/domain/dates.test.ts`
- Create: `src/domain/dates.ts`

- [ ] **Step 1: Write failing date utility tests**

`src/domain/dates.test.ts`:

```ts
import { addDays, compareDateOnly, daysBetween, formatDate, getTaskDateLabel, parseDate } from './dates';

describe('date utilities', () => {
  it('formats and parses local date strings', () => {
    const date = parseDate('2026-05-08');

    expect(formatDate(date)).toBe('2026-05-08');
  });

  it('adds calendar days without mutating the original date', () => {
    const original = parseDate('2026-05-08');
    const next = addDays(original, 3);

    expect(formatDate(original)).toBe('2026-05-08');
    expect(formatDate(next)).toBe('2026-05-11');
  });

  it('compares date-only values', () => {
    expect(compareDateOnly('2026-05-07', '2026-05-08')).toBe(-1);
    expect(compareDateOnly('2026-05-08', '2026-05-08')).toBe(0);
    expect(compareDateOnly('2026-05-09', '2026-05-08')).toBe(1);
  });

  it('calculates day differences', () => {
    expect(daysBetween('2026-05-08', '2026-05-11')).toBe(3);
    expect(daysBetween('2026-05-11', '2026-05-08')).toBe(-3);
  });

  it('labels overdue, today, and future task dates', () => {
    expect(getTaskDateLabel('2026-05-06', '2026-05-08')).toBe('已逾期 2 天');
    expect(getTaskDateLabel('2026-05-08', '2026-05-08')).toBe('今天');
    expect(getTaskDateLabel('2026-05-10', '2026-05-08')).toBe('2 天后');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/dates.test.ts
```

Expected: FAIL because `src/domain/dates.ts` does not exist.

- [ ] **Step 3: Implement date utilities**

`src/domain/dates.ts`:

```ts
const dayInMilliseconds = 24 * 60 * 60 * 1000;

export function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayString(): string {
  return formatDate(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addDaysToString(date: string, days: number): string {
  return formatDate(addDays(parseDate(date), days));
}

export function compareDateOnly(left: string, right: string): -1 | 0 | 1 {
  const leftTime = parseDate(left).getTime();
  const rightTime = parseDate(right).getTime();

  if (leftTime < rightTime) return -1;
  if (leftTime > rightTime) return 1;
  return 0;
}

export function daysBetween(startDate: string, endDate: string): number {
  return Math.round((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / dayInMilliseconds);
}

export function getTaskDateLabel(targetDate: string, today: string): string {
  const delta = daysBetween(today, targetDate);

  if (delta < 0) return `已逾期 ${Math.abs(delta)} 天`;
  if (delta === 0) return '今天';
  return `${delta} 天后`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/domain/dates.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit if the project is in git**

```bash
git add src/domain/dates.ts src/domain/dates.test.ts
git commit -m "feat: add care date utilities"
```

Skip if this is not a git repository.

---

### Task 3: Domain Types and Care Task Grouping

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/careTasks.test.ts`
- Create: `src/domain/careTasks.ts`

- [ ] **Step 1: Create shared domain types**

`src/domain/types.ts`:

```ts
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
```

- [ ] **Step 2: Write failing care task tests**

`src/domain/careTasks.test.ts`:

```ts
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
```

- [ ] **Step 3: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/careTasks.test.ts
```

Expected: FAIL because `getCareTasks` is not implemented.

- [ ] **Step 4: Implement care task grouping**

`src/domain/careTasks.ts`:

```ts
import { compareDateOnly, daysBetween } from './dates';
import type { CareTask, CareTaskGroup, CareType, Plant } from './types';

function getGroup(dueDate: string, today: string): CareTaskGroup | null {
  const comparison = compareDateOnly(dueDate, today);

  if (comparison < 0) return 'overdue';
  if (comparison === 0) return 'today';

  const daysUntilDue = daysBetween(today, dueDate);
  return daysUntilDue <= 3 ? 'next3days' : null;
}

function createTask(plant: Plant, type: CareType, dueDate: string, today: string): CareTask | null {
  const group = getGroup(dueDate, today);
  if (!group) return null;

  return {
    id: `${plant.id}-${type}`,
    plantId: plant.id,
    plantName: plant.name,
    plantImage: plant.image,
    type,
    dueDate,
    group,
  };
}

export function getCareTasks(plants: Plant[], today: string): CareTask[] {
  return plants
    .flatMap((plant) => {
      const tasks: Array<CareTask | null> = [
        createTask(plant, 'watering', plant.nextWateringDate, today),
      ];

      if (plant.nextFertilizingDate) {
        tasks.push(createTask(plant, 'fertilizing', plant.nextFertilizingDate, today));
      }

      return tasks.filter((task): task is CareTask => task !== null);
    })
    .sort((left, right) => {
      const dateComparison = compareDateOnly(left.dueDate, right.dueDate);
      if (dateComparison !== 0) return dateComparison;
      return left.plantName.localeCompare(right.plantName, 'zh-CN');
    });
}

export function getTasksByGroup(plants: Plant[], today: string, group: CareTaskGroup): CareTask[] {
  return getCareTasks(plants, today).filter((task) => task.group === group);
}

export function countTodayTasks(plants: Plant[], today: string): number {
  return getTasksByGroup(plants, today, 'today').length;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm test -- src/domain/careTasks.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit if the project is in git**

```bash
git add src/domain/types.ts src/domain/careTasks.ts src/domain/careTasks.test.ts
git commit -m "feat: group plant care tasks"
```

Skip if this is not a git repository.

---

### Task 4: Plant Actions

**Files:**
- Create: `src/domain/plantActions.test.ts`
- Create: `src/domain/plantActions.ts`

- [ ] **Step 1: Write failing plant action tests**

`src/domain/plantActions.test.ts`:

```ts
import { createPlant, hasSameDayCareLog, recordCare, updatePlant } from './plantActions';
import type { Plant } from './types';

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/plantActions.test.ts
```

Expected: FAIL because `plantActions.ts` does not exist.

- [ ] **Step 3: Implement plant actions**

`src/domain/plantActions.ts`:

```ts
import { addDaysToString } from './dates';
import type { CareLog, CareType, Plant, PlantFormValues } from './types';

export function createId(): string {
  return crypto.randomUUID();
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
    return plant;
  }

  return {
    ...plant,
    nextFertilizingDate: addDaysToString(today, plant.fertilizingIntervalDays),
    careLogs: [log, ...plant.careLogs],
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/domain/plantActions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit if the project is in git**

```bash
git add src/domain/plantActions.ts src/domain/plantActions.test.ts
git commit -m "feat: add plant care actions"
```

Skip if this is not a git repository.

---

### Task 5: Local Storage Persistence

**Files:**
- Create: `src/domain/storage.test.ts`
- Create: `src/domain/storage.ts`

- [ ] **Step 1: Write failing storage tests**

`src/domain/storage.test.ts`:

```ts
import type { Plant } from './types';
import { loadPlants, savePlants } from './storage';

const plants: Plant[] = [
  {
    id: 'plant-1',
    name: '绿萝',
    wateringIntervalDays: 3,
    fertilizingIntervalDays: null,
    nextWateringDate: '2026-05-11',
    nextFertilizingDate: null,
    careLogs: [],
  },
];

describe('plant storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an empty list when storage is empty', () => {
    expect(loadPlants()).toEqual([]);
  });

  it('saves and loads plants', () => {
    savePlants(plants);

    expect(loadPlants()).toEqual(plants);
  });

  it('returns an empty list when storage contains invalid json', () => {
    localStorage.setItem('garden-housekeeper-plants', 'not json');

    expect(loadPlants()).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/domain/storage.test.ts
```

Expected: FAIL because `storage.ts` does not exist.

- [ ] **Step 3: Implement storage helpers**

`src/domain/storage.ts`:

```ts
import type { Plant } from './types';

const storageKey = 'garden-housekeeper-plants';

export function loadPlants(): Plant[] {
  const rawValue = localStorage.getItem(storageKey);

  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function savePlants(plants: Plant[]): void {
  localStorage.setItem(storageKey, JSON.stringify(plants));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/domain/storage.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit if the project is in git**

```bash
git add src/domain/storage.ts src/domain/storage.test.ts
git commit -m "feat: persist plants locally"
```

Skip if this is not a git repository.

---

### Task 6: Plant Form Component

**Files:**
- Create: `src/components/PlantForm.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create plant form component**

`src/components/PlantForm.tsx`:

```tsx
import { useState } from 'react';
import type { Plant, PlantFormValues } from '../domain/types';

interface PlantFormProps {
  plant?: Plant;
  onSubmit: (values: PlantFormValues) => void;
  onCancel: () => void;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function PlantForm({ plant, onSubmit, onCancel }: PlantFormProps) {
  const [name, setName] = useState(plant?.name ?? '');
  const [image, setImage] = useState<string | undefined>(plant?.image);
  const [wateringIntervalDays, setWateringIntervalDays] = useState(String(plant?.wateringIntervalDays ?? 3));
  const [fertilizingEnabled, setFertilizingEnabled] = useState(plant?.fertilizingIntervalDays !== null);
  const [fertilizingIntervalDays, setFertilizingIntervalDays] = useState(String(plant?.fertilizingIntervalDays ?? 14));

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(await readFileAsDataUrl(file));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      name,
      image,
      wateringIntervalDays: Number(wateringIntervalDays),
      fertilizingIntervalDays: fertilizingEnabled ? Number(fertilizingIntervalDays) : null,
    });
  }

  return (
    <form className="sheet-card form-stack" onSubmit={handleSubmit} aria-label={plant ? '编辑花草' : '新增花草'}>
      <label>
        花草名称
        <input value={name} onChange={(event) => setName(event.target.value)} required placeholder="比如：绿萝" />
      </label>

      <label>
        浇水周期（天）
        <input
          type="number"
          min="1"
          value={wateringIntervalDays}
          onChange={(event) => setWateringIntervalDays(event.target.value)}
          required
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={fertilizingEnabled}
          onChange={(event) => setFertilizingEnabled(event.target.checked)}
        />
        需要施肥提醒
      </label>

      {fertilizingEnabled ? (
        <label>
          施肥周期（天）
          <input
            type="number"
            min="1"
            value={fertilizingIntervalDays}
            onChange={(event) => setFertilizingIntervalDays(event.target.value)}
            required
          />
        </label>
      ) : null}

      <label>
        花草图片（可选）
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </label>

      {image ? <img className="image-preview" src={image} alt="花草预览" /> : null}

      <div className="button-row">
        <button className="secondary-button" type="button" onClick={onCancel}>取消</button>
        <button className="primary-button" type="submit">保存</button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Append form styles to `src/styles.css`**

```css
.sheet-card {
  border: 1px solid rgba(119, 154, 122, 0.22);
  border-radius: 24px;
  background: rgba(255, 252, 242, 0.92);
  box-shadow: 0 12px 34px rgba(83, 103, 79, 0.1);
}

.form-stack {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.form-stack label {
  display: grid;
  gap: 8px;
  color: #506252;
  font-weight: 700;
}

.form-stack input[type="text"],
.form-stack input[type="number"],
.form-stack input:not([type]) {
  width: 100%;
  border: 1px solid #d8cfae;
  border-radius: 16px;
  padding: 12px 14px;
  background: #fffdf7;
  color: #314137;
}

.checkbox-row {
  display: flex !important;
  grid-template-columns: unset !important;
  align-items: center;
  gap: 10px !important;
}

.image-preview {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  border-radius: 18px;
}

.button-row {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.primary-button,
.secondary-button,
.ghost-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 800;
}

.primary-button {
  background: #6f9b72;
  color: white;
}

.secondary-button {
  background: #efe7cd;
  color: #566247;
}

.ghost-button {
  background: rgba(111, 155, 114, 0.12);
  color: #4f7a55;
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit if the project is in git**

```bash
git add src/components/PlantForm.tsx src/styles.css
git commit -m "feat: add plant form"
```

Skip if this is not a git repository.

---

### Task 7: Task Board Component

**Files:**
- Create: `src/components/TaskBoard.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create task board component**

`src/components/TaskBoard.tsx`:

```tsx
import { getTaskDateLabel } from '../domain/dates';
import type { CareTask, CareTaskGroup, CareType } from '../domain/types';

interface TaskBoardProps {
  today: string;
  todayCount: number;
  selectedGroup: CareTaskGroup;
  tasks: CareTask[];
  hasPlants: boolean;
  onGroupChange: (group: CareTaskGroup) => void;
  onComplete: (plantId: string, type: CareType) => void;
  onOpenPlant: (plantId: string) => void;
  onAddPlant: () => void;
}

const groups: Array<{ value: CareTaskGroup; label: string }> = [
  { value: 'overdue', label: '逾期' },
  { value: 'today', label: '今天' },
  { value: 'next3days', label: '未来 3 天' },
];

const careLabels: Record<CareType, string> = {
  watering: '浇水',
  fertilizing: '施肥',
};

export default function TaskBoard({
  today,
  todayCount,
  selectedGroup,
  tasks,
  hasPlants,
  onGroupChange,
  onComplete,
  onOpenPlant,
  onAddPlant,
}: TaskBoardProps) {
  return (
    <section className="page-stack">
      <div className="hero-card">
        <p className="eyebrow">今日照顾</p>
        <h1>{todayCount > 0 ? `今天有 ${todayCount} 件养护小事` : '今天的小花园很安稳'}</h1>
      </div>

      <div className="tab-row" role="tablist" aria-label="任务分组">
        {groups.map((group) => (
          <button
            key={group.value}
            type="button"
            className={group.value === selectedGroup ? 'tab-button active' : 'tab-button'}
            onClick={() => onGroupChange(group.value)}
          >
            {group.label}
          </button>
        ))}
      </div>

      <div className="page-stack">
        {!hasPlants ? (
          <div className="empty-card">
            <p>先添加第一盆花吧</p>
            <button className="primary-button" type="button" onClick={onAddPlant}>新增花草</button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-card">这几天它们都还好</div>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className={task.group === 'overdue' ? 'task-card overdue' : 'task-card'}>
              <button className="task-main" type="button" onClick={() => onOpenPlant(task.plantId)}>
                <span className="task-icon">{task.type === 'watering' ? '💧' : '🌿'}</span>
                <span>
                  <strong>{task.plantName}</strong>
                  <small>{careLabels[task.type]} · {getTaskDateLabel(task.dueDate, today)}</small>
                </span>
              </button>
              <button className="primary-button" type="button" onClick={() => onComplete(task.plantId, task.type)}>
                已{careLabels[task.type]}
              </button>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Append task board styles to `src/styles.css`**

```css
.page-stack {
  display: grid;
  gap: 16px;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-radius: 999px;
  padding: 6px;
  background: rgba(239, 231, 205, 0.85);
}

.tab-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 8px;
  background: transparent;
  color: #68735e;
  font-weight: 800;
}

.tab-button.active {
  background: #fffdf7;
  color: #426b46;
  box-shadow: 0 6px 16px rgba(83, 103, 79, 0.12);
}

.task-card {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(119, 154, 122, 0.2);
  border-radius: 22px;
  padding: 14px;
  background: rgba(255, 252, 242, 0.92);
  box-shadow: 0 10px 24px rgba(83, 103, 79, 0.08);
}

.task-card.overdue {
  border-color: rgba(217, 132, 91, 0.38);
  background: #fff4ea;
}

.task-main {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 0;
  padding: 0;
  background: transparent;
  color: inherit;
  text-align: left;
}

.task-main strong,
.task-main small {
  display: block;
}

.task-main small {
  margin-top: 4px;
  color: #72806a;
}

.task-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 16px;
  background: #edf5e8;
}

.empty-card {
  border: 1px dashed rgba(119, 154, 122, 0.38);
  border-radius: 24px;
  padding: 28px 18px;
  background: rgba(255, 252, 242, 0.72);
  color: #708068;
  text-align: center;
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit if the project is in git**

```bash
git add src/components/TaskBoard.tsx src/styles.css
git commit -m "feat: add care task board"
```

Skip if this is not a git repository.

---

### Task 8: Archive and Detail Components

**Files:**
- Create: `src/components/PlantArchive.tsx`
- Create: `src/components/PlantDetail.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Create plant archive component**

`src/components/PlantArchive.tsx`:

```tsx
import type { Plant } from '../domain/types';

interface PlantArchiveProps {
  plants: Plant[];
  onAddPlant: () => void;
  onOpenPlant: (plantId: string) => void;
}

export default function PlantArchive({ plants, onAddPlant, onOpenPlant }: PlantArchiveProps) {
  return (
    <section className="page-stack">
      <div className="section-heading">
        <div>
          <p className="eyebrow">花草档案</p>
          <h1>我的小花园</h1>
        </div>
        <button className="primary-button" type="button" onClick={onAddPlant}>新增</button>
      </div>

      {plants.length === 0 ? (
        <div className="empty-card">先添加第一盆花吧</div>
      ) : (
        <div className="plant-grid">
          {plants.map((plant) => (
            <button key={plant.id} className="plant-card" type="button" onClick={() => onOpenPlant(plant.id)}>
              {plant.image ? <img src={plant.image} alt={plant.name} /> : <div className="plant-placeholder">🌱</div>}
              <strong>{plant.name}</strong>
              <small>下次浇水：{plant.nextWateringDate}</small>
              {plant.nextFertilizingDate ? <small>下次施肥：{plant.nextFertilizingDate}</small> : null}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Create plant detail component**

`src/components/PlantDetail.tsx`:

```tsx
import type { CareType, Plant } from '../domain/types';

interface PlantDetailProps {
  plant: Plant;
  onBack: () => void;
  onEdit: () => void;
  onRecordCare: (plantId: string, type: CareType) => void;
}

const careLabels: Record<CareType, string> = {
  watering: '浇水',
  fertilizing: '施肥',
};

export default function PlantDetail({ plant, onBack, onEdit, onRecordCare }: PlantDetailProps) {
  return (
    <section className="page-stack">
      <button className="ghost-button back-button" type="button" onClick={onBack}>返回</button>

      <article className="detail-card">
        {plant.image ? <img src={plant.image} alt={plant.name} /> : <div className="detail-placeholder">🌿</div>}
        <div>
          <p className="eyebrow">花草详情</p>
          <h1>{plant.name}</h1>
          <p>浇水周期：每 {plant.wateringIntervalDays} 天</p>
          <p>{plant.fertilizingIntervalDays === null ? '施肥提醒：已关闭' : `施肥周期：每 ${plant.fertilizingIntervalDays} 天`}</p>
        </div>
      </article>

      <div className="button-row detail-actions">
        <button className="primary-button" type="button" onClick={() => onRecordCare(plant.id, 'watering')}>记录浇水</button>
        {plant.fertilizingIntervalDays !== null ? (
          <button className="primary-button" type="button" onClick={() => onRecordCare(plant.id, 'fertilizing')}>记录施肥</button>
        ) : null}
        <button className="secondary-button" type="button" onClick={onEdit}>编辑</button>
      </div>

      <section className="sheet-card history-card">
        <h2>养护历史</h2>
        {plant.careLogs.length === 0 ? (
          <p className="muted">还没有记录</p>
        ) : (
          <ol className="timeline">
            {plant.careLogs.map((log) => (
              <li key={log.id}>
                <span>{log.type === 'watering' ? '💧' : '🌿'}</span>
                <strong>{log.date}</strong>
                <small>{careLabels[log.type]}</small>
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  );
}
```

- [ ] **Step 3: Append archive/detail styles to `src/styles.css`**

```css
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.plant-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.plant-card {
  display: grid;
  gap: 8px;
  border: 1px solid rgba(119, 154, 122, 0.2);
  border-radius: 22px;
  padding: 12px;
  background: rgba(255, 252, 242, 0.92);
  color: inherit;
  text-align: left;
  box-shadow: 0 10px 24px rgba(83, 103, 79, 0.08);
}

.plant-card img,
.plant-placeholder {
  width: 100%;
  height: 112px;
  border-radius: 18px;
}

.plant-card img {
  object-fit: cover;
}

.plant-placeholder,
.detail-placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #dbeed2, #f8e9b6);
  font-size: 34px;
}

.plant-card small {
  color: #72806a;
}

.back-button {
  justify-self: start;
}

.detail-card {
  display: grid;
  gap: 16px;
  border-radius: 28px;
  padding: 16px;
  background: rgba(255, 252, 242, 0.92);
  box-shadow: 0 12px 34px rgba(83, 103, 79, 0.1);
}

.detail-card img,
.detail-placeholder {
  width: 100%;
  height: 180px;
  border-radius: 24px;
  object-fit: cover;
}

.detail-card p {
  margin: 6px 0 0;
  color: #64745f;
}

.detail-actions {
  justify-content: flex-start;
  flex-wrap: wrap;
}

.history-card {
  padding: 18px;
}

.history-card h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.muted {
  color: #72806a;
}

.timeline {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  padding: 10px 12px;
  background: #f8f1db;
}
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit if the project is in git**

```bash
git add src/components/PlantArchive.tsx src/components/PlantDetail.tsx src/styles.css
git commit -m "feat: add plant archive and detail"
```

Skip if this is not a git repository.

---

### Task 9: Wire App State, Navigation, and Persistence

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] **Step 1: Replace `src/App.tsx` with the full app**

```tsx
import { useEffect, useMemo, useState } from 'react';
import PlantArchive from './components/PlantArchive';
import PlantDetail from './components/PlantDetail';
import PlantForm from './components/PlantForm';
import TaskBoard from './components/TaskBoard';
import { countTodayTasks, getTasksByGroup } from './domain/careTasks';
import { todayString } from './domain/dates';
import { createPlant, hasSameDayCareLog, recordCare, updatePlant } from './domain/plantActions';
import { loadPlants, savePlants } from './domain/storage';
import type { CareTaskGroup, CareType, Plant, PlantFormValues, View } from './domain/types';

type Modal = 'none' | 'add' | 'edit';

export default function App() {
  const [plants, setPlants] = useState<Plant[]>(() => loadPlants());
  const [view, setView] = useState<View>('tasks');
  const [selectedGroup, setSelectedGroup] = useState<CareTaskGroup>('today');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>('none');
  const today = todayString();

  useEffect(() => {
    savePlants(plants);
  }, [plants]);

  const selectedPlant = plants.find((plant) => plant.id === selectedPlantId) ?? null;
  const currentTasks = useMemo(
    () => getTasksByGroup(plants, today, selectedGroup),
    [plants, selectedGroup, today],
  );
  const todayCount = useMemo(() => countTodayTasks(plants, today), [plants, today]);

  function openPlant(plantId: string) {
    setSelectedPlantId(plantId);
    setView('detail');
    setModal('none');
  }

  function openAddForm() {
    setModal('add');
  }

  function openEditForm() {
    setModal('edit');
  }

  function closeForm() {
    setModal('none');
  }

  function handleCreatePlant(values: PlantFormValues) {
    setPlants((currentPlants) => [...currentPlants, createPlant(values, today)]);
    setModal('none');
    setView('archive');
  }

  function handleUpdatePlant(values: PlantFormValues) {
    if (!selectedPlant) return;

    setPlants((currentPlants) =>
      currentPlants.map((plant) => (plant.id === selectedPlant.id ? updatePlant(plant, values, today) : plant)),
    );
    setModal('none');
  }

  function handleRecordCare(plantId: string, type: CareType) {
    const plant = plants.find((currentPlant) => currentPlant.id === plantId);
    if (!plant) return;

    if (hasSameDayCareLog(plant, type, today)) {
      const confirmed = window.confirm('今天已经记录过这项养护，要再记录一次吗？');
      if (!confirmed) return;
    }

    setPlants((currentPlants) =>
      currentPlants.map((currentPlant) =>
        currentPlant.id === plantId ? recordCare(currentPlant, type, today) : currentPlant,
      ),
    );
  }

  function renderContent() {
    if (modal === 'add') {
      return <PlantForm onSubmit={handleCreatePlant} onCancel={closeForm} />;
    }

    if (modal === 'edit' && selectedPlant) {
      return <PlantForm plant={selectedPlant} onSubmit={handleUpdatePlant} onCancel={closeForm} />;
    }

    if (view === 'archive') {
      return <PlantArchive plants={plants} onAddPlant={openAddForm} onOpenPlant={openPlant} />;
    }

    if (view === 'detail' && selectedPlant) {
      return (
        <PlantDetail
          plant={selectedPlant}
          onBack={() => setView('archive')}
          onEdit={openEditForm}
          onRecordCare={handleRecordCare}
        />
      );
    }

    return (
      <TaskBoard
        today={today}
        todayCount={todayCount}
        selectedGroup={selectedGroup}
        tasks={currentTasks}
        hasPlants={plants.length > 0}
        onGroupChange={setSelectedGroup}
        onComplete={handleRecordCare}
        onOpenPlant={openPlant}
        onAddPlant={openAddForm}
      />
    );
  }

  return (
    <main className="app-shell">
      {renderContent()}

      <nav className="bottom-nav" aria-label="主导航">
        <button
          type="button"
          className={view === 'tasks' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => {
            setView('tasks');
            setModal('none');
          }}
        >
          今日照顾
        </button>
        <button
          type="button"
          className={view === 'archive' && modal === 'none' ? 'nav-button active' : 'nav-button'}
          onClick={() => {
            setView('archive');
            setModal('none');
          }}
        >
          花草档案
        </button>
      </nav>
    </main>
  );
}
```

- [ ] **Step 2: Append bottom navigation styles to `src/styles.css`**

```css
.bottom-nav {
  position: fixed;
  right: 14px;
  bottom: max(12px, env(safe-area-inset-bottom));
  left: 14px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: min(calc(100% - 28px), 402px);
  margin: 0 auto;
  border: 1px solid rgba(119, 154, 122, 0.2);
  border-radius: 999px;
  padding: 8px;
  background: rgba(255, 252, 242, 0.94);
  box-shadow: 0 16px 42px rgba(83, 103, 79, 0.18);
  backdrop-filter: blur(16px);
}

.nav-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 10px;
  background: transparent;
  color: #68735e;
  font-weight: 900;
}

.nav-button.active {
  background: #6f9b72;
  color: white;
}
```

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Commit if the project is in git**

```bash
git add src/App.tsx src/styles.css
git commit -m "feat: wire garden housekeeper app"
```

Skip if this is not a git repository.

---

### Task 10: Integration Tests for MVP Flows

**Files:**
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write integration tests**

`src/App.test.tsx`:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Plant } from './domain/types';

function setPlants(plants: Plant[]) {
  localStorage.setItem('garden-housekeeper-plants', JSON.stringify(plants));
}

describe('Garden Housekeeper app', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 8));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates a plant and shows it in the archive', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);

    await user.click(screen.getByRole('button', { name: '新增花草' }));
    await user.type(screen.getByLabelText('花草名称'), '绿萝');
    await user.clear(screen.getByLabelText('浇水周期（天）'));
    await user.type(screen.getByLabelText('浇水周期（天）'), '3');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByText('绿萝')).toBeInTheDocument();
    expect(screen.getByText('下次浇水：2026-05-11')).toBeInTheDocument();
  });

  it('shows overdue, today, and next 3 days task groups', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
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

    await user.click(screen.getByRole('button', { name: '逾期' }));
    expect(screen.getByText('浇水 · 已逾期 1 天')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '未来 3 天' }));
    expect(screen.getByText('薄荷')).toBeInTheDocument();
    expect(screen.getByText('浇水 · 2 天后')).toBeInTheDocument();
  });

  it('records care from the homepage and updates detail history', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
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

    await user.click(screen.getByRole('button', { name: '已浇水' }));
    expect(screen.getByText('这几天它们都还好')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '花草档案' }));
    await user.click(screen.getByRole('button', { name: /小玫瑰/ }));

    expect(screen.getByText('2026-05-08')).toBeInTheDocument();
    expect(screen.getByText('浇水')).toBeInTheDocument();
  });

  it('confirms before duplicate same-day care records', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    setPlants([
      {
        id: 'plant-1',
        name: '小玫瑰',
        wateringIntervalDays: 2,
        fertilizingIntervalDays: null,
        nextWateringDate: '2026-05-08',
        nextFertilizingDate: null,
        careLogs: [
          {
            id: 'log-1',
            plantId: 'plant-1',
            type: 'watering',
            date: '2026-05-08',
          },
        ],
      },
    ]);

    render(<App />);

    await user.click(screen.getByRole('button', { name: '已浇水' }));

    expect(window.confirm).toHaveBeenCalledWith('今天已经记录过这项养护，要再记录一次吗？');
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

    expect(localStorage.getItem('garden-housekeeper-plants')).toContain('绿萝');
  });
});
```

- [ ] **Step 2: Run integration tests**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: PASS. If a query fails because multiple elements match the same text, narrow it with `within()` around the relevant card instead of weakening the assertion.

- [ ] **Step 3: Run all tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 4: Commit if the project is in git**

```bash
git add src/App.test.tsx
git commit -m "test: cover garden housekeeper flows"
```

Skip if this is not a git repository.

---

### Task 11: Manual Browser Verification

**Files:**
- No code changes expected unless verification finds a bug.

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local server URL.

- [ ] **Step 2: Open the app in a mobile-sized browser**

Open the Vite local URL in Playwright or a normal browser, then set the viewport to a phone size such as 390 × 844.

Expected: The app shows the hand-journal styled “今日照顾” homepage in a single-column mobile layout with the bottom navigation visible.

- [ ] **Step 3: Verify empty state and add flow**

Actions:

1. Confirm the homepage shows “先添加第一盆花吧”.
2. Click “新增花草”.
3. Add `绿萝`, watering interval `3`, fertilizing interval `14`.
4. Save.

Expected:

- The app returns to “花草档案”.
- The plant card shows `绿萝`.
- The card shows next watering as today + 3 days.
- The card shows next fertilizing as today + 14 days.

- [ ] **Step 4: Verify task filters**

Actions:

1. Add or edit a plant so one care date is today.
2. Go to “今日照顾”.
3. Switch between “逾期”, “今天”, and “未来 3 天”.

Expected:

- Each tab shows only matching tasks.
- Empty tabs show “这几天它们都还好”.

- [ ] **Step 5: Verify quick care and detail history**

Actions:

1. On a visible task, click “已浇水” or “已施肥”.
2. Open the plant from “花草档案”.
3. Check “养护历史”.

Expected:

- The task disappears from the current group if its next date is no longer in that group.
- Detail history contains today’s care record.
- The next date updates to today + the configured interval.

- [ ] **Step 6: Verify duplicate care confirmation**

Actions:

1. In detail, click the same care action again on the same day.
2. Cancel the confirmation.

Expected:

- Browser confirmation appears.
- Canceling does not add another history record.

- [ ] **Step 7: Verify persistence**

Actions:

1. Refresh the browser.
2. Return to “花草档案”.

Expected:

- Added plants and care history remain visible.

- [ ] **Step 8: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit fixes if the project is in git**

If verification required fixes, commit the changed files:

```bash
git add <changed-files>
git commit -m "fix: polish garden housekeeper flows"
```

Skip if this is not a git repository or no fixes were needed.

---

## Self-Review

- Spec coverage: The plan covers local storage, two-tab navigation, detail as a secondary page, add/edit plant, optional image upload, watering/fertilizing intervals with fertilizing disabled, next-date calculation, overdue/today/next-3-days task grouping, homepage and detail care logging, history records, duplicate same-day confirmation, empty states, hand-journal styling, and manual verification.
- Placeholder scan: No `TBD`, `TODO`, “implement later”, or unspecified test/code steps remain.
- Type consistency: Shared names are consistent across tasks: `Plant`, `CareLog`, `CareTask`, `PlantFormValues`, `CareType`, `CareTaskGroup`, `createPlant`, `updatePlant`, `recordCare`, `hasSameDayCareLog`, `getTasksByGroup`, and `countTodayTasks`.
