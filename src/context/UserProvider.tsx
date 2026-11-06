/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/immutability */
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { createContext, useContext, useEffect, useState } from 'react';
import { firestore } from '../firebase/firebaseInit';
import { Usuario } from '../model/Usuario';
import { AuthContext } from './AuthProvider';

export const UserContext = createContext<any>({});

export const UserProvider = ({ children }: any) => {
  const {
    userAuth,
    reautenticarUsuarioComCredencialDaCache,
    excluirContaDoAuthentication,
    enviarImagemDoUsuarioParaStorage,
  } = useContext<any>(AuthContext);
  const [usuerFirebase, setUserFirebase] = useState<Usuario | null>(null);

  useEffect(() => {
    if (userAuth) {
      getUsuarioDoFirestore();
    } else {
      setUserFirebase(null);
    }
  }, [userAuth]);

  async function getUsuarioDoFirestore(): Promise<void> {
    try {
      if (!userAuth.user) {
        return;
      }
      const docSnap = await getDoc(doc(firestore, 'usuarios', userAuth.user.uid));
      console.log('docSnap.data(): ', docSnap.data());
      if (docSnap.exists()) {
        let userData = docSnap.data();
        const usuario: Usuario = {
          uid: docSnap.id,
          email: userData.email,
          nome: userData.nome,
          urlFoto: userData.urlFoto,
          idioma: userData.idioma,
          tema: userData.tema,
          fuso: userData.fuso,
        };
        console.log('usuario: ', usuario);
        setUserFirebase(usuario);
      }
    } catch (e) {
      console.error('UserProvider, getUsuarioDoFirestore: ' + e);
    }
  }

  async function atualizarUsuarioNoFirestore(usuario: Usuario, urlDevice?: string): Promise<string> {
    try {
      if (urlDevice) {
        const urlStorage = await enviarImagemDoUsuarioParaStorage(urlDevice, usuario.uid);
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
          fuso: usuario.fuso,
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

  async function excluirContaEDadosDoUsuario(uid: string): Promise<string> {
    try {
      await reautenticarUsuarioComCredencialDaCache();
      const execucoes = await getDocs(
        query(collection(firestore, 'execucoes'), where('uidUsuario', '==', uid)),
      );
      await Promise.all(execucoes.docs.map((execucao) => deleteDoc(execucao.ref)));
      await deleteDoc(doc(firestore, 'habitos', uid));
      await deleteDoc(doc(firestore, 'usuarios', uid));
      await excluirContaDoAuthentication();
      return 'ok';
    } catch (e) {
      console.error(e);
      return 'Erro ao excluir a conta. Contate o suporte.';
    }
  }

  return (
    <UserContext.Provider value={{ usuerFirebase, atualizarUsuarioNoFirestore, excluirContaEDadosDoUsuario }}>
      {children}
    </UserContext.Provider>
  );
};
