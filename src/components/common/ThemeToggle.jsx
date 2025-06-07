// src/components/common/ThemeToggle.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  // Não renderizar o botão no servidor ou se o tema ainda não foi determinado
  // Isso ajuda a evitar a dessincronização inicial (flicker) se o tema do servidor for diferente do cliente.
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !theme) {
    // Renderiza um placeholder ou nada para evitar que o ícone errado apareça brevemente.
    // Um div com tamanho fixo pode ajudar a evitar "layout shift".
    return <div style={{ width: '36px', height: '36px'}} className="p-2" />; // Tamanho correspondente ao botão
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-main-light dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors duration-150"
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};
export default ThemeToggle;
