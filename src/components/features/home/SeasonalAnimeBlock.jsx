// src/components/features/home/SeasonalAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentSeasonAnimes } from '../../../services/jikanService'; // Ajustar caminho
import SkeletonCard from '../../common/SkeletonCard'; // Ajustar caminho

const SeasonalAnimeBlock = () => {
  const [seasonalAnimes, setSeasonalAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getCurrentSeasonAnimes(1, 6); // Pegar 6 animes da primeira página
        setSeasonalAnimes(response.data || []);
      } catch (err) {
        console.error("Erro no SeasonalAnimeBlock:", err);
        setError("Não foi possível carregar os animes da temporada.");
        setSeasonalAnimes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, []);

  if (error) {
    return <p className="col-span-full text-center text-red-500 dark:text-red-400">{error}</p>;
    // Adicionado col-span-full para que a mensagem de erro ocupe toda a largura do grid.
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
      {isLoading && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
      {!isLoading && seasonalAnimes.map(anime => (
        <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id} className="block group">
          <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-xl">
            <img
              src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
              alt={anime.title}
              className="w-full h-64 sm:h-72 object-cover" // Altura da imagem
            />
            <div className="p-3 sm:p-4">
              <h3 className="text-sm sm:text-md font-semibold text-text-main-light dark:text-text-main-dark truncate group-hover:text-primary-light dark:group-hover:text-primary-dark" title={anime.title}>
                {anime.title}
              </h3>
              {/* Opcional: Gêneros ou outra info curta */}
              {/* <p className="text-xs text-text-muted-light dark:text-text-muted-dark truncate">
                {anime.genres?.map(g => g.name).join(', ') || 'N/A'}
              </p> */}
            </div>
          </div>
        </Link>
      ))}
      {!isLoading && seasonalAnimes.length === 0 && !error && (
        <p className="col-span-full text-center text-text-muted-light dark:text-text-muted-dark">
          Nenhum anime da temporada encontrado.
        </p>
      )}
    </div>
  );
};
export default SeasonalAnimeBlock;
