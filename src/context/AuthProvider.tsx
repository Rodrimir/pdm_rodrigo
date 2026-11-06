import { auth, firestore, storage } from '@/firebase/firebaseInit';
import { Credencial } from '@/model/types';
import { Usuario } from '@/model/Usuario';
import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { deleteField, doc, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { createContext, useState } from 'react';

export const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [userAuth, setUserAuth] = useState<UserCredential | null>(null);

  async function armazenarCredencialNaCache(credencial: Credencial): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'credencial',
        JSON.stringify({
          email: credencial.email,
          senha: credencial.senha,
        }),
      );
    } catch (e) {
      console.error('AuthProvider, armazenarCredencialNaCache: ' + e);
    }
  }

  async function getCredencialDaCache(): Promise<Credencial | null> {
    try {
      const credencial = await SecureStore.getItemAsync('credencial');
      return credencial ? JSON.parse(credencial) : null;
    } catch (e) {
      console.error('AuthProvider, getCredencialDaCache: ' + e);
      console.log('Erro ao recuperar credencial da cache. Contate o suporte.');
      return null;
    }
  }

  async function signUpComEmailESenha(usuario: Usuario, urlDevice?: string): Promise<string> {
    try {
      if (usuario.email && usuario.senha) {
        const userCredential = await createUserWithEmailAndPassword(auth, usuario.email, usuario.senha);
        if (userCredential) {
          await sendEmailVerification(userCredential.user);
          if (urlDevice) {
            const urlStorage = await enviarImagemDoUsuarioParaStorage(urlDevice, userCredential.user.uid);
            if (!urlStorage) {
              return 'Erro ao cadastrar o usuário. Contate o suporte.';
            }
            usuario.urlFoto = urlStorage;
          }
        }

        const usuarioFirestore = {
          email: usuario.email,
          nome: usuario.nome,
          urlFoto: usuario.urlFoto,
          idioma: usuario.idioma,
          tema: usuario.tema,
          fuso: usuario.fuso,
        };
        await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), usuarioFirestore, { merge: true });
      } else {
        return 'Confira se você digitou o email e a senha.';
      }
      return 'ok';
    } catch (e: any) {
      console.error(e.code, e.message);
      return getMensagemDeErroDoServidor(e);
    }
  }

  async function signInComEmailESenha(credencial: Credencial): Promise<string> {
    try {
      const userCredencial = await signInWithEmailAndPassword(auth, credencial.email, credencial.senha);
      if (!userCredencial.user.emailVerified) {
        return 'Você precisa verificar seu email para continuar.';
      }
      setUserAuth(userCredencial);
      armazenarCredencialNaCache(credencial);
      return 'ok';
    } catch (error: any) {
      console.error(error.code, error.message);
      return getMensagemDeErroDoServidor(error);
    }
  }

  async function signOutDaContaDoUsuario(): Promise<string> {
    try {
      await SecureStore.deleteItemAsync('credencial');
      await apagaTokenDispositivoNoFirestore();
      await signOut(auth);
      setUserAuth(null);
      return 'ok';
    } catch (error: any) {
      console.error(error.code, error.message);
      return getMensagemDeErroDoServidor(error);
    }
  }

  async function apagaTokenDispositivoNoFirestore(): Promise<void> {
    try {
      if (auth.currentUser) {
        await updateDoc(doc(firestore, 'usuarios', auth.currentUser.uid), {
          token_fcm: deleteField(),
        });
      }
    } catch (e) {
      console.error('AuthProvider, apagaTokenDispositivoNoFirestore: ' + e);
    }
  }

  async function reautenticarUsuarioComCredencialDaCache(): Promise<void> {
    const credencial = await getCredencialDaCache();
    if (!auth.currentUser || !credencial) {
      throw new Error('Sem usuário autenticado ou credencial na cache.');
    }
    await reauthenticateWithCredential(auth.currentUser, EmailAuthProvider.credential(credencial.email, credencial.senha));
  }

  async function excluirContaDoAuthentication(): Promise<void> {
    if (userAuth?.user) {
      await deleteUser(userAuth.user);
      await SecureStore.deleteItemAsync('credencial');
      setUserAuth(null);
    }
  }

  function getMensagemDeErroDoServidor(e: any): string {
    switch (e.code) {
      case 'auth/invalid-credential':
        return 'Email inexistente ou senha errada.';
      case 'auth/user-not-found':
        return 'Usuário não cadastrado.';
      case 'auth/wrong-password':
        return 'Erro na senha.';
      case 'auth/invalid-email':
        return 'Email inexistente.';
      case 'auth/user-disabled':
        return 'Usuário desabilitado.';
      case 'auth/email-already-in-use':
        return 'Email em uso. Tente outro email.';
      default:
        return 'Erro desconhecido. Contate o administrador';
    }
  }

  async function enviarImagemDoUsuarioParaStorage(urlDevice: string, uid: string): Promise<string | null> {
    try {
      const contexto = ImageManipulator.manipulate(urlDevice);
      contexto.resize({ width: 150, height: 150 });
      const imagemManipulada = await contexto.renderAsync();
      const imagemRedimensionada = await imagemManipulada.saveAsync({
        compress: 0.8,
        format: SaveFormat.PNG,
      });
      const arquivoLocal = new File(imagemRedimensionada.uri);
      const caminho = `imagens/usuarios/${uid}/foto.png`;
      const storageReference = ref(storage, caminho);
      const token = await auth.currentUser?.getIdToken();

      const resposta = await arquivoLocal.upload(`https://firebasestorage.googleapis.com/v0/b/${storageReference.bucket}/o?name=${encodeURIComponent(caminho)}`, {
        httpMethod: 'POST',
        headers: {
          Authorization: `Firebase ${token}`,
          'Content-Type': 'image/png',
        },
      });
      if (resposta.status < 200 || resposta.status >= 300) {
        throw new Error(`Upload falhou (${resposta.status}): ${resposta.body}`);
      }

      const url = await getDownloadURL(storageReference);
      return url;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        signInComEmailESenha,
        signOutDaContaDoUsuario,
        getCredencialDaCache,
        signUpComEmailESenha,
        userAuth,
        reautenticarUsuarioComCredencialDaCache,
        excluirContaDoAuthentication,
        enviarImagemDoUsuarioParaStorage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
