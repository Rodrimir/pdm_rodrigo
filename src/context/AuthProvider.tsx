import { auth, firestore, storage } from '@/firebase/firebaseInit';
import { Credencial } from '@/model/types';
import { Usuario } from '@/model/Usuario';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as SecureStore from 'expo-secure-store';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { createContext, useState } from 'react';

export const AuthContext = createContext<any>({});

export const AuthProvider = ({ children }: any) => {
  const [userAuth, setUserAuth] = useState<UserCredential | null>(null);
  /*
    Cache criptografado do usuário
  */
  async function armazenaCredencialnaCache(credencial: Credencial): Promise<void> {
    try {
      await SecureStore.setItemAsync(
        'credencial',
        JSON.stringify({
          email: credencial.email,
          senha: credencial.senha,
        }),
      );
    } catch (e) {
      console.error('AuthProvider, armazenaCredencialnaCache: ' + e);
    }
  }

  async function recuperaCredencialdaCache(): Promise<null | string> {
    try {
      const credencial = await SecureStore.getItemAsync('credencial');
      return credencial ? JSON.parse(credencial) : null;
    } catch (e) {
      console.error('AuthProvider, recuperaCredencialdaCache: ' + e);
      console.log('Erro ao recuperar credencial da cache. Contate o suporte.');
      return null;
    }
  }

  /*
    Funções do processo de Autenticação
  */
  async function signUp(usuario: Usuario, urlDevice?: string): Promise<string> {
    try {
      if (usuario.email && usuario.senha) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          usuario.email,
          usuario.senha,
        );
        if (userCredential) {
          await sendEmailVerification(userCredential.user);
          if (urlDevice) {
            const urlStorage = await sendImageToStorage(urlDevice, userCredential.user.uid);
            if (!urlStorage) {
              return 'Erro ao cadastrar o usuário. Contate o suporte.';
            }
            usuario.urlFoto = urlStorage;
          }
        }
        //A senha não deve ser persistida no serviço Firetore, ela é gerida pelo serviço Authentication
        const usuarioFirestore = {
          email: usuario.email,
          nome: usuario.nome,
          urlFoto: usuario.urlFoto,
          curso: usuario.curso,
          perfil: usuario.perfil,
        };
        await setDoc(doc(firestore, 'usuarios', userCredential.user.uid), usuarioFirestore);
      } else {
        return 'Confira se você digitou o email e a senha.';
      }
      return 'ok';
    } catch (e: any) {
      console.error(e.code, e.message);
      return launchServerMessageErro(e);
    }
  }

  async function entrar(credencial: Credencial): Promise<string> {
    try {
      const userCredencial = await signInWithEmailAndPassword(
        auth,
        credencial.email,
        credencial.senha,
      );
      if (!userCredencial.user.emailVerified) {
        return 'Você precisa verificar seu email para continuar.';
      }
      setUserAuth(userCredencial);
      armazenaCredencialnaCache(credencial);
      return 'ok';
    } catch (error: any) {
      return launchServerMessageErro(error);
    }
  }

  async function sair(): Promise<string> {
    try {
      await SecureStore.deleteItemAsync('credencial');
      await signOut(auth);
      return 'ok';
    } catch (error: any) {
      return launchServerMessageErro(error);
    }
  }

  async function delAccount(): Promise<void> {
    if (userAuth?.user) {
      await deleteUser(userAuth.user);
    }
  }

  //função utilitária
  function launchServerMessageErro(e: any): string {
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

  //Função utilitária para envio de imagens para o serviço de Storage
  //urlDevice: qual imagem que está no device que deve ser enviada via upload
  async function sendImageToStorage(urlDevice: string, uid: string): Promise<string | null> {
    try {
      //1. Redimensiona, compacta a imagem, e a transforma em blob
      const contexto = ImageManipulator.manipulate(urlDevice);
      contexto.resize({ width: 150, height: 150 });
      const imagemManipulada = await contexto.renderAsync();
      const imagemRedimensionada = await imagemManipulada.saveAsync({
        compress: 0.8,
        format: SaveFormat.PNG,
      });
      const data = await fetch(imagemRedimensionada.uri);
      const blob = await data.blob();

      //2. Prepara o path onde ela deve ser salva no storage
      const storageReference = ref(storage, `imagens/usuarios/${uid}/foto.png`);

      //3. Envia para o storage
      await uploadBytes(storageReference, blob);

      //4. Retorna a URL da imagem
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
        entrar,
        sair,
        recuperaCredencialdaCache,
        signUp,
        userAuth,
        delAccount,
        AuthProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
