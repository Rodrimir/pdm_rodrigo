/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import { firestore } from '@/firebase/firebaseInit';
import { Usuario } from '@/model/Usuario';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';

export const UserContext = createContext<any>({});

export const UserProvider = ({ children }: any) => {
  const { userAuth, delAccount, sendImageToStorage } = useContext(AuthContext);
  const [usuerFirebase, setUserFirebase] = useState<Usuario | null>(null);

  async function getUser(): Promise<void> {
    try {
      if (!userAuth.user) {
        return;
      }
      const docSnap = await getDoc(doc(firestore, 'usuarios', userAuth.user.uid));
      if (docSnap.exists()) {
        let userData = docSnap.data();
        const usuario: Usuario = {
          uid: docSnap.id,
          email: userData.email,
          nome: userData.nome,
          urlFoto: userData.urlFoto,
          idioma: userData.idioma,
          tema: userData.tema,
        };
        setUserFirebase(usuario);
      }
    } catch (e) {
      console.error('UserProvider, getUser: ' + e);
    }
  }

  useEffect(() => {
    if (userAuth) {
      getUser();
    }
  }, [userAuth]);

  async function update(usuario: Usuario, urlDevice?: string): Promise<string> {
    try {
      if (urlDevice) {
        const urlStorage = await sendImageToStorage(urlDevice, usuario.uid);
        if (!urlStorage) {
          return 'Erro ao enviar a imagem. Contate o suporte.';
        }
        usuario.urlFoto = urlStorage;
      }
      await setDoc(
        doc(firestore, 'usuarios', usuario.uid),
        {
          email: usuario.email,
          nome: usuario.nome,
          idioma: usuario.idioma,
          tema: usuario.tema,
          urlFoto: usuario.urlFoto,
        },
        { merge: true },
      );
      setUserFirebase(usuario);
      return 'ok';
    } catch (e) {
      console.error(e);
      return 'Erro ao atualizar o usuário. Contate o suporte.';
    }
  }

  async function del(uid: string): Promise<string> {
    try {
      await deleteDoc(doc(firestore, 'usuarios', uid));
      const msg = await delAccount();
      if (msg !== 'ok') {
        return msg;
      }
      return 'ok';
    } catch (e) {
      console.error(e);
      return 'Erro ao excluir a conta. Contate o suporte.';
    }
  }

  return <UserContext.Provider value={{ usuerFirebase, update, del }}>{children}</UserContext.Provider>;
};
