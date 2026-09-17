import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '@/navigation/types';
import { Screen } from '@/components/Screen';
import { PressableScale } from '@/components/PressableScale';
import { useAppTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CURRENCIES } from '@/constants/currency';

const SLIDES = [
  {
    icon: 'wallet-outline' as const,
    title: 'Track every rupee',
    body: 'Log income and expenses in seconds, with categories that actually match how you spend.',
  },
  {
    icon: 'pie-chart-outline' as const,
    title: 'See the pattern',
    body: 'Monthly reports and category breakdowns make it obvious where money goes.',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Stay on budget',
    body: 'Set limits, get warnings, and keep everything on this device with SQLite.',
  },
];

export function OnboardingScreen(_props: RootStackScreenProps<'Onboarding'>) {
  const { colors } = useAppTheme();
  const [index, setIndex] = useState(0);
  const currency = useSettingsStore((state) => state.currency);
  const setCurrency = useSettingsStore((state) => state.setCurrency);
  const completeOnboarding = useSettingsStore((state) => state.completeOnboarding);
  const loadSampleData = useFinanceStore((state) => state.loadSampleData);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  const finish = async (withSample: boolean) => {
    if (withSample) {
      await loadSampleData();
    }
    await completeOnboarding();
  };

  return (
    <Screen>
      <View style={styles.top}>
        <PressableScale onPress={() => void finish(false)}>
          <Text style={[styles.skip, { color: colors.textMuted }]}>Skip</Text>
        </PressableScale>
      </View>

      <View style={styles.center}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={slide.icon} size={42} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>{slide.body}</Text>
      </View>

      {last ? (
        <View style={{ gap: 10, marginBottom: 18 }}>
          <Text style={[styles.currencyLabel, { color: colors.textMuted }]}>Currency</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((item) => {
              const active = currency === item.code;
              return (
                <PressableScale
                  key={item.code}
                  onPress={() => void setCurrency(item.code)}
                  style={[
                    styles.currency,
                    {
                      backgroundColor: active ? colors.primarySoft : colors.surface,
                      borderColor: active ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.currencyText, { color: active ? colors.primary : colors.text }]}>
                    {item.code}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.dots}>
        {SLIDES.map((item, dot) => (
          <View
            key={item.title}
            style={[
              styles.dot,
              { backgroundColor: dot === index ? colors.primary : colors.border },
            ]}
          />
        ))}
      </View>

      {last ? (
        <View style={{ gap: 10 }}>
          <PressableScale onPress={() => void finish(true)} style={[styles.cta, { backgroundColor: colors.primary }]}>
            <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Start with demo data</Text>
          </PressableScale>
          <PressableScale onPress={() => void finish(false)} style={[styles.ghost, { borderColor: colors.border }]}>
            <Text style={[styles.ghostText, { color: colors.text }]}>Start fresh</Text>
          </PressableScale>
        </View>
      ) : (
        <PressableScale onPress={() => setIndex((value) => value + 1)} style={[styles.cta, { backgroundColor: colors.primary }]}>
          <Text style={[styles.ctaText, { color: colors.onPrimary }]}>Continue</Text>
        </PressableScale>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end', paddingTop: 8 },
  skip: { fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12 },
  currencyLabel: { fontWeight: '800', fontSize: 12, textTransform: 'uppercase' },
  currencyRow: { flexDirection: 'row', gap: 8 },
  currency: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  currencyText: { fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 18 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cta: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 18 },
  ctaText: { fontSize: 16, fontWeight: '800' },
  ghost: { borderWidth: 1, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 18 },
  ghostText: { fontSize: 16, fontWeight: '700' },
});
