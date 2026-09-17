import type { Transaction, TransactionInput } from '@/types';
import { getDatabase } from '@/services/database';
import { mapTransaction, type TransactionRow } from '@/services/mappers';
import { createId } from '@/utils/id';

export async function listTransactions(): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions ORDER BY date DESC, created_at DESC',
  );
  return rows.map(mapTransaction);
}

export async function insertTransaction(
  input: TransactionInput,
  recurringRuleId: string | null = null,
  id = createId(),
): Promise<Transaction> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const transaction: Transaction = {
    id,
    type: input.type,
    amount: input.amount,
    categoryId: input.categoryId,
    date: input.date,
    note: input.note?.trim() ? input.note.trim() : null,
    recurringRuleId,
    createdAt: now,
    updatedAt: now,
  };
  await db.runAsync(
    `INSERT INTO transactions
      (id, type, amount, category_id, date, note, recurring_rule_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      transaction.id,
      transaction.type,
      transaction.amount,
      transaction.categoryId,
      transaction.date,
      transaction.note,
      transaction.recurringRuleId,
      transaction.createdAt,
      transaction.updatedAt,
    ],
  );
  return transaction;
}

export async function updateTransaction(id: string, input: TransactionInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE transactions
     SET type = ?, amount = ?, category_id = ?, date = ?, note = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.type,
      input.amount,
      input.categoryId,
      input.date,
      input.note?.trim() ? input.note.trim() : null,
      new Date().toISOString(),
      id,
    ],
  );
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function deleteAllTransactions(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions');
}
