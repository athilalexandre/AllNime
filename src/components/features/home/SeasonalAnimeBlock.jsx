// src/components/features/home/SeasonalAnimeBlock.jsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import { GraphQLClient, gql } from 'graphql-request';
import { Link } from 'react-router-dom';

const endpoint = 'https://graphql.anilist.co';
const client = new GraphQLClient(endpoint);

async function getAniListSeasonAnimes() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  let season = 'WINTER';
  if (month >= 4 && month <= 6) season = 'SPRING';
  else if (month >= 7 && month <= 9) season = 'SUMMER';
  else if (month >= 10 && month <= 12) season = 'FALL';

  const SEASON_QUERY = gql`
    query ($season: MediaSeason, $year: Int) {
      Page(perPage: 10) {
        media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
          id
          title {
            romaji
            native
          }
          coverImage {
            large
          }
          averageScore
          episodes
          format
          status
        }
      }
    }
  `;
  const variables = { season, year };
  const data = await client.request(SEASON_QUERY, variables);
  return data.Page.media;
}

const SeasonalAnimeBlock = () => {
  const [animes, setAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnimes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const seasonAnimes = await getAniListSeasonAnimes();
        setAnimes(seasonAnimes);
      } catch (err) {
        setError('Não foi possível carregar os animes da temporada.');
        setAnimes([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnimes();
  }, []);

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
        <SwiperSlide key={anime.id} className="overflow-hidden rounded-lg">
          <Link to={`/anime/${anime.id}`} className="block group focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark h-full">
            <div className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 ease-in-out h-full flex flex-col">
              <img
                src={anime.coverImage?.large}
                alt={anime.title.romaji}
                className="w-full h-64 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null; // Evita loop de erro
                  e.target.src = 'https://via.placeholder.com/250x350?text=No+Image'; // Imagem de placeholder
                }}
              />
              <div className="p-2 flex-grow flex flex-col justify-between">
                <h3 className="text-xs font-semibold truncate" title={anime.title.romaji}>{anime.title.romaji}</h3>
                {anime.averageScore && (
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-xs text-text-muted-light dark:text-text-muted-dark font-semibold">
                      {(anime.averageScore/20).toFixed(1)}/5
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

export default SeasonalAnimeBlock;
