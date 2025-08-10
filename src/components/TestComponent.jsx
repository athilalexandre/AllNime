import React, { useState, useEffect } from 'react';
import { getAnimeDetailsById } from '../services/jikanService';
import { getAnimeWatchInfo } from '../services/consumetService';
import { animeMappingService } from '../services/animeMappingService';

const TestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testJikanAPI = async (id, title = null) => {
    try {
      setIsLoading(true);
      console.log(`🧪 Testando Jikan API para ID: ${id}, Título: ${title || 'N/A'}`);
      const result = await getAnimeDetailsById(id, title);
      setTestResults(prev => ({
        ...prev,
        jikan: { status: 'success', data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        jikan: { status: 'error', message: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testConsumetAPI = async (title) => {
    try {
      setIsLoading(true);
      const result = await getAnimeWatchInfo(title);
      setTestResults(prev => ({
        ...prev,
        consumet: { status: 'success', data: result }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        consumet: { status: 'error', message: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testMappingService = async () => {
    try {
      setIsLoading(true);
      console.log('🧪 Testando serviço de mapeamento...');
      
      // Testar mapeamento de ID inválido
      const mappedId = await animeMappingService.findAnimeByTitle('Naruto', '185660');
      const stats = animeMappingService.getCacheStats();
      
      setTestResults(prev => ({
        ...prev,
        mapping: { 
          status: 'success', 
          mappedId,
          stats,
          message: `ID mapeado: 185660 → ${mappedId}`
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        mapping: { status: 'error', message: error.message }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    animeMappingService.clearCache();
    setTestResults(prev => ({
      ...prev,
      cache: { status: 'success', message: 'Cache limpo com sucesso!' }
    }));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🧪 Teste de APIs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Teste Jikan API</h2>
          <div className="space-y-2">
            <button
              onClick={() => testJikanAPI('1')}
              disabled={isLoading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Testar ID 1 (Cowboy Bebop)
            </button>
            <button
              onClick={() => testJikanAPI('185660', 'Naruto')}
              disabled={isLoading}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:opacity-50"
            >
              Testar ID Inválido 185660 + Título "Naruto"
            </button>
            <button
              onClick={() => testJikanAPI('5')}
              disabled={isLoading}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Testar ID 5 (Cowboy Bebop Movie)
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Teste Consumet API</h2>
          <div className="space-y-2">
            <button
              onClick={() => testConsumetAPI('Naruto')}
              disabled={isLoading}
              className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Testar "Naruto"
            </button>
            <button
              onClick={() => testConsumetAPI('One Piece')}
              disabled={isLoading}
              className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50"
            >
              Testar "One Piece"
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Teste Serviço de Mapeamento</h2>
        <div className="flex gap-4">
          <button
            onClick={testMappingService}
            disabled={isLoading}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            Testar Mapeamento
          </button>
          <button
            onClick={clearCache}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Limpar Cache
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p>Testando...</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(testResults).map(([key, result]) => (
          <div key={key} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2 capitalize">{key}</h3>
            <div className={`p-3 rounded ${
              result.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-medium">{result.message || 'Teste executado'}</p>
              {result.data && (
                <pre className="mt-2 text-sm overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestComponent;
