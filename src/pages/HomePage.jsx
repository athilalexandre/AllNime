// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
// Manter a lógica de busca existente aqui (useState, useEffect para searchAnimes, handleSearchChange, etc.)
// Importar Search e Link se a busca for mantida aqui.
import { Link } from 'react-router-dom';    // Para a busca
import { Search as SearchIcon } from 'lucide-react'; // Para a busca
import { searchAnimes } from '../services/jikanService'; // Para a busca
import { getManualAnimes, addManualAnime } from '../services/watchlistStorageService';
import { v4 as uuidv4 } from 'uuid';
import { searchAnimesAniList } from '../services/anilistService';

import SeasonalAnimeBlock from '../components/features/home/SeasonalAnimeBlock';
import TopRatedAnimeBlock from '../components/features/home/TopRatedAnimeBlock';
import MyTopRatedAnimeBlock from '../components/features/home/MyTopRatedAnimeBlock'; // Adicionar import
import ManualAnimeModal from '../components/features/home/ManualAnimeModal';

const HomePage = () => {
  // Lógica da busca existente (copiada de uma versão anterior do HomePage.jsx)
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [manualAnimes, setManualAnimes] = useState(getManualAnimes());

  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }
    setIsSearchLoading(true);
    setSearchError(null);
    const timerId = setTimeout(() => {
      searchAnimes(searchTerm)
        .then(data => { setSuggestions(data?.data || []); })
        .catch(err => { console.error("Erro ao buscar animes:", err); setSearchError('Falha ao buscar animes.'); setSuggestions([]); })
        .finally(() => { setIsSearchLoading(false); });
    }, 500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleSearchChange = async (event) => {
    setSearchTerm(event.target.value);
    if (event.target.value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setIsSearchLoading(true);
    setSearchError(null);
    try {
      const results = await searchAnimesAniList(event.target.value.trim());
      setSuggestions(results);
    } catch (e) {
      setSearchError('Erro ao buscar animes na AniList');
    } finally {
      setIsSearchLoading(false);
    }
  };

  const handleAddManualAnime = (anime) => {
    addManualAnime(anime);
    setManualAnimes(getManualAnimes());
    setShowModal(false);
  };

  return (
    <div className="space-y-10 md:space-y-16 min-h-screen flex flex-col justify-between">
      <div>
        <button
          className="mb-6 px-4 py-2 bg-primary-light text-white rounded-lg shadow hover:bg-primary-dark transition-colors font-bold"
          onClick={() => setShowModal(true)}
        >
          Adicionar Anime Manualmente
        </button>
        {showModal && (
          <ManualAnimeModal
            onClose={() => setShowModal(false)}
            onSave={handleAddManualAnime}
          />
        )}
        {manualAnimes.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Meus Animes Cadastrados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {manualAnimes.map(anime => (
                <div key={anime.id} className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <img src={anime.imageUrl} alt={anime.title} className="w-full h-48 object-cover" />
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-primary-light dark:text-primary-dark mb-1 truncate" title={anime.title}>{anime.title}</h3>
                    <div className="my-2">
                      <span className="text-yellow-400 font-bold">{anime.rating}/5</span>
                    </div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-3 flex-grow break-words">
                      Opinião: {anime.opinion || <span className="italic">Nenhuma opinião.</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section aria-labelledby="search-title">
          <h2 id="search-title" className="text-2xl font-bold mb-2">Buscar Animes</h2>
          <div className="flex items-center mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Digite o nome de um anime..."
              className="border border-gray-300 dark:border-gray-600 rounded-l px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
            {isSearchLoading ? (
              <span className="ml-2 animate-spin">🔄</span>
            ) : (
              <button className="bg-primary-light text-white px-4 py-2 rounded-r font-bold hover:bg-primary-dark transition-colors">Buscar</button>
            )}
          </div>
          {searchError && <div className="text-red-500 mb-2">{searchError}</div>}
          {suggestions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {suggestions.map(anime => (
                <div key={anime.id} className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <img src={anime.coverImage?.large} alt={anime.title.romaji} className="w-full h-48 object-cover" />
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-lg font-semibold text-primary-light dark:text-primary-dark mb-1 truncate" title={anime.title.romaji}>{anime.title.romaji}</h3>
                    <div className="my-2">
                      <span className="text-yellow-400 font-bold">{anime.averageScore ? (anime.averageScore/20).toFixed(1) : 'N/A'}/5</span>
                    </div>
                    <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-3 flex-grow break-words">
                      Episódios: {anime.episodes || 'N/A'}<br/>
                      Status: {anime.status || 'N/A'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="seasonal-anime-title">
          <h2 id="seasonal-anime-title" className="text-2xl sm:text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-4 sm:mb-6 px-4 sm:px-0"> {/* px para mobile, reset para desktop se o container do App.jsx não for suficiente */}
            Animes da Temporada
          </h2>
          <SeasonalAnimeBlock />
        </section>

        <section aria-labelledby="top-rated-anime-title" className="mt-10 md:mt-16">
          <h2 id="top-rated-anime-title" className="text-2xl sm:text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-4 sm:mb-6 px-4 sm:px-0">
            Mais Bem Avaliados (Geral)
          </h2>
          <TopRatedAnimeBlock />
        </section>

        <section aria-labelledby="my-top-rated-anime-title" className="mt-10 md:mt-16">
          <h2 id="my-top-rated-anime-title" className="text-2xl sm:text-3xl font-bold text-text-main-light dark:text-text-main-dark mb-4 sm:mb-6 px-4 sm:px-0">
            Meus Favoritos
          </h2>
          <MyTopRatedAnimeBlock />
        </section>
      </div>
      <footer className="bg-card-light dark:bg-card-dark border-t border-gray-200 dark:border-gray-700 mt-10 py-6 text-center text-sm text-text-muted-light dark:text-text-muted-dark shadow-inner">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2 px-4">
          <span>Todos os Direitos Reservados para Athila Alexandre</span>
          <a href="https://github.com/athilalexandre" target="_blank" rel="noopener noreferrer" className="text-primary-light dark:text-primary-dark font-bold hover:underline flex items-center gap-1">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" className="inline-block"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.084-.729.084-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.809 1.304 3.495.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.553 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            github.com/athilalexandre
          </a>
        </div>
      </footer>
    </div>
  );
};
export default HomePage;
