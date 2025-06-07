// src/components/features/home/TopRatedAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTopRatedAnimes } from '../../../services/jikanService'; // Ajustar caminho
import SkeletonCard from '../../common/SkeletonCard'; // Ajustar caminho
import { Star } from 'lucide-react'; // Para exibir a nota

const TopRatedAnimeBlock = () => {
  const [topAnimes, setTopAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getTopRatedAnimes(1, 6); // Pegar 6 animes da primeira página
        setTopAnimes(response.data || []);
      } catch (err) {
        console.error("Erro no TopRatedAnimeBlock:", err);
        setError("Não foi possível carregar os animes mais bem avaliados.");
        setTopAnimes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, []);

  if (error) {
    return <p className="text-center text-red-500 dark:text-red-400 col-span-full">{error}</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {isLoading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
      {!isLoading && topAnimes.map(anime => (
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
              {anime.score && (
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold">
                    {anime.score.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Link>
      ))}
      {!isLoading && topAnimes.length === 0 && !error && (
        <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark">
          Nenhum anime encontrado na lista de mais bem avaliados.
        </p>
      )}
    </div>
  );
};
export default TopRatedAnimeBlock;
