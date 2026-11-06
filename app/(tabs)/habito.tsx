/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { HabitoContext } from '@/context/HabitoProvider';
import { AvatarHabito, imagensAvatar } from '@/model/AvatarHabito';
import { Execucao } from '@/model/Execucao';
import { Habito } from '@/model/Habito';
import { yupResolver } from '@hookform/resolvers/yup';
import { useContext, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  List,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as yup from 'yup';

// Mensagem padrão dos campos obrigatórios
const MensagemAlerta = 'Campo obrigatório';
// Opção do histórico que mostra as execuções de todos os avatares
const FiltroTodos = 'Todos';

// Validação com o Yup do formulário do hábito
const schemaHabito = yup
  .object()
  .shape({
    avatar: yup.string().required('Escolha um avatar'),
    nome: yup.string().required(MensagemAlerta).min(2, 'O nome deve ter ao menos 2 caracteres'),
    horario: yup
      .string()
      .required(MensagemAlerta)
      .matches(/^([01]\d|2[0-3]):[0-5]\d$/, 'Digite um horário válido, como 08:30'),
  })
  .required();

// Validação com o Yup do formulário da execução: aceita só números inteiros a partir de 1
const schemaExecucao = yup
  .object()
  .shape({
    quantidade: yup
      .number()
      .typeError('Digite apenas números')
      .required(MensagemAlerta)
      .integer('Digite apenas números inteiros')
      .min(1, 'A quantidade deve ser ao menos 1'),
  })
  .required();

// Mantém só os dígitos e coloca os dois pontos: 0830 vira 08:30
function formatarHorarioDigitado(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 4);
  return digitos.length > 2 ? `${digitos.slice(0, 2)}:${digitos.slice(2)}` : digitos;
}

