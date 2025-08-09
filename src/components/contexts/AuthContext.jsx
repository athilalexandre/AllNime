import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../../services/auth/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  // twitter removed
  logout: async () => {},
});

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

  const value = useMemo(() => ({ user, loading, signInWithGoogle, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);


