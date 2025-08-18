import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react';
import { searchAnimes } from '../../../services/jikanService';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import logger from '../../../services/loggerService.js';

const SearchBar = ({ placeholder = "Digite o nome de um anime...", className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    'Naruto', 'Dragon Ball', 'One Piece', 'Attack on Titan', 
    'Death Note', 'Fullmetal Alchemist', 'My Hero Academia'
  ]);
  
  const searchTimeoutRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { canAccessAdultContent } = useAuth();
  const { translate } = useLanguage();

  // Log component initialization
  useEffect(() => {
    logger.info('SearchBar component initialized', {
      canAccessAdultContent,
      popularSearchesCount: popularSearches.length
    }, 'search');
  }, [canAccessAdultContent]);

  // Mover fetchSuggestions para antes do useEffect que a utiliza
  const fetchSuggestions = useCallback(async (query) => {
    if (query.trim().length < 2) return;

    logger.debug('Fetching suggestions', { query, canAccessAdultContent }, 'search');
    setIsLoading(true);
    
    try {
      const startTime = Date.now();
      const response = await searchAnimes(query, { limit: 5 }, canAccessAdultContent);
      const duration = Date.now() - startTime;
      
      if (response?.data) {
        setSuggestions(response.data);
        setShowSuggestions(true);
        logger.info('Suggestions fetched successfully', {
          query,
          resultsCount: response.data.length,
          duration: `${duration}ms`
        }, 'search');
      } else {
        logger.warn('No suggestions data in response', { query, response }, 'search');
      }
    } catch (error) {
      logger.error('Error fetching suggestions', {
        query,
        error: error.message,
        stack: error.stack
      }, 'search');
    } finally {
      setIsLoading(false);
    }
  }, [canAccessAdultContent]);

  useEffect(() => {
    // Carregar buscas recentes do localStorage
    try {
      const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
      setRecentSearches(recent.slice(0, 5));
      logger.debug('Recent searches loaded', { count: recent.length }, 'search');
    } catch (error) {
      logger.error('Error loading recent searches from localStorage', { error: error.message }, 'search');
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      // Debounce de 300ms para evitar muitas requisições
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300);
      logger.debug('Search debounce started', { searchTerm, delay: 300 }, 'search');
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    // Fechar sugestões ao clicar fora
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    if (!query.trim()) return;
    
    logger.info('Search initiated', { query, source: 'searchbar' }, 'search');
    
    // Salvar busca recente
    try {
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
      logger.debug('Recent search saved', { query, totalRecent: newRecent.length }, 'search');
    } catch (error) {
      logger.error('Error saving recent search', { query, error: error.message }, 'search');
    }
    
    // Navegar para resultados
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setShowSuggestions(false);
    setSearchTerm('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  const clearSearch = () => {
    logger.debug('Search cleared', { previousTerm: searchTerm }, 'search');
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (anime) => {
    logger.info('Suggestion clicked', { 
      animeTitle: anime.title, 
      animeId: anime.mal_id 
    }, 'search');
    handleSearch(anime.title);
  };

  const handleRecentSearchClick = (search) => {
    logger.info('Recent search clicked', { search }, 'search');
    handleSearch(search);
  };

  const handlePopularSearchClick = (search) => {
    logger.info('Popular search clicked', { search }, 'search');
    handleSearch(search);
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder={translate(placeholder)}
                 className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onFocus={() => {
              if (searchTerm.trim().length >= 2 || recentSearches.length > 0 || popularSearches.length > 0) {
                setShowSuggestions(true);
                logger.debug('Search suggestions shown on focus', { 
                  searchTermLength: searchTerm.trim().length,
                  recentSearchesCount: recentSearches.length,
                  popularSearchesCount: popularSearches.length
                }, 'search');
              }
            }}
          />
          
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          )}
        </div>
        
                       <button
                 type="submit"
                 className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-light hover:bg-primary-dark text-white px-4 py-1.5 rounded-md font-medium transition-colors text-sm"
               >
                 {translate('Buscar')}
               </button>
      </form>

      {/* Dropdown de sugestões */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {/* Sugestões da API */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                   <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                       <Star className="w-4 h-4 mr-2 text-yellow-500" />
                       {translate('Sugestões')}
                     </h3>
              <div className="space-y-2">
                {suggestions.map((anime) => (
                  <button
                    key={anime.mal_id}
                    onClick={() => handleSuggestionClick(anime)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {anime.images?.jpg?.image_url && (
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          className="w-10 h-14 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            logger.warn('Failed to load anime image', { 
                              animeId: anime.mal_id, 
                              imageUrl: anime.images?.jpg?.image_url 
                            }, 'search');
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {anime.title}
                        </div>
                        {anime.year && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {anime.year}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buscas recentes */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                     <Clock className="w-4 h-4 mr-2 text-blue-500" />
                     {translate('Buscas Recentes')}
                   </h3>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm text-gray-600 dark:text-gray-400"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buscas populares */}
          {popularSearches.length > 0 && (
            <div className="p-3">
                                 <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                     <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                     {translate('Populares')}
                   </h3>
              <div className="space-y-1">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularSearchClick(search)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm text-gray-600 dark:text-gray-400"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
                             <div className="p-3 text-center">
                   <div className="text-sm text-gray-500 dark:text-gray-400">
                     {translate('Buscando sugestões...')}
                   </div>
                 </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
