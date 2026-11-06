import { AuthProvider } from '@/context/AuthProvider';
import { FcmProvider } from '@/context/FcmProvider';
import { HabitoProvider } from '@/context/HabitoProvider';
import { UserContext, UserProvider } from '@/context/UserProvider';
import { Tema } from '@/model/Tema';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

// Segura a splash até o app estar pronto
SplashScreen.preventAutoHideAsync();

// Tema claro do app
const themeLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200ee',
    white: '#fff',
    black: '#000',
  },
};

// Tema escuro do app
const themeDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    white: '#fff',
    black: '#000',
  },
};

// Fica dentro dos Providers porque o tema depende do perfil do usuário
function AppComTema() {
  const colorScheme = useColorScheme();
  const { usuerFirebase } = useContext<any>(UserContext);

  // Usa o tema do perfil; antes do login, segue o celular
  const escuro = usuerFirebase ? usuerFirebase.tema === Tema.Escuro : colorScheme === 'dark';
  const theme = escuro ? themeDark : themeLight;

  return (
    // Entrega o tema para todos os componentes do Paper
    <PaperProvider theme={theme}>
      <StatusBar style={escuro ? 'light' : 'dark'} />
      {/* Telas do app, sem o cabeçalho padrão */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="index" />
        <Stack.Screen name="entrar" />
        <Stack.Screen name="cadastrar" />
        <Stack.Screen name="recuperarSenha" />
        <Stack.Screen name="perfil" />
      </Stack>
    </PaperProvider>
  );
}

// Layout raiz: organiza os Providers e a navegação do app
export default function RootLayout() {
  // Esconde a splash quando o layout é montado
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <FcmProvider>
        <UserProvider>
          <HabitoProvider>
            <AppComTema />
          </HabitoProvider>
        </UserProvider>
      </FcmProvider>
    </AuthProvider>
  );
}
