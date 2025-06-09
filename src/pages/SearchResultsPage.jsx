import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchAnimes } from '../services/jikanService';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResultsPage = () => {
  const query = useQuery();
  const searchTerm = query.get('q') || '';
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setError(null);
    searchAnimes(searchTerm)
      .then(data => setResults(data?.data || []))
      .catch(() => setError('Erro ao buscar animes.'))
      .finally(() => setIsLoading(false));
  }, [searchTerm]);

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Resultados para "{searchTerm}"</h1>
      {isLoading && <p className="text-center">Carregando...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      {!isLoading && !error && results.length === 0 && (
        <p className="text-center text-text-muted-light dark:text-text-muted-dark">Nenhum anime encontrado.</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map(anime => (
          <div
            key={anime.mal_id}
            className="bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(`/anime/${anime.mal_id}/edit`)}
          >
            <img src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url} alt={anime.title} className="w-full h-64 object-cover" />
            <div className="p-3">
              <h3 className="text-md font-semibold truncate mb-1" title={anime.title}>{anime.title}</h3>
              <p className="text-xs text-text-muted-light dark:text-text-muted-dark">Episódios: {anime.episodes || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage; 