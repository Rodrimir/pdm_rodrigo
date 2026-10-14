import { AuthProvider } from '@/context/AuthProvider';
import { UserProvider } from '@/context/UserProvider';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

// Segura a splash
SplashScreen.preventAutoHideAsync();

//Criar variaveis de tema clato e escito
const themeLight = {
  ...MD3LightTheme,
};

const themeDark = {
  ...MD3DarkTheme,
};

const temaDoApp = true;

// Layout raiz do app
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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
