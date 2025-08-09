import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export const languages = {
  en: {
    'Voltar para a busca': 'Back to search',
    'Carregando detalhes do anime...': 'Loading anime details...',
    'Não foi possível carregar os detalhes do anime.': 'Could not load anime details.',
    'Anime não encontrado.': 'Anime not found.',
    'Título em Japonês:': 'Japanese Title:',
    'Status:': 'Status:',
    'Episódios:': 'Episodes:',
    'Classificação:': 'Rating:',
    'Popularidade:': 'Popularity:',
    'Sinopse': 'Synopsis',
    'Tipo:': 'Type:',
    'Fonte:': 'Source:',
    'Período no Ar:': 'Aired:',
    'Duração por Ep.:': 'Duration per Ep.:',
    'min.': 'min.',
    'Gêneros:': 'Genres:',
    'Estúdios:': 'Studios:',
    'Sua Avaliação': 'Your Rating',
    'Não Avaliado': 'Not Rated',
    'Sua opinião sobre este anime...': 'Your opinion about this anime...',
    'Salvar Avaliação': 'Save Rating',
    'Remover Avaliação': 'Remove Rating',
    'Avaliação salva com sucesso!': 'Rating saved successfully!',
    'LocalStorage não disponível. Avaliação não pôde ser salva.': 'LocalStorage not available. Rating could not be saved.',
    'Avaliação removida com sucesso!': 'Rating removed successfully!',
    'LocalStorage não disponível. Avaliação não pôde ser removida.': 'LocalStorage not available. Rating could not be removed.',
    'Trailer': 'Trailer',
    'Links Externos': 'External Links',
    'Episódios para Assistir': 'Episodes to Watch',
    'Número:': 'Number:',
    'Episódio': 'Episode',
    'Sem Título': 'No Title',
  },
  pt: {
    'Voltar para a busca': 'Voltar para a busca',
    'Carregando detalhes do anime...': 'Carregando detalhes do anime...', 
    'Não foi possível carregar os detalhes do anime.': 'Não foi possível carregar os detalhes do anime.',
    'Anime não encontrado.': 'Anime não encontrado.',
    'Título em Japonês:': 'Título em Japonês:',
    'Status:': 'Status:',
    'Episódios:': 'Episódios:',
    'Classificação:': 'Classificação:',
    'Popularidade:': 'Popularidade:',
    'Sinopse': 'Sinopse',
    'Tipo:': 'Tipo:',
    'Fonte:': 'Fonte:',
    'Período no Ar:': 'Período no Ar:',
    'Duração por Ep.:': 'Duração por Ep.:',
    'min.': 'min.',
    'Gêneros:': 'Gêneros:',
    'Estúdios:': 'Estúdios:',
    'Sua Avaliação': 'Sua Avaliação',
    'Não Avaliado': 'Não Avaliado',
    'Sua opinião sobre este anime...': 'Sua opinião sobre este anime...',
    'Salvar Avaliação': 'Salvar Avaliação',
    'Remover Avaliação': 'Remover Avaliação',
    'Avaliação salva com sucesso!': 'Avaliação salva com sucesso!',
    'LocalStorage não disponível. Avaliação não pôde ser salva.': 'LocalStorage não disponível. Avaliação não pôde ser salva.',
    'Avaliação removida com sucesso!': 'Avaliação removida com sucesso!',
    'LocalStorage não disponível. Avaliação não pôde ser removida.': 'LocalStorage não disponível. Avaliação não pôde ser removida.',
    'Trailer': 'Trailer',
    'Links Externos': 'Links Externos',
    'Episódios para Assistir': 'Episódios para Assistir',
    'Número:': 'Número:',
    'Episódio': 'Episódio',
    'Sem Título': 'Sem Título',
  },
  es: {
    'Voltar para a busca': 'Volver a la búsqueda',
    'Carregando detalhes do anime...': 'Cargando detalles del anime...',
    'Não foi possível carregar os detalhes do anime.': 'No se pudieron cargar los detalles del anime.',
    'Anime não encontrado.': 'Anime no encontrado.',
    'Título em Japonês:': 'Título en Japonés:',
    'Status:': 'Estado:',
    'Episódios:': 'Episodios:',
    'Classificação:': 'Clasificación:',
    'Popularidade:': 'Popularidad:',
    'Sinopse': 'Sinopsis',
    'Tipo:': 'Tipo:',
    'Fonte:': 'Fuente:',
    'Período no Ar:': 'Período en el aire:',
    'Duração por Ep.:': 'Duración por Ep.:',
    'min.': 'min.',
    'Gêneros:': 'Géneros:',
    'Estúdios:': 'Estudios:',
    'Sua Avaliação': 'Tu Evaluación',
    'Não Avaliado': 'No Evaluado',
    'Sua opinião sobre este anime...': 'Tu opinión sobre este anime...',
    'Salvar Avaliação': 'Guardar Evaluación',
    'Remover Avaliação': 'Eliminar Evaluación',
    'Avaliação salva com sucesso!': '¡Evaluación guardada exitosamente!',
    'LocalStorage não disponível. Avaliação não pôde ser salva.': 'LocalStorage no disponible. La evaluación no se pudo guardar.',
    'Avaliação removida com sucesso!': '¡Evaluación eliminada exitosamente!',
    'LocalStorage não disponível. Avaliação não pôde ser removida.': 'LocalStorage no disponible. La evaluación no se pudo eliminar.',
    'Trailer': 'Trailer',
    'Links Externos': 'Enlaces Externos',
    'Episódios para Assistir': 'Episodios para Ver',
    'Número:': 'Número:',
    'Episódio': 'Episodio',
    'Sem Título': 'Sin Título',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('appLanguage') || 'pt';
    }
    return 'pt';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('appLanguage', language);
    }
  }, [language]);

  const translate = (key) => {
    return languages[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 