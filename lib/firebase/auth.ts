import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import { auth } from "./config";

const googleProvider = new GoogleAuthProvider();

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error("Firebase not configured. Please set up Firebase credentials.");
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error("Firebase not configured. Please set up Firebase credentials.");
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithGoogle = async (): Promise<UserCredential> => {
  if (!auth) {
    throw new Error("Firebase not configured. Please set up Firebase credentials.");
  }
  return signInWithPopup(auth, googleProvider);
};

export const signOut = async (): Promise<void> => {
  if (!auth) {
    return; // Silently fail in preview mode
  }
  return firebaseSignOut(auth);
};

export type { FirebaseUser };

