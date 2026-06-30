import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Home from './pages/Home'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Products from './pages/Products'
import Category from './pages/CategoryPage'
import Login from './pages/Login'
import SignupPage from './pages/SignupPage'
import Checkout from './pages/Checkout'
import TrackOrder from './pages/TrackOrder'
import Wishlist from './pages/Wishlist'
import Orders from './pages/Orders'
import Settings from './pages/Settings'
import BecomeSeller from './pages/BecomeSeller'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectRoute'

function App() {
  const [deliveryToast, setDeliveryToast] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    const body = document.body;
    body.classList.remove("dark-theme-active", "gold-theme-active");
    if (savedTheme === "dark") {
      body.classList.add("dark-theme-active");
    } else if (savedTheme === "gold") {
      body.classList.add("gold-theme-active");
    }
  }, []);

  // ── Keep-Alive Ping (prevents Render backend from sleeping) ───────────────
  useEffect(() => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";
    const FOURTEEN_MINUTES = 14 * 60 * 1000;

    const ping = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/ping`);
        const data = await res.json();
        console.log(`[Keep-Alive] Backend alive at ${data.time}`);
      } catch {
        // silently ignore – backend might just be waking up
      }
    };

    // Ping once immediately on load, then every 14 minutes
    ping();
    const interval = setInterval(ping, FOURTEEN_MINUTES);
    return () => clearInterval(interval);
  }, []);


  // Global Client-Side Delivery Finished Toast Listener
  useEffect(() => {
    const checkActiveShipments = async () => {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (!userData || !userData.id) return;

      try {
        const res = await fetch(`http://localhost:5000/api/orders/active/${userData.id}`);
        if (!res.ok) return;
        const activeList = await res.json();
        
        // Find if we had any active orders in localStorage that are now missing (meaning they transitioned to delivered)
        const cachedActiveStr = localStorage.getItem("orders_in_transit");
        let cachedActive = [];
        if (cachedActiveStr) {
          cachedActive = JSON.parse(cachedActiveStr);
        }

        // Save current active list for next check
        localStorage.setItem("orders_in_transit", JSON.stringify(activeList.map(o => o.orderId)));

        // If cached list is not empty, check if any order has disappeared
        if (cachedActive.length > 0) {
          const missing = cachedActive.filter(id => !activeList.some(o => o.orderId === id));
          if (missing.length > 0) {
            // Retrieve details of the completed order to show toast
            const dRes = await fetch(`http://localhost:5000/api/orders/delivered/${userData.id}`);
            if (dRes.ok) {
              const deliveredList = await dRes.json();
              const deliveredOrder = deliveredList.find(o => missing.includes(o.orderId));
              if (deliveredOrder) {
                // Map database keys to frontend keys
                const mappedOrder = {
                  ...deliveredOrder,
                  orderId: deliveredOrder.orderId,
                  items: deliveredOrder.items,
                  amount: deliveredOrder.amount,
                  status: "delivered",
                  deliveryDate: deliveredOrder.deliveryDate
                };

                setDeliveryToast(mappedOrder);
                window.dispatchEvent(new Event("ordersChanged"));
                window.dispatchEvent(new Event("activeOrderChanged"));

                // Update activeOrder in localStorage if currently viewed
                const curActiveTracking = JSON.parse(localStorage.getItem("activeOrder"));
                if (curActiveTracking && curActiveTracking.orderId === deliveredOrder.orderId) {
                  localStorage.setItem("activeOrder", JSON.stringify(mappedOrder));
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Client shipments check failed:", err);
      }
    };

    const interval = setInterval(checkActiveShipments, 4000);
    return () => clearInterval(interval);
  }, []);
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
            <Route path="/become-seller" element={<BecomeSeller />} />


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
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/track-order"
              element={
                <ProtectedRoute>
                  <TrackOrder />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>

        </main>

        {/* FOOTER */}
        <Footer />

        {/* Global Delivery Notification Banner */}
        {deliveryToast && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[999] w-full max-w-md px-4 pointer-events-none animate-bounce">
            <div className="bg-emerald-600 border border-emerald-500 rounded-3xl p-5 shadow-2xl flex items-center justify-between gap-4 text-white hover:bg-emerald-700 transition duration-300 pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                  📦
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white">Order Delivered! 🎉</h4>
                  <p className="text-[11px] text-emerald-100 font-semibold pr-4 leading-normal">
                    Your order <span className="font-mono text-white underline">{deliveryToast.orderId.slice(0, 12)}</span> has been successfully delivered!
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setDeliveryToast(null)}
                className="text-white/80 hover:text-white font-black text-sm p-1.5 cursor-pointer bg-white/10 rounded-full flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}

      </div>
    </Router>
  )
}

export default App