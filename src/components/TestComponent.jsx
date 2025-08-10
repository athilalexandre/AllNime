import React, { useState, useEffect } from 'react';
import { getAnimeDetailsById } from '../services/jikanService';
import { getAnimeWatchInfo } from '../services/consumetService';

const TestComponent = () => {
  const [testResults, setTestResults] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const testJikanAPI = async (id) => {
    try {
      setIsLoading(true);
      const result = await getAnimeDetailsById(id);
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste das APIs</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Teste Jikan API</h2>
          <div className="space-x-2 mb-3">
            <button 
              onClick={() => testJikanAPI('5114')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Testar ID 5114
            </button>
            <button 
              onClick={() => testJikanAPI('185407')}
              disabled={isLoading}
              className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
            >
              Testar ID 185407 (problemático)
            </button>
          </div>
          {testResults.jikan && (
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.jikan, null, 2)}
            </pre>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Teste Consumet API</h2>
          <button 
            onClick={() => testConsumetAPI('Fullmetal Alchemist: Brotherhood')}
            disabled={isLoading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50 mb-3"
          >
            Testar Streaming
          </button>
          {testResults.consumet && (
            <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
              {JSON.stringify(testResults.consumet, null, 2)}
            </pre>
          )}
        </div>

        {isLoading && (
          <div className="text-center text-gray-600">
            Testando APIs...
          </div>
        )}
      </div>
    </div>
  );
};

export default TestComponent;
