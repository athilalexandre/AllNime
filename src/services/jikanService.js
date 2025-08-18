import axios from 'axios';
import logger from './loggerService.js';

const API_BASE_URL = 'https://api.jikan.moe/v4';

// Soft rate limiting: aim ~1 request/second
const MIN_REQUEST_INTERVAL_MS = 1200; // Increased to be more conservative
let lastRequestAt = 0;

// localStorage keys for persistent cache
const STORAGE_KEYS = {
  cacheData: 'jikan_cache_data',
  cacheTimes: 'jikan_cache_times',
};

// Cache system for rate limiting
const cache = {
  data: new Map(),
  timestamps: new Map(),
  maxAge: 10 * 60 * 1000, // 10 minutes (increased)
  maxSize: 200 // Increased cache size
};

// Rate limiting state
let rateLimitState = {
  isLimited: false,
  resetTime: null,
  retryAfter: null
};

// Configuração do axios com timeout e retry
const axiosInstance = axios.create({
  timeout: 15000, // 15 segundos de timeout
});

// Cache management functions
const getCacheKey = (url, params) => {
  return `${url}?${new URLSearchParams(params).toString()}`;
};

const getFromCache = (key) => {
  const timestamp = cache.timestamps.get(key);
  if (timestamp && Date.now() - timestamp < cache.maxAge) {
    return cache.data.get(key);
  }
  return null;
};

const saveCacheToStorage = () => {
  try {
    const dataEntries = Array.from(cache.data.entries());
    const timeEntries = Array.from(cache.timestamps.entries());
    localStorage.setItem(STORAGE_KEYS.cacheData, JSON.stringify(dataEntries));
    localStorage.setItem(STORAGE_KEYS.cacheTimes, JSON.stringify(timeEntries));
  } catch (_) {
    // ignore persistence errors (e.g., SSR or quota)
  }
};

const loadCacheFromStorage = () => {
  try {
    const rawData = localStorage.getItem(STORAGE_KEYS.cacheData);
    const rawTimes = localStorage.getItem(STORAGE_KEYS.cacheTimes);
    if (rawData && rawTimes) {
      const parsedData = JSON.parse(rawData);
      const parsedTimes = JSON.parse(rawTimes);
      cache.data = new Map(parsedData);
      cache.timestamps = new Map(parsedTimes);
    }
  } catch (_) {
    // ignore
  }
};

const setCache = (key, data) => {
  // Clean old entries if cache is full
  if (cache.data.size >= cache.maxSize) {
    const oldestKey = cache.timestamps.keys().next().value;
    cache.data.delete(oldestKey);
    cache.timestamps.delete(oldestKey);
  }
  
  cache.data.set(key, data);
  cache.timestamps.set(key, Date.now());
  // Persist lazily
  saveCacheToStorage();
};

const clearCache = () => {
  cache.data.clear();
  cache.timestamps.clear();
  try {
    localStorage.removeItem(STORAGE_KEYS.cacheData);
    localStorage.removeItem(STORAGE_KEYS.cacheTimes);
  } catch (_) {}
};

// Rate limiting functions
const checkRateLimit = () => {
  if (rateLimitState.isLimited && rateLimitState.resetTime) {
    if (Date.now() >= rateLimitState.resetTime) {
      rateLimitState.isLimited = false;
      rateLimitState.resetTime = null;
      rateLimitState.retryAfter = null;
      return false;
    }
    return true;
  }
  return false;
};

const setRateLimit = (retryAfter) => {
  rateLimitState.isLimited = true;
  rateLimitState.retryAfter = retryAfter;
  rateLimitState.resetTime = Date.now() + (retryAfter * 1000);
  
  logger.warn('Jikan API Rate Limit Set', {
    retryAfter: retryAfter,
    resetTime: new Date(rateLimitState.resetTime).toISOString()
  }, 'api');
};

