/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */
import { AuthContext } from '@/context/AuthProvider';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Image, Platform, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

//1. Configurar o manipulador de notificações: define como elas aparecem com o app aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // mostra o aviso no topo da tela
    shouldShowList: true, // deixa na lista de notificações
    shouldPlaySound: true, // toca o som
    shouldSetBadge: false, // não mexe no contador do ícone
  }),
});

/*
  Outros passos devem ser dados, são eles:
  5. Configuração do Firebase no projeto (envolve obter o google-services.json e configurar o app.config.ts)
  6. Criar o app em modo desenvolvimento (profile development), seguindo os passos de: https://expo.dev/blog/expo-go-vs-development-builds
*/

// Tela de Preload: primeira tela do app, tenta o login automático e prepara as notificações
export default function PreloadScreen() {
  const theme = useTheme();
  const { getCredencialDaCache, signInComEmailESenha } = useContext<any>(AuthContext);

  useEffect(() => {
    // Ao montar o componente, tenta logar com as credenciais da cache
    logarComCredencialDaCache();

    //2. Registra o dispositivo para receber notificações
    registrarDispositivoParaReceberNotificacoes();

    //4. O Expo não suporta tópicos do FCM. Para contornar essa limitação, o token do dispositivo
    // é cadastrado no Firestore. Veja cadastrarTokenDispositivoNoFirestore() no FcmProvider.tsx.
  }, []);

  // Cria o canal do Android e pede a permissão de notificações
  async function registrarDispositivoParaReceberNotificacoes(): Promise<void> {
    if (Platform.OS === 'android') {
      // Configura o canal de notificação para Android; a permissão só é pedida depois de existir um canal
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Tempo Claro',
        importance: AndroidImportance.MAX, // prioridade máxima: aparece com destaque
        vibrationPattern: [0, 50, 10, 50], // espera, vibra, pausa, vibra (em ms)
        lightColor: theme.colors.error,
      });
    }

    //3. Solicitar permissões de notificação (só em celular de verdade)
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Se o usuário ainda não permitiu, abre a pergunta do sistema
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        tratarErroDeRegistroDeNotificacoes(
          'Permissão negada. Você não receberá notificações até que a permissão seja concedida.',
        );
        return;
      }
    }
  }

  // Avisa o usuário que a permissão de notificações foi negada
  function tratarErroDeRegistroDeNotificacoes(mensagemDeErro: string) {
    alert(mensagemDeErro);
  }

  // Faz o login automático e decide para qual tela o app vai
  async function logarComCredencialDaCache() {
    const credencial = await getCredencialDaCache();
    if (credencial) {
      // Se tem credenciais armazenadas, tenta logar
      const mensagem = await signInComEmailESenha(credencial);
      if (mensagem === 'ok') {
        // Se o app foi aberto pelo toque em uma notificação, usa a rota enviada nos dados dela
        const ultimaNotificacao = Notifications.getLastNotificationResponse();
        const rota = ultimaNotificacao?.notification.request.content.data?.rota;
        Notifications.clearLastNotificationResponse();
        switch (rota) {
          case 'habito':
            router.replace('/(tabs)/habito');
            break;
          default:
            router.replace('/(tabs)/home');
        }
      } else {
        // Se não consegue logar, vai para a tela de login
        router.replace('/entrar');
      }
    } else {
      router.replace('/entrar');
    }
  }

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Image
        style={styles.imagem}
        source={require('../assets/images/icon.png')}
        accessibilityLabel="logo do app"
      />
    </View>
  );
}

// Estilos da tela de Preload
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
