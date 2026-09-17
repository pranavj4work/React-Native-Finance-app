import { CURRENCY_LOCALES } from '@/constants/currency';
import type { CurrencyCode } from '@/types';

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const fractionDigits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(CURRENCY_LOCALES[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatSignedCurrency(
  amount: number,
  currency: CurrencyCode,
  type: 'income' | 'expense',
): string {
  const value = formatCurrency(amount, currency);
  return type === 'income' ? `+${value}` : `-${value}`;
}
