// Firebase initialization and providers
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import logger, { logFirebaseError } from '../loggerService.js';

// Firebase configuration validation
const validateFirebaseConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingFields = requiredFields.filter(field => !config[field] || config[field].trim() === '');
  
  if (missingFields.length > 0) {
    logger.critical('Firebase Configuration Missing Required Fields', {
      missingFields: missingFields,
      config: {
        hasApiKey: !!config.apiKey,
        hasAuthDomain: !!config.authDomain,
        hasProjectId: !!config.projectId,
        hasAppId: !!config.appId
      },
      suggestion: 'Check environment variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_APP_ID'
    }, 'firebase');
    return false;
  }
  
  // Validate API key format (Firebase API keys are typically 39 characters)
  if (config.apiKey.length < 30) {
    logger.warn('Firebase API Key seems too short', {
      apiKeyLength: config.apiKey.length,
      expectedLength: '39 characters',
      suggestion: 'Verify the API key in Firebase console'
    }, 'firebase');
  }
  
  // In development mode, allow fallback configuration
  if (import.meta.env.DEV && config.apiKey.includes('XXXXXXXXXXXXXXXX')) {
    logger.warn('Using development fallback Firebase configuration', {
      suggestion: 'Configure real Firebase credentials for full functionality'
    }, 'firebase');
  }
  
  return true;
};

// Get Firebase configuration from environment variables
const getFirebaseConfig = () => {
  // Try to get from environment variables first
  let config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  };

  // If environment variables are not set, use development fallback
  if (!config.apiKey || config.apiKey === '') {
    logger.warn('Firebase environment variables not found, using development fallback', {
      environment: import.meta.env.MODE,
      suggestion: 'Create a .env file with your Firebase configuration'
    }, 'firebase');
    
    config = {
      apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      authDomain: "allnime-app.firebaseapp.com",
      projectId: "allnime-app",
      appId: "1:123456789:web:abcdef123456"
    };
  } else {
    logger.info('Firebase environment variables loaded successfully', {
      hasApiKey: !!config.apiKey,
      apiKeyLength: config.apiKey.length,
      authDomain: config.authDomain,
      projectId: config.projectId
    }, 'firebase');
  }

  logger.info('Loading Firebase Configuration', {
    hasApiKey: !!config.apiKey,
    hasAuthDomain: !!config.authDomain,
    hasProjectId: !!config.projectId,
    hasAppId: !!config.appId,
    environment: import.meta.env.MODE,
    usingFallback: !import.meta.env.VITE_FIREBASE_API_KEY
  }, 'firebase');

  return config;
};

// Initialize Firebase with error handling
let app;
let auth;
let googleProvider;

try {
  const firebaseConfig = getFirebaseConfig();
  
  if (!validateFirebaseConfig(firebaseConfig)) {
    throw new Error('Invalid Firebase configuration');
  }

  logger.info('Initializing Firebase App', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
  }, 'firebase');

  app = initializeApp(firebaseConfig);
  
  logger.info('Firebase App initialized successfully', {
    projectId: firebaseConfig.projectId
  }, 'firebase');

  // Initialize Auth
  auth = getAuth(app);
  
  // Configure Auth settings
  auth.useDeviceLanguage();
  auth.settings.appVerificationDisabledForTesting = import.meta.env.DEV;
  
  logger.info('Firebase Auth initialized successfully', {
    useDeviceLanguage: true,
    appVerificationDisabled: import.meta.env.DEV
  }, 'firebase');

  // Initialize Google Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  logger.info('Google Auth Provider configured', {
    scopes: ['email', 'profile']
  }, 'firebase');

} catch (error) {
  logger.critical('Failed to initialize Firebase', {
    error: error.message,
    stack: error.stack,
    suggestion: 'Check Firebase configuration and internet connection'
  }, 'firebase');
  
  // Create fallback objects to prevent app crashes
  app = null;
  auth = null;
  googleProvider = null;
}

// Check if Firebase is properly initialized
const isFirebaseInitialized = () => {
  return app !== null && auth !== null && googleProvider !== null;
};

// Enhanced error handling for Firebase operations
const handleFirebaseError = (error, operation, context = '') => {
  // Ensure error is a valid object
  if (!error || typeof error !== 'object') {
    const fallbackError = new Error('Unknown Firebase error');
    logFirebaseError(fallbackError, `${operation} - ${context}`);
    
    return {
      error: fallbackError,
      userMessage: 'An unexpected error occurred. Please try again.',
      code: 'unknown',
      operation: operation,
      context: context
    };
  }

  logFirebaseError(error, `${operation} - ${context}`);
  
  // Provide user-friendly error messages
  let userMessage = 'An error occurred. Please try again.';
  
  if (error.code) {
    switch (error.code) {
      case 'auth/invalid-api-key':
        userMessage = 'Authentication service unavailable. Please contact support.';
        break;
      case 'auth/network-request-failed':
        userMessage = 'Network error. Please check your internet connection.';
        break;
      case 'auth/popup-closed-by-user':
        userMessage = 'Login cancelled. Please try again.';
        break;
      case 'auth/popup-blocked':
        userMessage = 'Popup blocked. Please allow popups for this site.';
        break;
      case 'auth/unauthorized-domain':
        userMessage = 'This domain is not authorized for authentication.';
        break;
      case 'auth/quota-exceeded':
        userMessage = 'Service temporarily unavailable. Please try again later.';
        break;
    }
  }
  
  return {
    error: error,
    userMessage: userMessage,
    code: error.code || 'unknown',
    operation: operation,
    context: context
  };
};

