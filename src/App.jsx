import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Products from './pages/Products'
import Category from './pages/CategoryPage'
import Login from './pages/Login'
import SignupPage from './pages/SignupPage'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectRoute'

function App() {
  return (
    <Router>
      <div className="bg-gray-100 min-h-screen flex flex-col justify-between">

        {/* NAVBAR */}
        <Navbar />

        {/* MAIN CONTENT */}
        <main className="flex-grow">

          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category/:id" element={<Category />} />


            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* PROTECTED ROUTE */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
          </Routes>

        </main>

        {/* FOOTER */}
        <Footer />

      </div>
    </Router>
  )
}

export default App