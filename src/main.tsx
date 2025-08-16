import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext.tsx'; // Import our new provider

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/movie-kombat/">
      <MovieProvider>
        <App />
      </MovieProvider>
    </BrowserRouter>
  </StrictMode>
);