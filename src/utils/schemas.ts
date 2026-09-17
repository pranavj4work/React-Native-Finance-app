import { z } from 'zod';

export const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => {
      const amount = Number(value.replace(/,/g, ''));
      return Number.isFinite(amount) && amount > 0;
    }, 'Enter an amount greater than 0'),
  categoryId: z.string().min(1, 'Pick a category'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(140, 'Keep notes under 140 characters'),
  recurring: z.enum(['none', 'weekly', 'monthly']),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(24),
  icon: z.string().min(1, 'Pick an icon'),
  color: z.string().min(1, 'Pick a color'),
  type: z.enum(['income', 'expense']),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const budgetSchema = z.object({
  amount: z
    .string()
    .min(1, 'Limit is required')
    .refine((value) => {
      const amount = Number(value.replace(/,/g, ''));
      return Number.isFinite(amount) && amount > 0;
    }, 'Enter a limit greater than 0'),
});
