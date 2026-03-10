import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ─── GLOBAL: Capture beforeinstallprompt BEFORE React mounts ─
// This event fires very early. If we only listen inside a React component,
// we miss it because the component is behind the Intro animation gate.
window.__deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
  console.log('[Florizza] beforeinstallprompt captured globally');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ─── Register Service Worker ─────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated') {
                console.log('[Florizza] Nova versão disponível.');
              }
            });
          }
        });
      })
      .catch(err => console.warn('[Florizza] SW registration failed:', err));
  });
}
