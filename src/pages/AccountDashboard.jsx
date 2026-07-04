import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Wallet, ShoppingBag, Heart, Navigation as NavigationIcon, Key, ShieldCheck, ArrowRight, LogOut, CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";
import Toast from "../components/Toast";
import ProductCard from "../components/ProductCard";
import { apiService } from "../services/apiService";

const AccountDashboard = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Check login & user info
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userData = JSON.parse(localStorage.getItem("userData")) || { name: "Guest User", email: "guest@shopease.xyz" };

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Check seller status
    const checkSellerStatus = async () => {
      if (userData && userData.id) {
        try {
          const store = await apiService.seller.getStore(userData.id);
          setIsSeller(!!store);
        } catch (err) {
          console.warn("Seller check failed:", err.message);
        }
      }
    };

    // Fetch Wallet balance
    const fetchWallet = async () => {
      if (userData && userData.id) {
        try {
          const wData = await apiService.user.getWallet(userData.id);
          setWalletBalance(wData.balance || 0);
        } catch (err) {
          console.error("Failed to load wallet balance:", err.message);
        }
      }
    };

    // Fetch catalog products
    const fetchProducts = async () => {
      setLoadingProducts(true);
      let customItems = [];
      let fsItems = [];

      try {
        customItems = await apiService.products.listAll() || [];
      } catch (err) {
        console.error("Failed custom products:", err);
      }

      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        fsItems = (data || []).map(p => ({ ...p, id: `fs_${p.id}`, images: [p.image] }));
      } catch (err) {
        console.error("Failed FakeStoreAPI:", err);
      }

      const combined = [...customItems, ...fsItems];
      const seenIds = new Set();
      const uniqueProducts = [];

      for (const p of combined) {
        if (p && p.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          uniqueProducts.push(p);
        }
      }

      // Sort: Merchant products first
      const sorted = uniqueProducts.sort((a, b) => {
        const isMerchantA = !!(a.sellerId || a.seller_id);
        const isMerchantB = !!(b.sellerId || b.seller_id);
        if (isMerchantA && !isMerchantB) return -1;
        if (!isMerchantA && isMerchantB) return 1;
        return 0;
      });

      setProducts(sorted);
      setFilteredProducts(sorted);
      setLoadingProducts(false);
    };

    checkSellerStatus();
    fetchWallet();
    fetchProducts();

    const checkInterval = setInterval(() => {
      checkSellerStatus();
      fetchWallet();
    }, 2000);
    return () => clearInterval(checkInterval);
  }, [isLoggedIn, navigate]);

  // Handle category filter changes
  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p => {
        const cat = (p.category || "").toLowerCase();
        return cat.includes(selectedCategory.toLowerCase());
      });
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, products]);

  const handleWithdrawFunds = async () => {
    if (walletBalance <= 0) {
      setToast("Wallet balance is currently $0.00 ⚠️");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    try {
      await apiService.user.withdraw(userData.id);
      setWalletBalance(0);
      setToast("Funds withdrawn to bank account successfully! 🏦");
    } catch (err) {
      setToast(err.message || "Withdrawal failed");
    }
    setTimeout(() => setToast(null), 2000);
  };

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    setToast("Logged out successfully! 👋");
    setTimeout(() => {
      navigate("/");
    }, 1200);
  };

  const categoriesList = [
    { id: "all", label: "✨ All Vibes" },
    { id: "clothing", label: "👕 Apparel" },
    { id: "electronics", label: "⚡ Electronics" },
    { id: "jewelery", label: "💎 Bling" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-8 md:px-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 animate-scale-in-dash">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="genz-gradient-text genz-text-glow">Your Control Center 👾</span>
            </h1>
            <p className="text-sm text-slate-400 font-semibold mt-1">Configure your account, check radar tracking, and explore products. No Cap.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-black text-xs px-5 py-3 rounded-2xl cursor-pointer transition-all duration-300 scale-hover"
          >
            <LogOut size={14} />
            <span>LOGOUT SESSION</span>
          </button>
        </div>

        {/* TOP ROW: Profile Overview & Wallet Info */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Profile Overview Card (7 cols) */}
          <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between animate-slide-up-dash" style={{ animationDelay: "100ms" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md">
                  <User size={28} />
                </div>
                <div>
                  <span className="bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-cyan-200 dark:border-cyan-900/60 uppercase tracking-widest">
                    {isSeller ? "verified merchant" : "elite member"}
                  </span>
                  <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1.5">{userData.name}</h3>
                  <p className="text-xs text-slate-400 font-semibold">{userData.email}</p>
                </div>
              </div>
              <div className="hidden sm:block bg-slate-55 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-xl text-right">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">MEMBER SINCE</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300 mt-0.5">July 2026</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-6 pt-5 border-t border-slate-100 dark:border-slate-850">
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Shopper status</span>
                <span className="text-sm font-extrabold text-cyan-500 mt-0.5 block">Tier 1: VIP</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">RADAR RADIS</span>
                <span className="text-sm font-extrabold text-pink-500 mt-0.5 block">GPS Active</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Security Level</span>
                <span className="text-sm font-extrabold text-emerald-500 mt-0.5 block flex items-center justify-center gap-1">
                  <CheckCircle2 size={12} /> Shielded
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Balance Card (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-purple-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between animate-slide-up-dash" style={{ animationDelay: "200ms" }}>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Wallet size={18} className="text-cyan-300" />
                </div>
                <span className="text-xs font-extrabold tracking-widest text-slate-300 uppercase">Available Funds</span>
              </div>
              <span className="bg-white/10 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                radar wallet
              </span>
            </div>

            <div className="my-5">
              <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">BALANCE (USD)</span>
              <h2 className="text-4xl font-black tracking-tight mt-0.5">${walletBalance.toFixed(2)}</h2>
            </div>

            <div className="flex gap-2">
              <Link 
                to="/wallet"
                className="flex-1 bg-white hover:bg-slate-100 text-black font-black text-xs py-3.5 rounded-2xl text-center cursor-pointer transition-all duration-300"
              >
                TOP-UP FUNDS
              </Link>
              {walletBalance > 0 && (
                <button 
                  onClick={handleWithdrawFunds}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs py-3.5 rounded-2xl cursor-pointer transition-all duration-300 shadow-lg shadow-cyan-600/20"
                >
                  WITHDRAW
                </button>
              )}
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: Navigation shortcuts grid */}
        <div className="space-y-4">
          <h3 className="text-lg font-black tracking-wider uppercase text-slate-400 flex items-center gap-1.5 animate-scale-in-dash" style={{ animationDelay: "250ms" }}>
            <Sparkles size={16} className="text-cyan-500" /> Vibe Navigation Radar
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Shortcut 1: My Orders */}
            <Link 
              to="/orders"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-cyan-500 transition-all duration-300 flex justify-between items-center animate-slide-up-dash cursor-pointer"
              style={{ animationDelay: "300ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-2xl group-hover:scale-110 transition duration-300">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 link-underline">Track & Manage Orders</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Check order shipment in transit.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Shortcut 2: Wishlist */}
            <Link 
              to="/wishlist"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-pink-500 transition-all duration-300 flex justify-between items-center animate-slide-up-dash cursor-pointer"
              style={{ animationDelay: "350ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-50 dark:bg-pink-950/30 text-pink-500 dark:text-pink-400 rounded-2xl group-hover:scale-110 transition duration-300">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 link-underline">Saved Wishlist</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your curated shopping aesthetic.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Shortcut 3: Account Hub & Radar */}
            <Link 
              to="/manage-account"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-cyan-500 transition-all duration-300 flex justify-between items-center animate-slide-up-dash cursor-pointer"
              style={{ animationDelay: "400ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-2xl group-hover:scale-110 transition duration-300">
                  <NavigationIcon size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 link-underline">Radar & Addresses</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Edit delivery location using Map picker.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Shortcut 4: Security Settings */}
            <Link 
              to="/settings"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-pink-500 transition-all duration-300 flex justify-between items-center animate-slide-up-dash cursor-pointer"
              style={{ animationDelay: "450ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-50 dark:bg-pink-950/30 text-pink-500 dark:text-pink-400 rounded-2xl group-hover:scale-110 transition duration-300">
                  <Key size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 link-underline">Security & Preferences</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Toggle 2FA alerts, sessions and sounds.</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

            {/* Shortcut 5: Merchant Tools */}
            <Link 
              to="/become-seller"
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 hover:border-cyan-500 transition-all duration-300 flex justify-between items-center animate-slide-up-dash cursor-pointer"
              style={{ animationDelay: "500ms" }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-2xl group-hover:scale-110 transition duration-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200 link-underline">
                    {isSeller ? "Manage Your Products" : "Become a Seller"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isSeller ? "Edit product lists & sales" : "Register a custom brand catalog."}
                  </p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>

          </div>
        </div>

        {/* BOTTOM SECTION: Embedded Product Catalog */}
        <div className="space-y-6 pt-6 animate-scale-in-dash" style={{ animationDelay: "550ms" }}>
          
          {/* Header filters */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
            <div>
              <h2 className="text-2xl font-black">
                <span className="genz-gradient-text genz-text-glow">Explore Shop Vibes 🛒</span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">Quick-shop catalog items directly from your home hub dashboard.</p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer select-none ${
                    selectedCategory === cat.id 
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-black" 
                      : "bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product list renderer */}
          {loadingProducts ? (
            <div className="h-60 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-cyan-500" size={28} />
              <span className="text-xs text-slate-400 font-extrabold tracking-widest uppercase">SCANNING CATALOG TELEMETRY...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12 font-bold">No vibe matches for this category. Check again! ⚠️</p>
          ) : (
            <div className="animate-slide-up-dash">
              <ProductCard products={filteredProducts.slice(0, 8)} gridClass="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default AccountDashboard;
