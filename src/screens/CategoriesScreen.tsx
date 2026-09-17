import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { RootStackScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { CategoryBadge } from '@/components/CategoryBadge';
import { BudgetBar } from '@/components/BudgetBar';
import { PressableScale } from '@/components/PressableScale';
import { EmptyState } from '@/components/EmptyState';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { currentMonth } from '@/utils/dates';
import { spentInCategory } from '@/utils/transactions';
import { Ionicons } from '@expo/vector-icons';

export function CategoriesScreen({ navigation }: RootStackScreenProps<'Categories'>) {
  const { colors } = useAppTheme();
  const categories = useFinanceStore((state) => state.categories);
  const budgets = useFinanceStore((state) => state.budgets);
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteCategory = useFinanceStore((state) => state.deleteCategory);
  const month = currentMonth();

  const expenseCategories = categories.filter((item) => item.type === 'expense');
  const incomeCategories = categories.filter((item) => item.type === 'income');

  const onDelete = (id: string, isDefault: boolean) => {
    if (isDefault) {
      Alert.alert('Default category', 'Built-in categories cannot be deleted.');
      return;
    }
    Alert.alert('Delete category?', 'You can only delete it if it has no transactions.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void deleteCategory(id).catch((error: Error) => {
            Alert.alert('Cannot delete', error.message);
          });
        },
      },
    ]);
  };

  const renderGroup = (title: string, list: typeof categories, showBudget: boolean) => (
    <View style={{ gap: 10 }}>
      <Text style={[styles.group, { color: colors.textMuted }]}>{title}</Text>
      {list.length === 0 ? (
        <EmptyState icon="pricetag-outline" title="No categories" subtitle="Add a custom category to get started." />
      ) : (
        list.map((category) => {
          const budget = budgets.find((item) => item.categoryId === category.id);
          const spent = spentInCategory(transactions, category.id, month);
          return (
            <PressableScale
              key={category.id}
              onPress={() => {
                if (showBudget) {
                  navigation.navigate('BudgetEditor', { categoryId: category.id });
                } else if (!category.isDefault) {
                  navigation.navigate('CategoryForm', { categoryId: category.id });
                }
              }}
              onLongPress={() => onDelete(category.id, category.isDefault)}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.row}>
                <CategoryBadge name={category.name} icon={category.icon} color={category.color} showLabel />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {!category.isDefault ? (
                    <PressableScale
                      onPress={() => navigation.navigate('CategoryForm', { categoryId: category.id })}
                    >
                      <Ionicons name="pencil-outline" size={16} color={colors.textMuted} />
                    </PressableScale>
                  ) : null}
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </View>
              </View>
              {showBudget && budget ? <BudgetBar spent={spent} limit={budget.monthlyLimit} /> : null}
              {showBudget && !budget ? (
                <Text style={[styles.hint, { color: colors.primary }]}>Set a monthly budget</Text>
              ) : null}
            </PressableScale>
          );
        })
      )}
    </View>
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        <PressableScale
          onPress={() => navigation.navigate('CategoryForm')}
          style={[styles.add, { backgroundColor: colors.primarySoft }]}
        >
          <Text style={[styles.addText, { color: colors.primary }]}>Add</Text>
        </PressableScale>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderGroup('Expenses', expenseCategories, true)}
        {renderGroup('Income', incomeCategories, false)}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  add: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  addText: { fontWeight: '800' },
  content: { paddingBottom: 40, gap: 22 },
  group: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hint: { fontSize: 12, fontWeight: '700' },
});
