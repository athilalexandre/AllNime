import React, { createContext, useContext, useMemo, useState } from 'react';

export const languages = {
  pt: 'Português',
  en: 'English',
};

const DICTS = {
  pt: {
    'Explorar': 'Explorar',
    'Minhas Listas': 'Minhas Listas',
    'Meus Avaliados': 'Meus Avaliados',
    'Planejo Assistir': 'Planejo Assistir',
    'Assistindo Atualmente': 'Assistindo Atualmente',
    'Completos': 'Completos',
    'Desistidos': 'Desistidos',
  },
  en: {
    'Explorar': 'Explore',
    'Minhas Listas': 'My Lists',
    'Meus Avaliados': 'My Ratings',
    'Planejo Assistir': 'Plan to Watch',
    'Assistindo Atualmente': 'Watching',
    'Completos': 'Completed',
    'Desistidos': 'Dropped',
  },
};

const LanguageContext = createContext({
  language: 'pt',
  setLanguage: () => {},
  translate: (key) => key,
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt');

  const translate = useMemo(() => {
    return (key) => {
      const dict = DICTS[language] || {};
      return dict[key] || key;
    };
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

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;


