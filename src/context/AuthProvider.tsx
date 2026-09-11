import { auth, firestore } from '@/firebase/firebaseInit';
import { Credencial } from '@/model/types';
import { Usuario } from '@/model/Usuario';
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
import { createContext, useState } from 'react';

export const AuthContext = createContext({});

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
      return null;
    }
  }

  /*
    Funções do processo de Autenticação
  */
  async function signUp(usuario: Usuario): Promise<string> {
    try {
      if (usuario.email && usuario.senha) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          usuario.email,
          usuario.senha,
        );
        if (userCredential) {
          await sendEmailVerification(userCredential.user);
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

  async function signIn(credencial: Credencial): Promise<string> {
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
      console.error(error.code, error.message);
      return launchServerMessageErro(error);
    }
  }

  async function sair(): Promise<string> {
    try {
      await SecureStore.deleteItemAsync('credencial');
      await signOut(auth);
      return 'ok';
    } catch (error: any) {
      console.error(error.code, error.message);
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

  return (
    <AuthContext.Provider
      value={{
        signIn,
        sair,
        recuperaCredencialdaCache,
        signUp,
        userAuth,
        delAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
