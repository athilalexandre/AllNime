// src/services/recommendationService.js
import { getAnimeDetailsById } from './jikanService.js';

class RecommendationService {
  constructor() {
    this.userRatings = this.loadUserRatings();
    this.animeCache = new Map();
  }

  loadUserRatings() {
    try {
      const ratings = localStorage.getItem('animeRatings');
      return ratings ? JSON.parse(ratings) : {};
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      return {};
    }
  }

  // Calcula a similaridade entre dois animes baseado em gêneros
  calculateSimilarity(anime1, anime2) {
    if (!anime1.genres || !anime2.genres) return 0;
    
    const genres1 = new Set(anime1.genres.map(g => g.name.toLowerCase()));
    const genres2 = new Set(anime2.genres.map(g => g.name.toLowerCase()));
    
    const intersection = new Set([...genres1].filter(x => genres2.has(x)));
    const union = new Set([...genres1, ...genres2]);
    
    return intersection.size / union.size;
  }

  // Gera recomendações baseadas no histórico de avaliações
  async generateRecommendations(limit = 10) {
    const ratings = this.loadUserRatings();
    const ratedAnimes = Object.values(ratings);
    
    if (ratedAnimes.length === 0) {
      return this.getPopularRecommendations(limit);
    }

    // Agrupa animes por gênero favorito
    const genrePreferences = this.analyzeGenrePreferences(ratedAnimes);
    
    // Busca animes similares aos favoritos
    const recommendations = await this.findSimilarAnimes(genrePreferences, limit);
    
    return recommendations;
  }

  // Analisa preferências de gênero do usuário
  analyzeGenrePreferences(ratedAnimes) {
    const genreScores = {};
    
    ratedAnimes.forEach(rating => {
      if (rating.anime && rating.anime.genres) {
        rating.anime.genres.forEach(genre => {
          const genreName = genre.name.toLowerCase();
          if (!genreScores[genreName]) {
            genreScores[genreName] = { count: 0, totalScore: 0 };
          }
          genreScores[genreName].count++;
          genreScores[genreName].totalScore += rating.rating;
        });
      }
    });

    // Calcula score médio por gênero
    const preferences = Object.entries(genreScores)
      .map(([genre, data]) => ({
        genre,
        score: data.totalScore / data.count,
        count: data.count
      }))
      .sort((a, b) => b.score - a.score);

    return preferences.slice(0, 5); // Top 5 gêneros
  }

  // Busca animes similares baseado nas preferências
  async findSimilarAnimes(genrePreferences) {
    const recommendations = [];
    const seenIds = new Set();
    
    // Carrega avaliações para evitar recomendar animes já avaliados
    const userRatings = this.loadUserRatings();
    Object.keys(userRatings).forEach(id => seenIds.add(parseInt(id)));

    for (const preference of genrePreferences) {
      try {
        // Busca animes por gênero (simulado - em produção seria uma API call)
        const genreAnimes = await this.searchAnimesByGenre();
        
        for (const anime of genreAnimes) {
          if (recommendations.length >= 10) break;
          if (!seenIds.has(anime.mal_id)) {
            recommendations.push({
              ...anime,
              matchScore: preference.score,
              reason: `Similar ao gênero ${preference.genre} que você gosta`
            });
            seenIds.add(anime.mal_id);
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar animes do gênero ${preference.genre}:`, error);
      }
    }

    return recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);
  }

  // Busca animes por gênero (simulado - em produção seria uma API call real)
  async searchAnimesByGenre() {
    // Por enquanto, retorna uma lista simulada
    // Em produção, isso seria uma chamada para a API Jikan
    // TODO: Implementar chamada real para a API
    return [];
  }

  // Recomendações populares para usuários sem histórico
  async getPopularRecommendations() {
    try {
      // Em produção, isso seria uma chamada para a API Jikan
      // Por enquanto, retorna uma lista simulada
      // TODO: Implementar chamada real para a API
    } catch (error) {
      console.error('Erro ao buscar recomendações populares:', error);
    }
    return [];
  }

  // Recomendações baseadas em um anime específico
  async getSimilarAnimes(animeId) {
    try {
      const anime = await getAnimeDetailsById(animeId);
      if (!anime) return [];

      // Em produção, isso seria uma busca por animes similares na API
      // Por enquanto, retorna uma lista simulada baseada no gênero
      // TODO: Implementar busca real por animes similares
    } catch (error) {
      console.error('Erro ao buscar animes similares:', error);
    }
    return [];
  }

  // Atualiza cache de animes
  updateAnimeCache(animeId, animeData) {
    this.animeCache.set(animeId, {
      data: animeData,
      timestamp: Date.now()
    });
  }

  // Limpa cache antigo (mais de 1 hora)
  cleanCache() {
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    for (const [id, cache] of this.animeCache.entries()) {
      if (now - cache.timestamp > oneHour) {
        this.animeCache.delete(id);
      }
    }
  }
}

export const recommendationService = new RecommendationService();
