import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { MainTabScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { BalanceHero, SummaryCard } from '@/components/SummaryCard';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts';
import { currentMonth, greeting, monthLabel } from '@/utils/dates';
import { formatCurrency } from '@/utils/formatCurrency';
import { PressableScale } from '@/components/PressableScale';

export function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const { colors } = useAppTheme();
  const currency = useSettingsStore((state) => state.currency);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const refresh = useFinanceStore((state) => state.refresh);
  const loading = useFinanceStore((state) => state.loading);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const month = currentMonth();
  const summary = useMonthlySummary(month);
  const alerts = useBudgetAlerts(month);
  const [refreshing, setRefreshing] = useState(false);

  const recent = useMemo(() => transactions.slice(0, 7), [transactions]);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen padded={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.hello, { color: colors.textMuted }]}>{greeting()}</Text>
          <Text style={[styles.brand, { color: colors.text }]}>Finora</Text>
        </View>

        <BalanceHero month={monthLabel(month)} balance={formatCurrency(summary.balance, currency)} />

        <View style={styles.row}>
          <SummaryCard
            label="Income"
            value={formatCurrency(summary.income, currency)}
            tone="income"
            icon="arrow-down-circle"
          />
          <SummaryCard
            label="Expenses"
            value={formatCurrency(summary.expense, currency)}
            tone="expense"
            icon="arrow-up-circle"
          />
        </View>

        {alerts.length > 0 ? (
          <View style={[styles.alert, { backgroundColor: colors.warningSoft }]}>
            <Text style={[styles.alertTitle, { color: colors.warning }]}>Budget watch</Text>
            {alerts.map((alert) => (
              <Text key={alert.categoryId} style={[styles.alertText, { color: colors.text }]}>
                {alert.categoryName} is {alert.status === 'over' ? 'over' : 'near'} its limit (
                {Math.round(alert.ratio * 100)}%).
              </Text>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionHead}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
          <PressableScale onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.link, { color: colors.primary }]}>See all</Text>
          </PressableScale>
        </View>

        {recent.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title="No transactions yet"
            subtitle="Add your first income or expense to see this month’s picture."
            actionLabel="Add transaction"
            onAction={() => navigation.getParent()?.navigate('AddTransaction')}
          />
        ) : (
          <View style={styles.list}>
            {recent.map((item, index) => (
              <TransactionItem
                key={item.id}
                transaction={item}
                category={categoryMap.get(item.categoryId)}
                index={index}
                onPress={() => navigation.getParent()?.navigate('AddTransaction', { transactionId: item.id })}
                onDelete={() => void deleteTransaction(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <FAB onPress={() => navigation.getParent()?.navigate('AddTransaction')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 110, gap: 16 },
  header: { marginBottom: 4 },
  hello: { fontSize: 14, fontWeight: '600' },
  brand: { fontSize: 28, fontWeight: '800', marginTop: 2 },
  row: { flexDirection: 'row', gap: 12 },
  alert: { borderRadius: 16, padding: 14, gap: 4 },
  alertTitle: { fontWeight: '800', fontSize: 13 },
  alertText: { fontSize: 13, fontWeight: '600' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  link: { fontWeight: '700' },
  list: { gap: 10 },
});
