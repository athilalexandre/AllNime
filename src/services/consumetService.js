import axios from 'axios';
import logger from './loggerService.js';

// URLs alternativas para a Consumet API
const CONSUMET_APIS = [
  'https://consumet-api.vercel.app', // Principal
  'https://api.consumet.org',        // Backup 1
  'https://consumet-api-production-host.vercel.app' // Backup 2
];

// Cache para API funcionando
let workingAPICache = null;
let lastAPITest = 0;
const API_TEST_INTERVAL = 5 * 60 * 1000; // 5 minutos

// Função para testar qual API está funcionando
const getWorkingAPI = async () => {
  const now = Date.now();
  
  // Usar cache se ainda for válido
  if (workingAPICache && (now - lastAPITest) < API_TEST_INTERVAL) {
    return workingAPICache;
  }

  logger.info('Testando APIs Consumet disponíveis', { apis: CONSUMET_APIS }, 'api');
  
  for (const apiUrl of CONSUMET_APIS) {
    try {
      logger.debug(`Testando API: ${apiUrl}`, {}, 'api');
      
      const response = await axios.get(`${apiUrl}/anime/gogoanime/test`, { 
        timeout: 8000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'AllNime/1.0'
        }
      });
      
      if (response.status === 200 || response.status === 404) {
        logger.info(`Consumet API funcionando: ${apiUrl}`, { status: response.status }, 'api');
        workingAPICache = apiUrl;
        lastAPITest = now;
        return apiUrl;
      }
    } catch (error) {
      logger.warn(`Consumet API ${apiUrl} falhou`, { 
        error: error.message,
        status: error.response?.status,
        code: error.code
      }, 'api');
      continue;
    }
  }
  
  logger.error('Nenhuma Consumet API está funcionando', { apis: CONSUMET_APIS }, 'api');
  return null;
};

export const getAnimeWatchInfo = async (animeTitle) => {
  if (!animeTitle) {
    logger.warn('getAnimeWatchInfo chamado sem título', {}, 'api');
    return Promise.resolve(null);
  }
  
  logger.info('Buscando informações de streaming', { anime: animeTitle }, 'api');
  
  try {
    // Tentar encontrar uma API funcionando
    const workingAPI = await getWorkingAPI();
    if (!workingAPI) {
      logger.warn('Nenhuma Consumet API está funcionando no momento', {}, 'api');
      return null;
    }

    // Buscar informações do anime
    const response = await axios.get(`${workingAPI}/anime/gogoanime/${encodeURIComponent(animeTitle)}`, {
      params: { page: 1 },
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AllNime/1.0'
      }
    });

    logger.debug('Resposta da Consumet API', { 
      anime: animeTitle,
      status: response.status,
      hasResults: !!response.data?.results,
      resultsCount: response.data?.results?.length || 0
    }, 'api');

    // Verificar se temos resultados válidos
    if (response.data?.results && response.data.results.length > 0) {
      const firstResult = response.data.results[0];
      
      // Se temos um ID válido, buscar informações completas
      if (firstResult.id) {
        try {
          logger.debug('Buscando informações detalhadas', { 
            anime: animeTitle,
            id: firstResult.id 
          }, 'api');
          
          const infoResponse = await axios.get(`${workingAPI}/anime/gogoanime/info/${firstResult.id}`, {
            timeout: 15000,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'AllNime/1.0'
            }
          });
          
          if (infoResponse.data?.episodes) {
            logger.info('Informações detalhadas obtidas com sucesso', { 
              anime: animeTitle,
              episodes: infoResponse.data.episodes.length
            }, 'api');
            
            return {
              ...response.data,
              detailedInfo: infoResponse.data,
              episodes: infoResponse.data.episodes
            };
          }
        } catch (infoError) {
          logger.warn('Falha ao buscar informações detalhadas', { 
            anime: animeTitle,
            error: infoError.message,
            status: infoError.response?.status
          }, 'api');
        }
      }
      
      logger.info('Informações básicas obtidas com sucesso', { 
        anime: animeTitle,
        results: response.data.results.length
      }, 'api');
      
      return response.data;
    }
    
    logger.info('Nenhum resultado encontrado', { anime: animeTitle }, 'api');
    return null;
  } catch (error) {
    // Log mais detalhado do erro
    if (error.code === 'ERR_NETWORK') {
      logger.warn('Erro de rede na Consumet API', { 
        anime: animeTitle,
        error: error.message
      }, 'api');
    } else if (error.response?.status === 404) {
      logger.info('Anime não encontrado na Consumet API', { anime: animeTitle }, 'api');
    } else if (error.response?.status === 429) {
      logger.warn('Rate limit atingido na Consumet API', { 
        anime: animeTitle,
        status: error.response.status
      }, 'api');
    } else if (error.response?.status === 500) {
      logger.warn('Erro interno do servidor Consumet', { 
        anime: animeTitle,
        status: error.response.status
      }, 'api');
    } else {
      logger.error('Erro na Consumet API', { 
        anime: animeTitle,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      }, 'api');
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
