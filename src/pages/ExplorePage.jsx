// src/pages/ExplorePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAnimes, searchAnimes } from '../services/jikanService';
import SkeletonCard from '../components/common/SkeletonCard';
import { Filter, ChevronLeft, ChevronRight, SearchX } from 'lucide-react';

const ITEMS_PER_PAGE = 25; // Jikan V4 suporta até 25

const ExplorePage = () => {
  const [animes, setAnimes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // Estado para o termo de busca
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(''); // Estado para busca debounced

  // Debounce para o termo de busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms de atraso

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Buscar animes
  const fetchAnimes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    try {
      let response;
      
      if (debouncedSearchQuery.trim()) {
        // Se há termo de busca, usar searchAnimes
        response = await searchAnimes(debouncedSearchQuery);
        // Para busca, não há paginação real, então simulamos
        setPaginationData({
          current_page: 1,
          has_next_page: false,
          items: { total: (response.data || []).length },
          last_visible_page: 1,
        });
      } else {
        // Se não há busca, usar getAnimes para explorar
        response = await getAnimes(currentPage, ITEMS_PER_PAGE);
        setPaginationData(response.pagination);
      }
      
      setAnimes(response.data || []);
    } catch (err) {
      console.error("Erro ao buscar animes para explorar:", err);
      setError("Não foi possível carregar os animes. Tente novamente mais tarde.");
      setAnimes([]);
      setPaginationData(null);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchQuery]);

  useEffect(() => {
    fetchAnimes();
  }, [fetchAnimes]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao mudar o termo de busca
  };

  const handleNextPage = () => {
    if (paginationData?.has_next_page) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const totalItems = paginationData?.items?.total || 0;
  const lastPage = paginationData?.last_visible_page || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4 pb-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Filter size={32} className="text-primary-light dark:text-primary-dark" />
          <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
            Explorar Animes
          </h1>
        </div>
        <input
          type="text"
          placeholder="Buscar animes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark outline-none w-full sm:w-auto text-black"
        />
      </div>

      {error && <p className="text-center text-red-500 dark:text-red-400 p-4 col-span-full">{error}</p>}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      )}

      {!isLoading && !error && animes.length === 0 && (
        <div className="col-span-full text-center py-10 bg-card-light dark:bg-card-dark rounded-lg shadow">
          <SearchX size={48} className="mx-auto text-text-muted-light dark:text-text-muted-dark mb-4" />
          <p className="text-xl text-text-muted-light dark:text-text-muted-dark">
            Nenhum anime encontrado com os filtros atuais.
          </p>
        </div>
      )}

      {!isLoading && !error && animes.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            {animes.map(anime => (
              <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="block group">
                <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
                  <img
                    src={anime.images?.jpg?.image_url || anime.images?.webp?.image_url || 'https://placehold.co/250x350/F0F0F0/333333?text=No+Image'}
                    alt={anime.title || 'N/A'}
                    className="w-full h-64 sm:h-72 object-cover"
                    onError={(e) => {
                      e.target.onerror = null; // Evita loop de erro
                      e.target.src = 'https://placehold.co/250x350/F0F0F0/333333?text=No+Image'; // Fallback image
                    }}
                  />
                  <div className="p-3 sm:p-4">
                    <h3 className="text-sm sm:text-md font-semibold text-text-main-light dark:text-text-main-dark truncate group-hover:text-primary-light dark:group-hover:text-primary-dark" title={anime.title || 'N/A'}>
                      {anime.title || 'N/A'}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Paginação - só mostrar se não for uma busca */}
          {!debouncedSearchQuery.trim() && paginationData && totalItems > ITEMS_PER_PAGE && (
            <div className="flex justify-center items-center space-x-2 sm:space-x-4 mt-8 pt-4 border-t border-gray-300 dark:border-gray-700">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || isLoading}
                className="px-3 py-2 sm:px-4 bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm sm:text-base"
              >
                <ChevronLeft size={20} className="mr-1" /> Anterior
              </button>
              <span className="text-text-main-light dark:text-text-main-dark text-sm sm:text-base">
                Página {currentPage} de {lastPage > 0 ? lastPage : 1}
              </span>
              <button
                onClick={handleNextPage}
                disabled={!paginationData?.has_next_page || isLoading}
                className="px-3 py-2 sm:px-4 bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-sm sm:text-base"
              >
                Próxima <ChevronRight size={20} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default ExplorePage;
