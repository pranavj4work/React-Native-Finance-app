import type { Budget } from '@/types';
import { getDatabase } from '@/services/database';
import { mapBudget, type BudgetRow } from '@/services/mappers';

export async function listBudgets(): Promise<Budget[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BudgetRow>('SELECT * FROM budgets');
  return rows.map(mapBudget);
}

export async function upsertBudget(categoryId: string, monthlyLimit: number): Promise<Budget> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO budgets (category_id, monthly_limit) VALUES (?, ?)
     ON CONFLICT(category_id) DO UPDATE SET monthly_limit = excluded.monthly_limit`,
    [categoryId, monthlyLimit],
  );
  return { categoryId, monthlyLimit };
}

export async function deleteBudget(categoryId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets WHERE category_id = ?', [categoryId]);
}

export async function deleteAllBudgets(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM budgets');
}
