import React, { useRef, useState } from 'react';
import { Download, Upload, Settings as SettingsIcon, Bell, Globe, Palette, Shield, User, Database, RefreshCw } from 'lucide-react';
import { exportAllData, importAllData } from '../services/backupService';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../components/contexts/useLanguage';
import { useAuth } from '../components/contexts/useAuth';

const SettingsPage = () => {
  const fileInputRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user, canAccessAdultContent, isUserAdult, userAge, logout } = useAuth(); // Modified

  const handleExport = () => {
    const data = exportAllData();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allnime-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = importAllData(json, { overwrite: true });
      if (result.success) {
        setImportMessage('Importação concluída! Atualize as páginas para ver os dados.');
      } else {
        setImportMessage(`Falha na importação: ${result.error || 'Erro desconhecido'}`);
      }
    } catch {
      setImportMessage('Arquivo inválido. Certifique-se de selecionar um backup JSON exportado pelo app.');
    } finally {
      event.target.value = '';
    }
  };

  const handleClearData = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'appearance', label: 'Aparência', icon: Palette },
    { id: 'language', label: 'Idioma', icon: Globe },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database },
    { id: 'account', label: 'Conta', icon: User }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark mb-3">Informações do Sistema</h3>
              <div className="space-y-2 text-sm text-text-muted-light dark:text-text-muted-dark">
                <p>Versão: 1.0.0</p>
                <p>Última atualização: {new Date().toLocaleDateString()}</p>
                <p>Navegador: {navigator.userAgent.split(' ').pop()}</p>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Tema</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Tema atual: <strong>{theme}</strong></p>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
              >
                Alternar Tema
              </button>
            </div>
            
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Personalização</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Configurações de aparência personalizáveis.</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Mostrar animações</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Modo compacto</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Idioma</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Idioma atual: <strong>{language === 'pt' ? 'Português' : 'English'}</strong></p>
              <div className="space-y-2">
                <button
                  onClick={() => setLanguage('pt')}
                  className={`w-full text-left p-2 rounded ${language === 'pt' ? 'bg-primary-light text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  🇧🇷 Português
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full text-left p-2 rounded ${language === 'en' ? 'bg-primary-light text-white' : 'bg-gray-100 dark:bg-gray-700'}`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Notificações</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Configure como e quando receber notificações.</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Notificações do navegador</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Lembretes de avaliação</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Novos episódios</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Recomendações</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Configurações de Privacidade</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Gerencie suas configurações de privacidade e segurança.</p>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Permitir rastreamento de uso para melhorias</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Compartilhar dados anônimos de uso</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Receber notificações sobre atualizações</span>
                </label>
              </div>
            </div>

            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Restrições de Conteúdo</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Configurações relacionadas ao acesso a conteúdo adulto.</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-text-main-light dark:text-text-main-dark mb-2">Status Atual</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${isUserAdult ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {isUserAdult ? 'Usuário Adulto' : 'Usuário Menor de Idade'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${canAccessAdultContent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {canAccessAdultContent ? 'Conteúdo +18 Permitido' : 'Conteúdo +18 Bloqueado'}
                      </span>
                    </div>
                  </div>
                  
                  {userAge && (
                    <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-2">
                      Idade verificada: {userAge} anos
                    </p>
                  )}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Como Funciona</h5>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Usuários não logados não podem acessar conteúdo adulto</li>
                    <li>• Usuários logados precisam ser maiores de 18 anos</li>
                    <li>• A verificação é feita através do perfil do Google</li>
                    <li>• Conteúdo adulto inclui gêneros como Ecchi, Harem, etc.</li>
                  </ul>
                </div>
                
                {!canAccessAdultContent && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Para Acessar Conteúdo Adulto</h5>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                      {!user ? (
                        <>
                          <li>• Faça login com sua conta Google</li>
                          <li>• Verifique se sua data de nascimento está correta no Google</li>
                        </>
                      ) : (
                        <>
                          <li>• Verifique se sua data de nascimento está correta no Google</li>
                          <li>• Certifique-se de que você é maior de 18 anos</li>
                          <li>• Entre em contato com o suporte se necessário</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Gerenciamento de Dados</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Gerencie seus dados e configurações.</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExport}
                  className="flex items-center bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
                >
                  <Download size={16} className="mr-2" /> Exportar Dados
                </button>
                <button
                  onClick={handleImportClick}
                  className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
                >
                  <Upload size={16} className="mr-2" /> Importar Dados
                </button>
                <button
                  onClick={handleClearData}
                  className="flex items-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
                >
                  <RefreshCw size={16} className="mr-2" /> Limpar Dados
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
              </div>
              {importMessage && (
                <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{importMessage}</p>
              )}
            </div>
            
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-muted-light dark:text-text-muted-dark">Animes avaliados</p>
                  <p className="font-semibold">0</p>
                </div>
                <div>
                  <p className="text-text-muted-light dark:text-text-muted-dark">Listas criadas</p>
                  <p className="font-semibold">0</p>
                </div>
                <div>
                  <p className="text-text-muted-light dark:text-text-muted-dark">Tamanho dos dados</p>
                  <p className="font-semibold">0 KB</p>
                </div>
                <div>
                  <p className="text-text-muted-light dark:text-text-muted-dark">Última sincronização</p>
                  <p className="font-semibold">Nunca</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Informações da Conta</h3>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {user.photoURL && (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                      />
                    )}
                    <div>
                      <h4 className="text-lg font-medium text-text-main-light dark:text-text-main-dark">
                        {user.displayName || 'Usuário'}
                      </h4>
                      <p className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        {user.email}
                      </p>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                        Conta criada em: {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('pt-BR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-text-main-light dark:text-text-main-dark mb-2">Status de Idade</h5>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isUserAdult ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                          {isUserAdult ? 'Usuário Adulto' : 'Usuário Menor de Idade'}
                        </span>
                      </div>
                      {userAge && (
                        <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                          Idade: {userAge} anos
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h5 className="font-medium text-text-main-light dark:text-text-main-dark mb-2">Conteúdo Adulto</h5>
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${canAccessAdultContent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                          {canAccessAdultContent ? 'Permitido' : 'Bloqueado'}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted-light dark:text-text-muted-dark mt-1">
                        {canAccessAdultContent 
                          ? 'Você pode acessar conteúdo +18' 
                          : 'Conteúdo +18 não disponível'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={logout}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-text-main-light dark:text-text-main-dark mb-2">
                    Não autenticado
                  </h4>
                  <p className="text-text-muted-light dark:text-text-muted-dark mb-4">
                    Faça login para acessar todas as funcionalidades
                  </p>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Ir para Login
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon size={32} className="text-primary-light dark:text-primary-dark" />
        <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">Configurações</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-light text-white dark:bg-primary-dark'
                    : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default SettingsPage;


