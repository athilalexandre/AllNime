// src/components/features/home/MyTopRatedAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAnimeDetailsById } from '../../../services/jikanService'; // Ajustar caminho
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';

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
        }).filter(anime => anime && typeof anime.userRating === 'number' && anime.userRating >= 4);

        ratedAnimesFromStorage.sort((a, b) => b.userRating - a.userRating);
        ratedAnimesFromStorage = ratedAnimesFromStorage.slice(0, 10);
      }

      if (ratedAnimesFromStorage.length === 0) {
        setMyTopAnimes([]);
        setIsLoading(false);
        return;
      }

      const animeDetailsPromises = ratedAnimesFromStorage.map(ratedAnime =>
        getAnimeDetailsById(ratedAnime.id).then(detailsResponse => ({
          ...detailsResponse.data,
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
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="min-w-[180px] h-72 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        ))}
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
    <Swiper
      modules={[Navigation, Autoplay]}
      slidesPerView={4}
      spaceBetween={20}
      navigation
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      loop
      breakpoints={{
        320: { slidesPerView: 1.2 },
        640: { slidesPerView: 2.2 },
        1024: { slidesPerView: 4 },
      }}
      className="!pb-8"
    >
      {myTopAnimes.map(anime => (
        <SwiperSlide key={anime.mal_id}>
          <Link to={`/anime/${anime.mal_id}`} className="block group focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark rounded-lg">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden group-hover:scale-105 transition">
              <img
                src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                alt={anime.title}
                className="w-full h-64 object-cover"
                loading="lazy"
              />
              <div className="p-2">
                <h3 className="text-xs font-semibold truncate" title={anime.title}>{anime.title}</h3>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold">
                    Sua nota: {anime.userRating}/5
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MyTopRatedAnimeBlock;
