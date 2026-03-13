import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { AppModeProvider } from '@/contexts/app-mode-context';
import { AuthProvider } from '@/contexts/auth-context';
import { BookingsProvider } from '@/contexts/bookings-context';
import { LanguageProvider } from '@/contexts/language-context';
import { useAppMode } from '@/hooks/use-app-mode';
import { useLanguage } from '@/hooks/use-language';
import { ThemeColors } from '@/constants/theme';

function RootNavigator() {
  const { mode, isInitialized, hasOnboarded } = useAppMode();
  const { strings } = useLanguage();
  const colors = ThemeColors[mode];

  if (!isInitialized) return null;

  const navigationTheme = mode === 'nightlife'
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.primary,
        },
      };

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack>
        {!hasOnboarded ? (
          <Stack.Screen
            name="onboarding"
            options={{ headerShown: false, gestureEnabled: false }}
          />
        ) : null}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="venue/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="booking/[venueId]"
          options={{
            title: strings.booking.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
        <Stack.Screen
          name="booking-detail/[id]"
          options={{
            title: strings.bookingDetail.title,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
        <Stack.Screen
          name="booking/confirmation"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="filter"
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="ai-assistant"
          options={{
            headerShown: false,
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />
        <Stack.Screen
          name="auth/login"
          options={{
            presentation: 'modal',
            title: strings.profile.signIn,
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.text,
          }}
        />
      </Stack>
      <StatusBar style={mode === 'nightlife' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Oswald-Regular': require('@expo-google-fonts/oswald/400Regular/Oswald_400Regular.ttf'),
    'Oswald-Medium': require('@expo-google-fonts/oswald/500Medium/Oswald_500Medium.ttf'),
    'Oswald-SemiBold': require('@expo-google-fonts/oswald/600SemiBold/Oswald_600SemiBold.ttf'),
    'Oswald-Bold': require('@expo-google-fonts/oswald/700Bold/Oswald_700Bold.ttf'),
    'Geist-Regular': require('@expo-google-fonts/geist/400Regular/Geist_400Regular.ttf'),
    'Geist-Medium': require('@expo-google-fonts/geist/500Medium/Geist_500Medium.ttf'),
    'Geist-SemiBold': require('@expo-google-fonts/geist/600SemiBold/Geist_600SemiBold.ttf'),
    'Geist-Bold': require('@expo-google-fonts/geist/700Bold/Geist_700Bold.ttf'),
    'JetBrainsMono-Regular': require('@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf'),
    'JetBrainsMono-Medium': require('@expo-google-fonts/jetbrains-mono/500Medium/JetBrainsMono_500Medium.ttf'),
    'JetBrainsMono-SemiBold': require('@expo-google-fonts/jetbrains-mono/600SemiBold/JetBrainsMono_600SemiBold.ttf'),
    'JetBrainsMono-Bold': require('@expo-google-fonts/jetbrains-mono/700Bold/JetBrainsMono_700Bold.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppModeProvider>
          <AuthProvider>
            <BookingsProvider>
              <RootNavigator />
            </BookingsProvider>
          </AuthProvider>
        </AppModeProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
