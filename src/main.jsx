import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
  libraries: ['places', 'marker'],
});

loader.load().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}).catch((e) => {
  console.error('Google Maps API failed to load:', e);
});
