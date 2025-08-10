// src/pages/ExplorePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Star, TrendingUp, Sparkles, Eye } from 'lucide-react';
import { getAnimeGenres, getAnimes, getTopRatedAnimes } from '../services/jikanService';
import SearchBar from '../components/features/search/SearchBar';
import { useAuth } from '../components/contexts/useAuth';
import AdultContentWarning from '../components/ui/AdultContentWarning';
import { useAdultContent } from '../hooks/useAdultContent';

const ExplorePage = () => {
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [animesByGenre, setAnimesByGenre] = useState([]);
  const [topAnimes, setTopAnimes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { canAccessAdultContent } = useAuth();
  const { canAccess, getRestrictionMessage } = useAdultContent();

  useEffect(() => {
    loadGenres();
    loadTopAnimes();
  }, [loadTopAnimes]);

  useEffect(() => {
    if (selectedGenre) {
      loadAnimesByGenre(selectedGenre);
    }
  }, [selectedGenre, loadAnimesByGenre]);

  const loadGenres = async () => {
    setIsLoadingGenres(true);
    try {
      const genresData = await getAnimeGenres();
      setGenres(genresData);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
      setError('Erro ao carregar gêneros');
    } finally {
      setIsLoadingGenres(false);
    }
  };

  const loadTopAnimes = useCallback(async () => {
    try {
      const response = await getTopRatedAnimes(1, 10, canAccessAdultContent);
      if (response?.data) {
        setTopAnimes(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar top animes:', error);
    }
  }, [canAccessAdultContent]);

  const loadAnimesByGenre = useCallback(async (genreId) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getAnimes(1, 20, genreId, canAccessAdultContent);
      if (response?.data) {
        setAnimesByGenre(response.data);
      } else {
        setAnimesByGenre([]);
      }
    } catch (error) {
      console.error('Erro ao carregar animes por gênero:', error);
      setError('Erro ao carregar animes por gênero');
    } finally {
      setIsLoading(false);
    }
  }, [canAccessAdultContent]);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre.mal_id);
  };

  const handleAnimeClick = (anime) => {
    navigate(`/anime/${anime.mal_id}`);
  };

  const getGenreIcon = (genreName) => {
    const name = genreName.toLowerCase();
    if (name.includes('action')) return '⚔️';
    if (name.includes('adventure')) return '🗺️';
    if (name.includes('comedy')) return '😄';
    if (name.includes('drama')) return '🎭';
    if (name.includes('fantasy')) return '🐉';
    if (name.includes('horror')) return '👻';
    if (name.includes('mystery')) return '🔍';
    if (name.includes('romance')) return '💕';
    if (name.includes('sci-fi')) return '🚀';
    if (name.includes('slice of life')) return '🌸';
    if (name.includes('sports')) return '⚽';
    if (name.includes('supernatural')) return '✨';
    if (name.includes('thriller')) return '😱';
    return '🎬';
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-text-main-light dark:text-text-main-dark">
          Explorar Animes
        </h1>
        <p className="text-lg text-text-muted-light dark:text-text-muted-dark mb-6">
          Descubra novos animes por gênero, popularidade e muito mais
        </p>
        
        {/* Barra de busca */}
        <div className="max-w-2xl mb-8">
          <SearchBar placeholder="Buscar animes específicos..." />
        </div>
      </div>

      {/* Aviso de Conteúdo Adulto */}
      {!canAccess() && (
        <div className="mb-8">
          <AdultContentWarning
            title="Conteúdo Adulto Filtrado"
            message="Os animes exibidos foram filtrados para excluir conteúdo adulto. Faça login e verifique se você é maior de 18 anos para acessar todos os animes."
            showDetails={true}
            onAction={() => window.location.href = '/'}
            actionText="Fazer Login"
          />
        </div>
      )}

      {/* Gêneros */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Filter size={24} />
          Explorar por Gênero
        </h2>
        
        {isLoadingGenres ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {genres.map(genre => (
              <button
                key={genre.mal_id}
                onClick={() => handleGenreClick(genre)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  selectedGenre === genre.mal_id
                    ? 'border-primary-light bg-primary-light text-white'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary-light dark:hover:border-primary-light'
                }`}
              >
                <div className="text-2xl mb-2">{getGenreIcon(genre.name)}</div>
                <div className="text-sm font-medium">{genre.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {genre.count} animes
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Animes por gênero selecionado */}
      {selectedGenre && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles size={24} />
              {genres.find(g => g.mal_id === selectedGenre)?.name}
            </h2>
            <button
              onClick={() => setSelectedGenre(null)}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Limpar seleção
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => loadAnimesByGenre(selectedGenre)}
                className="mt-2 px-4 py-2 bg-primary-light text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : animesByGenre.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {animesByGenre.map(anime => (
                <div
                  key={anime.mal_id}
                  onClick={() => handleAnimeClick(anime)}
                  className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
                >
                  <div className="relative">
                    <img
                      src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/250x350?text=No+Image';
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                        <Eye size={24} className="mx-auto mb-2" />
                        <span className="text-sm">Ver detalhes</span>
                      </div>
                    </div>

                    {/* Score */}
                    {anime.score && (
                      <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star size={12} fill="currentColor" />
                        {anime.score}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h3 className="text-md font-semibold truncate mb-1" title={anime.title}>
                      {anime.title}
                    </h3>
                    <div className="space-y-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                      {anime.type && <p className="capitalize">{anime.type}</p>}
                      {anime.episodes && <p>Episódios: {anime.episodes}</p>}
                      {anime.year && <p>{anime.year}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Nenhum anime encontrado para este gênero.</p>
            </div>
          )}
        </section>
      )}

      {/* Top Animes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp size={24} />
          Top Animes
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {topAnimes.map((anime, index) => (
            <div
              key={anime.mal_id}
              onClick={() => handleAnimeClick(anime)}
              className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform group relative"
            >
              {/* Ranking */}
              <div className="absolute top-2 left-2 bg-primary-light text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>

              <div className="relative">
                <img
                  src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/250x350?text=No+Image';
                  }}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                  <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                    <Eye size={24} className="mx-auto mb-2" />
                    <span className="text-sm">Ver detalhes</span>
                  </div>
                </div>

                {/* Score */}
                {anime.score && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    {anime.score}
                  </div>
                )}
              </div>

              <div className="p-3">
                <h3 className="text-md font-semibold truncate mb-1" title={anime.title}>
                  {anime.title}
                </h3>
                <div className="space-y-1 text-xs text-text-muted-light dark:text-text-muted-dark">
                  {anime.type && <p className="capitalize">{anime.type}</p>}
                  {anime.episodes && <p>Episódios: {anime.episodes}</p>}
                  {anime.year && <p>{anime.year}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
