import { HabitoContext } from '@/context/HabitoProvider';
import { imagensAvatar } from '@/model/AvatarHabito';
import { useContext } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

// Tela Home: mostra o fundo do tema e o avatar do hábito
export default function HomeScreen() {
  const theme = useTheme();
  // Hábito da conta logada, atualizado em tempo real
  const { habito } = useContext<any>(HabitoContext);

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      {/* Fundo: noite no tema escuro e dia no tema claro */}
      <Image
        style={styles.fundo}
        source={
          theme.dark ? require('../../assets/images/noite.png') : require('../../assets/images/dia.png')
        }
        resizeMode="cover"
      />
      {/* Avatar do hábito, quando o usuário tem um */}
      {habito && (
        <Image
          style={styles.avatar}
          source={imagensAvatar[habito.avatar as keyof typeof imagensAvatar]}
          resizeMode="contain"
          accessibilityLabel={habito.nome}
        />
      )}
      {/* Boas-vindas, só quando o usuário não tem hábito */}
      {habito === null && (
        <Text style={styles.titulo} variant="headlineMedium">
          Bem vindo ao Tempo Claro!
        </Text>
      )}
    </View>
  );
}

// Estilos da tela Home
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  fundo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  avatar: {
    width: 220,
    height: 220,
    top: '15%', // 15% abaixo do meio da tela
  },
  titulo: {
    textAlign: 'center',
  },
});
