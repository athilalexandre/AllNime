// Exemplo de estrutura básica em HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { searchAnimes } from '../services/jikanService';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react'; // Ícone de busca
// import { debounce } from 'lodash'; // Opcional, considerar implementação manual simples primeiro

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce manual simples
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timerId = setTimeout(() => {
      searchAnimes(searchTerm)
        .then(data => {
          setSuggestions(data?.data || []); // Ajustar conforme a estrutura da API Jikan
        })
        .catch(err => {
          console.error("Erro ao buscar animes:", err);
          setError('Falha ao buscar animes. Tente novamente.');
          setSuggestions([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 500); // 500ms de debounce

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center"> {/* Removido bg, text, pt-10 */}
      {/* O título H1 será movido para o Header, conforme passo 7 */}
      <div className="w-full max-w-xl px-4 mt-8"> {/* Adicionado mt-8 para espaçamento se Header não existir ou for simples */}
        <div className="relative">
          <input
            type="text"
            placeholder="Digite o nome de um anime..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-4 pl-12 rounded-lg shadow-md focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark outline-none bg-card-light dark:bg-card-dark text-text-main-light dark:text-text-main-dark transition-colors duration-150"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted-light dark:text-text-muted-dark" />
        </div>
        {isLoading && <p className="mt-4 text-center text-text-muted-light dark:text-text-muted-dark">Buscando...</p>}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>} {/* Manter text-red-500 para erro destacado */}
        {suggestions.length > 0 && !isLoading && (
          <ul className="mt-4 bg-card-light dark:bg-card-dark rounded-lg shadow-lg overflow-hidden">
            {suggestions.map(anime => (
              <Link to={`/anime/${anime.mal_id}`} key={anime.mal_id}>
                <li
                  className="p-4 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer border-b border-gray-200 dark:border-gray-700 last:border-b-0 transition-colors duration-150"
                >
                  {anime.title} {/* Estilo do texto do título do anime já vem do global ou pode ser text-text-main-light/dark se necessário */}
                </li>
              </Link>
            ))}
          </ul>
        )}
        {!isLoading && !error && suggestions.length === 0 && searchTerm.trim() && (
          <p className="mt-4 text-center text-text-muted-light dark:text-text-muted-dark">Nenhuma sugestão encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default HomePage;
