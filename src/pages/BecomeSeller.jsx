import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Briefcase, Award, TrendingUp, Users, CheckCircle, Store, 
  ArrowLeft, Plus, Loader2, DollarSign, Package, Settings, 
  CreditCard, ShoppingBag, Edit3, Trash2, Save, X, 
  Activity, Image as ImageIcon, Check, Calendar, MapPin, ShieldAlert
} from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";
import ProductCard from "../components/ProductCard";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState(null);
  
  // Dashboard tab state
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, inventory, orders, wallet, settings
  const [storeBanner, setStoreBanner] = useState("from-blue-600 via-indigo-650 to-violet-700");
  const [storeBio, setStoreBio] = useState("We deliver high-quality authentic goods with premium packaging and fast shipping.");
  const [inventorySearch, setInventorySearch] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // holds product object when editing
  const [payouts, setPayouts] = useState([]);

  // Seller Form State
  const [sellerForm, setSellerForm] = useState({
    businessName: "",
    gstNumber: "",
    email: "",
    phone: "",
    category: "smartphones"
  });

  // Shop inventory
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", originalPrice: "", stock: "", description: "", images: [], coverImageIndex: 0 });



  const fetchStoreData = useCallback(async () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) {
      setToast("Please log in first to access the seller channel 🔒");
      setTimeout(() => navigate("/login"), 2500);
      setIsLoading(false);
      return;
    }

    try {
      const store = await apiService.seller.getStore(user.id);
      if (store) {
        setStoreDetails(store);
        setIsOnboarded(true);
        setSellerForm({
          businessName: store.businessName || store.business_name || "",
          gstNumber: store.gstin || "",
          email: store.email || "",
          phone: store.phone || "",
          category: store.category || "smartphones"
        });
        
        // Fetch inventory
        const list = await apiService.seller.getInventory(user.id);
        setInventory(list);

        // Fetch wallet balance
        const wData = await apiService.user.getWallet(user.id);
        setWalletBalance(wData.balance || 0);

        // Fetch seller-specific orders
        const ordersData = await apiService.seller.getOrders(user.id);
        setSellerOrders(ordersData || []);
      }
    } catch (err) {
      console.error("Failed to fetch merchant details:", err);
    }
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStoreData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchStoreData]);

  // Real-time synchronization loop to update wallet balance and orders automatically
  useEffect(() => {
    if (!isOnboarded) return;
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;

    const interval = setInterval(async () => {
      try {
        const wData = await apiService.user.getWallet(user.id);
        setWalletBalance(prev => {
          if (wData.balance > prev) {
             setToast(`💵 New Sale Registered! Wallet balance increased to $${wData.balance.toFixed(2)}.`);
             setTimeout(() => setToast(""), 3000);
          }
          return wData.balance || 0;
        });

        const ordersData = await apiService.seller.getOrders(user.id);
        setSellerOrders(ordersData || []);
      } catch (err) {
        console.error("Live statistics sync failed:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOnboarded]);

  useEffect(() => {
    const saved = localStorage.getItem("merchantPayouts");
    if (saved) {
      setTimeout(() => {
        setPayouts(JSON.parse(saved));
      }, 0);
    }
  }, []);

  // Simulate automated payout settlement transition from Processing -> Settled
  useEffect(() => {
    const hasProcessing = payouts.some(p => p.status === "processing");
    if (!hasProcessing) return;

    const timer = setTimeout(() => {
      const updated = payouts.map(p => {
        if (p.status === "processing") {
          return { ...p, status: "settled" };
        }
        return p;
      });
      setPayouts(updated);
      localStorage.setItem("merchantPayouts", JSON.stringify(updated));
      setToast("Payout settlement completed! Funds successfully credited to your bank account. 🟢");
      setTimeout(() => setToast(""), 3000);
    }, 10000);

    return () => clearTimeout(timer);
  }, [payouts]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!sellerForm.businessName.trim() || !sellerForm.email.trim() || !sellerForm.phone.trim()) {
      setToast("Please fill in all required seller details ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;

    setIsLoading(true);
    try {
      const payoutId = "PAY_" + Math.floor(1000000 + Math.random() * 9000000);
      const storeData = {
        ownerId: user.id,
        businessName: sellerForm.businessName,
        email: sellerForm.email,
        phone: sellerForm.phone,
        category: sellerForm.category,
        gstin: sellerForm.gstNumber || "GST-UNREGISTERED",
        payoutId: payoutId
      };

      const store = await apiService.seller.registerStore(storeData);
      setStoreDetails(store || storeData);
      setIsOnboarded(true);
      setToast("Seller Shop onboarding successful! 🚀 Welcome to ShopEase Partners.");
      
      await fetchStoreData();
    } catch (err) {
      setToast(err.message || "Failed to register store");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (newItem.images.length + files.length > 10) {
      setToast("You can only upload a maximum of 10 images ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const readers = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(base64Images => {
      setNewItem(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images].slice(0, 10)
      }));
    });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price || !newItem.stock || newItem.images.length === 0 || !newItem.description.trim()) {
      setToast("Please enter all required specifications, a description, and images ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    if (newItem.images.length < 2) {
      setToast("You must provide at least 2 images for your product ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;

    setIsLoading(true);
    try {
      const finalImages = [...newItem.images];
      if (newItem.coverImageIndex > 0 && newItem.coverImageIndex < finalImages.length) {
        const cover = finalImages.splice(newItem.coverImageIndex, 1)[0];
        finalImages.unshift(cover);
      }

      const productData = {
        id: "custom_" + Date.now(),
        title: newItem.name,
        price: parseFloat(newItem.price),
        originalPrice: newItem.originalPrice ? parseFloat(newItem.originalPrice) : parseFloat(newItem.price),
        stock: parseInt(newItem.stock),
        description: newItem.description,
        category: sellerForm.category || "general",
        images: finalImages,
        sellerId: user.id,
        seller_id: user.id
      };

      await apiService.products.create(productData);
      setNewItem({ name: "", price: "", originalPrice: "", stock: "", description: "", images: [], coverImageIndex: 0 });
      setToast("Product listed live in global catalog! 📦");

      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      console.error("Add item error:", err);
      setToast("Failed to list product in catalog");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  const handleDeleteItem = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from the live catalog?")) return;
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem("userData"));
    try {
      await apiService.seller.deleteProduct(productId);
      setToast("Product unlisted 🗑️");

      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      console.error("Delete item error:", err);
      setToast("Failed to unlist product");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  // Update Inventory details (Price & Stock)
  const handleEditProductClick = (product) => {
    setEditingProduct({
      ...product,
      editPrice: product.price,
      editStock: product.stock,
      editTitle: product.title,
      editDescription: product.description
    });
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem("userData"));
    try {
      const updateData = {
        title: editingProduct.editTitle,
        description: editingProduct.editDescription,
        price: parseFloat(editingProduct.editPrice),
        stock: parseInt(editingProduct.editStock)
      };

      await apiService.products.update(editingProduct.id, updateData);
      setToast("Product inventory details updated! 💾");
      setEditingProduct(null);

      // Refresh Inventory
      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      console.error("Update product error:", err);
      setToast("Failed to update product details");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  // Withdraw funds from Wallet
  const handleWithdrawFunds = async () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user || walletBalance <= 0) return;

    setIsLoading(true);
    try {
      const withdrawAmount = walletBalance;
      await apiService.user.withdraw(user.id);
      setWalletBalance(0);

      // Create new persistent payout statement record
      const newPayout = {
        referenceId: "WTH_" + Math.floor(10000000 + Math.random() * 90000000),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        method: "ACH Bank Wire",
        amount: withdrawAmount,
        status: "processing",
        timestamp: Date.now()
      };

      const updated = [newPayout, ...payouts];
      setPayouts(updated);
      localStorage.setItem("merchantPayouts", JSON.stringify(updated));

      setToast("Settlement initiated! Funds successfully dispatched to payout account. 🏦");
      window.dispatchEvent(new Event("walletUpdate"));
    } catch (err) {
      console.error("Withdraw error:", err);
      setToast("Failed to withdraw funds");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  // Add demo funds to user wallet for testing purposes
  const handleAddDemoFunds = async () => {
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await apiService.user.deposit(user.id, 250);
      setWalletBalance(res.balance || 250);
      setToast("Demo Funds ($250.00) successfully added to your merchant wallet! 💵");
      window.dispatchEvent(new Event("walletUpdate"));
    } catch (err) {
      console.error("Deposit error:", err);
      setToast("Failed to add demo funds");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  // Update merchant fulfillment order status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem("userData"));
    try {
      await apiService.seller.updateOrderStatus(orderId, newStatus);
      setToast(`Order status marked as: ${newStatus.toUpperCase()} 📦`);
      
      // Refresh Orders and Wallet
      const ordersData = await apiService.seller.getOrders(user.id);
      setSellerOrders(ordersData || []);
      const wData = await apiService.user.getWallet(user.id);
      setWalletBalance(wData.balance || 0);
    } catch (err) {
      console.error("Fulfillment error:", err);
      setToast("Failed to update order status");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  if (isLoading && inventory.length === 0 && !isOnboarded) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-650 font-semibold">Loading merchant panel...</p>
      </div>
    );
  }

  // Calculate Metrics
  const activeProductsCount = inventory.length;
  
  const totalRevenue = sellerOrders
    .reduce((sum, o) => {
      const user = JSON.parse(localStorage.getItem("userData"));
      const merchantItems = o.items.filter(i => (i.sellerId === user?.id || i.seller_id === user?.id));
      const orderRevenue = merchantItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
      return sum + orderRevenue;
    }, 0);

  const unitsSold = sellerOrders.reduce((sum, o) => {
    const user = JSON.parse(localStorage.getItem("userData"));
    const merchantItems = o.items.filter(i => (i.sellerId === user?.id || i.seller_id === user?.id));
    const qty = merchantItems.reduce((s, i) => s + (i.quantity || 1), 0);
    return sum + qty;
  }, 0);

  const lowStockCount = inventory.filter(p => p.stock <= 5).length;

  const filteredInventory = inventory.filter(item => 
    item.title.toLowerCase().includes(inventorySearch.toLowerCase()) || 
    (item.category || "").toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Back button */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-650 hover:text-black mb-6 font-semibold transition cursor-pointer scale-hover"
      >
        <ArrowLeft size={16} />
        Back to Marketplace
      </button>

      {/* Store Header Banner */}
      <div className={`relative rounded-3xl overflow-hidden mb-8 shadow-md bg-gradient-to-r ${storeBanner} p-6 md:p-10 text-white transition-all duration-500`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Store size={220} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-white/20 text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider backdrop-blur-xs">
                {isOnboarded ? "ShopEase Partner" : "New Merchant"}
              </span>
              {isOnboarded && (
                <span className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm">
                  <CheckCircle size={12} /> Active Store
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">
              {isOnboarded ? (storeDetails?.businessName || sellerForm.businessName) : "Become a Verified Seller"}
            </h1>
            <p className="text-white/80 max-w-xl text-sm leading-relaxed font-medium">
              {isOnboarded ? storeBio : "Scale your brand by listing stocks in the global catalog with 0% commissions and weekly payment settlements."}
            </p>
          </div>
          {isOnboarded && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col items-start gap-1 font-mono text-xs shadow-lg">
              <div><span className="text-white/60 font-bold uppercase tracking-wider text-[10px]">Merchant Payout ID:</span></div>
              <div className="text-white font-extrabold text-sm">{storeDetails?.payoutId || storeDetails?.payout_id}</div>
              <div className="mt-2 text-[10px] text-white/70">Verified Settlements Connected</div>
            </div>
          )}
        </div>
      </div>

      {!isOnboarded ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Pitch Section */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Why sell on ShopEase?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs hover:shadow-md transition">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Briefcase size={20} />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">0% Commission</h4>
                <p className="text-sm text-gray-500">Keep 100% of your earnings. No hidden transaction cuts or listings fees.</p>
              </div>

              <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs hover:shadow-md transition">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp size={20} />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">Massive Audience</h4>
                <p className="text-sm text-gray-500">Get your products displayed directly to search result lists and flash deals.</p>
              </div>

              <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs hover:shadow-md transition">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                  <Users size={20} />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">Direct Settlement</h4>
                <p className="text-sm text-gray-500">Fast weekly payouts directly into your bank payout channel automatically.</p>
              </div>

              <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-xs hover:shadow-md transition">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <Award size={20} />
                </div>
                <h4 className="font-bold text-gray-800 text-base mb-1">Merchant Protections</h4>
                <p className="text-sm text-gray-500">Full control over stock numbers, shipping status tags, and pricing discounts.</p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl text-white shadow-lg flex items-center gap-4">
              <div className="text-3xl">🚀</div>
              <div>
                <h3 className="font-extrabold text-lg mb-0.5">Start listing in 5 minutes</h3>
                <p className="text-xs text-blue-100 leading-relaxed">Fill out the register console. Once accepted, add custom stocks to see them load live in search filters!</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
            <h3 className="text-xl font-extrabold text-gray-900 mb-6">Register Merchant Store</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="Apparel Co. / Gadget Shop"
                  value={sellerForm.businessName}
                  onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={sellerForm.gstNumber}
                  onChange={(e) => setSellerForm({ ...sellerForm, gstNumber: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Email</label>
                <input
                  type="email"
                  required
                  placeholder="partners@yourbrand.com"
                  value={sellerForm.email}
                  onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 555-0199"
                  value={sellerForm.phone}
                  onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Category Focus</label>
                <select
                  value={sellerForm.category}
                  onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                  className="form-input cursor-pointer"
                >
                  <option value="smartphones">Smartphones & Mobiles</option>
                  <option value="laptops">Laptops & Computers</option>
                  <option value="mens-shirts">Clothing & Apparel</option>
                  <option value="mens-shoes">Shoes & Footwear</option>
                  <option value="beauty">Cosmetics & Beauty</option>
                  <option value="furniture">Furniture & Decor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 text-sm scale-hover shadow-md btn-glow"
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Activate Partner Console"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 overflow-x-auto gap-1 text-sm font-semibold text-gray-500 whitespace-nowrap scrollbar-none">
            <button 
              onClick={() => { setActiveTab("dashboard"); setEditingProduct(null); }}
              className={`pb-4 px-6 border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === "dashboard" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              <Activity size={16} /> Dashboard Overview
            </button>
            <button 
              onClick={() => { setActiveTab("inventory"); setEditingProduct(null); }}
              className={`pb-4 px-6 border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === "inventory" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              <Package size={16} /> Products & Inventory
            </button>
            <button 
              onClick={() => { setActiveTab("orders"); setEditingProduct(null); }}
              className={`pb-4 px-6 border-b-2 transition cursor-pointer flex items-center gap-2 relative ${activeTab === "orders" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              <ShoppingBag size={16} /> Orders & Fulfillment
              {sellerOrders.filter(o => o.status !== "delivered").length > 0 && (
                <span className="absolute top-0 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              )}
            </button>
            <button 
              onClick={() => { setActiveTab("wallet"); setEditingProduct(null); }}
              className={`pb-4 px-6 border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === "wallet" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              <CreditCard size={16} /> Payouts & Wallet
            </button>
            <button 
              onClick={() => { setActiveTab("settings"); setEditingProduct(null); }}
              className={`pb-4 px-6 border-b-2 transition cursor-pointer flex items-center gap-2 ${activeTab === "settings" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-500 hover:text-gray-900"}`}
            >
              <Settings size={16} /> Store Settings
            </button>
          </div>

          {/* TAB CONTENTS */}
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-slide-up">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Revenue</p>
                    <p className="text-2xl font-black text-gray-900">${totalRevenue.toFixed(2)}</p>
                    <p className="text-[10px] text-green-500 font-bold">100% Margin Settled</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <DollarSign size={22} />
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Wallet Balance</p>
                    <p className="text-2xl font-black text-gray-900">${walletBalance.toFixed(2)}</p>
                    <p className="text-[10px] text-blue-500 font-bold">Available to withdraw</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <CreditCard size={22} />
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Products</p>
                    <p className="text-2xl font-black text-gray-900">{activeProductsCount}</p>
                    <p className="text-[10px] text-gray-500 font-medium">In global search catalog</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Package size={22} />
                  </div>
                </div>

                <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Sales Units</p>
                    <p className="text-2xl font-black text-gray-900">{unitsSold} Items</p>
                    <p className="text-[10px] text-amber-500 font-bold">{lowStockCount} Low stock alerts</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                    <ShoppingBag size={22} />
                  </div>
                </div>
              </div>

              {/* Analytics Section - Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sales Performance Chart (SVG Line Graph) */}
                <div className="lg:col-span-8 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-black text-gray-800">Sales Trend Analytics</h3>
                      <p className="text-xs text-gray-400 font-medium">Weekly store sales performance and conversion revenue</p>
                    </div>
                    <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-wider">
                      Weekly Update
                    </span>
                  </div>

                  {/* SVG line chart */}
                  <div className="relative h-64 w-full">
                    <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="5,5" />
                      <line x1="0" y1="160" x2="500" y2="160" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="5,5" />

                      {/* Line Paths */}
                      <path 
                        d="M 10 160 Q 90 120 170 140 T 330 60 T 490 30" 
                        fill="none" 
                        stroke="#2563EB" 
                        strokeWidth="3.5" 
                        strokeLinecap="round" 
                      />
                      <path 
                        d="M 10 160 Q 90 120 170 140 T 330 60 T 490 30 L 490 200 L 10 200 Z" 
                        fill="url(#sales-gradient)" 
                      />

                      {/* Dots and Labels */}
                      <circle cx="10" cy="160" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="90" cy="120" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="170" cy="140" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="250" cy="100" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="330" cy="60" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="410" cy="50" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="490" cy="30" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-bold px-2 mt-4 uppercase tracking-wider">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* Store Traffic / Conversion Stats (4 cols) */}
                <div className="lg:col-span-4 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 mb-1">Conversion funnel</h3>
                    <p className="text-xs text-gray-400 font-medium mb-6">Customer catalog interaction trends</p>

                    <div className="space-y-4">
                      {/* Funnel 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Store Page Views</span>
                          <span className="text-gray-800">4,284 visitors</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>

                      {/* Funnel 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Product Card Clicks</span>
                          <span className="text-gray-800">1,948 clicks</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{width: '45%'}}></div>
                        </div>
                      </div>

                      {/* Funnel 3 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Added to Cart</span>
                          <span className="text-gray-800">328 users</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{width: '18%'}}></div>
                        </div>
                      </div>

                      {/* Funnel 4 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-gray-500">Successful Purchases</span>
                          <span className="text-gray-800">{unitsSold} orders</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{width: '10%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 mt-6 flex items-center justify-between text-xs font-bold text-gray-500">
                    <span>Average Conversion Rate</span>
                    <span className="text-emerald-600 text-sm font-extrabold">+2.4%</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-black text-gray-800 mb-6">Recent Store Activity</h3>
                <div className="space-y-4">
                  {sellerOrders.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm font-medium">
                      No customer transactions logged yet. Listed products will show analytics once orders roll in.
                    </div>
                  ) : (
                    sellerOrders.slice(0, 5).map((o, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                            🛍️
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              Order placed by customer for ${o.amount.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold uppercase">
                              Order: {o.orderId.slice(0, 14)}... | Status: {o.status.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(o.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & PRODUCTS */}
          {activeTab === "inventory" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
              {/* Product Listing List (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-lg font-black text-gray-800">Listed Products</h3>
                    <p className="text-xs text-gray-400 font-medium">Manage price, stocks, and details of custom items live</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full sm:w-48 pl-3 pr-3 py-2 bg-gray-100 hover:bg-gray-50 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 font-semibold"
                  />
                </div>

                {filteredInventory.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 text-sm font-medium border border-dashed rounded-2xl">
                    No custom products match search criteria. List new items using the console.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredInventory.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition bg-gray-50/50">
                        <div className="flex gap-3">
                          {item.images && item.images[0] ? (
                            <img src={item.images[0]} className="w-12 h-12 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200 flex-shrink-0"><ImageIcon size={18} /></div>
                          )}
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{item.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.category}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">
                              Price: <span className="text-green-600">${item.price}</span> | Stock: <span className="text-gray-700 font-extrabold">{item.stock} units</span>
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleEditProductClick(item)}
                            className="flex-1 sm:flex-initial text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer scale-hover bg-blue-50 border border-blue-100 hover:bg-blue-100 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="flex-1 sm:flex-initial text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer scale-hover bg-red-50 border border-red-100 hover:bg-red-100 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add / Edit Form Pane (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {editingProduct ? (
                  // EDIT INVENTORY PANEL
                  <div className="bg-white border-2 border-blue-500 rounded-3xl p-6 shadow-md space-y-4 animate-scale-in">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <div className="flex items-center gap-2">
                        <Edit3 className="text-blue-600" size={18} />
                        <h3 className="font-black text-gray-900 text-base">Quick Inventory Update</h3>
                      </div>
                      <button 
                        onClick={() => setEditingProduct(null)} 
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProduct} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Title</label>
                        <input
                          type="text"
                          required
                          value={editingProduct.editTitle}
                          onChange={(e) => setEditingProduct({ ...editingProduct, editTitle: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                          required
                          value={editingProduct.editDescription}
                          onChange={(e) => setEditingProduct({ ...editingProduct, editDescription: e.target.value })}
                          className="form-input min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price ($)</label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={editingProduct.editPrice}
                            onChange={(e) => setEditingProduct({ ...editingProduct, editPrice: e.target.value })}
                            className="form-input border-blue-200 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Qty</label>
                          <input
                            type="number"
                            required
                            value={editingProduct.editStock}
                            onChange={(e) => setEditingProduct({ ...editingProduct, editStock: e.target.value })}
                            className="form-input border-blue-200 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                        >
                          <Save size={14} /> Update Inventory
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingProduct(null)}
                          className="flex-1 bg-gray-100 hover:bg-gray-250 text-gray-700 font-bold py-2.5 rounded-xl cursor-pointer transition text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  // ADD NEW PRODUCT PANEL
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                    <h3 className="font-black text-gray-800 text-base uppercase tracking-wider mb-2 border-b pb-3">List New Product</h3>
                    <form onSubmit={handleAddItem} className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Vintage Leather Watch Strap"
                          value={newItem.name}
                          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                          className="form-input"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                        <textarea
                          required
                          placeholder="Provide a detailed description of your product..."
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          className="form-input min-h-[80px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price ($)</label>
                          <input
                            type="number"
                            required
                            placeholder="29"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Original Price ($)</label>
                          <input
                            type="number"
                            placeholder="39 (Optional)"
                            value={newItem.originalPrice}
                            onChange={(e) => setNewItem({ ...newItem, originalPrice: e.target.value })}
                            className="form-input"
                          />
                        </div>

                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Qty</label>
                          <input
                            type="number"
                            required
                            placeholder="50"
                            value={newItem.stock}
                            onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Images (Min 2, Max 10)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="form-input text-xs"
                        />
                        {newItem.images.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-emerald-600 font-bold">{newItem.images.length} image(s) loaded.</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cover Image</p>
                            </div>
                            <div className="grid grid-cols-5 gap-2">
                              {newItem.images.map((img, idx) => (
                                <div 
                                  key={idx} 
                                  onClick={() => setNewItem({ ...newItem, coverImageIndex: idx })}
                                  className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all ${idx === (newItem.coverImageIndex || 0) ? 'border-blue-600 shadow-md scale-95' : 'border-transparent opacity-80'}`}
                                >
                                  <img src={img} className="w-full h-full object-cover" />
                                  {idx === (newItem.coverImageIndex || 0) && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] px-1 rounded-bl-md font-bold">COVER</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm text-xs btn-glow scale-hover"
                      >
                        <Plus size={14} />
                        <span>List Product Live</span>
                      </button>
                    </form>

                    {/* Compact preview */}
                    <div className="border-t border-gray-100 pt-4 mt-2">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Card Live Preview</h4>
                      <div className="bg-gray-50 rounded-2xl p-4 border flex justify-center">
                        <div className="w-full max-w-[200px] pointer-events-none scale-90">
                          <ProductCard
                            gridClass="grid-cols-1"
                            products={[{
                              id: 'preview',
                              title: newItem.name || 'Product Title',
                              price: newItem.price || 0,
                              originalPrice: newItem.originalPrice,
                              images: newItem.images.length ? 
                                [newItem.images[newItem.coverImageIndex || 0], ...newItem.images.filter((_, i) => i !== (newItem.coverImageIndex || 0))] 
                                : ['https://placehold.co/600x400/eeeeee/999999?text=Preview+Image'],
                              description: newItem.description || 'Description details.',
                              category: sellerForm.category || 'general'
                            }]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ORDERS & FULFILLMENT */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6 animate-slide-up">
              <div>
                <h3 className="text-xl font-black text-gray-800">Fulfillment Pipeline</h3>
                <p className="text-xs text-gray-400 font-medium">Coordinate orders containing custom stock items and update dispatch checkpoints</p>
              </div>

              {sellerOrders.length === 0 ? (
                <div className="text-center py-20 text-gray-500 font-semibold bg-gray-50 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3">
                  <div className="p-4 bg-white rounded-full shadow-xs text-2xl">🛍️</div>
                  <div>
                    <p className="text-gray-700">No active customer orders yet.</p>
                    <p className="text-xs text-gray-400 font-normal mt-1">Listed products will register transactions here when purchased by buyers.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {sellerOrders.map((order) => {
                    const user = JSON.parse(localStorage.getItem("userData"));
                    // filter only items of this seller
                    const merchantItems = order.items.filter(item => (item.sellerId === user?.id || item.seller_id === user?.id));
                    const merchantSubtotal = merchantItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                    
                    let statusBadgeClass = "bg-gray-150 text-gray-700";
                    if (order.status === "shipped") statusBadgeClass = "bg-blue-50 text-blue-600 border border-blue-100";
                    else if (order.status === "out_for_delivery") statusBadgeClass = "bg-amber-50 text-amber-600 border border-amber-100";
                    else if (order.status === "delivered") statusBadgeClass = "bg-emerald-50 text-emerald-600 border border-emerald-100";

                    return (
                      <div key={order.orderId} className="border border-gray-150 rounded-2xl overflow-hidden hover:shadow-xs transition bg-gray-50/20">
                        {/* Order Header */}
                        <div className="bg-gray-50 p-4 border-b border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                          <div className="space-y-0.5 font-medium">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-800">Order ID:</span>
                              <span className="font-mono text-gray-650 bg-white border px-2 py-0.5 rounded-md font-semibold">{order.orderId}</span>
                            </div>
                            <div className="text-gray-400 font-semibold flex items-center gap-3 mt-1.5">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${statusBadgeClass}`}>
                              {order.status.replace(/_/g, " ")}
                            </span>
                            {order.deliveryDate && (
                              <span className="text-[10px] bg-emerald-500 text-white font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Delivered: {order.deliveryDate}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order body (items + shipping) */}
                        <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
                          {/* Items Section */}
                          <div className="md:col-span-7 space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ordered Merchant Stock</h4>
                            {merchantItems.map((item, idx) => (
                              <div key={idx} className="flex gap-3 bg-white p-3 rounded-xl border border-gray-100">
                                {item.images && item.images[0] ? (
                                  <img src={item.images[0]} className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 flex-shrink-0"><ImageIcon size={14} /></div>
                                )}
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.title}</p>
                                  <p className="text-xs text-gray-500 font-semibold">
                                    Qty: <span className="text-gray-800 font-extrabold">{item.quantity || 1} units</span> | Price: <span className="text-green-600">${item.price}</span>
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Shipping Details */}
                          <div className="md:col-span-5 space-y-4 border-t md:border-t-0 md:border-l border-gray-150 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1"><MapPin size={12} /> Shipping Address</h4>
                              <div className="text-xs text-gray-600 space-y-0.5 font-medium">
                                <p className="font-extrabold text-gray-850">{order.shippingDetails?.fullName || order.shippingDetails?.name || "Customer"}</p>
                                <p>{order.shippingDetails?.addressLine || order.shippingDetails?.address}</p>
                                <p>{order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.zipCode || order.shippingDetails?.zip}</p>
                                <p className="font-bold text-gray-500 mt-1">Phone: {order.shippingDetails?.phone}</p>
                              </div>
                            </div>

                            <div className="bg-gray-50 border p-3 rounded-xl flex items-center justify-between text-xs mt-3">
                              <span className="font-bold text-gray-500">Subtotal payout:</span>
                              <span className="font-extrabold text-emerald-600 text-sm">${merchantSubtotal.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Footer - Fulfillment Controls */}
                        {order.status !== "delivered" && (
                          <div className="bg-white px-4 py-3.5 border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                              <ShieldAlert size={14} /> Action Required
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {order.status === "placed" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId, "shipped")}
                                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition cursor-pointer scale-hover"
                                >
                                  Mark as Shipped 🚀
                                </button>
                              )}
                              
                              {order.status === "shipped" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId, "out_for_delivery")}
                                  className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition cursor-pointer scale-hover"
                                >
                                  Mark as Out for Delivery 🚚
                                </button>
                              )}

                              {order.status === "out_for_delivery" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.orderId, "delivered")}
                                  className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl transition cursor-pointer scale-hover"
                                >
                                  Mark as Delivered ✅
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WALLET & PAYOUTS */}
          {activeTab === "wallet" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
              {/* Wallet overview card (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-fit gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <CreditCard size={14} /> Merchant Settlement Wallet
                  </div>
                  
                  <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl relative shadow-md">
                    <div className="absolute top-4 right-4 text-white/10"><Store size={70} /></div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-wider font-mono">Available Balance</p>
                          <p className="text-4xl font-black">${walletBalance.toFixed(2)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddDemoFunds}
                          className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 scale-hover cursor-pointer"
                        >
                          <Plus size={12} /> Add Demo Funds
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-white/70 font-mono mt-4 pt-4 border-t border-white/10">
                        <div>
                          <p>Account Type</p>
                          <p className="text-white font-extrabold">ShopEase Partner</p>
                        </div>
                        <div className="text-right">
                          <p>Payout ID</p>
                          <p className="text-white font-extrabold">{storeDetails?.payoutId || storeDetails?.payout_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleWithdrawFunds}
                  disabled={walletBalance <= 0 || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl cursor-pointer transition text-sm flex items-center justify-center gap-1.5 shadow-sm scale-hover btn-glow"
                >
                  <CreditCard size={16} />
                  <span>Withdraw Balance to Bank</span>
                </button>
              </div>

              {/* Settlement History (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-800">Payout Statements</h3>
                  <p className="text-xs text-gray-400 font-medium">Audit logs of automated settlement withdraws and weekly clearing periods</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Reference ID</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Method</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {payouts.map((payout, idx) => (
                        <tr key={idx} className="text-gray-700">
                          <td className="py-4.5 font-mono text-[11px]">{payout.referenceId}</td>
                          <td className="py-4.5 text-gray-500">{payout.date}</td>
                          <td className="py-4.5 text-gray-500">{payout.method}</td>
                          <td className="py-4.5 text-green-600 font-bold">${payout.amount.toFixed(2)}</td>
                          <td className="py-4.5">
                            {payout.status === "processing" ? (
                              <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md border border-amber-100 text-[10px] font-bold uppercase animate-pulse">Processing</span>
                            ) : (
                              <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 text-[10px] font-bold uppercase">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      <tr className="text-gray-500">
                        <td className="py-4.5 font-mono text-[11px]">SET_89274819</td>
                        <td className="py-4.5">June 26, 2026</td>
                        <td className="py-4.5">ACH Bank Wire</td>
                        <td className="py-4.5 font-bold">$189.50</td>
                        <td className="py-4.5">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 text-[10px] font-bold uppercase">Settled</span>
                        </td>
                      </tr>
                      <tr className="text-gray-500">
                        <td className="py-4.5 font-mono text-[11px]">SET_89230193</td>
                        <td className="py-4.5">June 19, 2026</td>
                        <td className="py-4.5">ACH Bank Wire</td>
                        <td className="py-4.5 font-bold">$78.20</td>
                        <td className="py-4.5">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md border border-emerald-100 text-[10px] font-bold uppercase">Settled</span>
                        </td>
                      </tr>
                      {sellerOrders.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center py-6 text-gray-400 font-normal">No recent wallet transactions found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STORE BRANDING & SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 animate-slide-up">
              {/* Profile details */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-800">Store Profile</h3>
                  <p className="text-xs text-gray-400 font-medium">Update brand description, categories, and buyer contact credentials</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Business Name</label>
                    <input
                      type="text"
                      value={sellerForm.businessName}
                      onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Store Bio / Description</label>
                    <textarea
                      value={storeBio}
                      onChange={(e) => setStoreBio(e.target.value)}
                      className="form-input min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Email</label>
                      <input
                        type="email"
                        value={sellerForm.email}
                        onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Phone</label>
                      <input
                        type="tel"
                        value={sellerForm.phone}
                        onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setToast("Store profile configuration saved successfully! 💾")}
                    className="bg-black hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl cursor-pointer transition text-xs shadow-sm scale-hover btn-glow"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>

              {/* Branding Customizations */}
              <div className="lg:col-span-5 space-y-6 border-t lg:border-t-0 lg:border-l border-gray-150 pt-6 lg:pt-0 lg:pl-8">
                <div>
                  <h3 className="text-lg font-black text-gray-800">Store Custom Branding</h3>
                  <p className="text-xs text-gray-400 font-medium">Style your store portal theme and background headers</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Choose Header Banner Gradient</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Gradient 1 */}
                      <button 
                        onClick={() => setStoreBanner("from-blue-600 via-indigo-650 to-violet-700")}
                        className={`p-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-650 to-violet-700 text-white text-xs font-bold transition flex items-center justify-between border-2 ${storeBanner.includes("blue-600") ? "border-black shadow-md scale-95" : "border-transparent"}`}
                      >
                        <span>Oceanic Violet</span>
                        {storeBanner.includes("blue-600") && <Check size={14} />}
                      </button>

                      {/* Gradient 2 */}
                      <button 
                        onClick={() => setStoreBanner("from-amber-500 via-orange-550 to-rose-600")}
                        className={`p-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-550 to-rose-600 text-white text-xs font-bold transition flex items-center justify-between border-2 ${storeBanner.includes("amber-500") ? "border-black shadow-md scale-95" : "border-transparent"}`}
                      >
                        <span>Sunset Ember</span>
                        {storeBanner.includes("amber-500") && <Check size={14} />}
                      </button>

                      {/* Gradient 3 */}
                      <button 
                        onClick={() => setStoreBanner("from-emerald-600 to-teal-700")}
                        className={`p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-xs font-bold transition flex items-center justify-between border-2 ${storeBanner.includes("emerald-600") ? "border-black shadow-md scale-95" : "border-transparent"}`}
                      >
                        <span>Emerald Glow</span>
                        {storeBanner.includes("emerald-600") && <Check size={14} />}
                      </button>

                      {/* Gradient 4 */}
                      <button 
                        onClick={() => setStoreBanner("from-rose-500 via-fuchsia-600 to-purple-700")}
                        className={`p-3 rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-600 to-purple-700 text-white text-xs font-bold transition flex items-center justify-between border-2 ${storeBanner.includes("rose-500") ? "border-black shadow-md scale-95" : "border-transparent"}`}
                      >
                        <span>Fuchsia Aura</span>
                        {storeBanner.includes("rose-500") && <Check size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BecomeSeller;
