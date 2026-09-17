import type { AppSettings, CurrencyCode, ThemePreference } from '@/types';
import { getDatabase } from '@/services/database';
import { mapSettings, type SettingsRow } from '@/services/mappers';

export async function getSettings(): Promise<AppSettings> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM settings WHERE id = 1');
  if (!row) {
    return { theme: 'system', currency: 'INR', hasOnboarded: false };
  }
  return mapSettings(row);
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE settings SET theme = ?, currency = ?, has_onboarded = ? WHERE id = 1',
    [next.theme, next.currency, next.hasOnboarded ? 1 : 0],
  );
}

export async function setTheme(theme: ThemePreference) {
  await updateSettings({ theme });
}

export async function setCurrency(currency: CurrencyCode) {
  await updateSettings({ currency });
}

export async function setOnboarded(hasOnboarded: boolean) {
  await updateSettings({ hasOnboarded });
}
