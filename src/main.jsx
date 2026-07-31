import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './styles/index.css';

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser.js');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-bg-card)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              padding: '12px 16px',
              boxShadow: 'var(--shadow-lg)',
            },
            success: { iconTheme: { primary: 'var(--color-success)', secondary: 'var(--color-bg-card)' } },
            error:   { iconTheme: { primary: 'var(--color-danger)', secondary: 'var(--color-bg-card)' } },
          }}
        />
      </BrowserRouter>
    </React.StrictMode>
  );
}

bootstrap();
