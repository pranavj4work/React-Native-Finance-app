import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { monthlyTotals } from '@/utils/transactions';

export function useMonthlySummary(month: string) {
  const transactions = useFinanceStore((state) => state.transactions);
  return useMemo(() => monthlyTotals(transactions, month), [transactions, month]);
}