// Enhanced request function with cache and rate limiting
const makeRequest = async (url, params = {}) => {
  const cacheKey = getCacheKey(url, params);
  
  // Check cache first
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    logger.debug('Jikan API Cache Hit', { url, cacheKey }, 'api');
    return cachedData;
  }
  
  // Check rate limit
  if (checkRateLimit()) {
    const waitTime = Math.ceil((rateLimitState.resetTime - Date.now()) / 1000);
    logger.warn('Jikan API Rate Limited - Using Cache', {
      waitTime: `${waitTime}s`,
      retryAfter: rateLimitState.retryAfter
    }, 'api');
    
    // Return cached data if available, even if expired
    const expiredData = cache.data.get(cacheKey);
    if (expiredData) {
      logger.info('Returning expired cached data due to rate limit', { url }, 'api');
      return expiredData;
    }
    
    // If no cached data, try to return a default response structure
    logger.warn('No cached data available, returning empty response', { url }, 'api');
    return { data: [], pagination: { has_next_page: false } };
  }
  
  try {
    // Soft client-side pacing
    const elapsed = Date.now() - lastRequestAt;
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
      await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL_MS - elapsed));
    }

    const response = await axiosInstance.get(url, { params });
    lastRequestAt = Date.now();
    
    // Cache successful response
    setCache(cacheKey, response.data);
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      const retryAfter = parseInt(error.response.headers['retry-after']) || 60;
      setRateLimit(retryAfter);
      
      // Try to return cached data
      const cachedData = cache.data.get(cacheKey);
      if (cachedData) {
        logger.warn('Jikan API Rate Limited - Returning Cached Data', {
          url,
          retryAfter
        }, 'api');
        return cachedData;
      }

      // If no cached data, return empty response instead of throwing
      logger.warn('Jikan API Rate Limited - No cached data, returning empty response', {
        url,
        retryAfter
      }, 'api');
      return { data: [], pagination: { has_next_page: false } };
    }
    
    throw error;
  }
};

// Interceptor para logging de requisições
axiosInstance.interceptors.request.use(
  (config) => {
    logger.debug('Jikan API Request', { 
      url: config.url,
      method: config.method,
      params: config.params
    }, 'api');
    return config;
  },
  (error) => {
    logger.error('Jikan API Request Error', { error: error.message }, 'api');
    return Promise.reject(error);
  }
);

// Interceptor para logging de respostas
axiosInstance.interceptors.response.use(
  (response) => {
    logger.debug('Jikan API Response', { 
      url: response.config.url,
      status: response.status,
      dataLength: response.data?.data?.length || 0
    }, 'api');
    return response;
  },
  (error) => {
    if (error.response?.status === 429) {
      logger.warn('Jikan API Rate Limit Atingido', { 
        url: error.config?.url,
        retryAfter: error.response.headers['retry-after'] || 'unknown'
      }, 'api');
    } else {
      logger.error('Jikan API Response Error', { 
        url: error.config?.url,
        status: error.response?.status,
        error: error.message
      }, 'api');
    }
    return Promise.reject(error);
  }
);

