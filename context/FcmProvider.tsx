/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability */
import { firestore } from '@/firebase/firebaseInit';
import * as Notifications from 'expo-notifications';
import { collection, deleteField, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect } from 'react';
import { AuthContext } from './AuthProvider';

export const FcmContext = createContext<any>({});

// Provider do Firebase Cloud Messaging: guarda no Firestore o token que identifica este celular
export const FcmProvider = ({ children }: any) => {
  const { userAuth } = useContext<any>(AuthContext);

  // Sempre que um usuário entra no app, cadastra o token do celular nele
  useEffect(() => {
    if (userAuth) {
      cadastrarTokenDispositivoNoFirestore(userAuth.user.uid);
    }
  }, [userAuth]);

  // Busca o token do celular no FCM e grava no documento do usuário, no campo token_fcm
  async function cadastrarTokenDispositivoNoFirestore(uid: string) {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      // Procura os usuários que já têm este token (o celular pode ter sido usado por outra conta antes)
      const q = query(collection(firestore, 'usuarios'), where('token_fcm', '==', token.data));
      const querySnapshot = await getDocs(q);
      // Se o token já é só deste usuário, não há nada a fazer
      if (querySnapshot.size === 1 && querySnapshot.docs[0].id === uid) {
        return;
      }
      const lote = writeBatch(firestore);
      // Remove o token das outras contas, para o celular não receber notificações
      // duplicadas nem de uma conta que já saiu dele
      querySnapshot.docs
        .filter((usuario) => usuario.id !== uid)
        .forEach((usuario) => lote.update(usuario.ref, { token_fcm: deleteField() }));
      // Grava o token no usuário autenticado; o merge mantém os outros campos do documento
      lote.set(doc(firestore, 'usuarios', uid), { token_fcm: token.data }, { merge: true });
      await lote.commit();
    } catch (error: any) {
      console.error('Erro ao buscar o token do dispositivo no Firestore: ' + error.message);
    }
  }

  return <FcmContext.Provider value={{}}>{children}</FcmContext.Provider>;
};
