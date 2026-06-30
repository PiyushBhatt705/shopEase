import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Award, TrendingUp, Users, CheckCircle, Store, ArrowLeft, Plus, Loader2 } from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storeDetails, setStoreDetails] = useState(null);

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
  const [newItem, setNewItem] = useState({ name: "", price: "", stock: "" });

  useEffect(() => {
    const fetchStoreStatus = async () => {
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
            businessName: store.business_name,
            gstNumber: store.gstin,
            email: store.email,
            phone: store.phone,
            category: store.category
          });
          const list = await apiService.seller.getInventory(user.id);
          setInventory(list);
        }
      } catch (err) {
        console.error("Failed to fetch cloud store info:", err);
      }
      setIsLoading(false);
    };

    fetchStoreStatus();
  }, [navigate]);

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
        owner_id: user.id,
        business_name: sellerForm.businessName,
        email: sellerForm.email,
        phone: sellerForm.phone,
        category: sellerForm.category,
        gstin: sellerForm.gstNumber || "GST-UNREGISTERED",
        payout_id: payoutId
      };

      const store = await apiService.seller.registerStore(storeData);
      setStoreDetails(store || storeData);
      setIsOnboarded(true);
      setToast("Seller Shop onboarding successful! 🚀 Welcome to ShopEase Partners.");
      
      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      setToast(err.message || "Failed to register store");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price || !newItem.stock) {
      setToast("Please enter valid product specifications ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user) return;

    setIsLoading(true);
    try {
      const productData = {
        id: "custom_" + Date.now(),
        title: newItem.name,
        price: parseFloat(newItem.price),
        stock: parseInt(newItem.stock),
        description: `Genuine e-commerce product listed by verified merchant: ${sellerForm.businessName}`,
        category: sellerForm.category || "general",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"],
        seller_id: user.id
      };

      await apiService.products.create(productData);
      setNewItem({ name: "", price: "", stock: "" });
      setToast("Product listed live in global catalog! 📦");

      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      setToast("Failed to list product in catalog");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  const handleDeleteItem = async (productId) => {
    setIsLoading(true);
    const user = JSON.parse(localStorage.getItem("userData"));
    try {
      await apiService.seller.deleteProduct(productId);
      setToast("Product unlisted 🗑️");

      const list = await apiService.seller.getInventory(user.id);
      setInventory(list);
    } catch (err) {
      setToast("Failed to unlist product");
    }
    setIsLoading(false);
    setTimeout(() => setToast(""), 2000);
  };

  if (isLoading && inventory.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-650 font-semibold">Loading merchant panel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-150">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-xs">
          <Store size={26} />
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Become a Seller</h1>
          <p className="text-gray-500 text-sm mt-1">Onboard your brand and sell custom items directly in our marketplace catalog.</p>
        </div>
      </div>

      {!isOnboarded ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* VALUE PITCH (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Why sell on ShopEase?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                  <Briefcase size={18} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">0% Commission</h4>
                <p className="text-xs text-gray-500">Keep 100% of your product margins. No middleman fees or cuts.</p>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
                <div className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp size={18} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Millions of Visitors</h4>
                <p className="text-xs text-gray-500">Direct visibility across e-commerce categories and landing pages.</p>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
                <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                  <Users size={18} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Fast Payments</h4>
                <p className="text-xs text-gray-500">Instant settlements into your merchant payout dashboard weekly.</p>
              </div>

              <div className="bg-white border border-gray-150 p-5 rounded-2xl shadow-xs">
                <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                  <Award size={18} />
                </div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">Seller Protection</h4>
                <p className="text-xs text-gray-500">Full shipping insurance and secure verification filters.</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl text-white shadow-md">
              <h3 className="font-extrabold text-base mb-1">Start selling in 5 minutes</h3>
              <p className="text-xs text-blue-100 leading-relaxed">Fill out the register console. Once accepted, add custom stocks to see them load live in search filters!</p>
            </div>
          </div>

          {/* REGISTRATION FORM (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Register Store</h3>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Business Name</label>
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
                <label className="text-xs font-semibold text-gray-500 uppercase">GSTIN / Tax ID (Optional)</label>
                <input
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  value={sellerForm.gstNumber}
                  onChange={(e) => setSellerForm({ ...sellerForm, gstNumber: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Business Email</label>
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
                <label className="text-xs font-semibold text-gray-500 uppercase">Contact Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={sellerForm.phone}
                  onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Product Category</label>
                <select
                  value={sellerForm.category}
                  onChange={(e) => setSellerForm({ ...sellerForm, category: e.target.value })}
                  className="form-input"
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
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Register Store"}
              </button>
            </form>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CONTROL DASHBOARD: Add items (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-emerald-500" size={20} />
              <h2 className="text-lg font-bold text-gray-800">Partner Console Active</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">
              Registered business: <span className="font-semibold text-gray-700">{sellerForm.businessName}</span> | Payout ID: <span className="font-mono text-gray-700 font-semibold">{storeDetails?.payout_id}</span>
            </p>

            <h3 className="font-extrabold text-sm uppercase text-gray-400 tracking-wider mb-4 border-t pt-4">List New Product</h3>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Leather Watch Strap"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Price ($)</label>
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
                  <label className="text-xs font-semibold text-gray-500 uppercase">Stock Qty</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm scale-hover text-xs btn-glow"
              >
                <Plus size={16} />
                <span>List Product Live</span>
              </button>
            </form>
          </div>

          {/* ACTIVE INVENTORY (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Active Shop Inventory</h2>
            
            {inventory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium">
                No listed products found. Fill out the console form to add custom items live!
              </div>
            ) : (
              <div className="divide-y divide-gray-150">
                {inventory.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 font-semibold">
                        Price: <span className="text-green-600">${item.price}</span> | Stock: <span className="text-gray-600">{item.stock} units</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 transition cursor-pointer scale-hover bg-red-50 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default BecomeSeller;
