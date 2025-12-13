import React from 'react';
import ReactDOM from 'react-dom/client';
import EstimateForm from './EstimateForm';
import './index.css';

// Main entry point for standalone use
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <EstimateForm />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  rootElement.innerHTML = `
    <div style="padding: 40px; color: white; text-align: center;">
      <h1>Error Loading Form</h1>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      <p>Check the browser console for details.</p>
    </div>
  `;
}

