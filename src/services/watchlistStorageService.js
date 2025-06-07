// src/services/watchlistStorageService.js

const LIST_TYPES = {
  PLAN_TO_WATCH: 'planToWatchList',
  WATCHING: 'watchingList',
  COMPLETED: 'completedList',
  DROPPED: 'droppedList',
};

const getListFromStorage = (listKey) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  const list = localStorage.getItem(listKey);
  try {
    return list ? JSON.parse(list) : [];
  } catch (error) {
    console.error(`Erro ao parsear lista ${listKey} do localStorage:`, error);
    return [];
  }
};

const saveListToStorage = (listKey, list) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    console.warn('LocalStorage não disponível. Não foi possível salvar a lista.');
    return;
  }
  localStorage.setItem(listKey, JSON.stringify(list));
};

// Função interna para remover de uma lista específica, usada por addToWatchlist
const _removeFromSpecificList = (listTypeKey, animeId) => {
    let currentList = getListFromStorage(listTypeKey);
    const numAnimeId = Number(animeId); // Garante que estamos comparando números
    if (currentList.includes(numAnimeId)) {
        currentList = currentList.filter(id => id !== numAnimeId);
        saveListToStorage(listTypeKey, currentList);
    }
};

const addToWatchlist = (listTypeKey, animeId) => {
  if (!Object.values(LIST_TYPES).includes(listTypeKey)) {
    console.error(`Tipo de lista inválido: ${listTypeKey}`);
    return;
  }
  if (typeof animeId !== 'number' && typeof animeId !== 'string') {
    console.error('animeId inválido:', animeId);
    return;
  }
  const numAnimeId = Number(animeId);

  // Remove o anime de qualquer outra lista antes de adicionar à nova
  Object.values(LIST_TYPES).forEach(otherListKey => {
    if (otherListKey !== listTypeKey) {
      _removeFromSpecificList(otherListKey, numAnimeId);
    }
  });

  let currentList = getListFromStorage(listTypeKey);
  if (!currentList.includes(numAnimeId)) {
    // Adiciona no início da lista para que os mais recentes apareçam primeiro
    currentList = [numAnimeId, ...currentList];
    saveListToStorage(listTypeKey, currentList);
  }
};

const removeFromWatchlist = (listTypeKey, animeId) => {
  if (!Object.values(LIST_TYPES).includes(listTypeKey)) {
    console.error(`Tipo de lista inválido: ${listTypeKey}`);
    return;
  }
  if (typeof animeId !== 'number' && typeof animeId !== 'string') {
    console.error('animeId inválido:', animeId);
    return;
  }
  _removeFromSpecificList(listTypeKey, Number(animeId));
};

const isInWatchlist = (listTypeKey, animeId) => {
  if (!Object.values(LIST_TYPES).includes(listTypeKey) || (typeof animeId !== 'number' && typeof animeId !== 'string')) {
    return false;
  }
  const numAnimeId = Number(animeId);
  const currentList = getListFromStorage(listTypeKey);
  return currentList.includes(numAnimeId);
};

const getAnimeWatchlistStatus = (animeId) => {
  if (typeof animeId !== 'number' && typeof animeId !== 'string') return null;
  const numAnimeId = Number(animeId);

  for (const listKey of Object.values(LIST_TYPES)) {
    if (isInWatchlist(listKey, numAnimeId)) {
      // Retorna a chave amigável (ex: "PLAN_TO_WATCH") em vez do valor da lista (ex: "planToWatchList")
      const friendlyKey = Object.keys(LIST_TYPES).find(key => LIST_TYPES[key] === listKey);
      return friendlyKey || null;
    }
  }
  return null; // Retorna null se não estiver em nenhuma lista
};

export {
  LIST_TYPES,
  getListFromStorage, // Exportar se for útil para debug ou outros componentes
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getAnimeWatchlistStatus,
};
