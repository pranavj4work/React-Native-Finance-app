import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/theme/ThemeContext';
import { radius } from '@/theme/tokens';

interface Props {
  name: string;
  icon: string;
  color: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function CategoryBadge({ name, icon, color, size = 'md', showLabel = false }: Props) {
  const { colors } = useAppTheme();
  const dimension = size === 'sm' ? 36 : 44;

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.icon,
          {
            width: dimension,
            height: dimension,
            borderRadius: radius.md,
            backgroundColor: `${color}22`,
          },
        ]}
      >
        <Ionicons
          name={(icon as keyof typeof Ionicons.glyphMap) ?? 'ellipse'}
          size={size === 'sm' ? 16 : 20}
          color={color}
        />
      </View>
      {showLabel ? (
        <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
          {name}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '600', flex: 1 },
});
