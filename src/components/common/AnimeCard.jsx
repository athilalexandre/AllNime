import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Play, Calendar, TrendingUp } from 'lucide-react';
import { processSynopsis } from '../../services/translationService';
import { useLanguage } from '../contexts/LanguageContext';

const AnimeCard = ({ anime, viewMode = 'grid' }) => {
  const { language } = useLanguage();
  
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://via.placeholder.com/250x350?text=No+Image';
  };

  // Processa a sinopse para remover duplicidades
  const { text: processedSynopsis } = processSynopsis(anime.synopsis, language);

  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
        <div className="flex">
          {/* Imagem */}
          <div className="flex-shrink-0">
            <img
              src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
              alt={anime.title}
              className="w-24 h-32 object-cover"
              onError={handleImageError}
            />
          </div>
          
          {/* Conteúdo */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
                  {anime.title}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {anime.type && (
                    <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {anime.type}
                    </span>
                  )}
                  {anime.episodes && (
                    <span className="flex items-center space-x-1">
                      <Play className="w-4 h-4" />
                      {anime.episodes} eps
                    </span>
                  )}
                  {anime.year && (
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      {anime.year}
                    </span>
                  )}
                </div>
                
                {processedSynopsis && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {processedSynopsis}
                  </p>
                )}
              </div>
              
              {/* Score e Ações */}
              <div className="flex flex-col items-end space-y-2 ml-4">
                {anime.score && (
                  <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-sm font-medium">
                    <Star className="w-4 h-4 fill-current" />
                    {anime.score}
                  </div>
                )}
                
                <Link
                  to={`/anime/${anime.mal_id}`}
                  className="inline-flex items-center space-x-1 px-3 py-2 bg-primary-light hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Ver Detalhes</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View mode grid (padrão)
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 hover:scale-105 group">
      {/* Imagem */}
      <div className="relative">
        <img
          src={anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url}
          alt={anime.title}
          className="w-full h-64 object-cover"
          onError={handleImageError}
        />
        
        {/* Overlay com informações */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
          <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
            <Eye size={24} className="mx-auto mb-2" />
            <span className="text-sm">Ver detalhes</span>
          </div>
        </div>

        {/* Score */}
        {anime.score && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star size={12} fill="currentColor" />
            {anime.score}
          </div>
        )}

        {/* Status */}
        {anime.status && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {anime.status === 'Currently Airing' ? 'Em Exibição' : 
             anime.status === 'Finished Airing' ? 'Finalizado' : 
             anime.status === 'Not yet aired' ? 'Não Exibido' : anime.status}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-2 truncate" title={anime.title}>
          {anime.title}
        </h3>
        
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {anime.type && (
            <p className="capitalize flex items-center space-x-1">
              <Play className="w-3 h-3" />
              {anime.type}
            </p>
          )}
          
          {anime.episodes && (
            <p className="flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              {anime.episodes} episódios
            </p>
          )}
          
          {anime.year && (
            <p className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              {anime.year}
            </p>
          )}
        </div>

        {/* Botão de ação */}
        <div className="mt-3">
          <Link
            to={`/anime/${anime.mal_id}`}
            className="w-full inline-flex items-center justify-center space-x-1 px-3 py-2 bg-primary-light hover:bg-primary-dark text-white text-sm font-medium rounded-md transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver Detalhes</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnimeCard;
