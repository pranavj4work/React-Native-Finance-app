import { useMemo, useState } from 'react';
import { Modal, RefreshControl, SectionList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { MainTabScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { TypeSegment } from '@/components/TypeSegment';
import { DatePickerField } from '@/components/DatePickerField';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useFilteredTransactions } from '@/hooks/useFilteredTransactions';
import { addMonths, currentMonth, formatDisplayDate, monthEnd, monthStart } from '@/utils/dates';
import type { TransactionFilters } from '@/types';

export function TransactionsScreen({ navigation }: MainTabScreenProps<'Transactions'>) {
  const { colors } = useAppTheme();
  const categories = useFinanceStore((state) => state.categories);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const refresh = useFinanceStore((state) => state.refresh);
  const loading = useFinanceStore((state) => state.loading);
  const [filterOpen, setFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: 'all',
    query: '',
    mode: 'month',
    month: currentMonth(),
    from: monthStart(currentMonth()),
    to: monthEnd(currentMonth()),
  });

  const visible = useFilteredTransactions(filters);
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const sections = useMemo(() => {
    const grouped = new Map<string, typeof visible>();
    for (const item of visible) {
      const list = grouped.get(item.date) ?? [];
      list.push(item);
      grouped.set(item.date, list);
    }
    return [...grouped.entries()].map(([date, data]) => ({
      title: formatDisplayDate(date),
      data,
    }));
  }, [visible]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <PressableScale onPress={() => setFilterOpen(true)}>
          <Text style={[styles.filter, { color: colors.primary }]}>
            {filters.mode === 'all' ? 'All dates' : filters.mode === 'range' ? 'Range' : 'Month'}
          </Text>
        </PressableScale>
      </View>

      <TextInput
        value={filters.query}
        onChangeText={(query) => setFilters((current) => ({ ...current, query }))}
        placeholder="Search notes or categories"
        placeholderTextColor={colors.textMuted}
        style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
      />

      <TypeSegment value={filters.type} onChange={(type) => setFilters((current) => ({ ...current, type }))} />

      {filters.mode === 'month' ? (
        <MonthSwitcher
          month={filters.month}
          onPrev={() =>
            setFilters((current) => ({
              ...current,
              month: addMonths(current.month, -1),
            }))
          }
          onNext={() =>
            setFilters((current) => ({
              ...current,
              month: addMonths(current.month, 1),
            }))
          }
        />
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.section, { color: colors.textMuted }]}>{section.title}</Text>
        )}
        renderItem={({ item, index }) => (
          <TransactionItem
            transaction={item}
            category={categoryMap.get(item.categoryId)}
            index={index}
            onPress={() => navigation.getParent()?.navigate('AddTransaction', { transactionId: item.id })}
            onDelete={() => void deleteTransaction(item.id)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Nothing here"
            subtitle="Try another month, clear search, or add a transaction."
            actionLabel="Add transaction"
            onAction={() => navigation.getParent()?.navigate('AddTransaction')}
          />
        }
      />

      <FAB onPress={() => navigation.getParent()?.navigate('AddTransaction')} />

      <Modal visible={filterOpen} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Filter dates</Text>
            {(['month', 'range', 'all'] as const).map((mode) => (
              <PressableScale
                key={mode}
                onPress={() => setFilters((current) => ({ ...current, mode }))}
                style={[
                  styles.option,
                  {
                    borderColor: filters.mode === mode ? colors.primary : colors.border,
                    backgroundColor: filters.mode === mode ? colors.primarySoft : colors.background,
                  },
                ]}
              >
                <Text style={[styles.optionText, { color: colors.text }]}>
                  {mode === 'month' ? 'By month' : mode === 'range' ? 'Custom range' : 'All time'}
                </Text>
              </PressableScale>
            ))}

            {filters.mode === 'range' ? (
              <View style={{ gap: 12, marginTop: 8 }}>
                <DatePickerField
                  label="From"
                  value={filters.from}
                  onChange={(from) => setFilters((current) => ({ ...current, from }))}
                />
                <DatePickerField
                  label="To"
                  value={filters.to}
                  onChange={(to) => setFilters((current) => ({ ...current, to }))}
                />
              </View>
            ) : null}

            <PressableScale
              onPress={() => setFilterOpen(false)}
              style={[styles.done, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.doneText, { color: colors.onPrimary }]}>Apply</Text>
            </PressableScale>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800' },
  filter: { fontWeight: '700' },
  search: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  list: { paddingTop: 12, paddingBottom: 110, gap: 4, flexGrow: 1 },
  section: { fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 10 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, gap: 10 },
  sheetTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  option: { borderWidth: 1, borderRadius: 14, padding: 14 },
  optionText: { fontWeight: '700' },
  done: { marginTop: 12, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  doneText: { fontWeight: '800', fontSize: 16 },
});
