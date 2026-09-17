import { create } from 'zustand';
import type { AppSettings, CurrencyCode, ThemePreference } from '@/types';
import * as settingsRepo from '@/services/settingsRepository';

interface SettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemePreference) => Promise<void>;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  currency: 'INR',
  hasOnboarded: false,
  hydrated: false,

  hydrate: async () => {
    const settings = await settingsRepo.getSettings();
    set({ ...settings, hydrated: true });
  },

  setTheme: async (theme) => {
    set({ theme });
    await settingsRepo.setTheme(theme);
  },

  setCurrency: async (currency) => {
    set({ currency });
    await settingsRepo.setCurrency(currency);
  },

  completeOnboarding: async () => {
    set({ hasOnboarded: true });
    await settingsRepo.setOnboarded(true);
  },
}));
