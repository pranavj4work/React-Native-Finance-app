import { budgetAlerts } from '@/utils/transactions';
import { currentMonth } from '@/utils/dates';

export function currentMonthSafe(): string {
  return currentMonth();
}

export { budgetAlerts };
