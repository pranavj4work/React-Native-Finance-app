import type { RecurringRule, Transaction } from '@/types';
import { insertTransaction } from '@/services/transactionRepository';
import { listRecurringRules, updateRecurringNextRun } from '@/services/recurringRepository';
import { nextRecurringDate, todayIso } from '@/utils/dates';

export async function processDueRecurring(existing: Transaction[]): Promise<{
  created: Transaction[];
  rules: RecurringRule[];
}> {
  const rules = await listRecurringRules();
  const created: Transaction[] = [];
  const today = todayIso();
  const updatedRules: RecurringRule[] = [];

  for (const rule of rules) {
    if (!rule.isActive) {
      updatedRules.push(rule);
      continue;
    }

    let nextRunDate = rule.nextRunDate;
    while (nextRunDate <= today) {
      const duplicate = existing.some(
        (item) =>
          item.recurringRuleId === rule.id && item.date === nextRunDate,
      );
      if (!duplicate) {
        const transaction = await insertTransaction(
          {
            type: rule.type,
            amount: rule.amount,
            categoryId: rule.categoryId,
            date: nextRunDate,
            note: rule.note,
          },
          rule.id,
        );
        created.push(transaction);
        existing.push(transaction);
      }
      nextRunDate = nextRecurringDate(nextRunDate, rule.frequency);
    }

    if (nextRunDate !== rule.nextRunDate) {
      await updateRecurringNextRun(rule.id, nextRunDate);
    }
    updatedRules.push({ ...rule, nextRunDate });
  }

  return { created, rules: updatedRules };
}
