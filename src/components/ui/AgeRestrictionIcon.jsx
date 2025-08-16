import React, { useState } from 'react';
import { Lock, User, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logger from '../../services/loggerService.js';

const AgeRestrictionIcon = ({ className = "" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { user, canAccessAdultContent, signInWithGoogle } = useAuth();

  const getStatusColor = (isBlocked) => {
    return isBlocked ? 'text-red-500' : 'text-green-500';
  };

  const getStatusText = (isBlocked) => {
    return isBlocked ? 'Bloqueado' : 'Liberado';
  };

  const handleLoginClick = async () => {
    try {
      logger.info('Login initiated from age restriction icon', { source: 'age-restriction-icon' }, 'auth');
      await signInWithGoogle();
    } catch (error) {
      logger.error('Login failed from age restriction icon', { 
        error: error.message,
        source: 'age-restriction-icon'
      }, 'auth');
    }
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
    <div className={`relative ${className}`}>
      {/* Ícone principal */}
      <div
        className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title="Status de Conteúdo e Autenticação"
      >
        {/* Ícone de autenticação */}
        <div className="flex items-center space-x-1">
          {user ? (
            <User className="w-4 h-4 text-green-600" />
          ) : (
            <Lock className="w-4 h-4 text-red-600" />
          )}
        </div>

        {/* Ícone de idade */}
        <div className="flex items-center space-x-1">
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">18</span>
          {!canAccessAdultContent && (
            <AlertTriangle className="w-3 h-3 text-red-600" />
          )}
        </div>

        {/* Ícone de informação */}
        <Info className="w-3 h-3 text-blue-500" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 z-50">
          {/* Seta do tooltip */}
          <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
          
          <div className="space-y-3">
            {/* Título */}
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Controle de Conteúdo
              </h3>
            </div>

            {/* Status de autenticação */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Autenticação:
              </span>
              <span className={`text-sm font-medium ${getStatusColor(!user)}`}>
                {user ? 'Logado' : 'Não logado'}
              </span>
            </div>

            {/* Status de conteúdo adulto */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Conteúdo +18:
              </span>
              <span className={`text-sm font-medium ${getStatusColor(!canAccessAdultContent)}`}>
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

            {/* Botão de ação */}
            {!user && (
              <button
                onClick={handleLoginClick}
                className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Fazer Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgeRestrictionIcon;
