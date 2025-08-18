import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import logger from './services/loggerService.js'

// Log application startup
logger.info('AllNime application starting', {
	version: '1.0.0',
	environment: import.meta.env.MODE,
	timestamp: new Date().toISOString(),
	userAgent: navigator.userAgent,
	url: window.location.href
});

try {
	const root = createRoot(document.getElementById('root'));
	
	root.render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
	
	logger.info('React application rendered successfully');
} catch (error) {
	logger.critical('Failed to render React application', {
		error: error.message,
		stack: error.stack
	});
}
