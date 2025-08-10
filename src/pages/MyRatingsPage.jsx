// Exemplo parcial de MyRatingsPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnimeDetailsById } from '../services/jikanService';
import { Star } from 'lucide-react'; // Para exibir a nota

const MyRatingsPage = () => {
  const [ratedAnimesList, setRatedAnimesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRatedAnimes = async () => {
      setIsLoading(true);
      setError(null);
      // Variable removed - not used

      // localStorage não está disponível no ambiente de execução desta ferramenta.
      // Simular um array vazio de chaves para evitar erro em Object.keys(localStorage).
      let keys = [];
      if (typeof window !== 'undefined' && window.localStorage) {
        keys = Object.keys(localStorage);
      }

      const ratingKeys = keys.filter(key => key.startsWith('animeRating_'));

      if (ratingKeys.length === 0) {
        setIsLoading(false);
        setRatedAnimesList([]);
        return;
      }

      const animePromises = ratingKeys.map(async (key) => {
        try {
          const animeId = key.substring('animeRating_'.length);
          // Acessar localStorage apenas se disponível
          const ratingDataString = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem(key) : null;
          if (!ratingDataString) {
            // Isso não deveria acontecer se ratingKeys foi populado corretamente, mas é uma salvaguarda.
            throw new Error(`Chave ${key} não encontrada no localStorage.`);
          }
          const ratingData = JSON.parse(ratingDataString);
          const detailsResponse = await getAnimeDetailsById(animeId); // Retorna { data: animeObject }

          return {
            id: detailsResponse.data.mal_id,
            title: detailsResponse.data.title,
            imageUrl: detailsResponse.data.images?.jpg?.small_image_url || detailsResponse.data.images?.jpg?.image_url,
            userRating: ratingData.rating,
            userOpinion: ratingData.opinion,
          };
        } catch (err) {
          console.error(`Falha ao buscar detalhes ou processar avaliação para a chave ${key}:`, err);
          return null; // Retornar null para ser filtrado depois
        }
      });

      try {
        const results = await Promise.allSettled(animePromises);
        const successfullyFetchedAnimes = results
          .filter(result => result.status === 'fulfilled' && result.value)
          .map(result => result.value);
        setRatedAnimesList(successfullyFetchedAnimes);
      } catch (e) {
        // Promise.allSettled não rejeita, então este catch é mais para erros inesperados.
        console.error("Erro inesperado ao processar animes avaliados:", e);
        setError("Ocorreu um erro ao carregar seus animes avaliados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatedAnimes();
  }, []);

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}
          />
        ))}
      </div>
    );
  };

  if (isLoading) return <p className="text-center p-10 text-text-muted-light dark:text-text-muted-dark">Carregando seus animes avaliados...</p>;
  if (error) return <p className="text-center p-10 text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-8">Meus Animes Avaliados</h1>
      {ratedAnimesList.length === 0 && !isLoading && (
        <p className="text-center text-text-muted-light dark:text-text-muted-dark">Você ainda não avaliou nenhum anime. Comece a explorar e avaliar!</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ratedAnimesList.map(anime => (
          <div key={anime.id} className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden flex flex-col">
            <Link to={`/anime/${anime.id}`} className="block">
              <img
                src={anime.imageUrl} 
                alt={anime.title} 
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null; // Evita loop de erro
                  e.target.src = 'https://via.placeholder.com/250x350?text=No+Image'; // Imagem de placeholder
                }}
              />
            </Link>
            <div className="p-4 flex flex-col flex-grow">
              <Link to={`/anime/${anime.id}`} className="block">
                <h3 className="text-lg font-semibold text-primary-light dark:text-primary-dark hover:underline mb-1 truncate" title={anime.title}>{anime.title}</h3>
              </Link>
              <div className="my-2">
                {renderStars(anime.userRating)}
              </div>
              <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-3 flex-grow break-words">
                Opinião: {anime.userOpinion || <span className="italic">Nenhuma opinião.</span>}
              </p>
              <Link
                to={`/anime/${anime.id}`}
                className="mt-auto self-start text-sm text-primary-light dark:text-primary-dark hover:underline font-semibold"
              >
                Ver detalhes / Editar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRatingsPage;
