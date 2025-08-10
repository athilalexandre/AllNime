// Funções utilitárias para idiomas
export const createTranslateFunction = (language, dicts) => {
  return (key) => {
    const dict = dicts[language] || {};
    return dict[key] || key;
  };
};
