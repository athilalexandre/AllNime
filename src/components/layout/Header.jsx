// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import DropdownMenu from '../common/DropdownMenu';

import AgeRestrictionIcon from '../ui/AgeRestrictionIcon';
import SearchBar from '../features/search/SearchBar';
import { Star, Eye, PlaySquare, CheckCheck, ArchiveX, Compass, Settings, Menu } from 'lucide-react';
import { useLanguage, languages } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { translate, setLanguage, language } = useLanguage();
  const { user, loading, signInWithGoogle, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const myListsItems = [
    { label: translate('Assistindo'), icon: PlaySquare, to: '/watching' },
    { label: translate('Completados'), icon: CheckCheck, to: '/completed' },
    { label: translate('Planejados'), icon: Eye, to: '/plan-to-watch' },
    { label: translate('Pausados'), icon: Star, to: '/on-hold' },
    { label: translate('Desistidos'), icon: ArchiveX, to: '/dropped' },
  ];

  return (
    <>
      <header className="bg-card-light dark:bg-card-dark shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 overflow-visible">
          <div className="flex items-center py-3 sm:py-4 overflow-visible">
            {/* Logo */}
            <Link to="/" className="text-lg sm:text-xl lg:text-2xl font-bold transition-colors hover:opacity-80 flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              AllNime
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 ml-6">
              <nav className="flex items-center space-x-3 xl:space-x-4">
                <Link to="/explore" className="flex items-center text-sm text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-2 py-2 rounded-md">
                  <Compass size={16} className="mr-1.5" /> {translate('Explorar')}
                </Link>
                <Link to="/settings" className="flex items-center text-sm text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-2 py-2 rounded-md">
                  <Settings size={16} className="mr-1.5" /> {translate('Configurações')}
                </Link>
              </nav>
              
              <DropdownMenu label={translate('Minhas Listas')} items={myListsItems} />
            </div>

            {/* Search Bar - Centro */}
            <div className="hidden md:flex flex-1 max-w-md mx-2 lg:mx-4 justify-center">
              <SearchBar placeholder={translate('Digite o nome de um anime...')} className="w-full max-w-sm" />
            </div>

            {/* Right Side Elements */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2 ml-auto overflow-visible">
              {/* Login e Status de Conteúdo Unificados */}
              <div className="flex-shrink-0">
                <AgeRestrictionIcon />
              </div>
              
              {/* Botão de logout (apenas quando logado) */}
              {user && (
                <button onClick={logout} className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium whitespace-nowrap">
                  {translate('Sair')}
                </button>
              )}
              

              
              {/* Language Selection Buttons */}
              <div className="hidden sm:flex space-x-1">
                {Object.keys(languages).map((langKey) => (
                  <button 
                    key={langKey} 
                    onClick={() => setLanguage(langKey)} 
                    className={`px-1.5 py-1 rounded text-xs font-semibold transition-colors ${
                      language === langKey 
                        ? 'bg-primary-light text-white' 
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {langKey.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <ThemeToggle />
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors"
              >
                <Menu size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden mb-3 px-2">
            <SearchBar placeholder={translate('Digite o nome de um anime...')} className="w-full" />
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <nav className="flex flex-col space-y-2">
                <Link 
                  to="/explore" 
                  className="flex items-center text-sm text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Compass size={18} className="mr-2" /> {translate('Explorar')}
                </Link>
                <Link 
                  to="/settings" 
                  className="flex items-center text-sm text-text-main-light dark:text-text-main-dark hover:text-primary-light dark:hover:text-primary-dark transition-colors px-3 py-2 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings size={18} className="mr-2" /> {translate('Configurações')}
                </Link>
                
                {/* Mobile Auth Section */}
                {!loading && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    {user ? (
                      <div className="flex items-center space-x-2 px-3 py-2">
                        {user.photoURL && (
                          <img src={user.photoURL} alt={user.displayName || 'avatar'} className="w-8 h-8 rounded-full" />
                        )}
                        <span className="text-sm text-text-main-light dark:text-text-main-dark">
                          {user.displayName || translate('Usuário')}
                        </span>
                        <button 
                          onClick={() => {
                            logout();
                            setIsMobileMenuOpen(false);
                          }} 
                          className="ml-auto px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          {translate('Sair')}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          signInWithGoogle();
                          setIsMobileMenuOpen(false);
                        }} 
                        className="w-full mx-3 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        {translate('Login Google')}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Mobile Language Selection */}
                <div className="flex space-x-1 pt-2">
                  {Object.keys(languages).map((langKey) => (
                    <button 
                      key={langKey} 
                      onClick={() => {
                        setLanguage(langKey);
                        setIsMobileMenuOpen(false);
                      }} 
                      className={`px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                        language === langKey 
                          ? 'bg-primary-light text-white' 
                          : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {langKey.toUpperCase()}
                    </button>
                  ))}
                </div>
                
                {/* Mobile My Lists */}
                <div className="pt-2">
                  <DropdownMenu label={translate('Minhas Listas')} items={myListsItems} />
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
      

    </>
  );
};

export default Header;
