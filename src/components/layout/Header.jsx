import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-card-light dark:bg-card-dark shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary-light dark:text-primary-dark">
          Anime Master
        </Link>
        <nav>
          <Link to="/my-ratings" className="text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors">
            Meus Avaliados
          </Link>
        </nav>
      </div>
    </header>
  );
};
export default Header;
