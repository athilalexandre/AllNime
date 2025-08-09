import React, { createContext, useContext, useMemo, useState } from 'react';

const LanguageContext = createContext({
  language: 'pt-BR',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');
  const dictionary = useMemo(() => ({
    'header.explore': 'Explorar',
    'header.settings': 'Configurações',
  }), []);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key) => dictionary[key] || key,
  }), [language, dictionary]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;


