import axios from 'axios';

const API_BASE_URL = 'https://api.jikan.moe/v4';

export const searchAnimes = async (query) => {
  if (!query) return Promise.resolve({ data: [] }); // Retorna vazio se não houver query

  try {
    const response = await axios.get(`${API_BASE_URL}/anime`, {
      params: {
        q: query,
        sfw: true, // Conteúdo seguro
        limit: 10, // Limitar a 10 sugestões
        // order_by: "members", // Opcional: ordenar por popularidade
        // sort: "desc"
      }
    });
    return response.data; // A API Jikan V4 encapsula os resultados em um campo 'data'
  } catch (error) {
    console.error('Erro ao buscar dados da Jikan API:', error.response?.data || error.message);
    throw error; // Re-lançar o erro para ser tratado no componente
  }
};

export const getAnimeDetailsById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/anime/${id}/full`);
    return response.data; // A API Jikan V4 encapsula em 'data'
  } catch (error) {
    console.error(`Erro ao buscar detalhes do anime ${id} da Jikan API:`, error.response?.data || error.message);
    throw error;
  }
};

export const getCurrentSeasonAnimes = async (page = 1, limit = 6) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/seasons/now`, {
      params: { page, limit, sfw: true, filter: 'tv' }
    });
    return response.data;
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
    return response.data;
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
    return response.data; // Contém { data: [], pagination: {} }
  } catch (error) {
    console.error('Erro ao buscar animes da Jikan API:', error.response?.data || error.message);
    throw error;
  }
};
