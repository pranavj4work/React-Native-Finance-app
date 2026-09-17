import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import type { MainTabScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EmptyState } from '@/components/EmptyState';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useMonthlySummary } from '@/hooks/useMonthlySummary';
import { useSettingsStore } from '@/store/useSettingsStore';
import { addMonths, currentMonth, lastNMonths, monthLabel } from '@/utils/dates';
import { categoryBreakdown, inMonth, monthlyTotals } from '@/utils/transactions';
import { formatCurrency } from '@/utils/formatCurrency';

export function ReportsScreen(_props: MainTabScreenProps<'Reports'>) {
  const { colors } = useAppTheme();
  const currency = useSettingsStore((state) => state.currency);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const [month, setMonth] = useState(currentMonth());
  const summary = useMonthlySummary(month);

  const monthTransactions = useMemo(() => inMonth(transactions, month), [transactions, month]);
  const breakdown = useMemo(
    () => categoryBreakdown(monthTransactions, categories),
    [monthTransactions, categories],
  );

  const pieData = breakdown.map((item) => ({
    value: item.amount,
    color: item.color,
    text: `${Math.round(item.percent)}%`,
  }));

  const barData = useMemo(() => {
    return lastNMonths(6, month).flatMap((key, index) => {
      const totals = monthlyTotals(transactions, key);
      const label = monthLabel(key).slice(0, 3);
      return [
        {
          value: totals.income,
          label,
          spacing: 3,
          labelWidth: 28,
          frontColor: colors.income,
          labelTextStyle: { color: colors.textMuted, fontSize: 10 },
        },
        {
          value: totals.expense,
          frontColor: colors.expense,
          spacing: index === 5 ? 0 : 16,
        },
      ];
    });
  }, [transactions, month, colors.expense, colors.income, colors.textMuted]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Reports</Text>
        <MonthSwitcher
          month={month}
          onPrev={() => setMonth((value) => addMonths(value, -1))}
          onNext={() => setMonth((value) => addMonths(value, 1))}
        />

        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.caption, { color: colors.textMuted }]}>Income</Text>
            <Text style={[styles.value, { color: colors.income }]}>{formatCurrency(summary.income, currency)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.caption, { color: colors.textMuted }]}>Expenses</Text>
            <Text style={[styles.value, { color: colors.expense }]}>{formatCurrency(summary.expense, currency)}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.caption, { color: colors.textMuted }]}>Balance</Text>
            <Text style={[styles.value, { color: colors.text }]}>{formatCurrency(summary.balance, currency)}</Text>
          </View>
        </View>

        <Text style={[styles.section, { color: colors.text }]}>Spending by category</Text>
        {breakdown.length === 0 ? (
          <EmptyState
            icon="pie-chart-outline"
            title="No expenses this month"
            subtitle="Add a few expenses to see a category breakdown."
          />
        ) : (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.chartWrap}>
              <PieChart
                data={pieData}
                donut
                radius={90}
                innerRadius={62}
                innerCircleColor={colors.surface}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.caption, { color: colors.textMuted }]}>Spent</Text>
                    <Text style={[styles.centerValue, { color: colors.text }]}>
                      {formatCurrency(summary.expense, currency)}
                    </Text>
                  </View>
                )}
              />
            </View>
            <View style={{ gap: 12, marginTop: 8 }}>
              {breakdown.map((item) => (
                <View key={item.categoryId} style={styles.breakRow}>
                  <CategoryBadge name={item.name} icon={item.icon} color={item.color} size="sm" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.breakName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.caption, { color: colors.textMuted }]}>
                      {item.percent.toFixed(1)}% of spending
                    </Text>
                  </View>
                  <Text style={[styles.breakAmount, { color: colors.text }]}>
                    {formatCurrency(item.amount, currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={[styles.section, { color: colors.text }]}>Last 6 months</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: colors.income }]} />
            <Text style={[styles.caption, { color: colors.textMuted }]}>Income</Text>
            <View style={[styles.dot, { backgroundColor: colors.expense }]} />
            <Text style={[styles.caption, { color: colors.textMuted }]}>Expense</Text>
          </View>
          <BarChart
            data={barData}
            barWidth={10}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            noOfSections={3}
            yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
            isAnimated
            width={280}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  summary: { flexDirection: 'row', borderWidth: 1, borderRadius: 18, padding: 14 },
  summaryItem: { flex: 1, gap: 4 },
  caption: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 14, fontWeight: '800' },
  section: { fontSize: 18, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  chartWrap: { alignItems: 'center', paddingVertical: 8 },
  centerValue: { fontSize: 13, fontWeight: '800' },
  breakRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  breakName: { fontWeight: '700' },
  breakAmount: { fontWeight: '800' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
});
