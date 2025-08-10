import axios from 'axios';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// Configuração do axios com timeout e retry
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'User-Agent': 'AnimeMaster/1.0'
  }
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

export const getAnimeDetailsById = async (id) => {
  try {
    // Primeira tentativa: endpoint /full
    const response = await axiosInstance.get(`${API_BASE_URL}/anime/${id}/full`);
    return response.data;
  } catch (error) {
    console.warn(`Endpoint /full falhou para anime ${id}, tentando endpoint básico...`);
    
    try {
      // Segunda tentativa: endpoint básico
      const fallback = await axiosInstance.get(`${API_BASE_URL}/anime/${id}`);
      return fallback.data;
    } catch (fallbackError) {
      console.error(`Fallback falhou ao buscar anime ${id}:`, fallbackError.response?.data || fallbackError.message);
      
      // Terceira tentativa: endpoint /characters para verificar se o anime existe
      try {
        const characterCheck = await axiosInstance.get(`${API_BASE_URL}/anime/${id}/characters`);
        if (characterCheck.data) {
          // Se conseguimos buscar personagens, o anime existe mas os detalhes falharam
          // Retornar dados mínimos para não quebrar a UI
          return {
            data: {
              mal_id: id,
              title: `Anime ID: ${id}`,
              title_japanese: 'N/A',
              synopsis: 'Informações temporariamente indisponíveis.',
              images: { jpg: { image_url: 'https://placehold.co/250x350/F0F0F0/333333?text=Loading...' } },
              rating: 'N/A',
              popularity: null,
              trailer: null,
              external: []
            }
          };
        }
      } catch (charError) {
        console.error(`Verificação de personagens falhou para anime ${id}:`, charError.message);
      }
      
      // Se tudo falhou, lançar erro
      throw new Error(`Não foi possível carregar os detalhes do anime ${id}. Tente novamente mais tarde.`);
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
