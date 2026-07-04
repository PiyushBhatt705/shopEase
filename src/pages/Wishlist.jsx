import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Toast from "../components/Toast";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load wishlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
    setLoading(false);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    // Trigger custom event so navbar can update instantly
    window.dispatchEvent(new Event("wishlistUpdate"));
    setToast("Removed from wishlist 💔");
    setTimeout(() => setToast(""), 2000);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    setToast("Added to cart 🛒");
    setTimeout(() => setToast(""), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-600 font-semibold">Loading Wishlist...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Back to Home button */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 animate-scale-in-dash">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <span className="genz-gradient-text genz-text-glow">Your Liked Products ❤️</span>
            {wishlist.length > 0 && (
              <span className="bg-red-50 border border-red-150 text-red-700 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 h-7">
                {wishlist.length} Items
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">Keep track of your favorite items, checkout whenever you want. Pure Love.</p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm max-w-xl mx-auto mt-10">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs animate-pulse">
            <Heart size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Save items that you like here. They will stay in your wishlist so you can buy them later!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative flex flex-col justify-between"
            >
              <div>
                {/* Product Image */}
                <div className="relative bg-gray-50 p-6 flex items-center justify-center">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/200"}
                    alt={item.title}
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                    }}
                    className="h-44 object-contain transition-transform duration-300 hover:scale-105"
                  />
                  
                  {/* Delete button */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2.5 bg-white text-gray-400 hover:text-red-500 rounded-full border border-gray-150 shadow-xs transition hover:scale-110 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-850 text-base line-clamp-2 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/product/${item.id}`)}>
                    {item.title}
                  </h3>
                  
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">${item.price}</span>
                    <span className="text-xs text-gray-400 line-through">${(item.price * 1.25).toFixed(0)}</span>
                  </div>
                </div>
              </div>

              {/* Actions container at bottom */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleAddToCart(item)}
                  className="w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition flex items-center justify-center gap-2 cursor-pointer scale-hover"
                >
                  <ShoppingCart size={16} />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
