import type { Category, CategoryInput } from '@/types';
import { getDatabase } from '@/services/database';
import { mapCategory, type CategoryRow } from '@/services/mappers';
import { createId } from '@/utils/id';

export async function listCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    'SELECT * FROM categories ORDER BY type ASC, name ASC',
  );
  return rows.map(mapCategory);
}

export async function insertCategory(input: CategoryInput): Promise<Category> {
  const db = await getDatabase();
  const category: Category = {
    id: createId(),
    name: input.name.trim(),
    icon: input.icon,
    color: input.color,
    type: input.type,
    isDefault: false,
  };
  await db.runAsync(
    'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, 0)',
    [category.id, category.name, category.icon, category.color, category.type],
  );
  return category;
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE categories SET name = ?, icon = ?, color = ?, type = ? WHERE id = ? AND is_default = 0',
    [input.name.trim(), input.icon, input.color, input.type, id],
  );
}

export async function deleteCategory(id: string): Promise<void> {
  const db = await getDatabase();
  const used = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM transactions WHERE category_id = ?',
    [id],
  );
  if (used && used.c > 0) {
    throw new Error('This category has transactions. Move or delete them first.');
  }
  await db.runAsync('DELETE FROM budgets WHERE category_id = ?', [id]);
  await db.runAsync('DELETE FROM recurring_rules WHERE category_id = ?', [id]);
  await db.runAsync('DELETE FROM categories WHERE id = ? AND is_default = 0', [id]);
}

export async function countCategoryUsage(id: string): Promise<number> {
  const db = await getDatabase();
  const used = await db.getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM transactions WHERE category_id = ?',
    [id],
  );
  return used?.c ?? 0;
}
