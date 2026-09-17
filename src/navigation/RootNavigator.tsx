import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import type { RootStackParamList } from '@/navigation/types';
import { TabNavigator } from '@/navigation/TabNavigator';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { AddTransactionScreen } from '@/screens/AddTransactionScreen';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { CategoryFormScreen } from '@/screens/CategoryFormScreen';
import { BudgetEditorScreen } from '@/screens/BudgetEditorScreen';
import { useAppTheme } from '@/theme/ThemeContext';
import { useSettingsStore } from '@/store/useSettingsStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const hasOnboarded = useSettingsStore((state) => state.hasOnboarded);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.expense,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {!hasOnboarded ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen name="Categories" component={CategoriesScreen} options={{ headerShown: false }} />
            <Stack.Screen
              name="CategoryForm"
              component={CategoryFormScreen}
              options={{ presentation: 'modal', title: '' }}
            />
            <Stack.Screen
              name="BudgetEditor"
              component={BudgetEditorScreen}
              options={{ title: '' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
