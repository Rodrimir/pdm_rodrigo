import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Icon, useTheme } from 'react-native-paper';

// Navegabilidade por BottomTab exigida no Modulo 1: define as abas Home e Menu,
// que sao as rotas acessiveis depois que o usuario esta autenticado.
export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Icon source="account-group" color={theme.colors.primary} size={20} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Icon source="menu" color={theme.colors.primary} size={20} />,
        }}
      />
    </Tabs>
  );
}
