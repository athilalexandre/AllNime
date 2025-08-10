// src/components/features/home/TopRatedAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { getTopRatedAnimes } from '../../../services/jikanService';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

const TopRatedAnimeBlock = () => {
  const [animes, setAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { canAccessAdultContent } = useAuth();

  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const topAnimes = await getTopRatedAnimes(1, 10, canAccessAdultContent);
        setAnimes(topAnimes.data || []);
      } catch (err) {
        console.error('Erro ao buscar animes mais bem avaliados:', err);
        setError('Não foi possível carregar os animes mais bem avaliados.');
        setAnimes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, [canAccessAdultContent]);

  if (error) {
    return <div className="text-center text-red-500 dark:text-red-400 col-span-full">{error}</div>;
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

  if (animes.length === 0) {
    return <div className="text-center text-text-muted-light dark:text-text-muted-dark">Nenhum anime encontrado.</div>;
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
      {animes.map(anime => (
        <SwiperSlide key={anime.mal_id} className="overflow-hidden rounded-lg">
          <Link to={`/anime/${anime.mal_id}`} className="block group focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark h-full">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 ease-in-out h-full flex flex-col">
              <img
                src={anime.images?.jpg?.image_url || anime.images?.webp?.image_url || 'https://placehold.co/250x350/F0F0F0/333333?text=No+Image'}
                alt={anime.title || 'N/A'}
                className="w-full h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null; // Evita loop de erro
                  e.target.src = 'https://placehold.co/250x350/F0F0F0/333333?text=No+Image';
                }}
              />
              <div className="p-2 flex-grow flex flex-col justify-between">
                <h3 className="text-xs font-semibold truncate" title={anime.title || 'N/A'}>{anime.title || 'N/A'}</h3>
                {anime.score && (
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold">
                      {anime.score.toFixed(1)}/10
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default TopRatedAnimeBlock;
