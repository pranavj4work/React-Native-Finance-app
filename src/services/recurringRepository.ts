import type { RecurringFrequency, RecurringRule, TransactionType } from '@/types';
import { getDatabase } from '@/services/database';
import { mapRecurring, type RecurringRow } from '@/services/mappers';
import { createId } from '@/utils/id';

export async function listRecurringRules(): Promise<RecurringRule[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecurringRow>('SELECT * FROM recurring_rules');
  return rows.map(mapRecurring);
}

export async function insertRecurringRule(input: {
  type: TransactionType;
  amount: number;
  categoryId: string;
  note?: string | null;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
}): Promise<RecurringRule> {
  const db = await getDatabase();
  const rule: RecurringRule = {
    id: createId(),
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    note: input.note?.trim() ? input.note.trim() : null,
    frequency: input.frequency,
    startDate: input.startDate,
    nextRunDate: input.nextRunDate,
    isActive: true,
  };
  await db.runAsync(
    `INSERT INTO recurring_rules
      (id, type, amount, category_id, note, frequency, start_date, next_run_date, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      rule.id,
      rule.type,
      rule.amount,
      rule.categoryId,
      rule.note,
      rule.frequency,
      rule.startDate,
      rule.nextRunDate,
    ],
  );
  return rule;
}

export async function updateRecurringNextRun(id: string, nextRunDate: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE recurring_rules SET next_run_date = ? WHERE id = ?', [nextRunDate, id]);
}

export async function deleteAllRecurringRules(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM recurring_rules');
}
