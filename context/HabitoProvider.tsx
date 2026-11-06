/* eslint-disable react-hooks/set-state-in-effect */
import { firestore } from '@/firebase/firebaseInit';
import { AvatarHabito } from '@/model/AvatarHabito';
import { Execucao } from '@/model/Execucao';
import { Habito } from '@/model/Habito';
import * as Notifications from 'expo-notifications';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  QuerySnapshot,
  setDoc,
  where,
} from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';

export const HabitoContext = createContext<any>({});

// Converte os documentos do Firestore em execuções, com as mais recentes primeiro
function converterDocumentosEmExecucoes(querySnapshot: QuerySnapshot): Execucao[] {
  const data: Execucao[] = [];
  querySnapshot.forEach((docSnap) => {
    data.push({
      uid: docSnap.id,
      uidUsuario: docSnap.data().uidUsuario,
      avatar: docSnap.data().avatar,
      quantidade: docSnap.data().quantidade,
      dataHora: docSnap.data().dataHora.toDate(),
    });
  });
  return data.sort((a, b) => b.dataHora.getTime() - a.dataHora.getTime());
}

// Mantém o lembrete diário igual ao hábito: agenda, substitui ou cancela a notificação local
async function atualizarNotificacaoDiariaDoHabito(habitoAtual: Habito | null | undefined): Promise<void> {
  try {
    // Sem hábito (excluído ou usuário saiu): cancela o lembrete
    if (!habitoAtual) {
      await Notifications.cancelScheduledNotificationAsync('habito');
      return;
    }

    // Transforma "08:30" em hora = 8 e minuto = 30
    const [hora, minuto] = habitoAtual.horario.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      // Id fixo: agendar de novo substitui o lembrete anterior
      identifier: 'habito',
      content: {
        title: `Hora de: ${habitoAtual.nome}`,
        body: 'Faça seu habito do tempo claro :)',
      },
      // Repete todo dia, no horário escolhido, usando o canal criado no Preload
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'default',
        hour: hora,
        minute: minuto,
      },
    });
  } catch (e) {
    console.error('HabitoProvider, atualizarNotificacaoDiariaDoHabito: ' + e);
  }
}

// Provider dos hábitos: CRUD do hábito e das execuções da conta logada
export const HabitoProvider = ({ children }: any) => {
  const { userAuth } = useContext<any>(AuthContext);
  // undefined: ainda carregando; null: o usuário não tem hábito
  const [habito, setHabito] = useState<Habito | null | undefined>(undefined);
  // Todas as execuções da conta logada
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const uidUsuario: string | undefined = userAuth?.user?.uid;

  // Escuta o hábito e as execuções em tempo real enquanto houver um usuário logado
  useEffect(() => {
    if (!uidUsuario) {
      setHabito(undefined);
      setExecucoes([]);
      return;
    }

    // O id do documento é o uid do usuário, então cada conta tem um único hábito por vez
    const unsubscribeHabito = onSnapshot(
      doc(firestore, 'habitos', uidUsuario),
      (docSnap) => {
        if (docSnap.exists()) {
          setHabito({
            uid: docSnap.id,
            avatar: docSnap.data().avatar,
            nome: docSnap.data().nome,
            horario: docSnap.data().horario,
          });
        } else {
          setHabito(null);
        }
      },
      (e) => console.error('HabitoProvider, habito: ' + e),
    );

    // Lista só as execuções da conta logada
    const unsubscribeExecucoes = onSnapshot(
      query(collection(firestore, 'execucoes'), where('uidUsuario', '==', uidUsuario)),
      (querySnapshot) => setExecucoes(converterDocumentosEmExecucoes(querySnapshot)),
      (e) => console.error('HabitoProvider, execucoes: ' + e),
    );

    // Para de escutar quando o usuário muda ou sai
    return () => {
      unsubscribeHabito();
      unsubscribeExecucoes();
    };
  }, [uidUsuario]);

  // Toda mudança no hábito atualiza o lembrete: criar, editar, excluir, entrar ou sair
  useEffect(() => {
    atualizarNotificacaoDiariaDoHabito(habito);
  }, [habito]);

  // Create e Update: grava o hábito no documento com o uid do usuário
  async function salvarHabitoNoFirestore(novoHabito: Habito): Promise<string> {
    try {
      await setDoc(doc(firestore, 'habitos', uidUsuario as string), {
        avatar: novoHabito.avatar,
        nome: novoHabito.nome,
        horario: novoHabito.horario,
      });
      return 'ok';
    } catch (e) {
      console.error('HabitoProvider, salvarHabitoNoFirestore: ' + e);
      return 'Erro ao salvar o hábito. Contate o suporte.';
    }
  }

  // Delete: exclui o hábito; as execuções continuam no histórico
  async function excluirHabitoDoFirestore(): Promise<string> {
    try {
      await deleteDoc(doc(firestore, 'habitos', uidUsuario as string));
      return 'ok';
    } catch (e) {
      console.error('HabitoProvider, excluirHabitoDoFirestore: ' + e);
      return 'Erro ao excluir o hábito. Contate o suporte.';
    }
  }

  // Create: registra uma execução com a conta, o avatar, a quantidade, o dia e a hora
  async function adicionarExecucaoDoHabitoNoFirestore(
    avatar: AvatarHabito,
    quantidade: number,
  ): Promise<string> {
    try {
      await addDoc(collection(firestore, 'execucoes'), {
        uidUsuario,
        avatar,
        quantidade,
        dataHora: new Date(),
      });
      return 'ok';
    } catch (e) {
      console.error('HabitoProvider, adicionarExecucaoDoHabitoNoFirestore: ' + e);
      return 'Erro ao registrar a execução. Contate o suporte.';
    }
  }

  // Read com filtro: busca as execuções da conta logada usando o avatar como chave de pesquisa
  async function getExecucoesDoUsuarioPeloAvatar(avatar: AvatarHabito): Promise<Execucao[]> {
    try {
      const q = query(
        collection(firestore, 'execucoes'),
        where('uidUsuario', '==', uidUsuario),
        where('avatar', '==', avatar),
      );
      return converterDocumentosEmExecucoes(await getDocs(q));
    } catch (e) {
      console.error('HabitoProvider, getExecucoesDoUsuarioPeloAvatar: ' + e);
      return [];
    }
  }

  return (
    <HabitoContext.Provider
      value={{
        habito,
        execucoes,
        salvarHabitoNoFirestore,
        excluirHabitoDoFirestore,
        adicionarExecucaoDoHabitoNoFirestore,
        getExecucoesDoUsuarioPeloAvatar,
      }}
    >
      {children}
    </HabitoContext.Provider>
  );
};
