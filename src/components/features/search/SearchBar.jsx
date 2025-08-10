import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, Star } from 'lucide-react';
import { searchAnimes } from '../../../services/jikanService';

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

  useEffect(() => {
    // Carregar buscas recentes do localStorage
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
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
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

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

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 2) return;

    setIsLoading(true);
    try {
      const response = await searchAnimes(query, { limit: 5 });
      if (response?.data) {
        setSuggestions(response.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    if (!query.trim()) return;
    
    // Salvar busca recente
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    
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
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (anime) => {
    handleSearch(anime.title);
  };

  const handleRecentSearchClick = (search) => {
    handleSearch(search);
  };

  const handlePopularSearchClick = (search) => {
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
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            onFocus={() => {
              if (searchTerm.trim().length >= 2 || recentSearches.length > 0 || popularSearches.length > 0) {
                setShowSuggestions(true);
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
          Buscar
        </button>
      </form>

      {/* Dropdown de sugestões */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {/* Sugestões da API */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Search size={16} />
                Sugestões
              </h3>
              <div className="space-y-2">
                {suggestions.map(anime => (
                  <button
                    key={anime.mal_id}
                    onClick={() => handleSuggestionClick(anime)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors flex items-center gap-3"
                  >
                    <img
                      src={anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-10 h-14 object-cover rounded"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/40x56?text=No+Image';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {anime.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {anime.type} • {anime.episodes || '?'} eps
                      </p>
                    </div>
                    {anime.score && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-medium">{anime.score}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buscas recentes */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Clock size={16} />
                Buscas recentes
              </h3>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm text-gray-700 dark:text-gray-300"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buscas populares */}
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <TrendingUp size={16} />
              Buscas populares
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handlePopularSearchClick(search)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-xs text-gray-700 dark:text-gray-300 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="p-3 text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-light"></div>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Buscando...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
