// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import DropdownMenu from '../common/DropdownMenu';
import { Star, Eye, PlaySquare, CheckCheck, ArchiveX, Compass, Settings } from 'lucide-react';
import { useLanguage, languages } from '../contexts/LanguageContext.jsx';

const Header = () => {
  const { translate, setLanguage, language } = useLanguage();

  const myListsItems = [
    { label: translate('Meus Avaliados'), to: '/my-ratings', icon: Star },
    { label: translate('Planejo Assistir'), to: '/plan-to-watch', icon: Eye },
    { label: translate('Assistindo Atualmente'), to: '/watching', icon: PlaySquare },
    { label: translate('Completos'), to: '/completed', icon: CheckCheck },
    { label: translate('Desistidos'), to: '/dropped', icon: ArchiveX },
  ];

  return (
    <header className="bg-card-light dark:bg-card-dark shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl sm:text-2xl font-bold text-primary-light dark:text-primary-dark transition-colors hover:opacity-80">
            Anime Master
          </Link>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <nav className="hidden sm:flex items-center space-x-1">
              <Link
                to="/explore"
                className="flex items-center text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
              >
                <Compass size={18} className="mr-1 sm:mr-2" /> {translate('Explorar')}
              </Link>
              <Link
                to="/settings"
                className="flex items-center text-sm sm:text-base text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
              >
                <Settings size={18} className="mr-1 sm:mr-2" /> {translate('Configurações')}
              </Link>
            </nav>
            <DropdownMenu label={translate('Minhas Listas')} items={myListsItems} />
            {/* Language Selection Buttons */}
            <div className="flex space-x-1">
              {Object.keys(languages).map((langKey) => (
                <button 
                  key={langKey}
                  onClick={() => setLanguage(langKey)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold ${language === langKey ? 'bg-primary-light text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                >
                  {langKey.toUpperCase()}
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
export default Header;
