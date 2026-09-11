import { auth } from '@/firebase/firebaseInit';
import { Credentials } from '@/model/types';
import * as SecureStore from 'expo-secure-store';
import { signOut as firebaseSignOut, signInWithEmailAndPassword } from 'firebase/auth';
import { createContext, useEffect } from 'react';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }: any) => {
  useEffect(() => {}, []);

  async function signIn(credentials: Credentials): Promise<string> {
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.senha);
      SecureStore.setItemAsync('user', JSON.stringify(credentials));
      return 'ok';
    } catch (e: any) {
      return launchServerMessageErro(e);
    }
  }

  async function signOut(): Promise<string> {
    try {
      await firebaseSignOut(auth);
      return 'ok';
    } catch (e: any) {
      return launchServerMessageErro(e);
    }
  }

  function launchServerMessageErro(e: any): string {
    switch (e.code) {
      case 'auth/invalid-credential':
        return 'senha errada';
      case 'auth/invalid-email':
        return 'email errado';
      default:
        return 'erro';
    }
  }

  return <AuthContext.Provider value={{ signIn, signOut }}>{children}</AuthContext.Provider>;
};
