import { Tabs } from 'expo-router';
import { Icon, useTheme } from 'react-native-paper';

// Barra de abas do app: Home, Hábito e Menu
export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.outlineVariant },
        headerShown: false,
      }}
    >
      {/* Aba Home */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon source="account-group" color={theme.colors.primary} size={20} />,
        }}
      />
      {/* Aba Hábito */}
      <Tabs.Screen
        name="habito"
        options={{
          title: 'Hábito',
          tabBarIcon: ({ color }) => <Icon source="calendar-check" color={theme.colors.primary} size={20} />,
        }}
      />
      {/* Aba Menu */}
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
