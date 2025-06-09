// src/pages/WatchingPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListFromStorage, LIST_TYPES } from '../services/watchlistStorageService';
import { getAnimeDetailsById } from '../services/jikanService';
import SkeletonCard from '../components/common/SkeletonCard';
import { PlaySquare } from 'lucide-react'; // Ícone alterado

const WatchingPage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const listType = LIST_TYPES.WATCHING; // Tipo de lista para esta página
  const pageTitle = "Assistindo Atualmente"; // Título da página

  useEffect(() => {
    const fetchListDetails = async () => {
      setIsLoading(true);
      setError(null);
      const animeIds = getListFromStorage(listType);

      if (animeIds.length === 0) {
        setAnimeList([]);
        setIsLoading(false);
        return;
      }

      const animeDetailsPromises = animeIds.map(id =>
        getAnimeDetailsById(id).then(response => response.data)
        .catch(err => {
            console.error(`Falha ao buscar detalhes para anime ID ${id} na ${pageTitle}Page:`, err);
            return null;
        })
      );

      try {
        const results = await Promise.allSettled(animeDetailsPromises);
        const successfullyFetchedAnimes = results
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        setAnimeList(successfullyFetchedAnimes);
      } catch (e) {
        console.error(`Erro inesperado ao processar ${pageTitle}Page:`, e);
        setError(`Não foi possível carregar a lista '${pageTitle}'.`);
        setAnimeList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListDetails();
  }, [listType, pageTitle]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const reFetch = async () => {
            setIsLoading(true);
            setError(null);
            const animeIds = getListFromStorage(listType);
            if (animeIds.length === 0) { setAnimeList([]); setIsLoading(false); return; }
            const promises = animeIds.map(id => getAnimeDetailsById(id).then(r => r.data).catch(() => null));
            const results = await Promise.allSettled(promises);
            const animes = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
            setAnimeList(animes);
            setIsLoading(false);
        };
        reFetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [listType]);

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 p-4">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        <PlaySquare size={32} className="text-primary-light dark:text-primary-dark" /> {/* Ícone alterado */}
        <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
          {pageTitle} {/* Título alterado */}
        </h1>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {Array.from({ length: getListFromStorage(listType).length > 0 ? Math.min(getListFromStorage(listType).length, 6) : 6 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      )}

      {!isLoading && animeList.length === 0 && (
         <div className="col-span-full text-center p-8 bg-card-light dark:bg-card-dark rounded-lg shadow">
            <p className="text-text-muted-light dark:text-text-muted-dark">
                Sua lista "{pageTitle}" está vazia.
            </p>
        </div>
      )}

      {!isLoading && animeList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {animeList.map(anime => (
            <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="block group">
              <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
                <img
                  src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-full h-64 sm:h-72 object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Evita loop de erro
                    e.target.src = 'https://via.placeholder.com/250x350?text=No+Image'; // Imagem de placeholder
                  }}
                />
                <div className="p-3 sm:p-4">
                  <h3 className="text-sm sm:text-md font-semibold text-text-main-light dark:text-text-main-dark truncate group-hover:text-primary-light dark:group-hover:text-primary-dark" title={anime.title}>
                    {anime.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
export default WatchingPage;
