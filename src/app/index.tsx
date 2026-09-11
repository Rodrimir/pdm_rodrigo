/* eslint-disable react-hooks/exhaustive-deps */
import { AuthContext } from '@/context/AuthProvider';
import { router } from 'expo-router';
import { useContext, useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function PreloadScreen() {
  const theme = useTheme();
  const { recuperaCredencialdaCache, entrar } = useContext<any>(AuthContext);

  async function logar() {
    const credencial = await recuperaCredencialdaCache();
    if (credencial !== 'null') {
      //se tem credenciais armazenadas tenta logar
      const mensagem = await entrar(credencial);
      if (mensagem === 'ok') {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/entrar');
      }
    } else {
      router.replace('/entrar');
    }
  }

  useEffect(() => {
    logar();
  }, []);

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
    width: 250,
    height: 250,
  },
});
