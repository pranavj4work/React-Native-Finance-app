import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { MainTabScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CURRENCIES } from '@/constants/currency';
import { exportTransactionsCsv } from '@/services/csvExport';
import type { ThemePreference } from '@/types';

const THEMES: {
  value: ThemePreference;
  label: string;
  caption: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: 'light', label: 'Light', caption: 'Bright', icon: 'sunny' },
  { value: 'dark', label: 'Dark', caption: 'Dimmed', icon: 'moon' },
  { value: 'system', label: 'System', caption: 'Auto', icon: 'phone-portrait-outline' },
];

function ThemePreview({ mode }: { mode: ThemePreference }) {
  if (mode === 'system') {
    return (
      <View style={styles.previewShell}>
        <View style={[styles.previewPane, styles.previewLight]}>
          <View style={styles.previewBarLight} />
          <View style={styles.previewCardLight} />
          <View style={styles.previewCardLight} />
        </View>
        <View style={[styles.previewPane, styles.previewDark]}>
          <View style={styles.previewBarDark} />
          <View style={styles.previewCardDark} />
          <View style={styles.previewCardDark} />
        </View>
      </View>
    );
  }

  const dark = mode === 'dark';
  return (
    <View style={[styles.previewShell, styles.previewColumn, dark ? styles.previewDark : styles.previewLight]}>
      <View style={dark ? styles.previewBarDark : styles.previewBarLight} />
      <View style={dark ? styles.previewCardDark : styles.previewCardLight} />
      <View style={dark ? styles.previewCardDark : styles.previewCardLight} />
    </View>
  );
}

export function SettingsScreen({ navigation }: MainTabScreenProps<'Settings'>) {
  const { colors } = useAppTheme();
  const theme = useSettingsStore((state) => state.theme);
  const currency = useSettingsStore((state) => state.currency);
  const setTheme = useSettingsStore((state) => state.setTheme);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const transactions = useFinanceStore((state) => state.transactions);
  const categories = useFinanceStore((state) => state.categories);
  const loadSampleData = useFinanceStore((state) => state.loadSampleData);
  const clearAllData = useFinanceStore((state) => state.clearAllData);

  const onExport = async () => {
    try {
      await exportTransactionsCsv(transactions, categories, currency);
    } catch (error) {
      Alert.alert('Export failed', error instanceof Error ? error.message : 'Please try again.');
    }
  };

  const onSample = () => {
    Alert.alert('Load demo data?', 'This replaces current transactions, budgets, and recurring rules.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Load',
        onPress: () => {
          void loadSampleData();
        },
      },
    ]);
  };

  const onClear = () => {
    Alert.alert('Clear all data?', 'Transactions, budgets, and recurring rules will be removed. Categories stay.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void clearAllData();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        <Text style={[styles.group, { color: colors.textMuted }]}>Appearance</Text>
        <View style={[styles.card, styles.appearanceCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.themeRow}>
            {THEMES.map((item) => {
              const active = theme === item.value;
              return (
                <PressableScale
                  key={item.value}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    void setTheme(item.value);
                  }}
                  style={[
                    styles.themeOption,
                    {
                      borderColor: active ? colors.primary : colors.border,
                      backgroundColor: active ? colors.primarySoft : colors.background,
                    },
                  ]}
                >
                  <ThemePreview mode={item.value} />
                  <View style={styles.themeMeta}>
                    <Ionicons
                      name={item.icon}
                      size={14}
                      color={active ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.themeLabel, { color: active ? colors.primary : colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  <Text style={[styles.themeCaption, { color: colors.textMuted }]}>{item.caption}</Text>
                  {active ? (
                    <View style={[styles.themeCheck, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={11} color={colors.onPrimary} />
                    </View>
                  ) : null}
                </PressableScale>
              );
            })}
          </View>
          <Text style={[styles.themeHint, { color: colors.textMuted }]}>
            {theme === 'system'
              ? "Follows your phone's light or dark setting."
              : theme === 'dark'
                ? 'Dark theme is on across Finora.'
                : 'Light theme is on across Finora.'}
          </Text>
        </View>

        <Text style={[styles.group, { color: colors.textMuted }]}>Currency</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {CURRENCIES.map((item) => {
            const active = currency === item.code;
            return (
              <PressableScale
                key={item.code}
                onPress={() => void setCurrency(item.code)}
                style={styles.settingRow}
              >
                <Text style={[styles.settingLabel, { color: colors.text }]}>
                  {item.symbol}  {item.label}
                </Text>
                {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
              </PressableScale>
            );
          })}
        </View>

        <Text style={[styles.group, { color: colors.textMuted }]}>Data</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PressableScale onPress={() => navigation.navigate('Categories')} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Manage categories</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </PressableScale>
          <PressableScale onPress={onExport} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Export CSV</Text>
            <Ionicons name="share-outline" size={18} color={colors.textMuted} />
          </PressableScale>
          <PressableScale onPress={onSample} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Load sample data</Text>
            <Ionicons name="sparkles-outline" size={18} color={colors.textMuted} />
          </PressableScale>
          <PressableScale onPress={onClear} style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.danger }]}>Clear all data</Text>
          </PressableScale>
        </View>

        <Text style={[styles.group, { color: colors.textMuted }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, padding: 16 }]}>
          <Text style={[styles.aboutTitle, { color: colors.text }]}>Finora</Text>
          <Text style={[styles.about, { color: colors.textMuted }]}>
            A local-first expense tracker built with Expo, TypeScript, Zustand, and SQLite. Your money
            data never leaves this device.
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 40, gap: 12, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8 },
  group: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  appearanceCard: { padding: 12, overflow: 'visible' },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 8,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  previewShell: {
    width: '100%',
    height: 76,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  previewColumn: { flexDirection: 'column', padding: 8, gap: 5 },
  previewPane: { flex: 1, padding: 6, gap: 4 },
  previewLight: { backgroundColor: '#F3F6F4' },
  previewDark: { backgroundColor: '#0B1110' },
  previewBarLight: { height: 7, width: '70%', borderRadius: 4, backgroundColor: '#0F766E' },
  previewBarDark: { height: 7, width: '70%', borderRadius: 4, backgroundColor: '#2DD4BF' },
  previewCardLight: { height: 16, borderRadius: 5, backgroundColor: '#FFFFFF' },
  previewCardDark: { height: 16, borderRadius: 5, backgroundColor: '#151C1B' },
  themeMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  themeLabel: { fontSize: 13, fontWeight: '800' },
  themeCaption: { fontSize: 11, fontWeight: '600', marginTop: -4 },
  themeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeHint: { fontSize: 12, fontWeight: '600', marginTop: 12, paddingHorizontal: 4, lineHeight: 17 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  aboutTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
  about: { fontSize: 14, lineHeight: 20 },
});
