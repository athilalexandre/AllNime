import React, { createContext, useMemo, useState } from 'react';

// Available languages
export const languages = {
  pt: 'Português',
  en: 'English'
};

// Language dictionaries
const DICTS = {
  pt: {
    // Header & Navigation
    'Minhas Listas': 'Minhas Listas',
    'Explorar': 'Explorar',
    'Configurações': 'Configurações',
    'Assistindo': 'Assistindo',
    'Completados': 'Completados',
    'Planejados': 'Planejados',
    'Pausados': 'Pausados',
    'Desistidos': 'Desistidos',
    'Sair': 'Sair',
    'Login Google': 'Login Google',
    'Usuário': 'Usuário',
    
    // Home Page
    'Descubra, organize e acompanhe seus animes favoritos. Uma plataforma completa para gerenciar sua jornada pelo mundo dos animes.': 'Descubra, organize e acompanhe seus animes favoritos. Uma plataforma completa para gerenciar sua jornada pelo mundo dos animes.',
    'Animes da Temporada Atual': 'Animes da Temporada Atual',
    'Animes Mais Bem Avaliados': 'Animes Mais Bem Avaliados',
    'Meus Animes Favoritos': 'Meus Animes Favoritos',
    'animes encontrados': 'animes encontrados',
    'animes avaliados': 'animes avaliados',
    
    // Explore Page
    'Explorar Animes': 'Explorar Animes',
    'Descubra novos animes através de nossas categorias curadas e recomendações personalizadas.': 'Descubra novos animes através de nossas categorias curadas e recomendações personalizadas.',
    'Top Animes': 'Top Animes',
    'Animes da Temporada': 'Animes da Temporada',
    'Animes Populares': 'Animes Populares',
    'Nenhum anime encontrado': 'Nenhum anime encontrado',
    'Tente ajustar os filtros ou explore outras categorias.': 'Tente ajustar os filtros ou explore outras categorias.',
    
    // Search
    'Digite o nome de um anime...': 'Digite o nome de um anime...',
    'Buscar': 'Buscar',
    'Busca Avançada': 'Busca Avançada',
    'Filtros': 'Filtros',
    'Gênero': 'Gênero',
    'Tipo': 'Tipo',
    'Status': 'Status',
    'Pontuação': 'Pontuação',
    'Ano': 'Ano',
    'Nenhum resultado encontrado': 'Nenhum resultado encontrado',
    
    // Common
    'Carregando...': 'Carregando...',
    'Erro': 'Erro',
    'Sucesso': 'Sucesso',
    'Salvar': 'Salvar',
    'Cancelar': 'Cancelar',
    'Editar': 'Editar',
    'Excluir': 'Excluir',
    'Filtrar': 'Filtrar',
    'Limpar': 'Limpar',
    
    // Anime details
    'Avaliação': 'Avaliação',
    'Episódios': 'Episódios',
    'Gêneros': 'Gêneros',
    'Sinopse': 'Sinopse',
    'Adicionar à Lista': 'Adicionar à Lista',
    'Remover da Lista': 'Remover da Lista',
    
    // Lists
    'Nenhum anime nesta lista': 'Nenhum anime nesta lista',
    
    // Settings
    'Geral': 'Geral',
    'Aparência': 'Aparência',
    'Idioma': 'Idioma',
    'Notificações': 'Notificações',
    'Privacidade': 'Privacidade',
    'Dados': 'Dados',
    'Conta': 'Conta',
    'Tema': 'Tema',
    'Claro': 'Claro',
    'Escuro': 'Escuro',
    'Automático': 'Automático',
    
    // Auth
    'Entrar': 'Entrar',
    'Perfil do Usuário': 'Perfil do Usuário',
    'Verificação de Idade': 'Verificação de Idade',
    'Conteúdo Adulto': 'Conteúdo Adulto',
    
    // Notifications
    'Aviso': 'Aviso',
    'Informação': 'Informação',
    
    // Pages
    'Início': 'Início',
    'Minhas Avaliações': 'Minhas Avaliações',
    'Planejo Assistir': 'Planejo Assistir',
    'Completos': 'Completos',
    'Desistidos': 'Desistidos',
  },
  en: {
    // Header & Navigation
    'Minhas Listas': 'My Lists',
    'Explorar': 'Explore',
    'Configurações': 'Settings',
    'Assistindo': 'Watching',
    'Completados': 'Completed',
    'Planejados': 'Planned',
    'Pausados': 'On Hold',
    'Desistidos': 'Dropped',
    'Sair': 'Logout',
    'Login Google': 'Google Login',
    'Usuário': 'User',
    
    // Home Page
    'Descubra, organize e acompanhe seus animes favoritos. Uma plataforma completa para gerenciar sua jornada pelo mundo dos animes.': 'Discover, organize and track your favorite animes. A complete platform to manage your journey through the anime world.',
    'Animes da Temporada Atual': 'Current Season Animes',
    'Animes Mais Bem Avaliados': 'Top Rated Animes',
    'Meus Animes Favoritos': 'My Favorite Animes',
    'animes encontrados': 'animes found',
    'animes avaliados': 'animes rated',
    
    // Explore Page
    'Explorar Animes': 'Explore Animes',
    'Descubra novos animes através de nossas categorias curadas e recomendações personalizadas.': 'Discover new animes through our curated categories and personalized recommendations.',
    'Top Animes': 'Top Animes',
    'Animes da Temporada': 'Seasonal Animes',
    'Animes Populares': 'Popular Animes',
    'Nenhum anime encontrado': 'No anime found',
    'Tente ajustar os filtros ou explore outras categorias.': 'Try adjusting the filters or explore other categories.',
    
    // Search
    'Digite o nome de um anime...': 'Type the name of an anime...',
    'Buscar': 'Search',
    'Busca Avançada': 'Advanced Search',
    'Filtros': 'Filters',
    'Gênero': 'Genre',
    'Tipo': 'Type',
    'Status': 'Status',
    'Pontuação': 'Score',
    'Ano': 'Year',
    'Nenhum resultado encontrado': 'No results found',
    
    // Common
    'Carregando...': 'Loading...',
    'Erro': 'Error',
    'Sucesso': 'Success',
    'Salvar': 'Save',
    'Cancelar': 'Cancel',
    'Editar': 'Edit',
    'Excluir': 'Delete',
    'Filtrar': 'Filter',
    'Limpar': 'Clear',
    
    // Anime details
    'Avaliação': 'Rating',
    'Episódios': 'Episodes',
    'Gêneros': 'Genres',
    'Sinopse': 'Synopsis',
    'Adicionar à Lista': 'Add to List',
    'Remover da Lista': 'Remove from List',
    
    // Lists
    'Nenhum anime nesta lista': 'No anime in this list',
    
    // Settings
    'Geral': 'General',
    'Aparência': 'Appearance',
    'Idioma': 'Language',
    'Notificações': 'Notifications',
    'Privacidade': 'Privacy',
    'Dados': 'Data',
    'Conta': 'Account',
    'Tema': 'Theme',
    'Claro': 'Light',
    'Escuro': 'Dark',
    'Automático': 'Auto',
    
    // Auth
    'Entrar': 'Login',
    'Perfil do Usuário': 'User Profile',
    'Verificação de Idade': 'Age Verification',
    'Conteúdo Adulto': 'Adult Content',
    
    // Notifications
    'Aviso': 'Warning',
    'Informação': 'Information',
    
    // Pages
    'Início': 'Home',
    'Minhas Avaliações': 'My Ratings',
    'Planejo Assistir': 'Plan to Watch',
    'Completos': 'Completed',
    'Desistidos': 'Dropped',
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
  // Get language from localStorage or default to 'pt'
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('allnime-language') || 'pt';
    } catch {
      return 'pt';
    }
  });

  // Update localStorage when language changes
  const handleSetLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    try {
      localStorage.setItem('allnime-language', newLanguage);
    } catch {
      // Ignore localStorage errors
    }
  };

  const translate = useMemo(() => {
    return createTranslateFunction(language, DICTS);
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
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


