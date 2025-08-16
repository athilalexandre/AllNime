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
      {/* Ícone principal - mais compacto */}
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

      {/* Tooltip - posicionado acima para não sair da tela */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
          {/* Seta do tooltip */}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200 dark:border-t-gray-700"></div>
          
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

            {/* Botão de ação */}
            {!user && (
              <button
                onClick={handleLoginClick}
                className="w-full px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors"
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
