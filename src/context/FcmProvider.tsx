/* eslint-disable react-hooks/immutability */
import * as Notifications from 'expo-notifications';
import { collection, deleteField, doc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { createContext, useContext, useEffect } from 'react';
import { firestore } from '../firebase/firebaseInit';
import { AuthContext } from './AuthProvider';

export const FcmContext = createContext<any>({});

export const FcmProvider = ({ children }: any) => {
  const { userAuth } = useContext<any>(AuthContext);

  useEffect(() => {
    if (userAuth) {
      cadastrarTokenDispositivoNoFirestore(userAuth.user.uid);
    }
  }, [userAuth]);

  async function cadastrarTokenDispositivoNoFirestore(uid: string) {
    try {
      const token = await Notifications.getDevicePushTokenAsync();
      const q = query(collection(firestore, 'usuarios'), where('token_fcm', '==', token.data));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size === 1 && querySnapshot.docs[0].id === uid) {
        return;
      }
      const lote = writeBatch(firestore);
      querySnapshot.docs
        .filter((usuario) => usuario.id !== uid)
        .forEach((usuario) => lote.update(usuario.ref, { token_fcm: deleteField() }));
      lote.set(doc(firestore, 'usuarios', uid), { token_fcm: token.data }, { merge: true });
      await lote.commit();
    } catch (error: any) {
      console.error('Erro ao buscar o token do dispositivo no Firestore: ' + error.message);
    }
  }

  return <FcmContext.Provider value={{}}>{children}</FcmContext.Provider>;
};
