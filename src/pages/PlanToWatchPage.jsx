// src/pages/PlanToWatchPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getListFromStorage, LIST_TYPES } from '../services/watchlistStorageService';
import { getAnimeDetailsById } from '../services/jikanService';
import SkeletonCard from '../components/common/SkeletonCard'; // Ajustar caminho se necessário
import { Eye } from 'lucide-react'; // Ícone para a página

const PlanToWatchPage = () => {
  const [animeList, setAnimeList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListDetails = async () => {
      setIsLoading(true);
      setError(null);
      // localStorage é verificado dentro de getListFromStorage
      const animeIds = getListFromStorage(LIST_TYPES.PLAN_TO_WATCH);

      if (animeIds.length === 0) {
        setAnimeList([]);
        setIsLoading(false);
        return;
      }

      const animeDetailsPromises = animeIds.map(id =>
        getAnimeDetailsById(id).then(response => response.data)
        .catch(err => {
            console.error(`Falha ao buscar detalhes para anime ID ${id} na PlanToWatchPage:`, err);
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
        console.error("Erro inesperado ao processar PlanToWatchPage:", e);
        setError("Não foi possível carregar a lista 'Planejo Assistir'.");
        setAnimeList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListDetails();
  }, []); // Adicionar dependência vazia para rodar apenas na montagem

  // Re-fetch quando a visibilidade da página muda, para refletir mudanças feitas em outras abas/janelas
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-executar a lógica de fetchListDetails.
        // Para evitar duplicação, poderia extrair fetchListDetails para fora ou usar um callback.
        // Por simplicidade, vou apenas chamar uma nova função que encapsula a lógica.
        // Nota: Isso pode ser otimizado com um estado para forçar re-fetch ou um event bus.
        const reFetch = async () => {
            setIsLoading(true);
            setError(null);
            const animeIds = getListFromStorage(LIST_TYPES.PLAN_TO_WATCH);
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
  }, []); // Dependência vazia para adicionar/remover listener apenas uma vez.

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 p-4">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        <Eye size={32} className="text-primary-light dark:text-primary-dark" />
        <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">
          Planejo Assistir
        </h1>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {/* Mostrar skeletons com base no número de IDs encontrados ou um máximo de 6 */}
          {Array.from({ length: getListFromStorage(LIST_TYPES.PLAN_TO_WATCH).length > 0 ? Math.min(getListFromStorage(LIST_TYPES.PLAN_TO_WATCH).length, 6) : 6 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      )}

      {!isLoading && animeList.length === 0 && (
        <div className="col-span-full text-center p-8 bg-card-light dark:bg-card-dark rounded-lg shadow">
            <p className="text-text-muted-light dark:text-text-muted-dark">
            Sua lista "Planejo Assistir" está vazia.
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
export default PlanToWatchPage;
