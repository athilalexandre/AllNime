// src/components/features/home/MyTopRatedAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnimeDetailsById } from '../../../services/jikanService'; // Ajustar caminho
import SkeletonCard from '../../common/SkeletonCard'; // Ajustar caminho
import { Star } from 'lucide-react';

const MyTopRatedAnimeBlock = () => {
  const [myTopAnimes, setMyTopAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyTopAnimes = async () => {
      setIsLoading(true);
      setError(null);
      let ratedAnimesFromStorage = [];

      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage);
        const ratingKeys = keys.filter(key => key.startsWith('animeRating_'));

        ratedAnimesFromStorage = ratingKeys.map(key => {
          try {
            const item = localStorage.getItem(key);
            if (!item) return null;
            const parsedItem = JSON.parse(item);
            return {
              id: key.substring('animeRating_'.length), // Este é o mal_id
              userRating: parsedItem.rating,
              userOpinion: parsedItem.opinion,
            };
          } catch (e) {
            console.error(`Erro ao parsear rating do localStorage para chave ${key}:`, e);
            return null;
          }
        }).filter(anime => anime && typeof anime.userRating === 'number' && anime.userRating >= 4); // Filtrar por nota >= 4

        // Ordenar por nota (decrescente) e pegar os top 6
        ratedAnimesFromStorage.sort((a, b) => b.userRating - a.userRating);
        ratedAnimesFromStorage = ratedAnimesFromStorage.slice(0, 6);
      } else {
        // localStorage não disponível
        setMyTopAnimes([]);
        setIsLoading(false);
        // setError("localStorage não está disponível para carregar seus favoritos."); // Opcional
        return;
      }

      if (ratedAnimesFromStorage.length === 0) {
        setMyTopAnimes([]);
        setIsLoading(false);
        return;
      }

      const animeDetailsPromises = ratedAnimesFromStorage.map(ratedAnime =>
        getAnimeDetailsById(ratedAnime.id).then(detailsResponse => ({
          ...detailsResponse.data, // mal_id, title, images, etc. já estão aqui
          userRating: ratedAnime.userRating,
          userOpinion: ratedAnime.userOpinion,
        })).catch(err => {
            console.error(`Falha ao buscar detalhes para anime ID ${ratedAnime.id}:`, err);
            return null;
        })
      );

      try {
        const results = await Promise.allSettled(animeDetailsPromises);
        const successfullyFetchedAnimes = results
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        setMyTopAnimes(successfullyFetchedAnimes);
      } catch (e) {
        console.error("Erro inesperado ao processar 'Meus Favoritos':", e);
        setError("Não foi possível carregar seus animes favoritos.");
        setMyTopAnimes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyTopAnimes();
  }, []);

  if (error && !isLoading) {
    return <p className="text-center text-red-500 dark:text-red-400 col-span-full">{error}</p>;
  }

  if (isLoading) {
     return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {Array.from({ length: Math.min(6, myTopAnimes.length || 6) }).map((_, index) => <SkeletonCard key={index} />)}
            {/* Ajustado length do skeleton para no máximo 6 ou o número de animes que seriam carregados se já soubéssemos */}
        </div>
     );
  }

  if (myTopAnimes.length === 0) {
    return (
      <div className="col-span-full text-center p-8 bg-card-light dark:bg-card-dark rounded-lg shadow">
        <p className="text-text-muted-light dark:text-text-muted-dark">
          Você ainda não avaliou nenhum anime com 4 ou 5 estrelas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {myTopAnimes.map(anime => (
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
              <div className="flex items-center mt-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold">
                  Sua nota: {anime.userRating}/5
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
export default MyTopRatedAnimeBlock;
