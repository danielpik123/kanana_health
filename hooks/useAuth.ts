"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { signIn, signUp, signInWithGoogle, signOut } from "@/lib/firebase/auth";

interface UseAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle case where Firebase auth might not be initialized
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);
      }, (error) => {
        // Silently handle auth errors in preview mode
        console.warn("Auth error (preview mode):", error);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      // Handle initialization errors gracefully
      console.warn("Firebase auth not configured (preview mode):", error);
      setLoading(false);
    }
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase not configured. Please set up Firebase credentials.");
    }
    await signIn(email, password);
  };

  const handleSignUp = async (email: string, password: string) => {
    if (!auth) {
      throw new Error("Firebase not configured. Please set up Firebase credentials.");
    }
    await signUp(email, password);
  };

  const handleSignInWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase not configured. Please set up Firebase credentials.");
    }
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    if (!auth) {
      return; // Silently fail in preview mode
    }
    await signOut();
  };

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
  };
}

