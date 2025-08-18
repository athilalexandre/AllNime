import React, { createContext, useEffect, useMemo, useState } from 'react';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from '../../services/auth/firebase';
import { useNotification } from './NotificationContext';

// Initial state
const AUTH_INITIAL_STATE = {
  user: null,
  loading: true,
  canAccessAdultContent: false,
  isUserAdult: false,
  userAge: null,
};

// Create context
export const AuthContext = createContext(AUTH_INITIAL_STATE);

// Utility functions
const checkUserAge = (user) => {
  if (!user) return false;
  
  try {
    // Verificar se o usuário tem idade suficiente (18+)
    // Primeiro, tentar obter a data de nascimento do perfil do Google
    if (user.providerData && user.providerData.length > 0) {
      const googleProfile = user.providerData.find(provider => provider.providerId === 'google.com');
      
      if (googleProfile && googleProfile.birthday) {
        // Calcular idade baseada na data de nascimento
        const birthDate = new Date(googleProfile.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age >= 18;
      }
    }
    
    // Se não conseguir obter a data de nascimento, verificar se o usuário tem pelo menos 18 anos
    // baseado na data de criação da conta (assumindo que usuários muito novos não são adultos)
    if (user.metadata && user.metadata.creationTime) {
      const creationDate = new Date(user.metadata.creationTime);
      const today = new Date();
      const accountAge = today.getFullYear() - creationDate.getFullYear();
      
      // Se a conta foi criada há mais de 18 anos, provavelmente o usuário é adulto
      if (accountAge >= 18) {
        return true;
      }
    }
    
    // Por padrão, para usuários logados, assumimos que são adultos
    // mas em produção você deve implementar uma verificação mais rigorosa
    return true;
  } catch (error) {
    console.error('Erro ao verificar idade do usuário:', error);
    // Em caso de erro, por segurança, não permitir acesso a conteúdo adulto
    return false;
  }
};

const canUserAccessAdultContent = (user) => {
  if (!user) return false;
  return checkUserAge(user);
};

const getUserAge = (user) => {
  if (!user) return null;
  
  try {
    if (user.providerData && user.providerData.length > 0) {
      const googleProfile = user.providerData.find(provider => provider.providerId === 'google.com');
      
      if (googleProfile && googleProfile.birthday) {
        const birthDate = new Date(googleProfile.birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          return age - 1;
        }
        
        return age;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao calcular idade do usuário:', error);
    return null;
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (current) => {
      setUser(current);
      setLoading(false);
    });
    
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 3000);
    
    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showSuccess('Login realizado com sucesso!');
    } catch (error) {
      console.error('Erro no login:', error);
      showError(`Erro no login: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showSuccess('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      showError(`Erro no logout: ${error.message}`);
    }
  };

  // Verifica se o usuário pode acessar conteúdo adulto
  const canAccessAdultContent = useMemo(() => {
    return canUserAccessAdultContent(user);
  }, [user]);

  // Verifica se o usuário é adulto
  const isUserAdult = useMemo(() => {
    return checkUserAge(user);
  }, [user]);

  // Obtém a idade exata do usuário
  const userAge = useMemo(() => {
    return getUserAge(user);
  }, [user]);

  const value = useMemo(() => ({ 
    user, 
    loading, 
    signInWithGoogle, 
    logout, 
    canAccessAdultContent, 
    isUserAdult,
    userAge
  }), [user, loading, canAccessAdultContent, isUserAdult, userAge]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook for using auth context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};




