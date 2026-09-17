import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { radius, spacing } from '@/theme/tokens';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  label: string;
  value: string;
  tone?: 'default' | 'income' | 'expense';
  icon?: keyof typeof Ionicons.glyphMap;
}

export function SummaryCard({ label, value, tone = 'default', icon }: Props) {
  const { colors } = useAppTheme();
  const accent =
    tone === 'income' ? colors.income : tone === 'expense' ? colors.expense : colors.primary;
  const soft =
    tone === 'income'
      ? colors.incomeSoft
      : tone === 'expense'
        ? colors.expenseSoft
        : colors.primarySoft;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: soft }]}>
        <Ionicons name={icon ?? 'wallet-outline'} size={18} color={accent} />
      </View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function BalanceHero({
  month,
  balance,
  onPressMonth,
}: {
  month: string;
  balance: string;
  onPressMonth?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <PressableScale
      onPress={onPressMonth}
      style={[styles.hero, { backgroundColor: colors.primary }]}
    >
      <Text style={[styles.heroLabel, { color: colors.onPrimary }]}>{month}</Text>
      <Text style={[styles.heroCaption, { color: colors.onPrimary }]}>Current balance</Text>
      <Text style={[styles.heroValue, { color: colors.onPrimary }]}>{balance}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '600' },
  value: { fontSize: 18, fontWeight: '700' },
  hero: {
    borderRadius: radius.xl,
    padding: 22,
    minHeight: 148,
    justifyContent: 'flex-end',
  },
  heroLabel: { fontSize: 13, fontWeight: '600', opacity: 0.85, marginBottom: 18 },
  heroCaption: { fontSize: 13, fontWeight: '600', opacity: 0.8 },
  heroValue: { fontSize: 34, fontWeight: '800', marginTop: 4 },
});
