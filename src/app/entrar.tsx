import { AuthContext } from '@/context/AuthProvider';
import { Credentials } from '@/model/types';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function Entrar(data: Credentials) {
  const theme = useTheme<any>();
  const { signIn } = useContext<any>(AuthContext);
  const [email, setEmail] = useState(data.email);
  const [senha, setSenha] = useState(data.senha);
  const [erro, setErro] = useState('');

  async function handleEntrar() {
    const msg = await signIn(email, senha);
    if (msg === 'ok') {
      router.replace('/(tabs)/home');
    } else {
      setErro(msg);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Entrar</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder="Senha"
        secureTextEntry
      />

      {erro ? <Text>{erro}</Text> : null}

      <Button title="Entrar" onPress={handleEntrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
});
