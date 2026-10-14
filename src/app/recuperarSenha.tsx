import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function RecuperarSenhaScreen() {
  const theme = useTheme();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ ...styles.container, backgroundColor: theme.colors.background }}
    >
      <Text>RecuperarSenha Screen</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
