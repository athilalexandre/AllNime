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
