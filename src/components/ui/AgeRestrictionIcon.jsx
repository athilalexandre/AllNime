import React, { useState, useRef, useEffect } from 'react';
import { Lock, User, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logger from '../../services/loggerService.js';

const AgeRestrictionIcon = ({ className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const iconRef = useRef(null);
  const { user, canAccessAdultContent, signInWithGoogle, loading } = useAuth();

  const getStatusColor = (isBlocked) => {
    return isBlocked ? 'text-red-500' : 'text-green-500';
  };

  const getStatusText = (isBlocked) => {
    return isBlocked ? 'Bloqueado' : 'Liberado';
  };

  const handleMouseEnter = () => {
    setShowTooltip(true);
    logger.debug('Age restriction tooltip shown', { 
      user: !!user, 
      canAccessAdultContent
    }, 'ui');
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className={`relative ${className}`} ref={iconRef}>
      {/* Container principal com login integrado */}
      <div className="flex items-center space-x-2">
        {/* Botão de login */}
        {user ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || 'avatar'} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
            )}
            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
              {user.displayName || 'Usuário'}
            </span>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle} 
            className={`px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md font-medium shadow-sm whitespace-nowrap transition-colors ${
              loading 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            style={{ minWidth: '80px' }}
            disabled={loading}
          >
            {loading ? 'Carregando...' : 'Login Google'}
          </button>
        )}

        {/* Ícone de status de conteúdo */}
        <div
          className="flex items-center space-x-1 p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-help"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          title="Status de Conteúdo e Autenticação"
        >
          {/* Ícone de autenticação */}
          <div className="flex items-center">
            {user ? (
              <User className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-red-600" />
            )}
          </div>

          {/* Ícone de idade */}
          <div className="flex items-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">18</span>
            {!canAccessAdultContent && (
              <AlertTriangle className="w-2.5 h-2.5 text-red-600 ml-0.5" />
            )}
          </div>

          {/* Ícone de informação */}
          <Info className="w-2.5 h-2.5 text-blue-500" />
        </div>
      </div>

      {/* Tooltip - sempre para baixo */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-64 sm:w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-[9999] mt-2">
          {/* Seta do tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-200 dark:border-b-gray-700"></div>
          
          <div className="space-y-2">
            {/* Título */}
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Controle de Conteúdo
              </h3>
            </div>

            {/* Status de autenticação */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Autenticação:
              </span>
              <span className={`text-xs font-medium ${getStatusColor(!user)}`}>
                {user ? 'Logado' : 'Não logado'}
              </span>
            </div>

            {/* Status de conteúdo adulto */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Conteúdo +18:
              </span>
              <span className={`text-xs font-medium ${getStatusColor(!canAccessAdultContent)}`}>
                {getStatusText(!canAccessAdultContent)}
              </span>
            </div>

            {/* Explicação */}
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {user ? (
                canAccessAdultContent ? (
                  "Você tem acesso completo a todos os animes, incluindo conteúdo adulto."
                ) : (
                  "Você está logado, mas não tem acesso a conteúdo adulto. Verifique se é maior de 18 anos."
                )
              ) : (
                "Faça login e verifique se é maior de 18 anos para acessar todos os animes."
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgeRestrictionIcon;
