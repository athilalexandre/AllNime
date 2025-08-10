// src/services/analyticsService.js
import { getAnimeDetailsById } from './jikanService.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
  }

  // Carrega dados do usuário
  loadUserData() {
    try {
      const ratings = JSON.parse(localStorage.getItem('animeRatings') || '{}');
      const watchlist = JSON.parse(localStorage.getItem('watchlist') || '{}');
      return { ratings, watchlist };
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      return { ratings: {}, watchlist: {} };
    }
  }

  // Obtém estatísticas gerais
  getGeneralStats() {
    const { ratings, watchlist } = this.loadUserData();
    
    const totalRated = Object.keys(ratings).length;
    const totalWatching = watchlist.watching?.length || 0;
    const totalCompleted = watchlist.completed?.length || 0;
    const totalPlanToWatch = watchlist.planToWatch?.length || 0;
    const totalDropped = watchlist.dropped?.length || 0;

    const totalAnimes = totalWatching + totalCompleted + totalPlanToWatch + totalDropped;

    return {
      totalRated,
      totalWatching,
      totalCompleted,
      totalPlanToWatch,
      totalDropped,
      totalAnimes,
      completionRate: totalAnimes > 0 ? Math.round((totalCompleted / totalAnimes) * 100) : 0
    };
  }

  // Obtém estatísticas de avaliações
  getRatingStats() {
    const { ratings } = this.loadUserData();
    
    if (Object.keys(ratings).length === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: {},
        topRated: [],
        recentRatings: []
      };
    }

    const ratingValues = Object.values(ratings).map(r => r.rating);
    const averageRating = ratingValues.reduce((sum, rating) => sum + rating, 0) / ratingValues.length;

    // Distribuição de avaliações
    const ratingDistribution = {};
    ratingValues.forEach(rating => {
      ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
    });

    // Top animes avaliados
    const topRated = Object.values(ratings)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10)
      .map(rating => ({
        ...rating,
        anime: rating.anime || { title: 'Anime não encontrado' }
      }));

    // Avaliações recentes
    const recentRatings = Object.values(ratings)
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 5)
      .map(rating => ({
        ...rating,
        anime: rating.anime || { title: 'Anime não encontrado' }
      }));

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratingValues.length,
      ratingDistribution,
      topRated,
      recentRatings
    };
  }

  // Obtém estatísticas por gênero
  async getGenreStats() {
    const { ratings, watchlist } = this.loadUserData();
    const genreStats = {};

    // Analisa avaliações por gênero
    for (const rating of Object.values(ratings)) {
      if (rating.anime && rating.anime.genres) {
        rating.anime.genres.forEach(genre => {
          const genreName = genre.name;
          if (!genreStats[genreName]) {
            genreStats[genreName] = {
              count: 0,
              totalRating: 0,
              averageRating: 0,
              watching: 0,
              completed: 0,
              planToWatch: 0,
              dropped: 0
            };
          }
          genreStats[genreName].count++;
          genreStats[genreName].totalRating += rating.rating;
        });
      }
    }

    // Analisa watchlist por gênero
    const allWatchlistAnimes = [
      ...(watchlist.watching || []),
      ...(watchlist.completed || []),
      ...(watchlist.planToWatch || []),
      ...(watchlist.dropped || [])
    ];

    for (const anime of allWatchlistAnimes) {
      if (anime.genres) {
        anime.genres.forEach(genre => {
          const genreName = genre.name;
          if (!genreStats[genreName]) {
            genreStats[genreName] = {
              count: 0,
              totalRating: 0,
              averageRating: 0,
              watching: 0,
              completed: 0,
              planToWatch: 0,
              dropped: 0
            };
          }

          // Determina o status do anime
          if (watchlist.watching?.some(w => w.mal_id === anime.mal_id)) {
            genreStats[genreName].watching++;
          } else if (watchlist.completed?.some(c => c.mal_id === anime.mal_id)) {
            genreStats[genreName].completed++;
          } else if (watchlist.planToWatch?.some(p => p.mal_id === anime.mal_id)) {
            genreStats[genreName].planToWatch++;
          } else if (watchlist.dropped?.some(d => d.mal_id === anime.mal_id)) {
            genreStats[genreName].dropped++;
          }
        });
      }
    }

    // Calcula médias e ordena
    const genreStatsArray = Object.entries(genreStats).map(([genre, stats]) => {
      stats.averageRating = stats.count > 0 ? Math.round((stats.totalRating / stats.count) * 10) / 10 : 0;
      return { genre, ...stats };
    });

    return genreStatsArray.sort((a, b) => b.count - a.count);
  }

  // Obtém estatísticas de progresso
  getProgressStats() {
    const { watchlist } = this.loadUserData();
    
    const watching = watchlist.watching || [];
    const completed = watchlist.completed || [];
    const planToWatch = watchlist.planToWatch || [];
    const dropped = watchlist.dropped || [];

    // Calcula progresso dos animes em watching
    const progressStats = watching.map(anime => {
      const totalEpisodes = anime.episodes || 0;
      const watchedEpisodes = anime.watchedEpisodes || 0;
      const progress = totalEpisodes > 0 ? Math.round((watchedEpisodes / totalEpisodes) * 100) : 0;

      return {
        ...anime,
        progress,
        remainingEpisodes: Math.max(0, totalEpisodes - watchedEpisodes)
      };
    });

    // Estatísticas gerais de progresso
    const totalProgress = progressStats.reduce((sum, anime) => sum + anime.progress, 0);
    const averageProgress = progressStats.length > 0 ? Math.round(totalProgress / progressStats.length) : 0;

    return {
      progressStats,
      averageProgress,
      totalWatching: watching.length,
      totalCompleted: completed.length,
      totalPlanToWatch: planToWatch.length,
      totalDropped: dropped.length
    };
  }

  // Obtém estatísticas de tempo
  getTimeStats() {
    const { ratings, watchlist } = this.loadUserData();
    
    // Calcula tempo total assistindo (estimativa)
    const allAnimes = [
      ...Object.values(ratings).map(r => r.anime).filter(Boolean),
      ...(watchlist.watching || []),
      ...(watchlist.completed || []),
      ...(watchlist.planToWatch || []),
      ...(watchlist.dropped || [])
    ];

    // Remove duplicatas por mal_id
    const uniqueAnimes = allAnimes.filter((anime, index, self) => 
      index === self.findIndex(a => a.mal_id === anime.mal_id)
    );

    const totalEpisodes = uniqueAnimes.reduce((sum, anime) => {
      const episodes = anime.episodes || 0;
      return sum + episodes;
    }, 0);

    // Estimativa: 24 minutos por episódio
    const totalMinutes = totalEpisodes * 24;
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    return {
      totalEpisodes,
      totalMinutes,
      totalHours,
      totalDays,
      averageEpisodesPerAnime: uniqueAnimes.length > 0 ? Math.round(totalEpisodes / uniqueAnimes.length) : 0
    };
  }

  // Obtém estatísticas de atividade
  getActivityStats() {
    const { ratings } = this.loadUserData();
    
    if (Object.keys(ratings).length === 0) {
      return {
        activityByMonth: {},
        mostActiveMonth: null,
        totalActivity: 0
      };
    }

    // Agrupa atividade por mês
    const activityByMonth = {};
    Object.values(ratings).forEach(rating => {
      if (rating.timestamp) {
        const month = new Date(rating.timestamp).toISOString().slice(0, 7); // YYYY-MM
        activityByMonth[month] = (activityByMonth[month] || 0) + 1;
      }
    });

    // Encontra o mês mais ativo
    const mostActiveMonth = Object.entries(activityByMonth)
      .sort(([,a], [,b]) => b - a)[0];

    const totalActivity = Object.values(activityByMonth).reduce((sum, count) => sum + count, 0);

    return {
      activityByMonth,
      mostActiveMonth: mostActiveMonth ? {
        month: mostActiveMonth[0],
        count: mostActiveMonth[1]
      } : null,
      totalActivity
    };
  }

  // Obtém insights personalizados
  getPersonalInsights() {
    const ratingStats = this.getRatingStats();
    const genreStats = this.getGenreStats();
    const progressStats = this.getProgressStats();
    const timeStats = this.getTimeStats();

    const insights = [];

    // Insights baseados em avaliações
    if (ratingStats.averageRating >= 4) {
      insights.push("Você tem um gosto muito seletivo para animes!");
    } else if (ratingStats.averageRating <= 2) {
      insights.push("Você é bastante crítico com os animes que assiste.");
    }

    // Insights baseados em gêneros
    if (genreStats.length > 0) {
      const topGenre = genreStats[0];
      insights.push(`Seu gênero favorito é ${topGenre.genre} (${topGenre.count} animes).`);
    }

    // Insights baseados em progresso
    if (progressStats.averageProgress > 80) {
      insights.push("Você é muito dedicado em completar os animes que começa!");
    } else if (progressStats.averageProgress < 30) {
      insights.push("Você gosta de experimentar muitos animes diferentes.");
    }

    // Insights baseados em tempo
    if (timeStats.totalDays > 30) {
      insights.push(`Você já dedicou aproximadamente ${timeStats.totalDays} dias assistindo animes!`);
    }

    return insights;
  }

  // Exporta dados para análise
  exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      generalStats: this.getGeneralStats(),
      ratingStats: this.getRatingStats(),
      progressStats: this.getProgressStats(),
      timeStats: this.getTimeStats(),
      activityStats: this.getActivityStats(),
      personalInsights: this.getPersonalInsights()
    };

    return JSON.stringify(data, null, 2);
  }

  // Limpa cache
  clearCache() {
    this.cache.clear();
  }
}

export const analyticsService = new AnalyticsService();
