import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { PressableScale } from '@/components/PressableScale';

export function FAB({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <PressableScale
        onPress={onPress}
        hitSlop={8}
        style={[styles.fab, { backgroundColor: colors.fab, shadowColor: colors.primary }]}
      >
        <Ionicons name="add" size={28} color={colors.onPrimary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    zIndex: 50,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
});
