import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Eye, EyeOff, Settings, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import logger, { getLogs, getAPIStats, clearLogs, exportLogs, setLogLevel } from '../../services/loggerService.js';

const DebugPanel = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('logs');
  const [logLevel, setLogLevelState] = useState('INFO');
  const [logs, setLogsState] = useState([]);
  const [apiStats, setApiStats] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterLevel, setFilterLevel] = useState('all');

  useEffect(() => {
    if (isOpen && autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = () => {
    setLogsState(getLogs(filterLevel === 'all' ? null : filterLevel, 100));
    setApiStats(getAPIStats());
  };

  const handleClearLogs = () => {
    clearLogs();
    refreshData();
  };

  const handleExportLogs = () => {
    exportLogs();
  };

  const handleLogLevelChange = (newLevel) => {
    setLogLevelState(newLevel);
    setLogLevel(newLevel);
    refreshData();
  };

  const getLevelIcon = (level) => {
    switch (level) {
      case 'debug': return <Info className="w-4 h-4 text-blue-500" />;
      case 'info': return <Info className="w-4 h-4 text-green-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-700" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'debug': return 'bg-blue-100 text-blue-800';
      case 'info': return 'bg-green-100 text-green-800';
      case 'warn': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Debug Panel - AllNime
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg ${
                autoRefresh 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
              }`}
              title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            >
              {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={refreshData}
              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
              title="Refresh data"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportLogs}
              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
              title="Export logs"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClearLogs}
              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
              title="Clear logs"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Log Level:
              </label>
              <select
                value={logLevel}
                onChange={(e) => handleLogLevelChange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter:
              </label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {logs.length} logs • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'logs'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'api'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            API Stats
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'system'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            System Info
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'logs' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-2">
                {logs.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No logs available
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        log.level === 'critical' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' :
                        log.level === 'error' ? 'border-red-200 bg-red-50 dark:bg-red-900/10' :
                        log.level === 'warn' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10' :
                        log.level === 'info' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' :
                        'border-gray-200 bg-gray-50 dark:bg-gray-900/10'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {getLevelIcon(log.level)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                              {log.level.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            {log.context && (
                              <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                {log.context}
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {log.message}
                          </div>
                          {log.data && (
                            <details className="text-xs text-gray-600 dark:text-gray-400">
                              <summary className="cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                                Data ({typeof log.data === 'object' ? Object.keys(log.data).length : 1} items)
                              </summary>
                              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-x-auto">
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(apiStats).map(([apiName, stats]) => (
                  <div key={apiName} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                      {apiName} API
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Total Calls:</span>
                        <span className="font-medium">{stats.calls}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                        <span className={`font-medium ${stats.errors > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {stats.errors}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Avg Duration:</span>
                        <span className="font-medium">{Math.round(stats.totalDuration / stats.calls)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Last Reset:</span>
                        <span className="font-medium">{new Date(stats.lastReset).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.keys(apiStats).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-8">
                    No API statistics available
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Browser Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">User Agent:</span>
                      <span className="font-medium max-w-xs truncate" title={navigator.userAgent}>
                        {navigator.userAgent}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Language:</span>
                      <span className="font-medium">{navigator.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Platform:</span>
                      <span className="font-medium">{navigator.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Online:</span>
                      <span className={`font-medium ${navigator.onLine ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {navigator.onLine ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Application Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                      <span className="font-medium">{import.meta.env.MODE}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">URL:</span>
                      <span className="font-medium max-w-xs truncate" title={window.location.href}>
                        {window.location.href}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Viewport:</span>
                      <span className="font-medium">{window.innerWidth} × {window.innerHeight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Local Storage:</span>
                      <span className="font-medium">{localStorage.length} items</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
