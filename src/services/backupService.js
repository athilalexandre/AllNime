// Simple backup/restore utilities for localStorage-scoped data of this app

const ANIME_RATING_PREFIX = 'animeRating_';
const LIST_KEYS = [
  'planToWatchList',
  'watchingList',
  'completedList',
  'droppedList',
];
const THEME_KEY = 'theme';

const isBrowser = () => typeof window !== 'undefined' && !!window.localStorage;

export const exportAllData = () => {
  if (!isBrowser()) return null;
  const allKeys = Object.keys(localStorage);
  const ratings = {};
  for (const key of allKeys) {
    if (key.startsWith(ANIME_RATING_PREFIX)) {
      try {
        ratings[key] = JSON.parse(localStorage.getItem(key));
      } catch {
        // ignore malformed entries
      }
    }
  }

  const lists = {};
  for (const listKey of LIST_KEYS) {
    try {
      lists[listKey] = JSON.parse(localStorage.getItem(listKey) || '[]');
    } catch {
      lists[listKey] = [];
    }
  }

  const theme = localStorage.getItem(THEME_KEY) || null;

  return {
    meta: {
      exportedAt: new Date().toISOString(),
      app: 'anime-master',
      version: 1,
    },
    ratings,
    lists,
    theme,
  };
};

export const importAllData = (data, { overwrite = true } = {}) => {
  if (!isBrowser()) return { success: false, error: 'No localStorage' };
  if (!data || typeof data !== 'object') return { success: false, error: 'Invalid data' };

  try {
    // ratings
    if (data.ratings && typeof data.ratings === 'object') {
      for (const [key, value] of Object.entries(data.ratings)) {
        if (!key.startsWith(ANIME_RATING_PREFIX)) continue;
        const exists = localStorage.getItem(key) !== null;
        if (!exists || overwrite) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    }

    // lists
    if (data.lists && typeof data.lists === 'object') {
      for (const listKey of LIST_KEYS) {
        const incoming = Array.isArray(data.lists[listKey]) ? data.lists[listKey] : [];
        if (!overwrite && localStorage.getItem(listKey)) {
          // merge unique numeric ids
          const current = JSON.parse(localStorage.getItem(listKey) || '[]');
          const merged = Array.from(new Set([...current.map(Number), ...incoming.map(Number)]));
          localStorage.setItem(listKey, JSON.stringify(merged));
        } else {
          localStorage.setItem(listKey, JSON.stringify(incoming.map(Number)));
        }
      }
    }

    // theme
    if (typeof data.theme === 'string' && (data.theme === 'light' || data.theme === 'dark')) {
      if (overwrite || !localStorage.getItem(THEME_KEY)) {
        localStorage.setItem(THEME_KEY, data.theme);
      }
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || String(error) };
  }
};


