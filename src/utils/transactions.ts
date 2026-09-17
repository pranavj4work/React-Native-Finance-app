import type {
  Budget,
  BudgetAlert,
  Category,
  Transaction,
  TransactionFilters,
  TransactionType,
} from '@/types';
import { monthEnd, monthStart } from '@/utils/dates';

export function sumByType(transactions: Transaction[], type: TransactionType): number {
  return transactions
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

export function inMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((item) => item.date.startsWith(month));
}

export function monthlyTotals(transactions: Transaction[], month: string) {
  const monthTx = inMonth(transactions, month);
  const income = sumByType(monthTx, 'income');
  const expense = sumByType(monthTx, 'expense');
  return { income, expense, balance: income - expense, count: monthTx.length };
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
  categories: Category[],
): Transaction[] {
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]));
  const query = filters.query.trim().toLowerCase();

  let from = filters.from;
  let to = filters.to;
  if (filters.mode === 'month') {
    from = monthStart(filters.month);
    to = monthEnd(filters.month);
  }

  return transactions
    .filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }
      if (filters.mode !== 'all') {
        if (item.date < from || item.date > to) {
          return false;
        }
      }
      if (query) {
        const note = item.note?.toLowerCase() ?? '';
        const category = categoryNames.get(item.categoryId)?.toLowerCase() ?? '';
        if (!note.includes(query) && !category.includes(query)) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date === b.date) {
        return b.createdAt.localeCompare(a.createdAt);
      }
      return b.date.localeCompare(a.date);
    });
}

export function categoryBreakdown(transactions: Transaction[], categories: Category[]) {
  const expenses = transactions.filter((item) => item.type === 'expense');
  const total = sumByType(expenses, 'expense');
  const grouped = new Map<string, number>();

  for (const item of expenses) {
    grouped.set(item.categoryId, (grouped.get(item.categoryId) ?? 0) + item.amount);
  }

  return [...grouped.entries()]
    .map(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);
      return {
        categoryId,
        name: category?.name ?? 'Unknown',
        color: category?.color ?? '#64748B',
        icon: category?.icon ?? 'ellipse',
        amount,
        percent: total === 0 ? 0 : (amount / total) * 100,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function budgetAlerts(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  month: string,
): BudgetAlert[] {
  const monthTx = inMonth(transactions, month).filter((item) => item.type === 'expense');

  return budgets
    .map((budget) => {
      const category = categories.find((item) => item.id === budget.categoryId);
      const spent = monthTx
        .filter((item) => item.categoryId === budget.categoryId)
        .reduce((total, item) => total + item.amount, 0);
      const ratio = budget.monthlyLimit === 0 ? 0 : spent / budget.monthlyLimit;
      const status = ratio >= 1 ? 'over' : ratio >= 0.8 ? 'warning' : null;
      if (!status || !category) {
        return null;
      }
      return {
        categoryId: budget.categoryId,
        categoryName: category.name,
        color: category.color,
        spent,
        limit: budget.monthlyLimit,
        ratio,
        status,
      } satisfies BudgetAlert;
    })
    .filter((item): item is BudgetAlert => item !== null)
    .sort((a, b) => b.ratio - a.ratio);
}

export function spentInCategory(transactions: Transaction[], categoryId: string, month: string): number {
  return inMonth(transactions, month)
    .filter((item) => item.type === 'expense' && item.categoryId === categoryId)
    .reduce((total, item) => total + item.amount, 0);
}
