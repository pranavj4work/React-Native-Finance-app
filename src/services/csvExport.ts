import dayjs from 'dayjs';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Category, CurrencyCode, Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatCurrency';

function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function exportTransactionsCsv(
  transactions: Transaction[],
  categories: Category[],
  currency: CurrencyCode,
): Promise<void> {
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const header = ['Date', 'Type', 'Category', 'Amount', 'Note'];
  const rows = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((item) => [
      item.date,
      item.type,
      names.get(item.categoryId) ?? 'Unknown',
      formatCurrency(item.amount, currency),
      item.note ?? '',
    ]);

  const csv = [header, ...rows]
    .map((line) => line.map((cell) => csvEscape(String(cell))).join(','))
    .join('\n');

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('Sharing is not available on this device.');
  }

  const file = new File(Paths.cache, `finora-transactions-${dayjs().format('YYYY-MM-DD')}.csv`);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(csv);

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Finora transactions',
    UTI: 'public.comma-separated-values-text',
  });
}
