import { AuthContext } from '@/context/AuthProvider';
import { router } from 'expo-router';
import { useContext } from 'react';
import { Button, StyleSheet, View } from 'react-native';

export default function Menu() {
  const { signOut } = useContext<any>(AuthContext);

  async function handleSair() {
    await signOut();
    router.replace('/entrar');
  }

  return (
    <View style={styles.container}>
      <Button title="Sair" onPress={handleSair} />
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
