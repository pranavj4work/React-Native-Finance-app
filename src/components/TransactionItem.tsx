import { Alert, StyleSheet, Text, View } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Category, Transaction } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { useAppTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';
import { formatSignedCurrency } from '@/utils/formatCurrency';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PressableScale } from '@/components/PressableScale';

interface Props {
  transaction: Transaction;
  category?: Category;
  index?: number;
  onPress: () => void;
  onDelete: () => void;
}

export function TransactionItem({ transaction, category, index = 0, onPress, onDelete }: Props) {
  const { colors } = useAppTheme();
  const currency = useSettingsStore((state) => state.currency);
  const amountColor = transaction.type === 'income' ? colors.income : colors.expense;

  const confirmDelete = () => {
    Alert.alert('Delete transaction?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onDelete();
        },
      },
    ]);
  };

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 8) * 40).springify()}>
      <Swipeable
        overshootRight={false}
        renderRightActions={() => (
          <RectButton style={[styles.delete, { backgroundColor: colors.danger }]} onPress={confirmDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </RectButton>
        )}
      >
        <PressableScale
          onPress={onPress}
          onLongPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert(category?.name ?? 'Transaction', undefined, [
              { text: 'Edit', onPress },
              { text: 'Delete', style: 'destructive', onPress: confirmDelete },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <CategoryBadge
            name={category?.name ?? 'Unknown'}
            icon={category?.icon ?? 'ellipse'}
            color={category?.color ?? colors.textMuted}
          />
          <View style={styles.meta}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {category?.name ?? 'Unknown'}
            </Text>
            <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>
              {transaction.note || (transaction.type === 'income' ? 'Income' : 'Expense')}
            </Text>
          </View>
          <Text style={[styles.amount, { color: amountColor }]}>
            {formatSignedCurrency(transaction.amount, currency, transaction.type)}
          </Text>
        </PressableScale>
      </Swipeable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  meta: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700' },
  note: { fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
  delete: {
    width: 88,
    marginLeft: 8,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: { color: '#fff', fontWeight: '700' },
});
