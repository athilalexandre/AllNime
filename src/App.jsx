// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import { LanguageProvider } from './components/contexts/LanguageContext';
import { NotificationProvider } from './components/contexts/NotificationContext';
import HomePage from './pages/HomePage';
import AnimeDetailPage from './pages/AnimeDetailPage';
import EditAnimePage from './pages/EditAnimePage';
import Header from './components/layout/Header';
import MyRatingsPage from './pages/MyRatingsPage';
import PlanToWatchPage from './pages/PlanToWatchPage';
import WatchingPage from './pages/WatchingPage';
import CompletedPage from './pages/CompletedPage';
import DroppedPage from './pages/DroppedPage';
import ExplorePage from './pages/ExplorePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import TestComponent from './components/TestComponent';
import logger from './services/loggerService.js';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log the error
    logger.critical('React Error Boundary Caught Error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href
    });

    // Dispatch custom event for global error handling
    window.dispatchEvent(new CustomEvent('react-error', {
      detail: { error, errorInfo }
    }));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Algo deu errado
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ocorreu um erro inesperado na aplicação. Nossa equipe foi notificada.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Recarregar Página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                  Detalhes do Erro (Dev)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </div>
                  <div className="mt-2">
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global Error Handler
const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', {
      reason: event.reason,
      promise: event.promise
    });
    
    // Prevent the default browser behavior
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    logger.error('Global JavaScript Error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack
    });
  });

  // Handle React errors
  window.addEventListener('react-error', (event) => {
    logger.critical('React Error Boundary Event', {
      error: event.detail?.error,
      errorInfo: event.detail?.errorInfo
    });
  });

  // Handle network errors
  window.addEventListener('offline', () => {
    logger.warn('Application went offline');
  });

  window.addEventListener('online', () => {
    logger.info('Application came back online');
  });

  // Handle visibility change (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      logger.debug('Tab became hidden');
    } else {
      logger.debug('Tab became visible');
    }
  });

  // Handle beforeunload (page refresh/close)
  window.addEventListener('beforeunload', () => {
    logger.info('Page is about to unload', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  });
};

function App() {
  // Setup global error handling
  React.useEffect(() => {
    setupGlobalErrorHandling();
    
    // Log app initialization
    logger.info('App component mounted', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    return () => {
      logger.info('App component unmounting');
    };
  }, []);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/anime/:id" element={<AnimeDetailPage />} />
                  <Route path="/anime/:id/edit" element={<EditAnimePage />} />
                  <Route path="/my-ratings" element={<MyRatingsPage />} />
                  <Route path="/plan-to-watch" element={<PlanToWatchPage />} />
                  <Route path="/watching" element={<WatchingPage />} />
                  <Route path="/completed" element={<CompletedPage />} />
                  <Route path="/dropped" element={<DroppedPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/test" element={<TestComponent />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
            </div>
                      </Router>
          </AuthProvider>
        </LanguageProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