export const searchAnimes = async (query, options = {}, canAccessAdultContent = false) => {
  if (!query || query.trim() === '') {
    return { data: [], pagination: { has_next_page: false } };
  }

  const {
    page = 1,
    limit = 25,
    genre = null,
    type = null,
    status = null,
    orderBy = 'popularity',
    sort = 'desc'
  } = options;

  try {
    const params = {
      q: query.trim(),
      sfw: !canAccessAdultContent,
      page,
      limit,
      order_by: orderBy,
      sort
    };

    if (genre) params.genres = genre;
    if (type) params.type = type;
    if (status) params.status = status;

    const response = await makeRequest(`${API_BASE_URL}/anime`, params);

    if (response?.data && Array.isArray(response.data)) {
      const filtered = response.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    logger.error('Erro ao buscar animes:', {
      query,
      error: error.message,
      status: error.response?.status
    }, 'api');
    
    // Return empty result on error
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getTopAnimes = async (options = {}, canAccessAdultContent = false) => {
  const {
    page = 1,
    limit = 10,
    type = 'tv',
    filter = 'bypopularity'
  } = options;

  try {
    const params = {
      sfw: !canAccessAdultContent,
      page,
      limit,
      type,
      filter
    };

    const response = await makeRequest(`${API_BASE_URL}/top/anime`, params);

    if (response?.data && Array.isArray(response.data)) {
      const filtered = response.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    logger.error('Erro ao buscar top animes:', {
      error: error.message,
      status: error.response?.status
    }, 'api');
    
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getSeasonalAnimes = async (options = {}, canAccessAdultContent = false) => {
  const {
    page = 1,
    limit = 10,
    filter = 'tv'
  } = options;

  try {
    const params = {
      sfw: !canAccessAdultContent,
      page,
      limit,
      filter
    };

    const response = await makeRequest(`${API_BASE_URL}/seasons/now`, params);

    if (response?.data && Array.isArray(response.data)) {
      const filtered = response.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    logger.error('Erro ao buscar animes da temporada:', {
      error: error.message,
      status: error.response?.status
    }, 'api');
    
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const getAnimeById = async (id) => {
  if (!id || id <= 0) {
    return null;
  }

  try {
    const response = await makeRequest(`${API_BASE_URL}/anime/${id}`);
    
    if (response?.data && response.data.mal_id) {
      return response.data;
    }
    
    return null;
  } catch (error) {
    logger.error('Erro ao buscar anime por ID:', {
      id,
      error: error.message,
      status: error.response?.status
    }, 'api');
    
    return null;
  }
};

export const getAnimeDetailsById = async (id) => {
  if (!id || id <= 0) {
    throw new Error('ID de anime inválido');
  }

  try {
    // Tentar endpoint /full primeiro para dados mais completos
    const response = await makeRequest(`${API_BASE_URL}/anime/${id}/full`);
    
    if (response?.data) {
      return { data: response.data };
    }
    
    throw new Error('Resposta da API não contém dados válidos');
  } catch (error) {
    logger.warn(`Endpoint /full falhou para anime ${id}, tentando endpoint básico...`, {
      id,
      error: error.message
    }, 'api');
    
    try {
      // Fallback para endpoint básico
      const fallback = await makeRequest(`${API_BASE_URL}/anime/${id}`);
      
      if (fallback?.data) {
        return { data: fallback.data };
      }
      
      throw new Error('Resposta do fallback não contém dados válidos');
    } catch (fallbackError) {
      logger.error(`Falha ao buscar anime ${id}:`, {
        id,
        error: fallbackError.message,
        status: fallbackError.response?.status
      }, 'api');
      
      // Se for rate limit, retornar erro específico
      if (fallbackError.message.includes('Rate limited')) {
        throw new Error(`API temporariamente indisponível. Tente novamente em alguns minutos.`);
      }
      
      if (fallbackError.response?.status === 404) {
        throw new Error(`Anime com ID ${id} não foi encontrado na base de dados.`);
      } else {
        throw new Error(`Não foi possível carregar os detalhes do anime ${id}. Tente novamente mais tarde.`);
      }
    }
  }
};

// Alias functions for backward compatibility
export const getCurrentSeasonAnimes = async (page = 1, limit = 25, canAccessAdultContent = false) => {
  return getSeasonalAnimes({ page, limit }, canAccessAdultContent);
};

export const getTopRatedAnimes = async (page = 1, limit = 25, canAccessAdultContent = false) => {
  return getTopAnimes({ page, limit }, canAccessAdultContent);
};

export const getAnimeGenres = async () => {
  try {
    const response = await makeRequest(`${API_BASE_URL}/genres/anime`);
    return response?.data || [];
  } catch (error) {
    logger.error('Erro ao buscar gêneros:', {
      error: error.message,
      status: error.response?.status
    }, 'api');
    return [];
  }
};

export const getAnimes = async (page = 1, limit = 25, genreId = null, canAccessAdultContent = false) => {
  const params = {
    page,
    limit,
    type: 'tv',
    order_by: 'popularity',
    sort: 'desc'
  };
  
  if (genreId) {
    params.genres = genreId;
  }

  try {
    const response = await makeRequest(`${API_BASE_URL}/anime`, params);

    if (response?.data && Array.isArray(response.data)) {
      const filtered = response.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    logger.error('Erro ao buscar animes:', {
      error: error.message,
      status: error.response?.status
    }, 'api');
    return { data: [], pagination: { has_next_page: false } };
  }
};

export const searchAnimesAdvanced = async (filters = {}, canAccessAdultContent = false) => {
  const {
    query = '',
    page = 1,
    limit = 25,
    genre = null,
    type = null,
    status = null,
    minScore = null,
    maxScore = null,
    orderBy = 'popularity',
    sort = 'desc'
  } = filters;

  try {
    const params = {
      sfw: !canAccessAdultContent,
      page,
      limit,
      order_by: orderBy,
      sort
    };

    if (query && query.trim()) {
      params.q = query.trim();
    }

    if (genre) params.genres = genre;
    if (type) params.type = type;
    if (status) params.status = status;
    if (minScore !== null) params.min_score = minScore;
    if (maxScore !== null) params.max_score = maxScore;

    const response = await makeRequest(`${API_BASE_URL}/anime`, params);

    if (response?.data && Array.isArray(response.data)) {
      const filtered = response.data.filter(item => 
        item?.approved !== false && 
        item?.mal_id && 
        item?.mal_id > 0 &&
        item?.title && 
        item?.title.trim() !== ''
      );
      
      return { 
        ...response, 
        data: filtered 
      };
    }
    
    return { data: [], pagination: { has_next_page: false } };
  } catch (error) {
    logger.error('Erro na busca avançada:', {
      error: error.message,
      status: error.response?.status
    }, 'api');
    return { data: [], pagination: { has_next_page: false } };
  }
};

// Cache management exports
export const clearJikanCache = clearCache;
export const getCacheStats = () => ({
  size: cache.data.size,
  maxSize: cache.maxSize,
  rateLimitState
});
