// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
import { getManualAnimes, addManualAnime } from '../services/watchlistStorageService';
import { v4 as uuidv4 } from 'uuid';

import SeasonalAnimeBlock from '../components/features/home/SeasonalAnimeBlock';
import TopRatedAnimeBlock from '../components/features/home/TopRatedAnimeBlock';
import MyTopRatedAnimeBlock from '../components/features/home/MyTopRatedAnimeBlock';
import ManualAnimeModal from '../components/features/home/ManualAnimeModal';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [manualAnimes, setManualAnimes] = useState(getManualAnimes());
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
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
          <form className="flex items-center mb-4" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Digite o nome de um anime..."
              className="border border-gray-300 dark:border-gray-600 rounded-l px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark"
            />
            <button type="submit" className="bg-primary-light text-white px-4 py-2 rounded-r font-bold hover:bg-primary-dark transition-colors">Buscar</button>
          </form>
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
    </div>
  );
};
export default HomePage;
