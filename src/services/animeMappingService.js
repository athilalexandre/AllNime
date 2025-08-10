import { searchAnimes } from './jikanService.js';

class AnimeMappingService {
  constructor() {
    this.idCache = new Map(); // Cache de mapeamento de IDs
    this.titleCache = new Map(); // Cache de busca por título
    this.searchCache = new Map(); // Cache de resultados de busca
  }

  // Buscar anime por título e retornar o ID correto da Jikan
  async findAnimeByTitle(title, fallbackId = null) {
    if (!title) {
      console.warn('Título não fornecido para busca');
      return fallbackId;
    }

    // Verificar cache primeiro
    const cacheKey = title.toLowerCase().trim();
    if (this.titleCache.has(cacheKey)) {
      console.log(`🎯 Cache hit para título: ${title}`);
      return this.titleCache.get(cacheKey);
    }

    try {
      console.log(`🔍 Buscando anime por título: ${title}`);
      const searchResult = await searchAnimes(title);
      
      if (searchResult?.data && searchResult.data.length > 0) {
        // Pegar o primeiro resultado mais relevante
        const bestMatch = searchResult.data[0];
        const jikanId = bestMatch.mal_id;
        
        // Armazenar no cache
        this.titleCache.set(cacheKey, jikanId);
        this.idCache.set(fallbackId, jikanId); // Mapear ID inválido para ID válido
        
        console.log(`✅ Mapeamento criado: ${fallbackId} → ${jikanId} (${bestMatch.title})`);
        return jikanId;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar anime por título "${title}":`, error.message);
    }

    // Se não conseguir mapear, retornar o ID original
    console.warn(`⚠️ Não foi possível mapear o título "${title}" para um ID válido`);
    return fallbackId;
  }

  // Obter ID mapeado ou buscar por título
  async getMappedId(originalId, title = null) {
    // Se já temos o mapeamento no cache
    if (this.idCache.has(originalId)) {
      return this.idCache.get(originalId);
    }

    // Se temos um título, tentar mapear
    if (title) {
      const mappedId = await this.findAnimeByTitle(title, originalId);
      return mappedId;
    }

    // Se não temos título, retornar o ID original
    return originalId;
  }

  // Limpar cache (útil para desenvolvimento)
  clearCache() {
    this.idCache.clear();
    this.titleCache.clear();
    this.searchCache.clear();
    console.log('🧹 Cache limpo');
  }

  // Obter estatísticas do cache
  getCacheStats() {
    return {
      idMappings: this.idCache.size,
      titleMappings: this.titleCache.size,
      searchResults: this.searchCache.size
    };
  }
}

// Instância singleton
export const animeMappingService = new AnimeMappingService();
