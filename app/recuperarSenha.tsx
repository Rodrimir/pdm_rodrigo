import { KeyboardAvoidingView, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

// Tela de recuperação de senha
export default function RecuperarSenhaScreen() {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <Text>RecuperarSenha Screen</Text>
    </KeyboardAvoidingView>
  );
}

// Estilos da tela de recuperação de senha
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
