// src/pages/RecommendationsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Star, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  Heart,
  Eye,
  Play
} from 'lucide-react';
import { recommendationService } from '../services/recommendationService.js';
import { useLanguage } from '../components/contexts/LanguageContext.jsx';

const RecommendationsPage = () => {
  const { translate } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const personalRecs = await recommendationService.generateRecommendations(12);
      setRecommendations(personalRecs);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'genre':
        return <TrendingUp className="text-blue-500" size={16} />;
      case 'rating':
        return <Star className="text-yellow-500" size={16} />;
      case 'popular':
        return <TrendingUp className="text-green-500" size={16} />;
      default:
        return <Sparkles className="text-purple-500" size={16} />;
    }
  };

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
    { id: 'personal', label: translate('Personalizadas'), icon: Heart },
    { id: 'trending', label: translate('Em Alta'), icon: TrendingUp },
    { id: 'discovery', label: translate('Descobertas'), icon: Sparkles }
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
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                {translate('Em desenvolvimento')}
              </h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">
                {translate('Esta funcionalidade será implementada em breve!')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'discovery' && (
          <div>
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-6">
              {translate('Descobertas')}
            </h2>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-xl font-semibold text-text-light dark:text-text-dark mb-2">
                {translate('Em desenvolvimento')}
              </h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">
                {translate('Esta funcionalidade será implementada em breve!')}
              </p>
            </div>
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
