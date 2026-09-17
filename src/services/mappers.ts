import type {
  AppSettings,
  Budget,
  Category,
  CurrencyCode,
  RecurringFrequency,
  RecurringRule,
  ThemePreference,
  Transaction,
  TransactionType,
} from '@/types';

export type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  is_default: number;
};

export type TransactionRow = {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  date: string;
  note: string | null;
  recurring_rule_id: string | null;
  created_at: string;
  updated_at: string;
};

export type BudgetRow = {
  category_id: string;
  monthly_limit: number;
};

export type RecurringRow = {
  id: string;
  type: TransactionType;
  amount: number;
  category_id: string;
  note: string | null;
  frequency: RecurringFrequency;
  start_date: string;
  next_run_date: string;
  is_active: number;
};

export type SettingsRow = {
  id: number;
  theme: ThemePreference;
  currency: CurrencyCode;
  has_onboarded: number;
};

export function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    type: row.type,
    isDefault: Boolean(row.is_default),
  };
}

export function mapTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    categoryId: row.category_id,
    date: row.date,
    note: row.note,
    recurringRuleId: row.recurring_rule_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapBudget(row: BudgetRow): Budget {
  return {
    categoryId: row.category_id,
    monthlyLimit: row.monthly_limit,
  };
}

export function mapRecurring(row: RecurringRow): RecurringRule {
  return {
    id: row.id,
    type: row.type,
    amount: row.amount,
    categoryId: row.category_id,
    note: row.note,
    frequency: row.frequency,
    startDate: row.start_date,
    nextRunDate: row.next_run_date,
    isActive: Boolean(row.is_active),
  };
}

export function mapSettings(row: SettingsRow): AppSettings {
  return {
    theme: row.theme,
    currency: row.currency,
    hasOnboarded: Boolean(row.has_onboarded),
  };
}
