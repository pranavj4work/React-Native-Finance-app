import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { PressableScale } from '@/components/PressableScale';
import { TypeSegment } from '@/components/TypeSegment';
import { useAppTheme } from '@/theme/ThemeContext';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/categories';
import { categorySchema, type CategoryFormValues } from '@/utils/schemas';
import type { TypeFilter } from '@/types';

export function CategoryFormScreen({ navigation, route }: RootStackScreenProps<'CategoryForm'>) {
  const { colors } = useAppTheme();
  const categoryId = route.params?.categoryId;
  const categories = useFinanceStore((state) => state.categories);
  const addCategory = useFinanceStore((state) => state.addCategory);
  const updateCategory = useFinanceStore((state) => state.updateCategory);
  const existing = categories.find((item) => item.id === categoryId);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: existing?.name ?? '',
      icon: existing?.icon ?? 'ellipse',
      color: existing?.color ?? CATEGORY_COLORS[0],
      type: existing?.type ?? 'expense',
    },
  });

  const selectedIcon = form.watch('icon');
  const selectedColor = form.watch('color');

  const onSubmit = form.handleSubmit(async (values) => {
    if (existing?.isDefault) {
      Alert.alert('Default category', 'Built-in categories cannot be edited.');
      return;
    }
    if (existing) {
      await updateCategory(existing.id, values);
    } else {
      await addCategory(values);
    }
    navigation.goBack();
  });

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>
          {existing ? 'Edit category' : 'New category'}
        </Text>

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
          name="name"
          render={({ field, fieldState }) => (
            <View>
              <Text style={[styles.label, { color: colors.textMuted }]}>Name</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="e.g. Subscriptions"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              />
              {fieldState.error ? (
                <Text style={[styles.error, { color: colors.danger }]}>{fieldState.error.message}</Text>
              ) : null}
            </View>
          )}
        />

        <Text style={[styles.label, { color: colors.textMuted }]}>Icon</Text>
        <View style={styles.grid}>
          {CATEGORY_ICONS.map((icon) => {
            const selected = selectedIcon === icon;
            return (
              <PressableScale
                key={icon}
                onPress={() => form.setValue('icon', icon)}
                style={[
                  styles.icon,
                  {
                    borderColor: selected ? selectedColor : colors.border,
                    backgroundColor: selected ? `${selectedColor}22` : colors.surface,
                  },
                ]}
              >
                <Ionicons name={icon} size={20} color={selected ? selectedColor : colors.text} />
              </PressableScale>
            );
          })}
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>Color</Text>
        <View style={styles.grid}>
          {CATEGORY_COLORS.map((color) => (
            <PressableScale
              key={color}
              onPress={() => form.setValue('color', color)}
              style={[
                styles.swatch,
                { backgroundColor: color, borderColor: selectedColor === color ? colors.text : 'transparent' },
              ]}
            />
          ))}
        </View>

        <PressableScale onPress={onSubmit} style={[styles.save, { backgroundColor: colors.primary }]}>
          <Text style={[styles.saveText, { color: colors.onPrimary }]}>Save category</Text>
        </PressableScale>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800' },
  label: { fontSize: 12, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, fontSize: 16 },
  error: { marginTop: 6, fontWeight: '600', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  save: { marginTop: 8, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveText: { fontWeight: '800', fontSize: 16 },
});
