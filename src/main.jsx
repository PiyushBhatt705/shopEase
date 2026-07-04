import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import CartProvider from "./context/CartContext";
import CompareProvider from "./context/CompareContext";
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx';
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <CompareProvider>
          <App />
          <Analytics />
        </CompareProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
