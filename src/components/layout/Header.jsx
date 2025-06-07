// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle'; // Importar o toggle

const Header = () => {
  return (
    <header className="bg-card-light dark:bg-card-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary-dark transition-colors hover:opacity-80">
            Anime Master
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4"> {/* Wrapper para nav e toggle */}
            <nav>
              <Link
                to="/my-ratings"
                className="text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
              >
                Meus Avaliados
              </Link>
            </nav>
            <ThemeToggle /> {/* Adicionar o toggle aqui */}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
