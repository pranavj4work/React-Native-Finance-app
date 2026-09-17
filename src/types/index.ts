export type TransactionType = 'income' | 'expense';
export type ThemePreference = 'light' | 'dark' | 'system';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';
export type RecurringFrequency = 'weekly' | 'monthly';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note: string | null;
  recurringRuleId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  categoryId: string;
  monthlyLimit: number;
}

export interface RecurringRule {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
  isActive: boolean;
}

export interface AppSettings {
  theme: ThemePreference;
  currency: CurrencyCode;
  hasOnboarded: boolean;
}

export interface TransactionInput {
  type: TransactionType;
  amount: number;
  categoryId: string;
  date: string;
  note?: string | null;
  recurring?: RecurringFrequency | 'none';
}

export interface CategoryInput {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface BudgetAlert {
  categoryId: string;
  categoryName: string;
  color: string;
  spent: number;
  limit: number;
  ratio: number;
  status: 'warning' | 'over';
}

export type TypeFilter = 'all' | TransactionType;

export interface TransactionFilters {
  type: TypeFilter;
  query: string;
  mode: 'month' | 'range' | 'all';
  month: string;
  from: string;
  to: string;
}
