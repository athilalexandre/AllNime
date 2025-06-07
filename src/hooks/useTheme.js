// src/hooks/useTheme.js
import { useState, useEffect, useCallback } from 'react';

export const useTheme = () => {
  const systemPreference = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const getInitialTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme;
      }
    }
    return systemPreference && systemPreference.matches ? 'dark' : 'light';
  }, [systemPreference]);

  const [theme, setTheme] = useState(getInitialTheme);

  const applyTheme = useCallback((selectedTheme) => {
    if (typeof window !== 'undefined') {
      const rootElement = window.document.documentElement;
      if (selectedTheme === 'dark') {
        rootElement.classList.add('dark');
      } else {
        rootElement.classList.remove('dark');
      }
      localStorage.setItem('theme', selectedTheme);
      setTheme(selectedTheme);
    }
  }, []);

  useEffect(() => {
    // Aplica o tema assim que o componente que usa o hook é montado no cliente
    // Isso garante que o tema salvo ou a preferência do sistema seja aplicado no carregamento inicial.
    const initialTheme = getInitialTheme();
    if (typeof window !== 'undefined') { // Garante que só roda no cliente
        const rootElement = window.document.documentElement;
        if (initialTheme === 'dark') {
            rootElement.classList.add('dark');
        } else {
            rootElement.classList.remove('dark');
        }
        // Se o tema salvo for diferente do estado inicial (ex: preferência do sistema mudou),
        // atualiza o localStorage e o estado.
        if (localStorage.getItem('theme') !== initialTheme) {
            localStorage.setItem('theme', initialTheme);
        }
        setTheme(initialTheme); // Atualiza o estado do React
    }
  }, [getInitialTheme]); // Removido applyTheme daqui para evitar loop, getInitialTheme é suficiente.

  // Este useEffect é para atualizar a classe no HTML quando o estado 'theme' mudar internamente via toggleTheme.
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const rootElement = window.document.documentElement;
        if (theme === 'dark') {
            rootElement.classList.add('dark');
        } else {
            rootElement.classList.remove('dark');
        }
        // Também salva no localStorage aqui para garantir que o toggle persista.
        localStorage.setItem('theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined' && systemPreference) {
        const handleChange = (e) => {
        const savedTheme = localStorage.getItem('theme');
        if (!savedTheme) { // Only if user hasn't set an explicit preference
            // Não chama applyTheme diretamente para evitar re-setar localStorage desnecessariamente
            // se já estiver de acordo com a preferência do sistema.
            // Apenas atualiza o estado do React, que por sua vez atualiza a classe no <html>
            setTheme(e.matches ? 'dark' : 'light');
        }
        };
        systemPreference.addEventListener('change', handleChange);
        return () => systemPreference.removeEventListener('change', handleChange);
    }
  }, [systemPreference, setTheme]); // Adicionado setTheme como dependência

  const toggleTheme = () => {
    // applyTheme já lida com a lógica de aplicar a classe e salvar no localStorage
    applyTheme(theme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
