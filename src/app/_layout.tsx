import { AuthProvider } from '@/context/AuthProvider';
import { UserProvider } from '@/context/UserProvider';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

// Segura a splash screen nativa para que ela so saia depois que o app montar.
SplashScreen.preventAutoHideAsync();

//Ampliando o tema padrão
const themeLight = {
  ...MD3LightTheme,
};

const themeDark = {
  ...MD3DarkTheme,
};

// Chave que escolhe entre o tema claro e o escuro do Material Design 3.
const temaDoApp = true;

// Layout raiz do app: envolve todas as rotas nos providers de tema, de autenticacao
// e de usuario, e declara a pilha de navegacao (Stack) comecando pelo preload (index).
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
