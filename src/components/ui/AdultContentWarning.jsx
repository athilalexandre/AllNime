import React from 'react';
import { Shield, AlertTriangle, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdultContentWarning = ({ 
  title = "Conteúdo Adulto", 
  message = "Este conteúdo pode não ser adequado para menores de 18 anos.",
  showDetails = true,
  className = "",
  onAction = null,
  actionText = "Entendi"
}) => {
  const { user, canAccessAdultContent, isUserAdult } = useAuth();

  const getStatusColor = () => {
    if (!user) return 'text-red-600 dark:text-red-400';
    if (!canAccessAdultContent) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getStatusIcon = () => {
    if (!user) return <Lock className="w-5 h-5" />;
    if (!canAccessAdultContent) return <AlertTriangle className="w-5 h-5" />;
    return <UserCheck className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!user) return 'Login Necessário';
    if (!canAccessAdultContent) return 'Acesso Restrito';
    return 'Acesso Permitido';
  };

  const getStatusDescription = () => {
    if (!user) return 'Faça login para acessar este conteúdo';
    if (!canAccessAdultContent) return 'Você precisa ser maior de 18 anos';
    return 'Você pode acessar este conteúdo';
  };

  return (
    <div className={`bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center ${getStatusColor()}`}>
            <Shield className="w-5 h-5" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
              {title}
            </h3>
            <div className={`flex items-center space-x-1 text-sm ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
          </div>
          
          <p className="text-red-800 dark:text-red-200 mb-3">
            {message}
          </p>
          
          {showDetails && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-red-200 dark:border-red-700">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">Status do Seu Acesso</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 dark:text-red-300">Autenticação:</span>
                  <span className={`font-medium ${user ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {user ? 'Logado' : 'Não logado'}
                  </span>
                </div>
                
                {user && (
                  <div className="flex items-center justify-between">
                    <span className="text-red-700 dark:text-red-300">Idade:</span>
                    <span className={`font-medium ${isUserAdult ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isUserAdult ? 'Adulto' : 'Menor de idade'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-red-700 dark:text-red-300">Conteúdo +18:</span>
                  <span className={`font-medium ${canAccessAdultContent ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {canAccessAdultContent ? 'Permitido' : 'Bloqueado'}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-red-600 dark:text-red-400 mt-3">
                {getStatusDescription()}
              </p>
            </div>
          )}
          
          {onAction && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={onAction}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {actionText}
              </button>
              
              {!user && (
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Fazer Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdultContentWarning;
