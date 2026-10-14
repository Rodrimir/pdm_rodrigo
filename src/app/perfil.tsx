import { UserContext } from '@/context/UserProvider';
import { yupResolver } from '@hookform/resolvers/yup';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useContext, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Dialog, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';
import { Idioma } from '../model/Idioma';
import { Tema } from '../model/Tema';
import { Usuario } from '../model/Usuario';

const requiredMessage = 'Campo obrigatório';

const schema = yup
  .object()
  .shape({
    nome: yup.string().required(requiredMessage).min(2, 'O nome deve ter ao menos 2 caracteres'),
    email: yup.string().matches(/\S+@\S+\.\S+/, {
      message: 'Email inválido',
      excludeEmptyString: true,
    }),
    idioma: yup.string().required(requiredMessage),
    tema: yup.string().required(requiredMessage),
  })
  .required();

export default function Perfil() {
  const theme = useTheme();
  const { usuerFirebase } = useContext<any>(UserContext);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      nome: '',
      email: '',
      idioma: Idioma.ptBR,
      tema: Tema.Claro,
    },
    values: usuerFirebase
      ? {
          nome: usuerFirebase.nome ?? '',
          email: usuerFirebase.email ?? '',
          idioma: Object.values(Idioma).includes(usuerFirebase.idioma) ? usuerFirebase.idioma : Idioma.ptBR,
          tema: Object.values(Tema).includes(usuerFirebase.tema) ? usuerFirebase.tema : Tema.Claro,
        }
      : undefined,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });
  const [requisitando, setRequisitando] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [dialogErroVisivel, setDialogErroVisivel] = useState(false);
  const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', mensagem: '' });
  const [urlFotoDevice, setUrlFotoDevice] = useState('');
  const { update, del } = useContext(UserContext);

  async function atualizaPerfil(data: Usuario) {
    if (!usuerFirebase) {
      return;
    }
    setRequisitando(true);
    setAtualizando(true);
    data.uid = usuerFirebase.uid;
    data.urlFoto = usuerFirebase.urlFoto ?? '';
    const msg = await update(data, urlFotoDevice);
    if (msg === 'ok') {
      setMensagem({
        tipo: 'ok',
        mensagem: 'Show! Seu perfil foi atualizado com sucesso.',
      });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setAtualizando(false);
    } else {
      setMensagem({ tipo: 'erro', mensagem: msg });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setAtualizando(false);
    }
  }

  async function escolherDaGaleria() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Precisamos de permissão para acessar a galeria.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!resultado.canceled) {
      setUrlFotoDevice(resultado.assets[0].uri);
    }
  }

  async function tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert('Precisamos de permissão para acessar a câmera.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!resultado.canceled) {
      setUrlFotoDevice(resultado.assets[0].uri);
    }
  }

  function avisarDaExclusaoPermanenteDaConta() {
    setDialogExcluirVisivel(true);
  }

  async function excluirConta() {
    if (!usuerFirebase) {
      return;
    }
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    setExcluindo(true);
    const msg = await del(usuerFirebase.uid);
    if (msg === 'ok') {
      router.replace('/entrar');
    } else {
      setMensagem({ tipo: 'erro', mensagem: msg });
      setDialogErroVisivel(true);
      setRequisitando(false);
      setExcluindo(false);
    }
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <ScrollView>
        <>
          {urlFotoDevice || usuerFirebase?.urlFoto ? (
            <Image style={styles.image} source={{ uri: urlFotoDevice || usuerFirebase.urlFoto }} />
          ) : (
            <Avatar.Icon style={styles.image} size={200} icon="account" />
          )}
          <View style={styles.divButtonsImage}>
            <Button style={styles.buttonImage} mode="outlined" icon="image" onPress={escolherDaGaleria}>
              Galeria
            </Button>
            <Button style={styles.buttonImage} mode="outlined" icon="camera" onPress={tirarFoto}>
              Foto
            </Button>
          </View>

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textinput}
                label="Nome"
                placeholder="Digite seu nome completo"
                mode="outlined"
                autoCapitalize="words"
                returnKeyType="next"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                right={<TextInput.Icon icon="smart-card" />}
              />
            )}
            name="nome"
          />
          {errors.nome && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.nome?.message?.toString()}
            </Text>
          )}

          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.textinput}
                disabled
                label="Email"
                placeholder="Digite seu email"
                mode="outlined"
                autoCapitalize="none"
                returnKeyType="next"
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

          <Text style={styles.label} variant="labelLarge">
            Idioma
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                style={styles.segmented}
                onValueChange={onChange}
                value={value}
                buttons={[
                  { value: Idioma.ptBR, label: Idioma.ptBR, icon: 'translate' },
                  { value: Idioma.enUS, label: Idioma.enUS, icon: 'translate' },
                ]}
              />
            )}
            name="idioma"
          />
          {errors.idioma && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.idioma?.message?.toString()}
            </Text>
          )}
          <Text style={styles.label} variant="labelLarge">
            Tema
          </Text>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => (
              <SegmentedButtons
                style={styles.segmented}
                onValueChange={onChange}
                value={value}
                buttons={[
                  { value: Tema.Claro, label: Tema.Claro, icon: 'white-balance-sunny' },
                  { value: Tema.Escuro, label: Tema.Escuro, icon: 'weather-night' },
                ]}
              />
            )}
            name="tema"
          />
          {errors.tema && (
            <Text style={{ ...styles.textError, color: theme.colors.error }}>
              {errors.tema?.message?.toString()}
            </Text>
          )}
          <Button
            style={styles.button}
            mode="contained"
            onPress={handleSubmit(atualizaPerfil)}
            loading={requisitando}
            disabled={requisitando}
          >
            {!atualizando ? 'Atualizar' : 'Atualizando'}
          </Button>
          <Button
            style={styles.buttonOthers}
            mode="outlined"
            onPress={avisarDaExclusaoPermanenteDaConta}
            loading={requisitando}
            disabled={requisitando}
          >
            {!excluindo ? 'Excluir' : 'Excluindo'}
          </Button>
        </>
      </ScrollView>
      <Dialog
        visible={dialogExcluirVisivel}
        onDismiss={() => {
          setDialogExcluirVisivel(false);
        }}
      >
        <Dialog.Icon icon={'alert-circle-outline'} size={60} />
        <Dialog.Title style={styles.textDialog}>{'Ops!'}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {'Você tem certeza que deseja excluir sua conta?\nEsta operação será irreversível.'}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogExcluirVisivel(false)}>Cancelar</Button>
          <Button onPress={excluirConta}>Excluir</Button>
        </Dialog.Actions>
      </Dialog>
      <Dialog
        visible={dialogErroVisivel}
        onDismiss={() => {
          setDialogErroVisivel(false);
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    borderRadius: 200 / 2,
    marginTop: 50,
  },
  divButtonsImage: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  buttonImage: {
    width: 180,
  },
  label: {
    width: 350,
    marginTop: 20,
    marginBottom: 6,
  },
  segmented: {
    width: 350,
  },
  textinput: {
    width: 350,
    height: 50,
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  textEsqueceuSenha: {
    alignSelf: 'flex-end',
    marginTop: 20,
  },
  textCadastro: {},
  textError: {
    width: 350,
  },
  button: {
    marginTop: 40,
  },
  buttonOthers: {
    marginTop: 20,
    marginBottom: 30,
  },
  textDialog: {
    textAlign: 'center',
  },
});
