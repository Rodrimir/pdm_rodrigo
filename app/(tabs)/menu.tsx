import { AuthContext } from '@/context/AuthProvider';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dialog, Divider, List, Text, useTheme } from 'react-native-paper';

// Aba Menu: acesso ao perfil, à senha e à saída do app
export default function Menu() {
  const theme = useTheme();
  const { signOutDaContaDoUsuario } = useContext<any>(AuthContext);
  const [dialogVisivel, setDialogVisivel] = useState(false);

  // Sai da conta e volta para a tela de entrar; se falhar, mostra o aviso
  async function sairDoAplicativo() {
    const confirmacao = await signOutDaContaDoUsuario();
    if (confirmacao === 'ok') {
      router.replace('/entrar');
    } else {
      setDialogVisivel(true);
    }
  }

  // Lista de opções do menu
  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <List.Item
        title="Perfil"
        description="Atualize seu perfil ou exclua sua conta"
        left={() => <List.Icon color={theme.colors.primary} icon="smart-card-outline" />}
        onPress={() => router.push('../perfil')}
      />
      <Divider />
      <List.Item
        title="Alterar Senha"
        description="Altere sua senha"
        left={() => <List.Icon color={theme.colors.primary} icon="eye-arrow-right-outline" />}
        onPress={() => alert('criar pagina ..')}
      />
      <Divider />
      <List.Item
        title="Sair"
        description="Finaliza sua sessão no aplicativo"
        left={() => <List.Icon color={theme.colors.primary} icon="exit-run" />}
        onPress={sairDoAplicativo}
      />
      <Dialog
        visible={dialogVisivel}
        onDismiss={() => {
          setDialogVisivel(false);
        }}
      >
        <Dialog.Icon icon={'alert-circle-outline'} size={60} />
        <Dialog.Title style={styles.textDialog}>Ops!</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {`Estamos com problemas para realizar essa operação.\nPor favor,
            contate o administrador.`}
          </Text>
        </Dialog.Content>
      </Dialog>
    </View>
  );
}

// Estilos da tela Menu
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  textDialog: {
    textAlign: 'center',
  },
});
