// src/components/features/anime-detail/WatchlistControls.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  LIST_TYPES,
  addToWatchlist,
  removeFromWatchlist,
  getAnimeWatchlistStatus
} from '../../../services/watchlistStorageService'; // Ajustar caminho se necessário
import { CheckCircle, PlusCircle, PlayCircle, XCircle, Trash2 } from 'lucide-react'; // Ícones

// Labels e ícones para os botões
const buttonConfig = {
  // Usar as chaves do ENUM LIST_TYPES diretamente aqui se preferir,
  // mas as chaves de objeto como PLAN_TO_WATCH são mais diretas se LIST_TYPES for usado para os valores (nomes das listas no localStorage)
  PLAN_TO_WATCH: { label: 'Planejo Assistir', Icon: PlusCircle, listKey: LIST_TYPES.PLAN_TO_WATCH, activeColor: 'bg-blue-500 hover:bg-blue-600', inactiveColor: 'bg-gray-500 hover:bg-gray-600' },
  WATCHING: { label: 'Assistindo', Icon: PlayCircle, listKey: LIST_TYPES.WATCHING, activeColor: 'bg-green-500 hover:bg-green-600', inactiveColor: 'bg-gray-500 hover:bg-gray-600' },
  COMPLETED: { label: 'Completo', Icon: CheckCircle, listKey: LIST_TYPES.COMPLETED, activeColor: 'bg-purple-500 hover:bg-purple-600', inactiveColor: 'bg-gray-500 hover:bg-gray-600' },
  DROPPED: { label: 'Desisti', Icon: XCircle, listKey: LIST_TYPES.DROPPED, activeColor: 'bg-red-500 hover:bg-red-600', inactiveColor: 'bg-gray-500 hover:bg-gray-600' },
};

const WatchlistControls = ({ animeId }) => {
  const [currentStatus, setCurrentStatus] = useState(null); // Armazena a friendlyKey (ex: "PLAN_TO_WATCH")
  const [isLoading, setIsLoading] = useState(true);

  // Carregar status inicial
  useEffect(() => {
    if (animeId) {
      const numAnimeId = Number(animeId);
      const status = getAnimeWatchlistStatus(numAnimeId); // Retorna friendlyKey ou null
      setCurrentStatus(status);
      setIsLoading(false);
    } else {
      setIsLoading(false); // Se não houver animeId, não há o que carregar
    }
  }, [animeId]);

  const handleListAction = useCallback((listTypeConstant) => { // Recebe a constante da chave, ex: "PLAN_TO_WATCH"
    if (!animeId) return;

    const listStorageKey = LIST_TYPES[listTypeConstant]; // Converte para a chave do localStorage, ex: "planToWatchList"
    const numAnimeId = Number(animeId);

    if (currentStatus === listTypeConstant) {
      removeFromWatchlist(listStorageKey, numAnimeId);
      setCurrentStatus(null);
    } else {
      addToWatchlist(listStorageKey, numAnimeId);
      setCurrentStatus(listTypeConstant);
    }
  }, [animeId, currentStatus]);

  const handleRemoveFromAll = useCallback(() => {
    if (!animeId || !currentStatus) return;
    const currentListStorageKey = LIST_TYPES[currentStatus]; // Converte friendlyKey para storageKey
    const numAnimeId = Number(animeId);
    if (currentListStorageKey) {
        removeFromWatchlist(currentListStorageKey, numAnimeId); // O serviço já garante que remove apenas desta lista
        setCurrentStatus(null);
    }
  }, [animeId, currentStatus]);

  if (isLoading) {
    return <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-6"></div>;
  }

  if (!animeId) return null; // Não renderiza nada se não houver animeId

  return (
    <div className="mt-6 p-4 bg-card-light dark:bg-card-dark rounded-lg shadow">
      <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-3">
        Gerenciar Lista de Acompanhamento
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(buttonConfig).map(([listTypeConstant, config]) => {
          const isActive = currentStatus === listTypeConstant;
          return (
            <button
              key={config.listKey} // Usa a chave do localStorage (valor de LIST_TYPES) para key do React
              onClick={() => handleListAction(listTypeConstant)} // Passa a constante da chave (ex: PLAN_TO_WATCH)
              className={`flex items-center justify-center text-white font-medium py-2 px-3 rounded-md transition-colors duration-150 text-sm
                ${isActive ? config.activeColor : config.inactiveColor}
                focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-card-dark focus:ring-indigo-500`} // Melhorar foco
            >
              <config.Icon size={18} className="mr-2" />
              {config.label}
            </button>
          );
        })}
      </div>
      {currentStatus && ( // Só mostra o botão de remover se estiver em alguma lista
        <button
            onClick={handleRemoveFromAll}
            className="mt-3 w-full flex items-center justify-center text-red-700 dark:text-red-400 hover:text-white dark:hover:text-white hover:bg-red-600 dark:hover:bg-red-500 border border-red-500 dark:border-red-400 font-medium py-2 px-3 rounded-md transition-colors duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-card-dark focus:ring-red-500"
        >
            <Trash2 size={18} className="mr-2" />
            Remover das Listas {/* Texto ajustado para clareza */}
        </button>
      )}
    </div>
  );
};

export default WatchlistControls;
