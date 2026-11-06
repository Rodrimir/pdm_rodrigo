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

async function atualizarNotificacaoDiariaDoHabito(habitoAtual: Habito | null | undefined): Promise<void> {
  try {
    if (!habitoAtual) {
      await Notifications.cancelScheduledNotificationAsync('habito');
      return;
    }

    const [hora, minuto] = habitoAtual.horario.split(':').map(Number);

    await Notifications.scheduleNotificationAsync({
      identifier: 'habito',
      content: {
        title: `Hora de: ${habitoAtual.nome}`,
        body: 'Faça seu habito do tempo claro :)',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        channelId: 'padrao',
        hour: hora,
        minute: minuto,
      },
    });
  } catch (e) {
    console.error('HabitoProvider, atualizarNotificacaoDiariaDoHabito: ' + e);
  }
}

export const HabitoProvider = ({ children }: any) => {
  const { userAuth } = useContext<any>(AuthContext);
  const [habito, setHabito] = useState<Habito | null | undefined>(undefined);
  const [execucoes, setExecucoes] = useState<Execucao[]>([]);
  const uidUsuario: string | undefined = userAuth?.user?.uid;

  useEffect(() => {
    if (!uidUsuario) {
      setHabito(undefined);
      setExecucoes([]);
      return;
    }

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

    const unsubscribeExecucoes = onSnapshot(
      query(collection(firestore, 'execucoes'), where('uidUsuario', '==', uidUsuario)),
      (querySnapshot) => setExecucoes(converterDocumentosEmExecucoes(querySnapshot)),
      (e) => console.error('HabitoProvider, execucoes: ' + e),
    );

    return () => {
      unsubscribeHabito();
      unsubscribeExecucoes();
    };
  }, [uidUsuario]);

  useEffect(() => {
    atualizarNotificacaoDiariaDoHabito(habito);
  }, [habito]);

  async function salvarHabitoNoFirestore(novoHabito: Habito): Promise<string> {
    if (!uidUsuario) return 'Usuário não autenticado.';
    try {
      await setDoc(doc(firestore, 'habitos', uidUsuario), {
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

  async function excluirHabitoDoFirestore(): Promise<string> {
    if (!uidUsuario) return 'Usuário não autenticado.';
    try {
      await deleteDoc(doc(firestore, 'habitos', uidUsuario));
      return 'ok';
    } catch (e) {
      console.error('HabitoProvider, excluirHabitoDoFirestore: ' + e);
      return 'Erro ao excluir o hábito. Contate o suporte.';
    }
  }

  async function adicionarExecucaoDoHabitoNoFirestore(
    avatar: AvatarHabito,
    quantidade: number,
  ): Promise<string> {
    if (!uidUsuario) return 'Usuário não autenticado.';
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

  async function getExecucoesDoUsuarioPeloAvatar(avatar: AvatarHabito): Promise<Execucao[]> {
    if (!uidUsuario) return [];
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
