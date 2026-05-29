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
