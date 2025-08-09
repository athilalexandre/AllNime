// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import DropdownMenu from '../common/DropdownMenu';
import { Star, Eye, PlaySquare, CheckCheck, ArchiveX, Compass, Settings } from 'lucide-react'; // Ícones para o dropdown e Explorar

const Header = () => {
  const myListsItems = [
    { label: 'Meus Avaliados', to: '/my-ratings', icon: Star },
    { label: 'Planejo Assistir', to: '/plan-to-watch', icon: Eye },
    { label: 'Assistindo Atualmente', to: '/watching', icon: PlaySquare },
    { label: 'Completos', to: '/completed', icon: CheckCheck },
    { label: 'Desistidos', to: '/dropped', icon: ArchiveX },
  ];

  return (
    <header className="bg-card-light dark:bg-card-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary-dark transition-colors hover:opacity-80">
            Anime Master
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <nav className="hidden sm:flex items-center space-x-1"> {/* Esconder em telas muito pequenas se o dropdown já estiver lá */}
              <Link
                to="/explore"
                className="flex items-center text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
              >
                <Compass size={18} className="mr-1 sm:mr-2" /> Explorar
              </Link>
              <Link
                to="/settings"
                className="flex items-center text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
              >
                <Settings size={18} className="mr-1 sm:mr-2" /> Configurações
              </Link>
            </nav>
            <DropdownMenu label="Minhas Listas" items={myListsItems} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
