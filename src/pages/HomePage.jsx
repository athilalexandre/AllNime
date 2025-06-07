// src/pages/HomePage.jsx
import React from 'react';
// Manter a lógica de busca existente aqui (useState, useEffect para searchAnimes, handleSearchChange, etc.)
// Importar Search e Link se a busca for mantida aqui.
import { useState, useEffect } from 'react'; // Para a busca
import { Link } from 'react-router-dom';    // Para a busca
import { Search as SearchIcon } from 'lucide-react'; // Para a busca
import { searchAnimes } from '../services/jikanService'; // Para a busca

import SeasonalAnimeBlock from '../components/features/home/SeasonalAnimeBlock';
import TopRatedAnimeBlock from '../components/features/home/TopRatedAnimeBlock';
import MyTopRatedAnimeBlock from '../components/features/home/MyTopRatedAnimeBlock'; // Adicionar import

const HomePage = () => {
  // Lógica da busca existente (copiada de uma versão anterior do HomePage.jsx)
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

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

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="space-y-10 md:space-y-16">
      {/* Seção de Busca Existente */}
      <section aria-labelledby="search-title">
        <h2 id="search-title" className="sr-only">Buscar Animes</h2> {/* Título para acessibilidade */}
        <div className="w-full max-w-xl mx-auto px-4"> {/* Centralizar busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Digite o nome de um anime..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full p-4 pl-12 rounded-lg shadow-md focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark outline-none bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark transition-colors duration-150"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark" />
          </div>
          {isSearchLoading && <p className="mt-4 text-center text-text-muted-light dark:text-text-muted-dark">Buscando...</p>}
          {searchError && <p className="mt-4 text-center text-red-500">{searchError}</p>}
          {suggestions.length > 0 && !isSearchLoading && (
            <ul className="mt-2 bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden max-h-72 overflow-y-auto">
              {suggestions.map(anime => (
                <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                  <li className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-150">
                    <span className="truncate block" title={anime.title}>{anime.title}</span>
                  </li>
                </Link>
              ))}
            </ul>
          )}
          {!isSearchLoading && !searchError && suggestions.length === 0 && searchTerm.trim() && (
            <p className="mt-4 text-center text-text-muted-light dark:text-text-muted-dark">Nenhuma sugestão encontrada.</p>
          )}
        </div>
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
  );
};
export default HomePage;
