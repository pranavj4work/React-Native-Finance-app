import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';
import { monthLabel } from '@/utils/dates';

interface Props {
  month: string;
  onChange: (month: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function MonthSwitcher({ month, onPrev, onNext }: Omit<Props, 'onChange'>) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <PressableScale onPress={onPrev} style={styles.arrow}>
        <Ionicons name="chevron-back" size={18} color={colors.text} />
      </PressableScale>
      <Text style={[styles.label, { color: colors.text }]}>{monthLabel(month)}</Text>
      <PressableScale onPress={onNext} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={18} color={colors.text} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  arrow: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 15, fontWeight: '700' },
});
