import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { formatCurrency } from '@/utils/formatCurrency';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  spent: number;
  limit: number;
}

export function BudgetBar({ spent, limit }: Props) {
  const { colors } = useAppTheme();
  const currency = useSettingsStore((state) => state.currency);
  const ratio = limit === 0 ? 0 : Math.min(spent / limit, 1);
  const over = spent > limit;
  const fill = over ? colors.danger : ratio >= 0.8 ? colors.warning : colors.primary;

  return (
    <View>
      <View style={styles.labels}>
        <Text style={[styles.caption, { color: colors.textMuted }]}>
          {formatCurrency(spent, currency)} of {formatCurrency(limit, currency)}
        </Text>
        <Text style={[styles.caption, { color: fill }]}>
          {limit > 0 ? Math.round((spent / limit) * 100) : 0}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  caption: { fontSize: 12, fontWeight: '600' },
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 999 },
});
