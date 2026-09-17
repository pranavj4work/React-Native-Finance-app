import dayjs from 'dayjs';

export function todayIso(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function currentMonth(): string {
  return dayjs().format('YYYY-MM');
}

export function monthLabel(month: string): string {
  return dayjs(`${month}-01`).format('MMMM YYYY');
}

export function monthStart(month: string): string {
  return `${month}-01`;
}

export function monthEnd(month: string): string {
  return dayjs(`${month}-01`).endOf('month').format('YYYY-MM-DD');
}

export function addMonths(month: string, delta: number): string {
  return dayjs(`${month}-01`).add(delta, 'month').format('YYYY-MM');
}

export function lastNMonths(n: number, endMonth = currentMonth()): string[] {
  return Array.from({ length: n }, (_, index) => addMonths(endMonth, index - (n - 1)));
}

export function formatDisplayDate(date: string): string {
  const value = dayjs(date);
  const today = dayjs();
  if (value.isSame(today, 'day')) {
    return 'Today';
  }
  if (value.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }
  return value.format('ddd, D MMM YYYY');
}

export function nextRecurringDate(date: string, frequency: 'weekly' | 'monthly'): string {
  if (frequency === 'weekly') {
    return dayjs(date).add(1, 'week').format('YYYY-MM-DD');
  }
  return dayjs(date).add(1, 'month').format('YYYY-MM-DD');
}

export function greeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
