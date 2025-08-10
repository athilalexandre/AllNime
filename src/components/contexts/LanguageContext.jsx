import React, { createContext, useMemo, useState } from 'react';

// Available languages
export const languages = {
  pt: 'Português',
  en: 'English'
};

// Language dictionaries
const DICTS = {
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.explore': 'Explorar',
    'nav.myRatings': 'Minhas Avaliações',
    'nav.settings': 'Configurações',
    'nav.watching': 'Assistindo',
    'nav.planToWatch': 'Planejo Assistir',
    'nav.completed': 'Completos',
    'nav.dropped': 'Desistidos',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.clear': 'Limpar',
    
    // Search
    'search.placeholder': 'Buscar animes...',
    'search.noResults': 'Nenhum resultado encontrado',
    'search.advanced': 'Busca Avançada',
    'search.filters': 'Filtros',
    'search.genre': 'Gênero',
    'search.type': 'Tipo',
    'search.status': 'Status',
    'search.score': 'Pontuação',
    'search.year': 'Ano',
    
    // Anime details
    'anime.rating': 'Avaliação',
    'anime.episodes': 'Episódios',
    'anime.status': 'Status',
    'anime.genres': 'Gêneros',
    'anime.synopsis': 'Sinopse',
    'anime.addToList': 'Adicionar à Lista',
    'anime.removeFromList': 'Remover da Lista',
    
    // Lists
    'list.watching': 'Assistindo',
    'list.planToWatch': 'Planejo Assistir',
    'list.completed': 'Completos',
    'list.dropped': 'Desistidos',
    'list.empty': 'Nenhum anime nesta lista',
    
    // Settings
    'settings.general': 'Geral',
    'settings.appearance': 'Aparência',
    'settings.language': 'Idioma',
    'settings.notifications': 'Notificações',
    'settings.privacy': 'Privacidade',
    'settings.data': 'Dados',
    'settings.account': 'Conta',
    'settings.theme': 'Tema',
    'settings.light': 'Claro',
    'settings.dark': 'Escuro',
    'settings.auto': 'Automático',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.logout': 'Sair',
    'auth.loginWithGoogle': 'Entrar com Google',
    'auth.userProfile': 'Perfil do Usuário',
    'auth.ageVerification': 'Verificação de Idade',
    'auth.adultContent': 'Conteúdo Adulto',
    
    // Notifications
    'notification.success': 'Sucesso',
    'notification.error': 'Erro',
    'notification.warning': 'Aviso',
    'notification.info': 'Informação',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.myRatings': 'My Ratings',
    'nav.settings': 'Settings',
    'nav.watching': 'Watching',
    'nav.planToWatch': 'Plan to Watch',
    'nav.completed': 'Completed',
    'nav.dropped': 'Dropped',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    
    // Search
    'search.placeholder': 'Search animes...',
    'search.noResults': 'No results found',
    'search.advanced': 'Advanced Search',
    'search.filters': 'Filters',
    'search.genre': 'Genre',
    'search.type': 'Type',
    'search.status': 'Status',
    'search.score': 'Score',
    'search.year': 'Year',
    
    // Anime details
    'anime.rating': 'Rating',
    'anime.episodes': 'Episodes',
    'anime.status': 'Status',
    'anime.genres': 'Genres',
    'anime.synopsis': 'Synopsis',
    'anime.addToList': 'Add to List',
    'anime.removeFromList': 'Remove from List',
    
    // Lists
    'list.watching': 'Watching',
    'list.planToWatch': 'Plan to Watch',
    'list.completed': 'Completed',
    'list.dropped': 'Dropped',
    'list.empty': 'No animes in this list',
    
    // Settings
    'settings.general': 'General',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.privacy': 'Privacy',
    'settings.data': 'Data',
    'settings.account': 'Account',
    'settings.theme': 'Theme',
    'settings.light': 'Light',
    'settings.dark': 'Dark',
    'settings.auto': 'Auto',
    
    // Auth
    'auth.login': 'Login',
    'auth.logout': 'Logout',
    'auth.loginWithGoogle': 'Login with Google',
    'auth.userProfile': 'User Profile',
    'auth.ageVerification': 'Age Verification',
    'auth.adultContent': 'Adult Content',
    
    // Notifications
    'notification.success': 'Success',
    'notification.error': 'Error',
    'notification.warning': 'Warning',
    'notification.info': 'Information',
  }
};

// Create context
export const LanguageContext = createContext({
  language: 'pt',
  setLanguage: () => {},
  translate: (key) => key,
  t: (key) => key,
});

// Utility function to create translate function
const createTranslateFunction = (language, dicts) => {
  return (key) => {
    const dict = dicts[language] || dicts.pt;
    return dict[key] || key;
  };
};

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  const translate = useMemo(() => {
    return createTranslateFunction(language, DICTS);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translate,
    t: translate, // alias
  }), [language, translate]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

// Hook for using language context
export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


