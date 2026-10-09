import { AuthContext } from '@/context/AuthProvider';
import { yupResolver } from '@hookform/resolvers/yup';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

const requiredMessage = 'Campo obrigatório';

// Schema do Yup usado pelo React Hook Form para validar o formulario
// antes de qualquer chamada ao Firebase.
const schema = yup
  .object()
  .shape({
    email: yup
      .string()
      .required(requiredMessage)
      .matches(/\S+@\S+\.\S+/, 'Email inválido'),
  })
  .required();

// Tela de recuperacao de senha: recebe o email do usuario para que o Firebase
// envie o link de redefinicao.
export default function RecuperarSenhaScreen() {
  const theme = useTheme();
  const { recuperarSenha } = useContext<any>(AuthContext);
  const [enviando, setEnviando] = useState(false);
  const [dialogVisivel, setDialogVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', mensagem: '' });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  // Pede o envio do email de redefinicao e, em caso de sucesso, volta para a tela
  // de login depois que o usuario fecha o Dialog.
  async function enviarEmailDeRecuperacao(data: { email: string }) {
    setEnviando(true);
    const resposta = await recuperarSenha(data.email);
    setEnviando(false);
    if (resposta === 'ok') {
      setMensagem({
        tipo: 'ok',
        mensagem: 'Enviamos um link para a redefinição da sua senha. Verifique seu email.',
      });
    } else {
      setMensagem({ tipo: 'erro', mensagem: resposta });
    }
    setDialogVisivel(true);
  }

  // Formulario montado com componentes do React Native Paper e Controller do Hook Form.
  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <Text style={styles.titulo} variant="titleLarge">
          Recuperar Senha
        </Text>
        <Text style={styles.subtitulo} variant="bodyMedium">
          Informe o email cadastrado para receber o link de redefinição da sua senha.
        </Text>
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textinput}
              label="Email"
              placeholder="Digite seu email"
              mode="outlined"
              autoCapitalize="none"
              returnKeyType="go"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              right={<TextInput.Icon icon="email" />}
            />
          )}
          name="email"
        />
        {errors.email && (
          <Text style={{ ...styles.textError, color: theme.colors.error }}>
            {errors.email?.message?.toString()}
          </Text>
        )}
        <Button
          style={styles.button}
          mode="contained"
          onPress={handleSubmit(enviarEmailDeRecuperacao)}
          loading={enviando}
          disabled={enviando}
        >
          {!enviando ? 'Enviar' : 'Enviando'}
        </Button>
        <Button mode="outlined" onPress={() => router.back()} disabled={enviando}>
          Voltar
        </Button>
      </ScrollView>
      <Dialog
        visible={dialogVisivel}
        onDismiss={() => {
          setDialogVisivel(false);
          if (mensagem.tipo === 'ok') {
            router.back();
          }
        }}
      >
        <Dialog.Icon
          icon={mensagem.tipo === 'ok' ? 'checkbox-marked-circle-outline' : 'alert-circle-outline'}
          size={60}
        />
        <Dialog.Title style={styles.textDialog}>
          {mensagem.tipo === 'ok' ? 'Informação' : 'Erro'}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {mensagem.mensagem}
          </Text>
        </Dialog.Content>
      </Dialog>
    </SafeAreaView>
  );
}

// Estilos da tela.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  titulo: {
    marginTop: 80,
    textAlign: 'center',
  },
  subtitulo: {
    width: 350,
    marginTop: 10,
    textAlign: 'center',
  },
  textinput: {
    width: 350,
    height: 50,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  textError: {
    width: 350,
  },
  button: {
    marginTop: 40,
    marginBottom: 20,
  },
  textDialog: {
    textAlign: 'center',
  },
});
