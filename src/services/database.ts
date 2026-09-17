import * as SQLite from 'expo-sqlite';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { createId } from '@/utils/id';

let database: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  database = await SQLite.openDatabaseAsync('finora.db');
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  await migrate(database);
  return database;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      is_default INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS recurring_rules (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      note TEXT,
      frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly')),
      start_date TEXT NOT NULL,
      next_run_date TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      recurring_rule_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS budgets (
      category_id TEXT PRIMARY KEY NOT NULL,
      monthly_limit REAL NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT NOT NULL DEFAULT 'system',
      currency TEXT NOT NULL DEFAULT 'INR',
      has_onboarded INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
  `);

  const count = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM categories');
  if (!count || count.c === 0) {
    for (const category of DEFAULT_CATEGORIES) {
      await db.runAsync(
        'INSERT INTO categories (id, name, icon, color, type, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        [createId(), category.name, category.icon, category.color, category.type, 1],
      );
    }
  }

  await db.runAsync(
    `INSERT OR IGNORE INTO settings (id, theme, currency, has_onboarded) VALUES (1, 'system', 'INR', 0)`,
  );
}

export async function resetDatabaseConnection() {
  if (database) {
    await database.closeAsync();
    database = null;
  }
}
