/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
import { AuthContext } from '@/context/AuthProvider';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Preload() {
  const theme = useTheme();
  const { getCredencialDaCache, signInComEmailESenha } = useContext<any>(AuthContext);

  useEffect(() => {
    logarComCredencialDaCache();

    registerForPushNotificationsAsync();
    sendNotification();
  }, []);

  async function logarComCredencialDaCache(): Promise<void> {
    const credencial = await getCredencialDaCache();
    if (credencial) {
      const result = await signInComEmailESenha(credencial);
      if (result === 'ok') {
        const lastNotification = await Notifications.getLastNotificationResponseAsync();
        switch (lastNotification?.notification.request.content.data?.rota) {
          case 'habito':
            router.replace('/(tabs)/habito');
            break;
          case 'home':
            router.replace('/(tabs)/home');
            break;
          default:
            router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/entrar');
      }
    } else {
      router.replace('/entrar');
    }
  }

  async function registerForPushNotificationsAsync(): Promise<void> {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('padrao', {
        name: 'padrao',
        importance: AndroidImportance.HIGH,
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        handleRegistrationError(
          'Permissão negada. Você não receberá notificações até que a permissão seja concedida.',
        );
        return;
      }
    }
  }

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  const sendNotification = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Título In App',
        body: 'Este é o corpo da Notificação In App!!!.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  };

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Image
        style={styles.imagem}
        source={require('../../assets/images/icon.png')}
        accessibilityLabel="logo do app"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagem: {
    width: 50,
    height: 50,
  },
});
