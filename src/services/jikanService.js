import axios from 'axios';
import { animeMappingService } from './animeMappingService.js';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// Configuração do axios com timeout (sem User-Agent problemático)
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos de timeout
});

export const searchAnimes = async (query) => {
  if (!query) return Promise.resolve({ data: [] }); // Retorna vazio se não houver query

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/anime`, {
      params: {
        q: query,
        sfw: true, // Conteúdo seguro
        limit: 10, // Limitar a 10 sugestões
        // order_by: "members", // Opcional: ordenar por popularidade
        // sort: "desc"
      }
    });
    const filtered = Array.isArray(response.data?.data)
      ? response.data.data.filter(item => 
          item?.approved !== false && 
          item?.mal_id && 
          item?.mal_id > 0 &&
          item?.title && 
          item?.title.trim() !== ''
        )
      : [];
    return { ...response.data, data: filtered };
  } catch (error) {
    console.error('Erro ao buscar dados da Jikan API:', error.response?.data || error.message);
    // Retornar array vazio em caso de erro para não quebrar a UI
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getAnimeDetailsById = async (id, title = null) => {
  // Validar se o ID é válido
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    throw new Error('ID de anime inválido');
  }

  let finalId = id;
  
  // Tentar mapear o ID se for inválido
  try {
    const mappedId = await animeMappingService.getMappedId(id, title);
    if (mappedId !== id) {
      console.log(`🔄 ID mapeado: ${id} → ${mappedId}`);
      finalId = mappedId;
    }
  } catch (mappingError) {
    console.warn(`⚠️ Erro no mapeamento de ID ${id}:`, mappingError.message);
  }

  try {
    // Primeira tentativa: endpoint /full
    const response = await axiosInstance.get(`${API_BASE_URL}/anime/${finalId}/full`);
    if (response.data?.data) {
      return response.data;
    }
    throw new Error('Resposta da API não contém dados válidos');
  } catch (error) {
    console.warn(`Endpoint /full falhou para anime ${finalId}, tentando endpoint básico...`);
    
    try {
      // Segunda tentativa: endpoint básico
      const fallback = await axiosInstance.get(`${API_BASE_URL}/anime/${finalId}`);
      if (fallback.data?.data) {
        return fallback.data;
      }
      throw new Error('Resposta do fallback não contém dados válidos');
    } catch (fallbackError) {
      console.error(`Fallback falhou ao buscar anime ${finalId}:`, fallbackError.response?.data || fallbackError.message);
      
      // Terceira tentativa: verificar se o anime existe através de busca por ID
      try {
        const searchResponse = await axiosInstance.get(`${API_BASE_URL}/anime`, {
          params: { mal_id: finalId, limit: 1 }
        });
        
        if (searchResponse.data?.data && searchResponse.data.data.length > 0) {
          const animeData = searchResponse.data.data[0];
          // Retornar dados mínimos baseados na busca
          return {
            data: {
              mal_id: parseInt(finalId),
              title: animeData.title || `Anime ID: ${finalId}`,
              title_japanese: animeData.title_japanese || 'N/A',
              synopsis: animeData.synopsis || 'Informações temporariamente indisponíveis.',
              images: animeData.images || { jpg: { image_url: 'https://placehold.co/250x350/F0F0F0/333333?text=Loading...' } },
              rating: animeData.rating || 'N/A',
              popularity: animeData.popularity || null,
              trailer: animeData.trailer || null,
              external: animeData.external || []
            }
          };
        }
      } catch (searchError) {
        console.error(`Busca por ID falhou para anime ${finalId}:`, searchError.message);
      }
      
      // Se tudo falhou, tentar buscar por título como último recurso
      if (title) {
        try {
          console.log(`🆘 Último recurso: buscando por título "${title}"`);
          const titleSearch = await searchAnimes(title);
          if (titleSearch?.data && titleSearch.data.length > 0) {
            const bestMatch = titleSearch.data[0];
            console.log(`🎯 Encontrado anime por título: ${bestMatch.title} (ID: ${bestMatch.mal_id})`);
            
            // Armazenar no cache para futuras requisições
            animeMappingService.idCache.set(id, bestMatch.mal_id);
            
            // Retornar dados do anime encontrado
            return {
              data: {
                mal_id: bestMatch.mal_id,
                title: bestMatch.title,
                title_japanese: bestMatch.title_japanese || 'N/A',
                synopsis: bestMatch.synopsis || 'Informações temporariamente indisponíveis.',
                images: bestMatch.images || { jpg: { image_url: 'https://placehold.co/250x350/F0F0F0/333333?text=Loading...' } },
                rating: bestMatch.rating || 'N/A',
                popularity: bestMatch.popularity || null,
                trailer: bestMatch.trailer || null,
                external: bestMatch.external || []
              }
            };
          }
        } catch (titleError) {
          console.error(`Busca por título falhou para "${title}":`, titleError.message);
        }
      }
      
      // Se tudo falhou, lançar erro específico
      if (fallbackError.response?.status === 404) {
        throw new Error(`Anime com ID ${finalId} não foi encontrado na base de dados.`);
      } else {
        throw new Error(`Não foi possível carregar os detalhes do anime ${finalId}. Tente novamente mais tarde.`);
      }
    }
  }
};

export const getCurrentSeasonAnimes = async (page = 1, limit = 6) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/seasons/now`, {
      params: { page, limit, sfw: true, filter: 'tv' }
    });
    const filtered = Array.isArray(response.data?.data)
      ? response.data.data.filter(item => 
          item?.approved !== false && 
          item?.mal_id && 
          item?.mal_id > 0 &&
          item?.title && 
          item?.title.trim() !== ''
        )
      : [];
    return { ...response.data, data: filtered };
  } catch (error) {
    console.error('Erro ao buscar animes da temporada da Jikan API:', error.response?.data || error.message);
    throw error;
  }
};

export const getTopRatedAnimes = async (page = 1, limit = 6) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/top/anime`, {
      params: { page, limit, sfw: true, type: 'tv' }
    });
    const filtered = Array.isArray(response.data?.data)
      ? response.data.data.filter(item => 
          item?.approved !== false && 
          item?.mal_id && 
          item?.mal_id > 0 &&
          item?.title && 
          item?.title.trim() !== ''
        )
      : [];
    return { ...response.data, data: filtered };
  } catch (error) {
    console.error('Erro ao buscar top animes da Jikan API:', error.response?.data || error.message);
    throw error;
  }
};

export const getAnimeGenres = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/genres/anime`);
    return response.data.data; // Array de objetos de gênero
  } catch (error) { // Corrigido o posicionamento do catch
    console.error('Erro ao buscar gêneros da Jikan API:', error.response?.data || error.message);
    throw error;
  }
};

export const getAnimes = async (page = 1, limit = 18, genreId = null) => {
  const params = {
    page,
    limit,
    sfw: true,
    type: 'tv', // Focar em séries de TV por padrão
  };
  if (genreId) {
    params.genres = genreId;
  }
  try {
    const response = await axios.get(`${API_BASE_URL}/anime`, { params });
    const filtered = Array.isArray(response.data?.data)
      ? response.data.data.filter(item => 
          item?.approved !== false && 
          item?.mal_id && 
          item?.mal_id > 0 &&
          item?.title && 
          item?.title.trim() !== ''
        )
      : [];
    return { ...response.data, data: filtered };
  } catch (error) {
    console.error('Erro ao buscar animes da Jikan API:', error.response?.data || error.message);
    throw error;
  }
};
