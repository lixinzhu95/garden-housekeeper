import { describe, expect, it } from 'vitest';
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
