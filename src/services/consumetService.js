import axios from 'axios';

// URLs alternativas para a Consumet API
const CONSUMET_APIS = [
  'https://api.consumet.org',
  'https://consumet-api-production-host.vercel.app',
  'https://consumet-api.vercel.app'
];

// Função para testar qual API está funcionando
const getWorkingAPI = async () => {
  for (const apiUrl of CONSUMET_APIS) {
    try {
      const response = await axios.get(`${apiUrl}/anime/gogoanime/test`, { timeout: 5000 });
      if (response.status === 200 || response.status === 404) {
        console.log(`Consumet API funcionando: ${apiUrl}`);
        return apiUrl;
      }
    } catch (error) {
      console.warn(`Consumet API ${apiUrl} falhou:`, error.message);
      continue;
    }
  }
  return null;
};

export const getAnimeWatchInfo = async (animeTitle) => {
  if (!animeTitle) return Promise.resolve(null);
  
  try {
    // Tentar encontrar uma API funcionando
    const workingAPI = await getWorkingAPI();
    if (!workingAPI) {
      console.warn('Nenhuma Consumet API está funcionando no momento');
      return null;
    }

    // Buscar informações do anime
    const response = await axios.get(`${workingAPI}/anime/gogoanime/${encodeURIComponent(animeTitle)}`, {
      params: { page: 1 },
      timeout: 10000
    });

    // Verificar se temos resultados válidos
    if (response.data?.results && response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      
      // Se temos um ID válido, buscar informações completas
      if (firstResult.id) {
        try {
          const infoResponse = await axios.get(`${workingAPI}/anime/gogoanime/info/${firstResult.id}`, {
            timeout: 10000
          });
          
          if (infoResponse.data?.episodes) {
            return {
              ...response.data,
              detailedInfo: infoResponse.data,
              episodes: infoResponse.data.episodes
            };
          }
        } catch (infoError) {
          console.warn(`Não foi possível buscar informações detalhadas para ${animeTitle}:`, infoError.message);
        }
      }
      
      return response.data;
    }
    
    return null;
  } catch (error) {
    // Log mais detalhado do erro
    if (error.code === 'ERR_NETWORK') {
      console.warn(`Consumet API: Erro de rede para "${animeTitle}": Verifique sua conexão`);
    } else if (error.response?.status === 404) {
      console.warn(`Consumet API: Anime "${animeTitle}" não encontrado`);
    } else if (error.response?.status === 500) {
      console.warn(`Consumet API: Erro interno do servidor para "${animeTitle}"`);
    } else {
      console.warn(`Consumet API: Erro ao buscar "${animeTitle}":`, error.response?.data || error.message);
    }
    
    return null;
  }
};

// Função para buscar episódios específicos
export const getAnimeEpisodes = async (animeId) => {
  try {
    const workingAPI = await getWorkingAPI();
    if (!workingAPI) return null;

    const response = await axios.get(`${workingAPI}/anime/gogoanime/info/${animeId}`, {
      timeout: 10000
    });
    
    return response.data?.episodes || [];
  } catch (error) {
    console.warn(`Erro ao buscar episódios para ID ${animeId}:`, error.message);
    return [];
  }
};
