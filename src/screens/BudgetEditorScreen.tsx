import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RootStackScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { CategoryBadge } from '@/components/CategoryBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { budgetSchema } from '@/utils/schemas';
import { currentMonth } from '@/utils/dates';
import { spentInCategory } from '@/utils/transactions';

export function BudgetEditorScreen({ navigation, route }: RootStackScreenProps<'BudgetEditor'>) {
  const { colors } = useAppTheme();
  const { categoryId } = route.params;
  const categories = useFinanceStore((state) => state.categories);
  const budgets = useFinanceStore((state) => state.budgets);
  const transactions = useFinanceStore((state) => state.transactions);
  const setBudget = useFinanceStore((state) => state.setBudget);
  const removeBudget = useFinanceStore((state) => state.removeBudget);

  const category = categories.find((item) => item.id === categoryId);
  const existing = budgets.find((item) => item.categoryId === categoryId);
  const spent = spentInCategory(transactions, categoryId, currentMonth());

  const form = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: { amount: existing ? String(existing.monthlyLimit) : '' },
  });

  if (!category) {
    return null;
  }

  const onSave = form.handleSubmit(async (values) => {
    await setBudget(categoryId, Number(values.amount.replace(/,/g, '')));
    navigation.goBack();
  });

  const onRemove = () => {
    Alert.alert('Remove budget?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeBudget(categoryId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Monthly budget</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CategoryBadge name={category.name} icon={category.icon} color={category.color} showLabel />
          {existing ? <BudgetBar spent={spent} limit={existing.monthlyLimit} /> : null}
        </View>

        <Controller
          control={form.control}
          name="amount"
          render={({ field, fieldState }) => (
            <View>
              <Text style={[styles.label, { color: colors.textMuted }]}>Limit</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                keyboardType="decimal-pad"
                placeholder="5000"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
              />
              {fieldState.error ? (
                <Text style={{ color: colors.danger, marginTop: 6 }}>{fieldState.error.message}</Text>
              ) : null}
            </View>
          )}
        />

        <PressableScale onPress={onSave} style={[styles.save, { backgroundColor: colors.primary }]}>
          <Text style={[styles.saveText, { color: colors.onPrimary }]}>Save budget</Text>
        </PressableScale>
        {existing ? (
          <PressableScale onPress={onRemove}>
            <Text style={[styles.remove, { color: colors.danger }]}>Remove budget</Text>
          </PressableScale>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 20, fontWeight: '700' },
  save: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveText: { fontWeight: '800', fontSize: 16 },
  remove: { textAlign: 'center', fontWeight: '700', marginTop: 8 },
});
