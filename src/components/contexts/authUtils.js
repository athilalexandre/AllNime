// Funções utilitárias para autenticação
export const checkUserAge = (user) => {
  if (!user) return false;
  
  // Verificar se o usuário tem idade suficiente (18+)
  // Por padrão, assumimos que usuários logados são adultos
  // Em uma implementação real, você pode verificar a data de nascimento do perfil do Google
  return true;
};

export const canUserAccessAdultContent = (user) => {
  if (!user) return false;
  return checkUserAge(user);
};
