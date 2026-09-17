import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { budgetAlerts } from '@/utils/transactions';
import { currentMonth } from '@/utils/dates';

export function useBudgetAlerts(month = currentMonth()) {
  const transactions = useFinanceStore((state) => state.transactions);
  const budgets = useFinanceStore((state) => state.budgets);
  const categories = useFinanceStore((state) => state.categories);

  return useMemo(
    () => budgetAlerts(transactions, budgets, categories, month),
    [transactions, budgets, categories, month],
  );
}
