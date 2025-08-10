// src/pages/StatsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Star, 
  Clock, 
  TrendingUp, 
  Download, 
  RefreshCw,
  Calendar,
  Target,
  Activity,
  Lightbulb
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService.js';
import { useLanguage } from '../components/contexts/LanguageContext.jsx';

const StatsPage = () => {
  const { translate } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const generalStats = analyticsService.getGeneralStats();
      const ratingStats = analyticsService.getRatingStats();
      const progressStats = analyticsService.getProgressStats();
      const timeStats = analyticsService.getTimeStats();
      const activityStats = analyticsService.getActivityStats();
      const genreStats = await analyticsService.getGenreStats();
      const personalInsights = analyticsService.getPersonalInsights();

      setStats({
        general: generalStats,
        rating: ratingStats,
        progress: progressStats,
        time: timeStats,
        activity: activityStats,
        genre: genreStats,
        insights: personalInsights
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportStats = () => {
    const data = analyticsService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allnime-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-light dark:border-primary-dark mx-auto mb-4"></div>
        <p className="text-text-muted-light dark:text-text-muted-dark">
          {translate('Carregando estatísticas...')}
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-4 pt-20 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
          {translate('Erro ao carregar estatísticas')}
        </h1>
        <button
          onClick={loadStats}
          className="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          {translate('Tentar novamente')}
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: translate('Visão Geral'), icon: BarChart3 },
    { id: 'ratings', label: translate('Avaliações'), icon: Star },
    { id: 'progress', label: translate('Progresso'), icon: Target },
    { id: 'genres', label: translate('Gêneros'), icon: TrendingUp },
    { id: 'activity', label: translate('Atividade'), icon: Activity },
    { id: 'insights', label: translate('Insights'), icon: Lightbulb }
  ];

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
          📊 {translate('Minhas Estatísticas')}
        </h1>
        <p className="text-text-muted-light dark:text-text-muted-dark">
          {translate('Analise seus dados e descubra insights sobre seus hábitos de anime')}
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

      {/* Export Button */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={exportStats}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          {translate('Exportar Dados')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-card-light dark:bg-card-dark rounded-lg p-6 shadow-lg">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Resumo Geral')}
            </h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Star className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      {translate('Total Avaliados')}
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      {stats.general.totalRated}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="text-green-600 dark:text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      {translate('Completos')}
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      {stats.general.totalCompleted}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Clock className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      {translate('Tempo Total')}
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      {stats.time.totalDays}d
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <TrendingUp className="text-orange-600 dark:text-orange-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      {translate('Taxa Conclusão')}
                    </p>
                    <p className="text-2xl font-bold text-text-light dark:text-text-dark">
                      {stats.general.completionRate}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                {translate('Distribuição de Avaliações')}
              </h3>
              <div className="flex items-center gap-4">
                {[5, 4, 3, 2, 1].map(rating => (
                  <div key={rating} className="text-center">
                    <div className="text-2xl mb-1">{'⭐'.repeat(rating)}</div>
                    <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                      {stats.rating.ratingDistribution[rating] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ratings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Análise de Avaliações')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Rated */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                  {translate('Top Avaliados')}
                </h3>
                <div className="space-y-2">
                  {stats.rating.topRated.slice(0, 5).map((rating, index) => (
                    <div key={rating.id} className="flex items-center justify-between">
                      <span className="text-sm text-text-main-light dark:text-text-main-dark truncate">
                        {index + 1}. {rating.anime.title}
                      </span>
                      <span className="text-sm font-medium text-primary-light dark:text-primary-dark">
                        {'⭐'.repeat(rating.rating)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Ratings */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                  {translate('Avaliações Recentes')}
                </h3>
                <div className="space-y-2">
                  {stats.rating.recentRatings.slice(0, 5).map((rating) => (
                    <div key={rating.id} className="flex items-center justify-between">
                      <span className="text-sm text-text-main-light dark:text-text-main-dark truncate">
                        {rating.anime.title}
                      </span>
                      <span className="text-sm font-medium text-primary-light dark:text-primary-dark">
                        {'⭐'.repeat(rating.rating)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating Stats */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                {translate('Estatísticas de Avaliação')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-light dark:text-primary-dark">
                    {stats.rating.averageRating}
                  </div>
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    {translate('Média Geral')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.rating.totalRatings}
                  </div>
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    {translate('Total Avaliados')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.rating.topRated.length > 0 ? stats.rating.topRated[0].rating : 0}
                  </div>
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    {translate('Melhor Avaliação')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Progresso dos Animes')}
            </h2>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.progress.totalWatching}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Assistindo')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.progress.totalCompleted}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Completos')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                  {stats.progress.totalPlanToWatch}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Planejo Assistir')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {stats.progress.totalDropped}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Desistidos')}
                </div>
              </div>
            </div>

            {/* Current Progress */}
            {stats.progress.progressStats.length > 0 && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                  {translate('Progresso Atual')}
                </h3>
                <div className="space-y-3">
                  {stats.progress.progressStats.slice(0, 5).map(anime => (
                    <div key={anime.mal_id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                          {anime.title}
                        </div>
                        <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                          {anime.watchedEpisodes || 0} / {anime.episodes || '?'} episódios
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-light dark:bg-primary-dark h-2 rounded-full"
                            style={{ width: `${anime.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark w-12 text-right">
                          {anime.progress}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'genres' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Análise por Gêneros')}
            </h2>
            
            {stats.genre.length > 0 ? (
              <div className="space-y-4">
                {stats.genre.slice(0, 10).map((genre) => (
                  <div key={genre.genre} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">
                        {genre.genre}
                      </h3>
                      <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {genre.count} animes
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {genre.watching}
                        </div>
                        <div className="text-text-muted-light dark:text-text-muted-dark">
                          {translate('Assistindo')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {genre.completed}
                        </div>
                        <div className="text-text-muted-light dark:text-text-muted-dark">
                          {translate('Completos')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                          {genre.planToWatch}
                        </div>
                        <div className="text-text-muted-light dark:text-text-muted-dark">
                          {translate('Planejo')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600 dark:text-red-400">
                          {genre.dropped}
                        </div>
                        <div className="text-text-muted-light dark:text-text-muted-dark">
                          {translate('Desistidos')}
                        </div>
                      </div>
                    </div>
                    
                    {genre.averageRating > 0 && (
                      <div className="mt-3 text-center">
                        <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                          {translate('Média de Avaliação')}
                        </div>
                        <div className="text-lg font-bold text-primary-light dark:text-primary-dark">
                          {'⭐'.repeat(Math.round(genre.averageRating))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-text-muted-light dark:text-text-muted-dark">
                {translate('Nenhum dado de gênero disponível')}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Atividade e Tempo')}
            </h2>
            
            {/* Time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {stats.time.totalEpisodes}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Total Episódios')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {stats.time.totalHours}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Total Horas')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  {stats.time.totalDays}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Total Dias')}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                  {stats.time.averageEpisodesPerAnime}
                </div>
                <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                  {translate('Média/Anime')}
                </div>
              </div>
            </div>

            {/* Activity Stats */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                {translate('Atividade por Mês')}
              </h3>
              {stats.activity.mostActiveMonth ? (
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-light dark:text-primary-dark mb-2">
                    {stats.activity.mostActiveMonth.month}
                  </div>
                  <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                    {translate('Mês mais ativo com')} {stats.activity.mostActiveMonth.count} {translate('avaliações')}
                  </div>
                </div>
              ) : (
                <div className="text-center text-text-muted-light dark:text-text-muted-dark">
                  {translate('Nenhuma atividade registrada')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-light dark:text-text-dark mb-4">
              {translate('Insights Pessoais')}
            </h2>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-text-light dark:text-text-dark mb-3">
                {translate('Descobertas sobre você')}
              </h3>
              <div className="space-y-3">
                {stats.insights.length > 0 ? (
                  stats.insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Lightbulb className="text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" size={20} />
                      <p className="text-text-main-light dark:text-text-main-dark">
                        {insight}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-text-muted-light dark:text-text-muted-dark py-8">
                    {translate('Continue usando o app para gerar insights personalizados!')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadStats}
          className="flex items-center gap-2 bg-primary-light dark:bg-primary-dark text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity mx-auto"
        >
          <RefreshCw size={18} />
          {translate('Atualizar Estatísticas')}
        </button>
      </div>
    </div>
  );
};

export default StatsPage;
