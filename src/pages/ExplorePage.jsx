// src/pages/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTopRatedAnimes, getCurrentSeasonAnimes, getAnimes } from '../services/jikanService';
import { useAdultContent } from '../hooks/useAdultContent';
import AnimeCard from '../components/common/AnimeCard';
import { Filter, Grid, List, Search, TrendingUp, Calendar, Star } from 'lucide-react';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('top');
  const { canAccess } = useAdultContent();

  const tabs = [
    { 
      id: 'top', 
      label: 'Top Animes', 
      icon: <Star size={16} />, 
      fetchFunction: (canAccess) => getTopRatedAnimes(1, 50, canAccess)
    },
    { 
      id: 'seasonal', 
      label: 'Animes da Temporada', 
      icon: <Calendar size={16} />, 
      fetchFunction: (canAccess) => getCurrentSeasonAnimes(1, 50, canAccess)
    },
    { 
      id: 'popular', 
      label: 'Animes Populares', 
      icon: <TrendingUp size={16} />, 
      fetchFunction: (canAccess) => getAnimes(1, 50, null, canAccess)
    },
  ];

  useEffect(() => {
    const fetchAnimes = async () => {
      setLoading(true);
      try {
        const activeTabData = tabs.find(tab => tab.id === activeTab);
        if (activeTabData) {
          const response = await activeTabData.fetchFunction(canAccess());
          if (response?.data) {
            setAnimes(response.data);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar animes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [activeTab, canAccess]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSearchParams(prev => ({ ...Object.fromEntries(prev), view: mode }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-light"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Carregando animes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Explorar Animes
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Descubra novos animes através de nossas categorias curadas e recomendações personalizadas.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-light text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-light text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {/* Anime Grid/List */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
          {animes.map((anime) => (
            <AnimeCard
              key={anime.mal_id}
              anime={anime}
              viewMode={viewMode}
            />
          ))}
        </div>

        {/* Empty State */}
        {animes.length === 0 && !loading && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
            <Search className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum anime encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tente ajustar os filtros ou explore outras categorias.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage;
