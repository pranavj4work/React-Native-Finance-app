import { create } from 'zustand';
import type {
  Budget,
  BudgetAlert,
  Category,
  CategoryInput,
  RecurringRule,
  Transaction,
  TransactionInput,
} from '@/types';
import * as categoryRepo from '@/services/categoryRepository';
import * as transactionRepo from '@/services/transactionRepository';
import * as budgetRepo from '@/services/budgetRepository';
import * as recurringRepo from '@/services/recurringRepository';
import { processDueRecurring } from '@/services/recurringEngine';
import { seedSampleData } from '@/services/sampleData';
import { nextRecurringDate } from '@/utils/dates';
import { budgetAlerts, currentMonthSafe } from '@/store/selectors';

interface FinanceState {
  hydrated: boolean;
  loading: boolean;
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  recurringRules: RecurringRule[];
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
  addTransaction: (input: TransactionInput) => Promise<BudgetAlert | null>;
  updateTransaction: (id: string, input: TransactionInput) => Promise<BudgetAlert | null>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, input: CategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setBudget: (categoryId: string, monthlyLimit: number) => Promise<void>;
  removeBudget: (categoryId: string) => Promise<void>;
  processRecurring: () => Promise<number>;
  loadSampleData: () => Promise<void>;
  clearAllData: () => Promise<void>;
}

function findBudgetAlert(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  categoryId: string,
): BudgetAlert | null {
  const month = currentMonthSafe();
  return (
    budgetAlerts(transactions, budgets, categories, month).find(
      (item) => item.categoryId === categoryId,
    ) ?? null
  );
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  hydrated: false,
  loading: false,
  transactions: [],
  categories: [],
  budgets: [],
  recurringRules: [],

  hydrate: async () => {
    const [categories, transactions, budgets, recurringRules] = await Promise.all([
      categoryRepo.listCategories(),
      transactionRepo.listTransactions(),
      budgetRepo.listBudgets(),
      recurringRepo.listRecurringRules(),
    ]);
    set({ categories, transactions, budgets, recurringRules, hydrated: true });
  },

  refresh: async () => {
    set({ loading: true });
    try {
      await get().hydrate();
      await get().processRecurring();
    } finally {
      set({ loading: false });
    }
  },

  addTransaction: async (input) => {
    let recurringRuleId: string | null = null;
    let rules = get().recurringRules;

    if (input.recurring && input.recurring !== 'none') {
      const rule = await recurringRepo.insertRecurringRule({
        type: input.type,
        amount: input.amount,
        categoryId: input.categoryId,
        note: input.note,
        frequency: input.recurring,
        startDate: input.date,
        nextRunDate: nextRecurringDate(input.date, input.recurring),
      });
      recurringRuleId = rule.id;
      rules = [rule, ...rules];
    }

    const transaction = await transactionRepo.insertTransaction(input, recurringRuleId);
    const transactions = [transaction, ...get().transactions];
    set({ transactions, recurringRules: rules });
    return findBudgetAlert(transactions, get().budgets, get().categories, input.categoryId);
  },

  updateTransaction: async (id, input) => {
    await transactionRepo.updateTransaction(id, input);
    const transactions = get().transactions.map((item) =>
      item.id === id
        ? {
            ...item,
            type: input.type,
            amount: input.amount,
            categoryId: input.categoryId,
            date: input.date,
            note: input.note?.trim() ? input.note.trim() : null,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    set({ transactions });
    return findBudgetAlert(transactions, get().budgets, get().categories, input.categoryId);
  },

  deleteTransaction: async (id) => {
    await transactionRepo.deleteTransaction(id);
    set({ transactions: get().transactions.filter((item) => item.id !== id) });
  },

  addCategory: async (input) => {
    const category = await categoryRepo.insertCategory(input);
    set({
      categories: [...get().categories, category].sort((a, b) => a.name.localeCompare(b.name)),
    });
  },

  updateCategory: async (id, input) => {
    await categoryRepo.updateCategory(id, input);
    set({
      categories: get().categories.map((item) =>
        item.id === id
          ? { ...item, name: input.name.trim(), icon: input.icon, color: input.color, type: input.type }
          : item,
      ),
    });
  },

  deleteCategory: async (id) => {
    await categoryRepo.deleteCategory(id);
    set({
      categories: get().categories.filter((item) => item.id !== id),
      budgets: get().budgets.filter((item) => item.categoryId !== id),
      recurringRules: get().recurringRules.filter((item) => item.categoryId !== id),
    });
  },

  setBudget: async (categoryId, monthlyLimit) => {
    const budget = await budgetRepo.upsertBudget(categoryId, monthlyLimit);
    const budgets = [...get().budgets.filter((item) => item.categoryId !== categoryId), budget];
    set({ budgets });
  },

  removeBudget: async (categoryId) => {
    await budgetRepo.deleteBudget(categoryId);
    set({ budgets: get().budgets.filter((item) => item.categoryId !== categoryId) });
  },

  processRecurring: async () => {
    const { created, rules } = await processDueRecurring([...get().transactions]);
    if (created.length > 0) {
      set({
        transactions: [...created, ...get().transactions],
        recurringRules: rules,
      });
    } else {
      set({ recurringRules: rules });
    }
    return created.length;
  },

  loadSampleData: async () => {
    await transactionRepo.deleteAllTransactions();
    await budgetRepo.deleteAllBudgets();
    await recurringRepo.deleteAllRecurringRules();
    const seeded = await seedSampleData(get().categories);
    set({
      transactions: seeded.transactions.sort((a, b) => b.date.localeCompare(a.date)),
      budgets: seeded.budgets,
      recurringRules: seeded.rules,
    });
  },

  clearAllData: async () => {
    await transactionRepo.deleteAllTransactions();
    await budgetRepo.deleteAllBudgets();
    await recurringRepo.deleteAllRecurringRules();
    set({ transactions: [], budgets: [], recurringRules: [] });
  },
}));
