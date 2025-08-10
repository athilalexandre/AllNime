import { createContext } from 'react';

export const LanguageContext = createContext({
  language: 'pt',
  setLanguage: () => {},
  translate: (key) => key,
  t: (key) => key,
});
