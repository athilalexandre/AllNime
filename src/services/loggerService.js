/**
 * Advanced Logging Service for AllNime
 * Provides comprehensive logging for debugging and monitoring
 */

class LoggerService {
  constructor() {
    this.logLevels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
      CRITICAL: 4
    };
    
    this.currentLevel = this.logLevels.INFO;
    this.maxLogs = 1000; // Prevent memory leaks
    this.logs = [];
    this.apiCallCounts = {};
    this.apiLimits = {
      'jikan': { limit: 60, window: 60000 }, // 60 calls per minute
      'consumet': { limit: 100, window: 60000 }, // 100 calls per minute
      'firebase': { limit: 1000, window: 60000 } // 1000 calls per minute
    };
    
    this.init();
  }

  init() {
    // Load saved logs from localStorage
    try {
      const savedLogs = localStorage.getItem('allnime_logs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs).slice(-this.maxLogs);
      }
    } catch (error) {
      console.warn('Failed to load saved logs:', error);
    }

    // Set up global error handler
    this.setupGlobalErrorHandling();
    
    // Set up API monitoring
    this.setupAPIMonitoring();
    
    // Log service initialization
    this.info('LoggerService initialized', { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  setupGlobalErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Global JavaScript Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // React error boundary fallback
    if (window.React) {
      window.addEventListener('react-error', (event) => {
        this.error('React Error Boundary', {
          error: event.detail?.error,
          errorInfo: event.detail?.errorInfo,
          componentStack: event.detail?.componentStack
        });
      });
    }
  }

  setupAPIMonitoring() {
    // Monitor API calls and rate limits
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        this.logAPICall(url, response.status, duration, 'success');
        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        this.logAPICall(url, 'error', duration, 'error', error);
        throw error;
      }
    };

    // Monitor Axios calls if available
    if (window.axios) {
      const originalAxios = window.axios;
      window.axios.interceptors.request.use(
        (config) => {
          config.metadata = { startTime: Date.now() };
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      window.axios.interceptors.response.use(
        (response) => {
          const duration = Date.now() - response.config.metadata.startTime;
          this.logAPICall(response.config.url, response.status, duration, 'success');
          return response;
        },
        (error) => {
          const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
          this.logAPICall(error.config?.url, error.response?.status || 'error', duration, 'error', error);
          return Promise.reject(error);
        }
      );
    }
  }

  logAPICall(url, status, duration, result, error = null) {
    const apiName = this.getAPIName(url);
    
    if (!this.apiCallCounts[apiName]) {
      this.apiCallCounts[apiName] = {
        calls: 0,
        lastReset: Date.now(),
        errors: 0,
        totalDuration: 0
      };
    }

    const apiStats = this.apiCallCounts[apiName];
    apiStats.calls++;
    apiStats.totalDuration += duration;

    if (result === 'error') {
      apiStats.errors++;
    }

    // Check rate limits
    const limit = this.apiLimits[apiName];
    if (limit) {
      const timeSinceReset = Date.now() - apiStats.lastReset;
      
      if (timeSinceReset > limit.window) {
        // Reset counter
        apiStats.calls = 1;
        apiStats.lastReset = Date.now();
        apiStats.errors = 0;
        apiStats.totalDuration = duration;
      } else if (apiStats.calls >= limit.limit) {
        this.warn(`API Rate Limit Approaching: ${apiName}`, {
          calls: apiStats.calls,
          limit: limit.limit,
          timeRemaining: limit.window - timeSinceReset,
          url: url
        });
      }
    }

    // Log API call details
    this.debug(`API Call: ${apiName}`, {
      url: url,
      status: status,
      duration: `${duration}ms`,
      result: result,
      totalCalls: apiStats.calls,
      errors: apiStats.errors,
      avgDuration: Math.round(apiStats.totalDuration / apiStats.calls)
    });

    // Save to localStorage periodically
    if (apiStats.calls % 10 === 0) {
      this.saveLogs();
    }
  }

  getAPIName(url) {
    if (typeof url === 'string') {
      if (url.includes('api.jikan.moe')) return 'jikan';
      if (url.includes('consumet')) return 'consumet';
      if (url.includes('firebase')) return 'firebase';
      if (url.includes('googleapis')) return 'firebase';
    }
    return 'unknown';
  }

  log(level, message, data = null, context = '') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: level,
      message: message,
      data: data,
      context: context,
      timestamp: timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add to logs array
    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on level
    const consoleMethod = this.getConsoleMethod(level);
    const prefix = `[${level.toUpperCase()}] [${timestamp}]`;
    
    if (data) {
      console[consoleMethod](`${prefix} ${message}`, data);
    } else {
      console[consoleMethod](`${prefix} ${message}`);
    }

    // Special handling for critical errors
    if (level === 'critical') {
      this.handleCriticalError(logEntry);
    }

    // Save logs periodically
    if (this.logs.length % 50 === 0) {
      this.saveLogs();
    }
  }

  getConsoleMethod(level) {
    switch (level) {
      case 'debug': return 'log';
      case 'info': return 'info';
      case 'warn': return 'warn';
      case 'error': return 'error';
      case 'critical': return 'error';
      default: return 'log';
    }
  }

  handleCriticalError(logEntry) {
    // Send to external monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'critical_error', {
        error_message: logEntry.message,
        error_data: JSON.stringify(logEntry.data),
        page_url: logEntry.url
      });
    }

    // Store in localStorage for debugging
    try {
      const criticalErrors = JSON.parse(localStorage.getItem('allnime_critical_errors') || '[]');
      criticalErrors.push(logEntry);
      localStorage.setItem('allnime_critical_errors', JSON.stringify(criticalErrors.slice(-10)));
    } catch (error) {
      console.warn('Failed to save critical error:', error);
    }
  }

  debug(message, data = null, context = '') {
    if (this.currentLevel <= this.logLevels.DEBUG) {
      this.log('debug', message, data, context);
    }
  }

  info(message, data = null, context = '') {
    if (this.currentLevel <= this.logLevels.INFO) {
      this.log('info', message, data, context);
    }
  }

  warn(message, data = null, context = '') {
    if (this.currentLevel <= this.logLevels.WARN) {
      this.log('warn', message, data, context);
    }
  }

  error(message, data = null, context = '') {
    if (this.currentLevel <= this.logLevels.ERROR) {
      this.log('error', message, data, context);
    }
  }

  critical(message, data = null, context = '') {
    if (this.currentLevel <= this.logLevels.CRITICAL) {
      this.log('critical', message, data, context);
    }
  }

  // Firebase specific logging
  logFirebaseError(error, context = '') {
    this.error('Firebase Error', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      context: context
    }, 'firebase');

    // Special handling for common Firebase errors
    switch (error.code) {
      case 'auth/invalid-api-key':
        this.critical('Firebase API Key Invalid', {
          error: error,
          suggestion: 'Check VITE_FIREBASE_API_KEY environment variable',
          context: context
        }, 'firebase');
        break;
      
      case 'auth/network-request-failed':
        this.warn('Firebase Network Error', {
          error: error,
          suggestion: 'Check internet connection and Firebase project status',
          context: context
        }, 'firebase');
        break;
      
      case 'auth/quota-exceeded':
        this.warn('Firebase Quota Exceeded', {
          error: error,
          suggestion: 'Firebase project quota reached, check Firebase console',
          context: context
        }, 'firebase');
        break;
    }
  }

  // API rate limit warnings
  logAPIRateLimit(apiName, currentCalls, limit) {
    this.warn(`API Rate Limit Warning: ${apiName}`, {
      currentCalls: currentCalls,
      limit: limit,
      percentage: Math.round((currentCalls / limit) * 100),
      suggestion: 'Consider implementing request throttling or caching'
    }, 'api');
  }

  // Performance monitoring
  logPerformance(operation, duration, details = {}) {
    if (duration > 1000) { // Log slow operations (>1s)
      this.warn(`Slow Operation: ${operation}`, {
        duration: `${duration}ms`,
        threshold: '1000ms',
        details: details
      }, 'performance');
    }

    this.debug(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      details: details
    }, 'performance');
  }

  // Save logs to localStorage
  saveLogs() {
    try {
      localStorage.setItem('allnime_logs', JSON.stringify(this.logs));
      localStorage.setItem('allnime_api_stats', JSON.stringify(this.apiCallCounts));
    } catch (error) {
      console.warn('Failed to save logs:', error);
    }
  }

  // Get logs for debugging
  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }

  // Get API statistics
  getAPIStats() {
    return this.apiCallCounts;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.apiCallCounts = {};
    localStorage.removeItem('allnime_logs');
    localStorage.removeItem('allnime_api_stats');
    this.info('Logs cleared');
  }

  // Export logs for debugging
  exportLogs() {
    const exportData = {
      logs: this.logs,
      apiStats: this.apiCallCounts,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `allnime-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Set log level
  setLogLevel(level) {
    if (this.logLevels[level.toUpperCase()] !== undefined) {
      this.currentLevel = this.logLevels[level.toUpperCase()];
      this.info(`Log level changed to: ${level.toUpperCase()}`);
    } else {
      this.warn(`Invalid log level: ${level}`);
    }
  }
}

// Create singleton instance
const logger = new LoggerService();

// Export for use in other modules
export default logger;

// Also export individual methods for convenience
export const {
  debug,
  info,
  warn,
  error,
  critical,
  logFirebaseError,
  logAPIRateLimit,
  logPerformance,
  getLogs,
  getAPIStats,
  clearLogs,
  exportLogs,
  setLogLevel
} = logger;
