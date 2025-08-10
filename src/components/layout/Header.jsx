// src/components/layout/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import DropdownMenu from '../common/DropdownMenu';
import { Star, Eye, PlaySquare, CheckCheck, ArchiveX, Compass, Settings } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { translate, setLanguage, language } = useLanguage();
  const { user, loading, signInWithGoogle, logout } = useAuth();

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
            AllNime
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
            {/* Auth buttons */}
            {!loading && (
              user ? (
                <div className="flex items-center space-x-2">
                  {user.photoURL && (
                    <img src={user.photoURL} alt={user.displayName || 'avatar'} className="w-8 h-8 rounded-full" />
                  )}
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={signInWithGoogle}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Login Google
                </button>
              )
            )}
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
