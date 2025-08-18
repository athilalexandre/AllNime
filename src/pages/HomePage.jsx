// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MyTopRatedAnimeBlock from '../components/features/home/MyTopRatedAnimeBlock';
import SeasonalAnimeBlock from '../components/features/home/SeasonalAnimeBlock';
import TopRatedAnimeBlock from '../components/features/home/TopRatedAnimeBlock';
import { useAdultContent } from '../hooks/useAdultContent';

const HomePage = () => {
  const { canAccess } = useAdultContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
            AllNime
          </span>
        </h1>
        <p className="max-w-2xl mx-auto mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
          Descubra, organize e acompanhe seus animes favoritos. Uma plataforma completa para gerenciar sua jornada pelo mundo dos animes.
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Descubra Animes</h3>
            <p className="text-gray-600 dark:text-gray-400">Encontre novos animes através de nossa busca avançada e recomendações personalizadas.</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Organize sua Lista</h3>
            <p className="text-gray-600 dark:text-gray-400">Mantenha controle dos animes que está assistindo, planeja assistir ou já completou.</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">Avalie e Comente</h3>
            <p className="text-gray-600 dark:text-gray-400">Compartilhe suas opiniões e veja o que outros usuários pensam sobre os animes.</p>
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-12">
          <SeasonalAnimeBlock />
          <TopRatedAnimeBlock />
          <MyTopRatedAnimeBlock />
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Comece sua jornada hoje
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600 dark:text-gray-400">
            Junte-se à comunidade AllNime e descubra um mundo de animes incríveis.
          </p>
          <div className="mt-8">
            <Link
              to="/explore"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-primary-light hover:bg-primary-dark rounded-md transition-colors"
            >
              Explorar Animes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
