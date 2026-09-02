import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

import { AuthProvider } from '@/context/AuthProvider';

export default function RootLayout() {
  return (
    <PaperProvider>
      <AuthProvider>
        <Stack initialRouteName="entrar" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="entrar" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </PaperProvider>
  );
}
