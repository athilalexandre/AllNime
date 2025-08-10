// src/pages/RecommendationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Star, RefreshCw, Play, Clock, Heart } from 'lucide-react';
import { recommendationService } from '../services/recommendationService.js';
import { useLanguage } from '../components/contexts/useLanguage';
import SkeletonCard from '../components/common/SkeletonCard';
import AdultContentWarning from '../components/ui/AdultContentWarning';
import { useAdultContent } from '../hooks/useAdultContent';
import { useAuth } from '../components/contexts/useAuth';

const RecommendationsPage = () => {
  const { translate } = useLanguage();
  const { canAccess } = useAdultContent();
  const { canAccessAdultContent } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoadingTrending, setIsLoadingTrending] = useState(true); // Added state for trending loading
  const [trendingAnimes, setTrendingAnimes] = useState([]); // Added state for trending animes
  const [trendingError, setTrendingError] = useState(null); // Added state for trending error
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(true); // Added state for discovery loading
  const [discoveryAnimes, setDiscoveryAnimes] = useState([]); // Added state for discovery animes
  const [discoveryError, setDiscoveryError] = useState(null); // Added state for discovery error
  const [selectedGenre, setSelectedGenre] = useState(null); // Added state for selected genre
  const [popularGenres, setPopularGenres] = useState([]); // Added state for popular genres

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const personalRecs = await recommendationService.generateRecommendations(12);
      // Filter adult content if user cannot access it
      const filteredRecs = canAccess() ? personalRecs : personalRecs.filter(anime => {
        if (!anime.genres || !Array.isArray(anime.genres)) return true;
        const adultGenres = ['Hentai', 'Ecchi', 'Yuri', 'Yaoi', 'Harem'];
        return !anime.genres.some(genre =>
          adultGenres.some(adultGenre =>
            genre.name && genre.name.toLowerCase().includes(adultGenre.toLowerCase())
          )
        );
      });
      setRecommendations(filteredRecs);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  }, [canAccess]);

  const fetchTrendingAnimes = useCallback(async () => {
    setIsLoadingTrending(true);
    setTrendingError(null);
    try {
      // Use sfw parameter based on adult content access
      const sfwParam = canAccessAdultContent ? '' : '&sfw=true';
      const response = await fetch(`https://api.jikan.moe/v4/top/anime?${sfwParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let filteredAnimes = data.data;
      
      // Additional filtering for adult content if needed
      if (!canAccess()) {
        const adultGenres = ['Hentai', 'Ecchi', 'Yuri', 'Yaoi', 'Harem'];
        filteredAnimes = data.data.filter(anime => {
          if (!anime.genres || !Array.isArray(anime.genres)) {
            return true;
          }
          return !anime.genres.some(genre =>
            adultGenres.some(adultGenre =>
              genre.name && genre.name.toLowerCase().includes(adultGenre.toLowerCase())
            )
          );
        });
      }
      
      setTrendingAnimes(filteredAnimes);
    } catch (error) {
      setTrendingError(`Erro ao carregar animes em alta: ${error.message}`);
      console.error('Erro ao carregar animes em alta:', error);
    } finally {
      setIsLoadingTrending(false);
    }
  }, [canAccessAdultContent, canAccess]);

  const fetchDiscoveryAnimes = useCallback(async () => {
    setIsLoadingDiscovery(true);
    setDiscoveryError(null);
    try {
      // Use sfw parameter based on adult content access
      const sfwParam = canAccessAdultContent ? '' : '&sfw=true';
      const response = await fetch(`https://api.jikan.moe/v4/anime?genres=${selectedGenre}&order_by=popularity&sort=desc${sfwParam}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let filteredAnimes = data.data;
      
      // Additional filtering for adult content if needed
      if (!canAccess()) {
        const adultGenres = ['Hentai', 'Ecchi', 'Yuri', 'Yaoi', 'Harem'];
        filteredAnimes = data.data.filter(anime => {
          if (!anime.genres || !Array.isArray(anime.genres)) return true;
          return !anime.genres.some(genre =>
            adultGenres.some(adultGenre =>
              genre.name && genre.name.toLowerCase().includes(adultGenre.toLowerCase())
            )
          );
        });
      }
      
      setDiscoveryAnimes(filteredAnimes);
    } catch (error) {
      setDiscoveryError(`Erro ao carregar animes por gênero: ${error.message}`);
      console.error('Erro ao carregar animes por gênero:', error);
    } finally {
      setIsLoadingDiscovery(false);
    }
  }, [selectedGenre, canAccessAdultContent, canAccess]);

  const fetchPopularGenres = async () => {
    try {
      const response = await fetch('https://api.jikan.moe/v4/genres/anime/popular');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPopularGenres(data.data);
    } catch (error) {
      console.error('Erro ao carregar gêneros populares:', error);
    }
  };

  useEffect(() => {
    fetchTrendingAnimes();
    fetchPopularGenres();
  }, [canAccessAdultContent, fetchTrendingAnimes]);

  useEffect(() => {
    if (selectedGenre) {
      fetchDiscoveryAnimes();
    }
  }, [selectedGenre, fetchDiscoveryAnimes]);

  // Removed unused function

  const getRecommendationColor = (type) => {
    switch (type) {
      case 'genre':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      case 'rating':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'popular':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200';
      default:
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200';
    }
  };

  const handleGenreClick = (genreId) => {
    setSelectedGenre(genreId);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark mx-auto mb-4"></div>
        <p className="text-text-muted-light dark:text-text-muted-dark">
          {translate('Analisando seus gostos...')}
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: translate('Personalizadas'), icon: Star },
    { id: 'trending', label: translate('Em Alta'), icon: Star },
    { id: 'discovery', label: translate('Descobertas'), icon: Star }
  ];

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
          ✨ {translate('Recomendações para Você')}
        </h1>
        <p className="text-text-muted-light dark:text-text-muted-dark">
          {translate('Descubra animes baseados no que você já assistiu e avaliou')}
        </p>
      </div>

      {/* Aviso de Conteúdo Adulto */}
      {!canAccess() && (
        <div className="mb-8">
          <AdultContentWarning
            title="Conteúdo Adulto Filtrado"
            message="As recomendações foram filtradas para excluir conteúdo adulto. Faça login e verifique se você é maior de 18 anos para acessar todas as recomendações."
            showDetails={true}
            onAction={() => window.location.href = '/'}
            actionText="Fazer Login"
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-light dark:bg-primary-dark text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-text-main-light dark:text-text-main-dark hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Refresh Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={loadRecommendations}
          className="flex items-center gap-2 bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
        >
          <RefreshCw size={18} />
          {translate('Atualizar Recomendações')}
        </button>
      </div>

      {/* Content */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-lg">
        {activeTab === 'personal' && (
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
              {translate('Baseado no que você gosta')}
            </h2>
            
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((anime, index) => (
                  <div key={anime.mal_id || index} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {/* Anime Image */}
                    <div className="relative">
                      <img
                        src={anime.images?.jpg?.image_url || anime.images?.webp?.image_url || '/placeholder-anime.jpg'}
                        alt={anime.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/placeholder-anime.jpg';
                        }}
                      />
                      
                      {/* Recommendation Badge */}
                      {anime.reason && (
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRecommendationColor('genre')}`}>
                            {anime.reason.includes('gênero') ? 'Gênero' : 'Recomendado'}
                          </span>
                        </div>
                      )}

                      {/* Match Score */}
                      {anime.matchScore && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-light dark:bg-primary-dark text-white">
                            {Math.round(anime.matchScore * 100)}% match
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Anime Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-text-light dark:text-text-dark mb-2 line-clamp-2">
                        {anime.title}
                      </h3>
                      
                      {/* Genres */}
                      {anime.genres && anime.genres.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {anime.genres.slice(0, 2).map((genre, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-text-muted-light dark:text-text-muted-dark rounded"
                            >
                              {genre.name}
                            </span>
                          ))}
                          {anime.genres.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-text-muted-light dark:text-text-muted-dark rounded">
                              +{anime.genres.length - 2}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-text-muted-light dark:text-text-muted-dark mb-3">
                        {anime.episodes && (
                          <span className="flex items-center gap-1">
                            <Play size={14} />
                            {anime.episodes} eps
                          </span>
                        )}
                        {anime.score && (
                          <span className="flex items-center gap-1">
                            <Star size={14} />
                            {anime.score}
                          </span>
                        )}
                        {anime.status && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {anime.status}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to={`/anime/${anime.mal_id}`}
                          className="flex-1 bg-primary-light dark:bg-primary-dark text-white text-center py-2 px-3 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                        >
                          {translate('Ver Detalhes')}
                        </Link>
                        <button
                          className="p-2 text-primary-light dark:text-primary-dark hover:bg-primary-light/10 dark:hover:bg-primary-dark/10 rounded-lg transition-colors"
                          title={translate('Adicionar à Lista')}
                        >
                          <Heart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {translate('Nenhuma recomendação ainda')}
                </h3>
                <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
                  {translate('Comece a avaliar animes para receber recomendações personalizadas!')}
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-2 bg-primary-light dark:bg-primary-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Eye size={18} />
                  {translate('Explorar Animes')}
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
              {translate('Animes em Alta')}
            </h2>
            
            {isLoadingTrending ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : trendingError ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {translate('Erro ao carregar')}
                </h3>
                <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
                  {trendingError}
                </p>
                <button
                  onClick={fetchTrendingAnimes}
                  className="inline-flex items-center gap-2 bg-primary-light dark:bg-primary-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <RefreshCw size={18} />
                  {translate('Tentar Novamente')}
                </button>
              </div>
            ) : trendingAnimes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingAnimes.map((anime) => (
                  <div
                    key={anime.mal_id}
                    className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/anime/${anime.mal_id}`}>
                      <div className="relative">
                        <img
                          src={anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url}
                          alt={anime.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/300x200/F0F0F0/333333?text=No+Image';
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-primary-light dark:bg-primary-dark text-white text-xs px-2 py-1 rounded-full">
                          #{anime.popularity || 'N/A'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-text-light dark:text-text-dark mb-2 line-clamp-2">
                          {anime.title}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-text-muted-light dark:text-text-muted-dark">
                          <span>{anime.type || 'TV'}</span>
                          {anime.score && (
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                              <span>{anime.score}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {translate('Nenhum anime em alta encontrado')}
                </h3>
                <p className="text-text-muted-light dark:text-text-muted-dark">
                  {translate('Tente novamente mais tarde.')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discovery' && (
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
              {translate('Descobertas')}
            </h2>
            
            {isLoadingDiscovery ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : discoveryError ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {translate('Erro ao carregar')}
                </h3>
                <p className="text-text-muted-light dark:text-text-muted-dark mb-6">
                  {discoveryError}
                </p>
                <button
                  onClick={fetchDiscoveryAnimes}
                  className="inline-flex items-center gap-2 bg-primary-light dark:bg-primary-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <RefreshCw size={18} />
                  {translate('Tentar Novamente')}
                </button>
              </div>
            ) : discoveryAnimes.length > 0 ? (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                    {translate('Gêneros Populares')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {popularGenres.map((genre) => (
                      <button
                        key={genre.mal_id}
                        onClick={() => handleGenreClick(genre.mal_id)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedGenre === genre.mal_id
                            ? 'bg-primary-light dark:bg-primary-dark text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {discoveryAnimes.map((anime) => (
                    <div
                      key={anime.mal_id}
                      className="bg-card-light dark:bg-card-dark rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <Link to={`/anime/${anime.mal_id}`}>
                        <div className="relative">
                          <img
                            src={anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url}
                            alt={anime.title}
                            className="w-full h-48 object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/300x200/F0F0F0/333333?text=No+Image';
                            }}
                          />
                          {anime.genres && anime.genres.length > 0 && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                              {anime.genres[0].name}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-text-light dark:text-text-dark mb-2 line-clamp-2">
                            {anime.title}
                          </h3>
                          <div className="flex items-center justify-between text-sm text-text-muted-light dark:text-text-muted-dark">
                            <span>{anime.type || 'TV'}</span>
                            {anime.score && (
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                <span>{anime.score}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">😔</div>
                <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                  {translate('Nenhum anime encontrado')}
                </h3>
                <p className="text-text-muted-light dark:text-text-muted-dark">
                  {translate('Tente selecionar um gênero diferente.')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3">
          💡 {translate('Dicas para Melhores Recomendações')}
        </h3>
        <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
          <li>• {translate('Avalie os animes que você assiste com notas de 1 a 5 estrelas')}</li>
          <li>• {translate('Adicione animes às suas listas (Assistindo, Completos, etc.)')}</li>
          <li>• {translate('Explore diferentes gêneros para expandir suas preferências')}</li>
          <li>• {translate('As recomendações melhoram conforme você usa mais o app')}</li>
        </ul>
      </div>
    </div>
  );
};

export default RecommendationsPage;