// Enhanced sign-in function with logging
const enhancedSignInWithPopup = async (context = '') => {
  if (!isFirebaseInitialized()) {
    const error = new Error('Firebase not initialized');
    logger.error('Sign-in attempted before Firebase initialization', {
      error: error.message,
      context: context,
      suggestion: 'Check Firebase configuration and ensure all required environment variables are set'
    }, 'firebase');
    throw error;
  }

  try {
    logger.info('Initiating Google sign-in', { context: context }, 'firebase');
    const startTime = Date.now();
    
    const result = await signInWithPopup(auth, googleProvider);
    const duration = Date.now() - startTime;
    
    logger.info('Google sign-in successful', {
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      },
      duration: `${duration}ms`,
      context: context
    }, 'firebase');
    
    return result;
  } catch (error) {
    const errorInfo = handleFirebaseError(error, 'sign-in', context);
    throw errorInfo;
  }
};

// Enhanced sign-out function with logging
const enhancedSignOut = async (context = '') => {
  if (!isFirebaseInitialized()) {
    const error = new Error('Firebase not initialized');
    logger.error('Sign-out attempted before Firebase initialization', {
      error: error.message,
      context: context,
      suggestion: 'Check Firebase configuration and ensure all required environment variables are set'
    }, 'firebase');
    throw error;
  }

  try {
    logger.info('Initiating sign-out', { context: context }, 'firebase');
    const startTime = Date.now();
    
    await signOut(auth);
    const duration = Date.now() - startTime;
    
    logger.info('Sign-out successful', {
      duration: `${duration}ms`,
      context: context
    }, 'firebase');
  } catch (error) {
    const errorInfo = handleFirebaseError(error, 'sign-out', context);
    throw errorInfo;
  }
};

// Enhanced auth state change listener with logging
const enhancedOnAuthStateChanged = (callback, context = '') => {
  if (!isFirebaseInitialized()) {
    logger.error('Auth state listener attempted before Firebase initialization', {
      context: context,
      suggestion: 'Check Firebase configuration and ensure all required environment variables are set'
    }, 'firebase');
    return () => {}; // Return no-op unsubscribe function
  }

  // Ensure callback is a function
  if (typeof callback !== 'function') {
    logger.error('Invalid callback provided to onAuthStateChanged', {
      callbackType: typeof callback,
      context: context
    }, 'firebase');
    return () => {}; // Return no-op unsubscribe function
  }

  logger.info('Setting up auth state listener', { context: context }, 'firebase');
  
  return onAuthStateChanged(auth, (user) => {
    try {
      if (user) {
        logger.info('User authenticated', {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          context: context
        }, 'firebase');
      } else {
        logger.info('User signed out', { context: context }, 'firebase');
      }
      
      callback(user);
    } catch (error) {
      logger.error('Error in auth state callback', {
        error: error.message,
        context: context
      }, 'firebase');
    }
  }, (error) => {
    const errorInfo = handleFirebaseError(error, 'auth-state-change', context);
    logger.error('Auth state change error', errorInfo, 'firebase');
  });
};

// Health check function
const checkFirebaseHealth = () => {
  if (!app || !auth) {
    return {
      status: 'error',
      message: 'Firebase not initialized',
      details: {
        hasApp: !!app,
        hasAuth: !!auth,
        hasProvider: !!googleProvider
      }
    };
  }

  return {
    status: 'healthy',
    message: 'Firebase is working correctly',
    details: {
      hasApp: !!app,
      hasAuth: !!auth,
      hasProvider: !!googleProvider,
      projectId: app?.options?.projectId,
      authDomain: app?.options?.authDomain
    }
  };
};

// Export enhanced functions
export {
  auth,
  googleProvider,
  enhancedSignInWithPopup as signInWithPopup,
  enhancedSignOut as signOut,
  enhancedOnAuthStateChanged as onAuthStateChanged,
  checkFirebaseHealth
};

// Log Firebase health status on import
if (app && auth) {
  logger.info('Firebase module loaded successfully', {
    health: checkFirebaseHealth()
  }, 'firebase');
} else {
  logger.critical('Firebase module failed to load', {
    health: checkFirebaseHealth()
  }, 'firebase');
}


