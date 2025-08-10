import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { searchAnimes, searchAnimesAdvanced } from '../services/jikanService';
import AdvancedSearchForm from '../components/features/search/AdvancedSearchForm';
import { useAuth } from '../components/contexts/useAuth';
import AdultContentWarning from '../components/ui/AdultContentWarning';
import { useAdultContent } from '../hooks/useAdultContent';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const navigate = useNavigate();
  const { canAccessAdultContent } = useAuth();
  const { canAccess, getRestrictionMessage } = useAdultContent();

  useEffect(() => {
    if (!searchTerm.trim()) return;
    performSearch(searchTerm, { page: 1 });
  }, [searchTerm, performSearch]);

  const performSearch = useCallback(async (query, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (Object.keys(activeFilters).length > 0) {
        // Busca avançada
        response = await searchAnimesAdvanced({
          query,
          page: options.page || 1,
          ...activeFilters
        }, canAccessAdultContent);
      } else {
        // Busca simples
        response = await searchAnimes(query, {
          page: options.page || 1,
          ...options
        }, canAccessAdultContent);
      }
      
      if (response?.data) {
        const filteredResults = response.data.filter(anime =>
          anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url
        );
        setResults(filteredResults);
        
        // Configurar paginação
        if (response.pagination) {
          setTotalPages(Math.ceil(response.pagination.items.total / 25));
        }
      } else {
        setResults([]);
        setTotalPages(1);
      }
    } catch (error) {
      setError('Erro ao buscar animes.');
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeFilters, canAccessAdultContent]);

  const handleAdvancedSearch = (filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
    performSearch(searchTerm, { page: 1, ...filters });
    setShowAdvancedSearch(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setCurrentPage(newPage);
    performSearch(searchTerm, { page: newPage, ...activeFilters });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
    performSearch(searchTerm, { page: 1 });
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className="container mx-auto p-4 pt-20">
      {/* Header da busca */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Resultados para "{searchTerm}"</h1>
        
        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtros ativos:</span>
            {Object.entries(activeFilters).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-light text-white"
              >
                {key}: {value}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Controles de busca */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={() => setShowAdvancedSearch(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Filter size={18} />
            Busca Avançada
          </button>
          
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Aviso de Conteúdo Adulto */}
      {!canAccess() && (
        <div className="mb-6">
          <AdultContentWarning
            title="Conteúdo Adulto Filtrado"
            message="Os resultados da busca foram filtrados para excluir conteúdo adulto. Faça login e verifique se você é maior de 18 anos para acessar todos os resultados."
            showDetails={true}
            onAction={() => window.location.href = '/'}
            actionText="Fazer Login"
          />
        </div>
      )}

      {/* Loading e erro */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Buscando animes...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => performSearch(searchTerm, { page: currentPage, ...activeFilters })}
            className="mt-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Resultados */}
      {!isLoading && !error && results.length === 0 && (
        <div className="text-center py-8">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">Nenhum anime encontrado.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Tente ajustar os termos de busca ou usar a busca avançada.
          </p>
        </div>
      )}

      {/* Grid de resultados */}
      {!isLoading && !error && results.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {results.map(anime => (
              <div
                key={anime.mal_id}
                className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                onClick={() => navigate(`/anime/${anime.mal_id}/edit`)}
              >
                <div className="relative">
                  <img 
                    src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} 
                    alt={anime.title} 
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/250x350?text=No+Image';
                    }}
                  />
                  
                  {/* Overlay com informações */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                      <Eye size={24} className="mx-auto mb-2" />
                      <span className="text-sm">Ver detalhes</span>
                    </div>
                  </div>

                  {/* Score */}
                  {anime.score && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      {anime.score}
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <h3 className="text-md font-semibold truncate mb-1" title={anime.title}>
                    {anime.title}
                  </h3>
                  
                  <div className="space-y-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                    {anime.type && (
                      <p className="capitalize">{anime.type}</p>
                    )}
                    {anime.episodes && (
                      <p>Episódios: {anime.episodes}</p>
                    )}
                    {anime.status && (
                      <p className="capitalize">{anime.status}</p>
                    )}
                    {anime.year && (
                      <p>{anime.year}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal de busca avançada */}
      <AdvancedSearchForm
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearch={handleAdvancedSearch}
      />
    </div>
  );
};

export default SearchResultsPage; 