import React, { useEffect, useMemo, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../../services/auth/firebase';
import { checkUserAge, canUserAccessAdultContent } from './authUtils';
import { AuthContext } from './authContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Verifica se o usuário pode acessar conteúdo adulto
  const canAccessAdultContent = useMemo(() => {
    return canUserAccessAdultContent(user);
  }, [user]);

  // Verifica se o usuário é adulto
  const isUserAdult = useMemo(() => {
    return checkUserAge(user);
  }, [user]);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signInWithGoogle, 
    logout, 
    canAccessAdultContent, 
    isUserAdult 
  }), [user, loading, canAccessAdultContent, isUserAdult]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};




