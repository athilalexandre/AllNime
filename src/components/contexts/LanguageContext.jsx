import React, { useMemo, useState } from 'react';
import { DICTS } from './languageConstants';
import { createTranslateFunction } from './languageUtils';
import { LanguageContext } from './languageContext';

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


