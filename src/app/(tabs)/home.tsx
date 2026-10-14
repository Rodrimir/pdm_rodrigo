import { ImageBackground, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <View style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <ImageBackground
        style={styles.fundo}
        imageStyle={styles.fundoImagem}
        source={require('../../../assets/images/icon.png')}
        resizeMode="contain"
      >
        <Text style={styles.titulo} variant="headlineMedium">
          Bem vindo ao Tempo Claro!
        </Text>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fundo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fundoImagem: {
    opacity: 0.2,
  },
  titulo: {
    textAlign: 'center',
  },
});
