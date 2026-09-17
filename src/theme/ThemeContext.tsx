import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorTokens } from '@/theme/tokens';
import { useSettingsStore } from '@/store/useSettingsStore';

interface ThemeContextValue {
  colors: ColorTokens;
  isDark: boolean;
  preference: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  preference: 'system',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preference = useSettingsStore((state) => state.theme);
  const system = useColorScheme();
  const resolved = preference === 'system' ? system ?? 'light' : preference;
  const isDark = resolved === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, preference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
