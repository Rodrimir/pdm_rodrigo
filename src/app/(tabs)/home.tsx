import { StyleSheet, Text, View } from 'react-native';

// Rota de destino apos o login. O conteudo (lista de documentos e busca) sera
// desenvolvido no Modulo 3, junto com o CRUD via SDK do Firestore.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
