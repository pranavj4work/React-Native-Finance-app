import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { useAppTheme } from '@/theme/ThemeContext';

interface Props {
  children: ReactNode;
  padded?: boolean;
  edges?: Edge[];
}

export function Screen({ children, padded = true, edges = ['top'] }: Props) {
  const { colors } = useAppTheme();
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
