import { useMemo } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import type { TransactionFilters } from '@/types';
import { filterTransactions } from '@/utils/transactions';

export function useFilteredTransactions(filters: TransactionFilters) {
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);

  return useMemo(
    () => filterTransactions(transactions, filters, categories),
    [transactions, categories, filters],
  );
}
