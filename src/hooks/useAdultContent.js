import { useCallback } from 'react';
import { useAuth } from '../components/contexts/useAuth';
import { notificationService } from '../services/notificationService';

export const useAdultContent = () => {
  const { user, canAccessAdultContent, isUserAdult } = useAuth();

  // Verifica se o usuário pode acessar conteúdo adulto
  const canAccess = useCallback(() => {
    return canAccessAdultContent;
  }, [canAccessAdultContent]);

  // Verifica se o usuário está autenticado
  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  // Verifica se o usuário é adulto
  const isAdult = useCallback(() => {
    return isUserAdult;
  }, [isUserAdult]);

  // Função para verificar acesso a conteúdo adulto com notificação
  const checkAccessWithNotification = useCallback((animeTitle = 'anime') => {
    if (!isAuthenticated()) {
      notificationService.addLoginRequiredNotification(animeTitle);
      return false;
    }

    if (!canAccess()) {
      notificationService.addAdultContentBlockedNotification(animeTitle);
      return false;
    }

    return true;
  }, [isAuthenticated, canAccess]);

  // Função para filtrar animes baseado no acesso do usuário
  const filterAdultContent = useCallback((animes = []) => {
    if (canAccess()) {
      return animes; // Retorna todos os animes se pode acessar conteúdo adulto
    }
    
    // Filtra animes com conteúdo adulto (assumindo que têm gêneros específicos)
    const adultGenres = ['Hentai', 'Ecchi', 'Yuri', 'Yaoi', 'Harem'];
    return animes.filter(anime => {
      if (!anime.genres || !Array.isArray(anime.genres)) return true;
      
      const hasAdultGenre = anime.genres.some(genre => 
        adultGenres.some(adultGenre => 
          genre.name && genre.name.toLowerCase().includes(adultGenre.toLowerCase())
        )
      );
      
      return !hasAdultGenre;
    });
  }, [canAccess]);

  // Função para obter mensagem de restrição
  const getRestrictionMessage = useCallback(() => {
    if (!isAuthenticated()) {
      return 'Faça login para acessar conteúdo adulto';
    }
    
    if (!isAdult()) {
      return 'Você precisa ser maior de 18 anos para acessar este conteúdo';
    }
    
    return null;
  }, [isAuthenticated, isAdult]);

  return {
    canAccess,
    isAuthenticated,
    isAdult,
    checkAccessWithNotification,
    filterAdultContent,
    getRestrictionMessage
  };
};
