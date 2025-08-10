import React, { useRef, useState } from 'react';
import { Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import { exportAllData, importAllData } from '../services/backupService';
import { useTheme } from '../hooks/useTheme';

const SettingsPage = () => {
  const fileInputRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');
  const { theme, toggleTheme } = useTheme();

  const handleExport = () => {
    const data = exportAllData();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anime-master-backup-${new Date().toISOString().slice(0,10)}.json`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <SettingsIcon size={32} className="text-primary-light dark:text-primary-dark" />
        <h1 className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">Configurações</h1>
      </div>

      <section className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
        <h2 className="text-xl font-semibold text-text-main-light dark:text-text-main-dark">Tema</h2>
        <p className="text-text-muted-light dark:text-text-muted-dark">Tema atual: <strong>{theme}</strong></p>
        <button
          onClick={toggleTheme}
          className="inline-flex items-center bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
        >
          Alternar Tema
        </button>
      </section>

      <section className="p-4 bg-card-light dark:bg-card-dark rounded-lg shadow space-y-3">
        <h2 className="text-xl font-semibold text-text-main-light dark:text-text-main-dark">Backup</h2>
        <p className="text-text-muted-light dark:text-text-muted-dark">Exporte e importe suas avaliações, listas e tema.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            className="flex items-center bg-primary-light hover:bg-opacity-80 dark:bg-primary-dark dark:hover:bg-opacity-80 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
          >
            <Download size={16} className="mr-2" /> Exportar JSON
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-md transition-colors text-sm"
          >
            <Upload size={16} className="mr-2" /> Importar JSON
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportChange} />
        </div>
        {importMessage && (
          <p className="text-sm text-text-muted-light dark:text-text-muted-dark">{importMessage}</p>
        )}
      </section>
    </div>
  );
};

export default SettingsPage;


