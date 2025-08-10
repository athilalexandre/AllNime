import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Shield, AlertTriangle } from 'lucide-react';
import { getAnimeGenres } from '../../../services/jikanService';
import { useAdultContent } from '../../../hooks/useAdultContent';

const AdvancedSearchForm = ({ onSearch, onClose, isOpen }) => {
  const { canAccess, getRestrictionMessage } = useAdultContent();
  
  const [filters, setFilters] = useState({
    query: '',
    genre: '',
    type: '',
    status: '',
    minScore: '',
    maxScore: '',
    orderBy: 'popularity',
    sort: 'desc',
    includeAdultContent: false
  });
  
  const [genres, setGenres] = useState([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadGenres();
    }
  }, [isOpen]);

  const loadGenres = async () => {
    setIsLoadingGenres(true);
    try {
      const genresData = await getAnimeGenres();
      setGenres(genresData);
    } catch (error) {
      console.error('Erro ao carregar gêneros:', error);
    } finally {
      setIsLoadingGenres(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Limpar valores vazios
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== false)
    );
    
    // Se não pode acessar conteúdo adulto, forçar includeAdultContent como false
    if (!canAccess()) {
      cleanFilters.includeAdultContent = false;
    }
    
    onSearch(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      query: '',
      genre: '',
      type: '',
      status: '',
      minScore: '',
      maxScore: '',
      orderBy: 'popularity',
      sort: 'desc',
      includeAdultContent: false
    });
  };

  if (!isOpen) return null;

  const restrictionMessage = getRestrictionMessage();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter size={20} />
            Busca Avançada
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Query principal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Anime
            </label>
            <input
              type="text"
              name="query"
              value={filters.query}
              onChange={handleInputChange}
              placeholder="Digite o nome do anime..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gênero */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gênero
              </label>
              <select
                name="genre"
                value={filters.genre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoadingGenres}
              >
                <option value="">Todos os gêneros</option>
                {genres.map(genre => (
                  <option key={genre.mal_id} value={genre.mal_id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo
              </label>
              <select
                name="type"
                value={filters.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os tipos</option>
                <option value="tv">TV</option>
                <option value="movie">Filme</option>
                <option value="ova">OVA</option>
                <option value="special">Especial</option>
                <option value="ona">ONA</option>
                <option value="music">Música</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os status</option>
                <option value="airing">Em exibição</option>
                <option value="complete">Completo</option>
                <option value="complete">Finalizado</option>
                <option value="upcoming">Próximos</option>
              </select>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <select
                name="orderBy"
                value={filters.orderBy}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="popularity">Popularidade</option>
                <option value="score">Pontuação</option>
                <option value="title">Título</option>
                <option value="episodes">Episódios</option>
                <option value="rank">Ranking</option>
                <option value="favorites">Favoritos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score mínimo
              </label>
              <input
                type="number"
                name="minScore"
                value={filters.minScore}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                placeholder="0.0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Score máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Score máximo
              </label>
              <input
                type="number"
                name="maxScore"
                value={filters.maxScore}
                onChange={handleInputChange}
                min="0"
                max="10"
                step="0.1"
                placeholder="10.0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Ordem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordem
              </label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="desc">Decrescente</option>
                <option value="asc">Crescente</option>
              </select>
            </div>
          </div>

          {/* Filtro de conteúdo adulto */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="includeAdultContent"
                  checked={filters.includeAdultContent}
                  onChange={handleInputChange}
                  disabled={!canAccess()}
                  className="w-4 h-4 text-primary-light border-gray-300 rounded focus:ring-primary-light dark:focus:ring-primary-dark"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Incluir conteúdo adulto (+18)
                </label>
              </div>
              
              {!canAccess() && (
                <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <AlertTriangle size={16} />
                  <span className="text-xs">{restrictionMessage}</span>
                </div>
              )}
            </div>
            
            {canAccess() && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-6">
                Marque esta opção para incluir animes com conteúdo adulto na busca
              </p>
            )}
          </div>

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary-light hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Buscar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdvancedSearchForm;
