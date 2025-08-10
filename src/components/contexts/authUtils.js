// Funções utilitárias para autenticação
export const checkUserAge = (user) => {
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

export const canUserAccessAdultContent = (user) => {
  if (!user) return false;
  return checkUserAge(user);
};

// Função para obter a idade exata do usuário
export const getUserAge = (user) => {
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