// Mostra o dia e a hora em que a execução foi feita
function formatarDataHoraDaExecucao(data: Date): string {
  const dia = data.toLocaleDateString('pt-BR');
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} às ${hora}`;
}

// Aba Hábito: cria, atualiza e exclui o hábito, registra execuções e mostra o histórico
export default function HabitoScreen() {
  const theme = useTheme();
  const {
    habito,
    execucoes,
    salvarHabitoNoFirestore,
    excluirHabitoDoFirestore,
    adicionarExecucaoDoHabitoNoFirestore,
    getExecucoesDoUsuarioPeloAvatar,
  } = useContext<any>(HabitoContext);
  // Formulário do hábito, preenchido com o hábito atual quando ele existe
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<any>({
    defaultValues: { avatar: '', nome: '', horario: '' },
    values: { avatar: habito?.avatar ?? '', nome: habito?.nome ?? '', horario: habito?.horario ?? '' },
    mode: 'onSubmit',
    resolver: yupResolver(schemaHabito),
  });
  // Formulário da execução
  const {
    control: controlExecucao,
    handleSubmit: handleSubmitExecucao,
    reset: resetExecucao,
    formState: { errors: errorsExecucao },
  } = useForm<any>({
    defaultValues: { quantidade: '' },
    mode: 'onSubmit',
    resolver: yupResolver(schemaExecucao),
  });
  const [requisitando, setRequisitando] = useState(false);
  const [dialogMensagemVisivel, setDialogMensagemVisivel] = useState(false);
  const [dialogExcluirVisivel, setDialogExcluirVisivel] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', mensagem: '' });
  // Avatar escolhido no filtro do histórico
  const [filtro, setFiltro] = useState<string>(FiltroTodos);
  // Execuções mostradas no histórico
  const [execucoesFiltradas, setExecucoesFiltradas] = useState<Execucao[]>([]);
  // Soma das quantidades mostradas no histórico
  const totalExecucoes = execucoesFiltradas.reduce((total, execucao) => total + execucao.quantidade, 0);

  // Atualiza o histórico quando o filtro muda ou quando chega uma execução nova
  useEffect(() => {
    // Ignora a resposta antiga se o filtro mudar antes de ela chegar
    let ativo = true;
    if (filtro === FiltroTodos) {
      setExecucoesFiltradas(execucoes);
    } else {
      getExecucoesDoUsuarioPeloAvatar(filtro).then((resultado: Execucao[]) => {
        if (ativo) {
          setExecucoesFiltradas(resultado);
        }
      });
    }
    return () => {
      ativo = false;
    };
  }, [filtro, execucoes]);

  // Mostra a mensagem de sucesso ou de erro e libera os botões
  function exibirResultadoDaOperacao(msg: string, mensagemSucesso: string) {
    setMensagem(msg === 'ok' ? { tipo: 'ok', mensagem: mensagemSucesso } : { tipo: 'erro', mensagem: msg });
    setDialogMensagemVisivel(true);
    setRequisitando(false);
  }

  // Cria ou atualiza o hábito
  async function salvarHabito(data: Habito) {
    setRequisitando(true);
    const msg = await salvarHabitoNoFirestore(data);
    exibirResultadoDaOperacao(msg, habito ? 'Hábito atualizado com sucesso.' : 'Hábito criado com sucesso.');
  }

  // Exclui o hábito depois da confirmação
  async function excluirHabito() {
    setDialogExcluirVisivel(false);
    setRequisitando(true);
    const msg = await excluirHabitoDoFirestore();
    exibirResultadoDaOperacao(msg, 'Hábito excluído. As execuções continuam salvas no histórico.');
  }

  // Registra a execução para o avatar atual e limpa o campo
  async function registrarExecucaoDoHabito(data: { quantidade: number }) {
    setRequisitando(true);
    const msg = await adicionarExecucaoDoHabitoNoFirestore(habito.avatar, data.quantidade);
    if (msg === 'ok') {
      resetExecucao();
    }
    exibirResultadoDaOperacao(msg, 'Execução registrada com sucesso.');
  }

  return (
    <SafeAreaView style={{ ...styles.container, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.conteudo}>
        <Text style={styles.titulo} variant="headlineSmall">
          {habito ? 'Meu hábito' : 'Criar hábito'}
        </Text>

        {/* Com hábito: mostra o avatar atual. Sem hábito: mostra os cards para escolher */}
        {habito ? (
          <Image
            style={styles.avatarAtual}
            source={imagensAvatar[habito.avatar as AvatarHabito]}
            resizeMode="contain"
            accessibilityLabel={habito.avatar}
          />
        ) : (
          <>
            <Text variant="labelLarge">Escolha um avatar</Text>
            {/* Cards dos avatares */}
            <Controller
              control={control}
              render={({ field: { onChange, value } }) => (
                <View style={styles.divAvatares}>
                  {Object.values(AvatarHabito).map((avatar) => (
                    <Card
                      key={avatar}
                      style={{
                        ...styles.cardAvatar,
                        borderColor: value === avatar ? theme.colors.primary : 'transparent',
                      }}
                      onPress={() => onChange(avatar)}
                    >
                      <Image
                        style={styles.imagemAvatar}
                        source={imagensAvatar[avatar]}
                        resizeMode="contain"
                      />
                      <Text style={styles.nomeAvatar} variant="labelLarge">
                        {avatar}
                      </Text>
                    </Card>
                  ))}
                </View>
              )}
              name="avatar"
            />
            {errors.avatar && (
              <Text style={{ color: theme.colors.error }}>{errors.avatar?.message?.toString()}</Text>
            )}
          </>
        )}

        {/* Campo do nome do hábito */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textinput}
              label="Nome do hábito"
              placeholder="Digite o nome do hábito"
              mode="outlined"
              returnKeyType="next"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              right={<TextInput.Icon icon="pencil" />}
            />
          )}
          name="nome"
        />
        {errors.nome && <Text style={{ color: theme.colors.error }}>{errors.nome?.message?.toString()}</Text>}

        {/* Campo do horário fixo do hábito */}
        <Controller
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textinput}
              label="Horário"
              placeholder="08:30"
              mode="outlined"
              keyboardType="numeric"
              maxLength={5}
              onBlur={onBlur}
              onChangeText={(texto) => onChange(formatarHorarioDigitado(texto))}
              value={value}
              right={<TextInput.Icon icon="clock-outline" />}
            />
          )}
          name="horario"
        />
        {errors.horario && (
          <Text style={{ color: theme.colors.error }}>{errors.horario?.message?.toString()}</Text>
        )}

        {/* Botão de criar ou atualizar */}
        <Button
          style={styles.button}
          mode="contained"
          onPress={() => handleSubmit(salvarHabito)()}
          loading={requisitando}
          disabled={requisitando}
        >
          {habito ? 'Atualizar' : 'Criar'}
        </Button>

        {/* Excluir e registrar execução só aparecem quando existe um hábito */}
        {habito && (
          <>
            <Button
              style={styles.buttonOthers}
              mode="outlined"
              onPress={() => setDialogExcluirVisivel(true)}
              disabled={requisitando}
            >
              Excluir
            </Button>

            <Text style={styles.subtitulo} variant="titleMedium">
              Registrar execução
            </Text>
            {/* Campo da quantidade da execução */}
            <Controller
              control={controlExecucao}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.textinput}
                  label="Quantidade"
                  placeholder="Digite a quantidade"
                  mode="outlined"
                  keyboardType="numeric"
                  maxLength={6}
                  onBlur={onBlur}
                  onChangeText={(texto) => onChange(texto.replace(/\D/g, ''))}
                  value={value}
                  right={<TextInput.Icon icon="counter" />}
                />
              )}
              name="quantidade"
            />
            {errorsExecucao.quantidade && (
              <Text style={{ color: theme.colors.error }}>
                {errorsExecucao.quantidade?.message?.toString()}
              </Text>
            )}
            <Button
              style={styles.button}
              mode="contained"
              onPress={() => handleSubmitExecucao(registrarExecucaoDoHabito)()}
              loading={requisitando}
              disabled={requisitando}
            >
              Registrar
            </Button>
          </>
        )}

        {/* Histórico das execuções, com filtro por avatar */}
        {execucoes.length > 0 && (
          <>
            <Text style={styles.subtitulo} variant="titleMedium">
              Histórico de execuções
            </Text>
            <SegmentedButtons
              onValueChange={setFiltro}
              value={filtro}
              buttons={[FiltroTodos, ...Object.values(AvatarHabito)].map((opcao) => ({
                value: opcao,
                label: opcao,
              }))}
            />
            <Text style={styles.total} variant="labelLarge">
              Total: {totalExecucoes}
            </Text>
            {execucoesFiltradas.map((execucao) => (
              <List.Item
                key={execucao.uid}
                title={`${execucao.avatar}: ${execucao.quantidade}`}
                description={formatarDataHoraDaExecucao(execucao.dataHora)}
                left={() => (
                  <Avatar.Image
                    style={styles.avatarLista}
                    size={40}
                    source={imagensAvatar[execucao.avatar]}
                  />
                )}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Confirmação da exclusão */}
      <Dialog visible={dialogExcluirVisivel} onDismiss={() => setDialogExcluirVisivel(false)}>
        <Dialog.Icon icon={'alert-circle-outline'} size={60} />
        <Dialog.Title style={styles.textDialog}>{'Ops!'}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.textDialog} variant="bodyLarge">
            {'Você tem certeza que deseja excluir este hábito?\nAs execuções continuam salvas no histórico.'}
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setDialogExcluirVisivel(false)}>Cancelar</Button>
          <Button onPress={excluirHabito}>Excluir</Button>
        </Dialog.Actions>
      </Dialog>
      {/* Resultado da operação */}
      <Dialog visible={dialogMensagemVisivel} onDismiss={() => setDialogMensagemVisivel(false)}>
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

// Estilos da aba Hábito
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    padding: 20,
  },
  titulo: {
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitulo: {
    marginTop: 30,
    marginBottom: 10,
  },
  avatarAtual: {
    width: 160,
    height: 160,
    alignSelf: 'center',
  },
  divAvatares: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cardAvatar: {
    flex: 1,
    borderWidth: 2,
    padding: 8,
  },
  imagemAvatar: {
    width: '100%',
    height: 80,
  },
  nomeAvatar: {
    textAlign: 'center',
    marginTop: 8,
  },
  textinput: {
    marginTop: 20,
    backgroundColor: 'transparent',
  },
  button: {
    marginTop: 30,
  },
  buttonOthers: {
    marginTop: 15,
  },
  total: {
    marginTop: 15,
  },
  avatarLista: {
    backgroundColor: 'transparent',
  },
  textDialog: {
    textAlign: 'center',
  },
});
