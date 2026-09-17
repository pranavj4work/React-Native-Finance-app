import dayjs from 'dayjs';
import type { Budget, Category, RecurringRule, Transaction } from '@/types';
import { insertTransaction } from '@/services/transactionRepository';
import { upsertBudget } from '@/services/budgetRepository';
import { insertRecurringRule } from '@/services/recurringRepository';
import { nextRecurringDate } from '@/utils/dates';

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function amountNear(base: number, spread: number): number {
  const value = base + (Math.random() * spread * 2 - spread);
  return Math.round(value);
}

export async function seedSampleData(categories: Category[]): Promise<{
  transactions: Transaction[];
  budgets: Budget[];
  rules: RecurringRule[];
}> {
  const byName = (name: string) => categories.find((item) => item.name === name);

  const food = byName('Food');
  const transport = byName('Transport');
  const shopping = byName('Shopping');
  const bills = byName('Bills');
  const entertainment = byName('Entertainment');
  const health = byName('Health');
  const rent = byName('Rent');
  const salary = byName('Salary');
  const freelance = byName('Freelance');
  const gift = byName('Gift');

  const required = [food, transport, shopping, bills, entertainment, health, rent, salary, freelance];
  if (required.some((item) => !item)) {
    throw new Error('Default categories are missing.');
  }

  const transactions: Transaction[] = [];
  const today = dayjs();

  for (let monthOffset = 0; monthOffset <= 2; monthOffset += 1) {
    const month = today.subtract(monthOffset, 'month');
    const salaryDate = month.date(1).format('YYYY-MM-DD');
    transactions.push(
      await insertTransaction({
        type: 'income',
        amount: 78000,
        categoryId: salary!.id,
        date: salaryDate,
        note: 'Monthly salary',
      }),
    );

    if (monthOffset !== 1) {
      transactions.push(
        await insertTransaction({
          type: 'income',
          amount: amountNear(18000, 4000),
          categoryId: freelance!.id,
          date: month.date(18).format('YYYY-MM-DD'),
          note: 'Client project',
        }),
      );
    }

    transactions.push(
      await insertTransaction({
        type: 'expense',
        amount: 18500,
        categoryId: rent!.id,
        date: month.date(1).format('YYYY-MM-DD'),
        note: 'House rent',
      }),
    );

    const expenseDays = [3, 5, 7, 9, 11, 13, 16, 19, 21, 24, 27];
    for (const day of expenseDays) {
      if (day > month.daysInMonth()) {
        continue;
      }
      if (monthOffset === 0 && day > today.date()) {
        continue;
      }
      const options = [
        { category: food!, amount: amountNear(420, 180), note: pick(['Lunch', 'Groceries', 'Coffee', 'Dinner']) },
        { category: transport!, amount: amountNear(180, 80), note: pick(['Metro', 'Cab', 'Fuel']) },
        { category: shopping!, amount: amountNear(1600, 900), note: pick(['Clothes', 'Amazon order', 'Home supplies']) },
        { category: entertainment!, amount: amountNear(650, 250), note: pick(['Movie', 'Streaming', 'Outing']) },
        { category: bills!, amount: amountNear(1400, 500), note: pick(['Electricity', 'Internet', 'Mobile']) },
        { category: health!, amount: amountNear(800, 300), note: pick(['Pharmacy', 'Clinic']) },
      ];
      const choice = pick(options);
      transactions.push(
        await insertTransaction({
          type: 'expense',
          amount: Math.max(40, choice.amount),
          categoryId: choice.category.id,
          date: month.date(day).format('YYYY-MM-DD'),
          note: choice.note,
        }),
      );
    }
  }

  if (gift) {
    transactions.push(
      await insertTransaction({
        type: 'income',
        amount: 2500,
        categoryId: gift.id,
        date: today.subtract(12, 'day').format('YYYY-MM-DD'),
        note: 'Birthday gift',
      }),
    );
  }

  const budgets: Budget[] = [];
  budgets.push(await upsertBudget(food!.id, 9000));
  budgets.push(await upsertBudget(transport!.id, 3000));
  budgets.push(await upsertBudget(shopping!.id, 6000));
  budgets.push(await upsertBudget(entertainment!.id, 2500));

  const rentRule = await insertRecurringRule({
    type: 'expense',
    amount: 18500,
    categoryId: rent!.id,
    note: 'House rent',
    frequency: 'monthly',
    startDate: today.startOf('month').format('YYYY-MM-DD'),
    nextRunDate: nextRecurringDate(today.startOf('month').format('YYYY-MM-DD'), 'monthly'),
  });

  return { transactions, budgets, rules: [rentRule] };
}
