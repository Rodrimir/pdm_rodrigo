import { AuthProvider } from '@/context/AuthProvider';
import { UserProvider } from '@/context/UserProvider';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

//Ampliando o tema padrão
const themeLight = {
  ...MD3LightTheme,
};

const themeDark = {
  ...MD3DarkTheme,
};

const temaDoApp = true;

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={temaDoApp ? themeLight : themeDark}>
      <AuthProvider>
        <UserProvider>
          <StatusBar style="dark" />
          <Stack
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="index" />
            <Stack.Screen name="entrar" />
            <Stack.Screen name="cadastrar" />
            <Stack.Screen name="recuperarSenha" />
            <Stack.Screen name="perfil" />
          </Stack>
        </UserProvider>
      </AuthProvider>
    </PaperProvider>
  );
}
