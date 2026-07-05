import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Heart, AlertTriangle, Scale } from "lucide-react";
import Toast from "../components/Toast";
import { useCompare } from "../hooks/useCompare";
import { soundService } from "../services/soundService";
import { safeLocalStorage } from "../utils/safeStorage";

const ProductCard = ({ products, gridClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [imageIndices, setImageIndices] = useState({});

  const isCompared = (id) => compareList.some((item) => item.id === id);

  const handleCompareToggle = (product) => {
    if (isCompared(product.id)) {
      removeFromCompare(product.id);
    } else {
      addToCompare(product);
    }
  };

  const handleNextImage = (e, productId, totalImages) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const handlePrevImage = (e, productId, totalImages) => {
    e.stopPropagation();
    setImageIndices(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  useEffect(() => {
    const saved = safeLocalStorage.getItem("wishlist", []);
    setWishlist(saved);
  }, []);

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const toggleWishlist = (product) => {
    let updated;
    soundService.playPop();
    if (isWishlisted(product.id)) {
      updated = wishlist.filter((item) => item.id !== product.id);
      setToast("Removed from wishlist 💔");
    } else {
      updated = [...wishlist, product];
      setToast("Added to wishlist ❤️");
    }
    setWishlist(updated);
    safeLocalStorage.setItem("wishlist", updated);
    window.dispatchEvent(new Event("wishlistUpdate"));
    setTimeout(() => setToast(null), 2000);
  };

  const badges = ["Sale", "New", "Hot", "Trending"];

  return (
    <div className="w-full">
      <style>{`
        @keyframes borderPulse {
          0%, 100% {
            border-color: transparent;
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.1),
                        0 10px 25px rgba(0, 0, 0, 0.15);
          }
          50% {
            border-color: rgb(59, 130, 246);
            box-shadow: 0 0 20px 3px rgba(59, 130, 246, 0.4),
                        0 20px 40px rgba(0, 0, 0, 0.3);
          }
        }

        .product-card {
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .product-card:hover {
          animation: borderPulse 2s ease-in-out infinite;
          transform: translateY(-8px);
        }
      `}</style>

      <div className={`grid gap-8 px-4 md:px-8 lg:px-12 ${gridClass}`}>
        {products.map((product, index) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="animated-border-card group cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 animate-fade-in h-[420px]"
            style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
          >
            <div className="animated-border-card-inner flex flex-col justify-between overflow-hidden">
              {/* Image Header */}
              <div className="relative product-card-image-wrapper p-6 flex items-center justify-center overflow-hidden h-60">
              {(index % 4 === 0 || index % 5 === 0) && (
                <span className="absolute top-3 left-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg z-10 shadow-md">
                  {badges[index % badges.length]}
                </span>
              )}

              {/* Wishlist Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className="absolute top-3 right-3 p-2 bg-white/95 rounded-full border border-gray-150 shadow-xs hover:text-red-500 transition scale-hover cursor-pointer z-10 hover:scale-110 flex items-center justify-center"
              >
                <Heart size={16} fill={isWishlisted(product.id) ? "red" : "none"} className={isWishlisted(product.id) ? "text-red-500" : "text-gray-500"} />
              </button>

              {/* Compare Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCompareToggle(product);
                }}
                className={`absolute top-12 right-3 p-2 rounded-full border transition scale-hover cursor-pointer z-10 hover:scale-110 flex items-center justify-center ${
                  isCompared(product.id)
                    ? "bg-indigo-650 text-white border-indigo-700 shadow-sm"
                    : "bg-white/95 text-gray-500 border-gray-150 hover:text-indigo-650 hover:bg-white"
                }`}
                title="Compare spec sheet"
              >
                <Scale size={15} />
              </button>

              <div className="relative w-full h-full flex justify-center items-center group/img">
                <img
                  src={product.images?.[imageIndices[product.id] || 0] || product.thumbnail || ""}
                  alt={product.title}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400/eeeeee/999999?text=No+Image";
                  }}
                  className="h-44 object-contain transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                />
                
                {product.images && product.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => handlePrevImage(e, product.id, product.images.length)}
                      className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity z-20 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button 
                      onClick={(e) => handleNextImage(e, product.id, product.images.length)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-md opacity-0 group-hover/img:opacity-100 transition-opacity z-20 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      {product.images.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === (imageIndices[product.id] || 0) ? 'bg-blue-600 scale-125' : 'bg-gray-300'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                {product.stock <= 10 && product.stock > 0 && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 w-fit mb-2 uppercase tracking-wide shadow-sm">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span>Only {product.stock} left!</span>
                  </div>
                )}
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {product.title}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-lg font-black text-gray-900">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </span>

                  {(product.originalPrice && product.originalPrice > product.price) ? (
                    <>
                      <span className="text-xs text-gray-400 line-through font-semibold">
                        ${parseFloat(product.originalPrice).toFixed(2)}
                      </span>
                      <span className="text-[9px] text-green-600 font-bold bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md ml-auto uppercase tracking-wide">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                      </span>
                    </>
                  ) : (
                    <div className="ml-auto" />
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (addToCart(product)) {
                    soundService.playAddCart();
                    setToast("Added to cart 🛒");
                  }
                }}
                className="w-full mt-4 product-card-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer scale-hover"
              >
                Add to Cart
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProductCard;