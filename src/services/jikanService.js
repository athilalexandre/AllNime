import axios from 'axios';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// Configuração do axios com timeout
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos de timeout
});

export const searchAnimes = async (query) => {
  if (!query || query.trim() === '') {
    return { data: [], pagination: { has_next_page: false } };
  }

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/anime`, {
      params: {
        q: query.trim(),
        sfw: true,
        limit: 25,
        order_by: "popularity",
        sort: "desc"
      }
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      const filtered = response.data.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response.data, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    console.error('Erro ao buscar animes:', error.response?.data || error.message);
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getAnimeDetailsById = async (id) => {
  // Validar se o ID é válido
  if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
    throw new Error('ID de anime inválido');
  }

  try {
    // Tentar endpoint /full primeiro
    const response = await axiosInstance.get(`${API_BASE_URL}/anime/${id}/full`);
    
    if (response.data?.data) {
      return response.data;
    }
    
    throw new Error('Resposta da API não contém dados válidos');
  } catch {
    console.warn(`Endpoint /full falhou para anime ${id}, tentando endpoint básico...`);
    
    try {
      // Fallback para endpoint básico
      const fallback = await axiosInstance.get(`${API_BASE_URL}/anime/${id}`);
      
      if (fallback.data?.data) {
        return fallback.data;
      }
      
      throw new Error('Resposta do fallback não contém dados válidos');
    } catch (fallbackError) {
      console.error(`Falha ao buscar anime ${id}:`, fallbackError.response?.data || fallbackError.message);
      
      if (fallbackError.response?.status === 404) {
        throw new Error(`Anime com ID ${id} não foi encontrado na base de dados.`);
      } else {
        throw new Error(`Não foi possível carregar os detalhes do anime ${id}. Tente novamente mais tarde.`);
      }
    }
  }
};

export const getCurrentSeasonAnimes = async (page = 1, limit = 25) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/seasons/now`, {
      params: { 
        page, 
        limit, 
        sfw: true, 
        filter: 'tv' 
      }
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      const filtered = response.data.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { ...response.data, data: filtered };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    console.error('Erro ao buscar animes da temporada:', error.response?.data || error.message);
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getTopRatedAnimes = async (page = 1, limit = 25) => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/top/anime`, {
      params: { 
        page, 
        limit, 
        sfw: true, 
        type: 'tv' 
      }
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      const filtered = response.data.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { ...response.data, data: filtered };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    console.error('Erro ao buscar top animes:', error.response?.data || error.message);
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getAnimeGenres = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/genres/anime`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error.response?.data || error.message);
    return [];
  }
};

export const getAnimes = async (page = 1, limit = 25, genreId = null) => {
  const params = {
    page,
    limit,
    sfw: true,
    type: 'tv',
    order_by: 'popularity',
    sort: 'desc'
  };
  
  if (genreId) {
    params.genres = genreId;
  }

  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/anime`, { params });

    if (response.data?.data && Array.isArray(response.data.data)) {
      const filtered = response.data.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { ...response.data, data: filtered };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    console.error('Erro ao buscar animes:', error.response?.data || error.message);
    return { data: [], pagination: { has_next_page: false } };
  }
};
