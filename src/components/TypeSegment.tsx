import { StyleSheet, Text, View } from 'react-native';
import type { TypeFilter } from '@/types';
import { useAppTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';

const OPTIONS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

export function TypeSegment({
  value,
  onChange,
  hideAll = false,
}: {
  value: TypeFilter;
  onChange: (value: TypeFilter) => void;
  hideAll?: boolean;
}) {
  const { colors } = useAppTheme();
  const options = hideAll ? OPTIONS.filter((item) => item.value !== 'all') : OPTIONS;

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <View key={option.value} style={styles.chipWrap}>
            <PressableScale
              onPress={() => onChange(option.value)}
              style={[styles.chip, active && { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.label, { color: active ? colors.text : colors.textMuted }]}>
                {option.label}
              </Text>
            </PressableScale>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', borderRadius: 14, padding: 4, gap: 4 },
  chipWrap: { flex: 1 },
  chip: { width: '100%', paddingVertical: 10, borderRadius: 11, alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '700' },
});
