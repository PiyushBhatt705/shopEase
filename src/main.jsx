import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import CartProvider from "./context/CartContext";
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx';
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Analytics />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
