import { useEffect, useMemo } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { RootStackScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { PressableScale } from '@/components/PressableScale';
import { DatePickerField } from '@/components/DatePickerField';
import { TypeSegment } from '@/components/TypeSegment';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { transactionSchema, type TransactionFormValues } from '@/utils/schemas';
import { todayIso } from '@/utils/dates';
import { formatCurrency } from '@/utils/formatCurrency';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CURRENCIES } from '@/constants/currency';
import type { TypeFilter } from '@/types';

export function AddTransactionScreen({ navigation, route }: RootStackScreenProps<'AddTransaction'>) {
  const { colors } = useAppTheme();
  const currency = useSettingsStore((state) => state.currency);
  const currencySymbol = CURRENCIES.find((item) => item.code === currency)?.symbol ?? '₹';
  const transactionId = route.params?.transactionId;
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const updateTransaction = useFinanceStore((state) => state.updateTransaction);
  const existing = transactions.find((item) => item.id === transactionId);

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: existing?.type ?? 'expense',
      amount: existing ? String(existing.amount) : '',
      categoryId: existing?.categoryId ?? '',
      date: existing?.date ?? todayIso(),
      note: existing?.note ?? '',
      recurring: 'none',
    },
  });

  const type = form.watch('type');
  const categoryId = form.watch('categoryId');
  const visibleCategories = useMemo(
    () => categories.filter((item) => item.type === type),
    [categories, type],
  );

  useEffect(() => {
    if (categoryId && !visibleCategories.some((item) => item.id === categoryId)) {
      form.setValue('categoryId', '');
    }
  }, [categoryId, visibleCategories, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      type: values.type,
      amount: Number(values.amount.replace(/,/g, '')),
      categoryId: values.categoryId,
      date: values.date,
      note: values.note,
      recurring: existing ? ('none' as const) : values.recurring,
    };

    const alert = existing
      ? await updateTransaction(existing.id, payload)
      : await addTransaction(payload);

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (alert) {
      const title = alert.status === 'over' ? 'Budget exceeded' : 'Approaching budget';
      Alert.alert(
        title,
        `${alert.categoryName}: ${formatCurrency(alert.spent, currency)} of ${formatCurrency(alert.limit, currency)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
      return;
    }

    navigation.goBack();
  });

  return (
    <Screen edges={Platform.OS === 'ios' ? ['bottom'] : ['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <PressableScale
            onPress={() => navigation.goBack()}
            style={[styles.close, { backgroundColor: colors.surfaceMuted }]}
          >
            <Ionicons name="close" size={20} color={colors.text} />
          </PressableScale>
          <Text style={[styles.title, { color: colors.text }]}>
            {existing ? 'Edit transaction' : 'Add transaction'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <TypeSegment
                hideAll
                value={field.value as TypeFilter}
                onChange={(next) => {
                  if (next !== 'all') {
                    field.onChange(next);
                  }
                }}
              />
            )}
          />

          <Controller
            control={form.control}
            name="amount"
            render={({ field, fieldState }) => (
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Amount</Text>
                <View
                  style={[
                    styles.amountCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: fieldState.error ? colors.danger : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.currency, { color: colors.textMuted }]}>{currencySymbol}</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                    style={[styles.amount, { color: colors.text }]}
                  />
                </View>
                {fieldState.error ? (
                  <Text style={[styles.error, { color: colors.danger }]}>{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />

          <View>
            <Text style={[styles.label, { color: colors.textMuted }]}>Category</Text>
            <View style={styles.grid}>
              {visibleCategories.map((category) => {
                const selected = categoryId === category.id;
                return (
                  <View key={category.id} style={styles.catWrap}>
                    <PressableScale
                      onPress={() => form.setValue('categoryId', category.id, { shouldValidate: true })}
                      style={[
                        styles.cat,
                        {
                          backgroundColor: selected ? `${category.color}22` : colors.surface,
                          borderColor: selected ? category.color : colors.border,
                        },
                      ]}
                    >
                      <View style={[styles.catIcon, { backgroundColor: `${category.color}22` }]}>
                        <Ionicons
                          name={(category.icon as keyof typeof Ionicons.glyphMap) ?? 'ellipse'}
                          size={18}
                          color={category.color}
                        />
                      </View>
                      <Text style={[styles.catName, { color: colors.text }]} numberOfLines={1}>
                        {category.name}
                      </Text>
                    </PressableScale>
                  </View>
                );
              })}
            </View>
            {form.formState.errors.categoryId ? (
              <Text style={[styles.error, { color: colors.danger }]}>
                {form.formState.errors.categoryId.message}
              </Text>
            ) : null}
          </View>

          <Controller
            control={form.control}
            name="date"
            render={({ field }) => <DatePickerField label="Date" value={field.value} onChange={field.onChange} />}
          />

          <Controller
            control={form.control}
            name="note"
            render={({ field, fieldState }) => (
              <View>
                <Text style={[styles.label, { color: colors.textMuted }]}>Note (optional)</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  placeholder="Add a short description"
                  placeholderTextColor={colors.textMuted}
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                />
                {fieldState.error ? (
                  <Text style={[styles.error, { color: colors.danger }]}>{fieldState.error.message}</Text>
                ) : null}
              </View>
            )}
          />

          {!existing ? (
            <Controller
              control={form.control}
              name="recurring"
              render={({ field }) => (
                <View>
                  <Text style={[styles.label, { color: colors.textMuted }]}>Repeat</Text>
                  <View style={styles.repeatRow}>
                    {(['none', 'weekly', 'monthly'] as const).map((option) => {
                      const selected = field.value === option;
                      return (
                        <View key={option} style={styles.repeatWrap}>
                          <PressableScale
                            onPress={() => field.onChange(option)}
                            style={[
                              styles.repeat,
                              {
                                backgroundColor: selected ? colors.primarySoft : colors.surface,
                                borderColor: selected ? colors.primary : colors.border,
                              },
                            ]}
                          >
                            <Text style={[styles.repeatText, { color: selected ? colors.primary : colors.text }]}>
                              {option === 'none' ? 'None' : option === 'weekly' ? 'Weekly' : 'Monthly'}
                            </Text>
                          </PressableScale>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            />
          ) : null}

          <PressableScale onPress={onSubmit} style={[styles.save, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveText, { color: colors.onPrimary }]}>
              {existing ? 'Save changes' : 'Add transaction'}
            </Text>
          </PressableScale>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 10 : 4,
    paddingBottom: 16,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSpacer: { width: 36, height: 36 },
  title: { fontSize: 18, fontWeight: '800' },
  content: { paddingBottom: 28, gap: 20 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8 },
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 64,
  },
  currency: { fontSize: 24, fontWeight: '700', marginRight: 8 },
  amount: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  catWrap: {
    width: '33.333%',
    padding: 4,
  },
  cat: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
    minHeight: 88,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catName: { fontSize: 12, fontWeight: '700', textAlign: 'center', width: '100%' },
  error: { marginTop: 6, fontSize: 12, fontWeight: '600' },
  repeatRow: { flexDirection: 'row', gap: 8 },
  repeatWrap: { flex: 1 },
  repeat: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  repeatText: { fontWeight: '700', fontSize: 13 },
  save: { marginTop: 4, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '800' },
});
