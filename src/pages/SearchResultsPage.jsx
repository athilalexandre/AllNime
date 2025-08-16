import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchAnimes } from '../services/jikanService';
import { useAdultContent } from '../hooks/useAdultContent';
import AnimeCard from '../components/common/AnimeCard';
import { Search, Filter, Grid, List, Star, Calendar, TrendingUp } from 'lucide-react';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const { canAccess } = useAdultContent();

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, sortBy]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchAnimes(query, { 
        limit: 50,
        sort: sortBy === 'score' ? 'desc' : 'asc',
        orderBy: sortBy === 'score' ? 'score' : 'title'
      }, canAccess());
      
      if (response?.data) {
        setAnimes(response.data);
      } else {
        setAnimes([]);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setError('Erro ao realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getSortLabel = (value) => {
    switch (value) {
      case 'relevance': return 'Relevância';
      case 'title': return 'Título A-Z';
      case 'score': return 'Melhor Avaliados';
      default: return 'Relevância';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Buscando animes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="w-6 h-6 text-primary-light" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resultados da Busca
            </h1>
          </div>
          
          {query && (
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Buscando por: <span className="font-semibold text-primary-light">"{query}"</span>
            </p>
          )}
          
          {animes.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {animes.length} anime{animes.length !== 1 ? 's' : ''} encontrado{animes.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="relevance">Relevância</option>
              <option value="title">Título A-Z</option>
              <option value="score">Melhor Avaliados</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Erro na busca
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={performSearch}
              className="px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-md transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        ) : animes.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {animes.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum anime encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Não encontramos animes para "{query}". Tente:
            </p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1 mb-6">
              <li>• Verificar a ortografia</li>
              <li>• Usar termos mais gerais</li>
              <li>• Tentar sinônimos</li>
            </ul>
            <Link
              to="/explore"
              className="inline-flex items-center px-4 py-2 bg-primary-light hover:bg-primary-dark text-white rounded-md transition-colors"
            >
              Explorar Animes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage; 