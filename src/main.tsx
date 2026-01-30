import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/luach-web-base.css';
import './styles/utilities.css';
import './i18n/config'; // Initialize i18n
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
