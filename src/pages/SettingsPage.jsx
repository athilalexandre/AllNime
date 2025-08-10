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
  const { user, canAccessAdultContent, isUserAdult } = useAuth();

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
              <h3 className="text-lg font-semibold text-text-main-light dark:text-text-main-dark">Privacidade e Segurança</h3>
              <p className="text-text-muted-light dark:text-text-muted-dark">Configure suas preferências de privacidade.</p>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Compartilhar dados de uso</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Permitir cookies</span>
                </label>
                <div className="pt-2">
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    Status de conteúdo adulto: {canAccessAdultContent ? 'Permitido' : 'Restrito'}
                  </p>
                  <p className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    Verificação de idade: {isUserAdult ? 'Verificado' : 'Não verificado'}
                  </p>
                </div>
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
                <div className="space-y-2">
                  <p className="text-text-muted-light dark:text-text-muted-dark">
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p className="text-text-muted-light dark:text-text-muted-dark">
                    <strong>Nome:</strong> {user.displayName || 'Não informado'}
                  </p>
                  <p className="text-text-muted-light dark:text-text-muted-dark">
                    <strong>ID:</strong> {user.uid}
                  </p>
                  <p className="text-text-muted-light dark:text-text-muted-dark">
                    <strong>Conta criada:</strong> {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Não disponível'}
                  </p>
                </div>
              ) : (
                <p className="text-text-muted-light dark:text-text-muted-dark">Nenhum usuário logado</p>
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


