import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { Heart } from "lucide-react";
import Toast from "../components/Toast";

const ProductCard = ({ products, gridClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const toggleWishlist = (product) => {
    let updated;
    if (isWishlisted(product.id)) {
      updated = wishlist.filter((item) => item.id !== product.id);
      setToast("Removed from wishlist 💔");
    } else {
      updated = [...wishlist, product];
      setToast("Added to wishlist ❤️");
    }
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
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

      <div className={`grid gap-8 ${gridClass}`}>
        {products.map((product, index) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="group bg-white rounded-3xl overflow-hidden cursor-pointer shadow-xs hover:shadow-2xl border border-gray-100 hover:border-blue-500/30 transition-all duration-500 relative flex flex-col justify-between h-[420px]"
          >
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

              <img
                src={product.images?.[0] || product.thumbnail || ""}
                alt={product.title}
                loading="lazy"
                onError={(e) => {
                  e.target.src = "https://placehold.co/600x400/eeeeee/999999?text=No+Image";
                }}
                className="h-44 object-contain transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-2"
              />
            </div>

            {/* Content Body */}
            <div className="p-5 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                  {product.title}
                </h3>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-lg font-black text-gray-900">
                    ${parseFloat(product.price || 0).toFixed(2)}
                  </span>

                  <span className="text-xs text-gray-400 line-through font-semibold">
                    ${(parseFloat(product.price || 0) * 1.25).toFixed(2)}
                  </span>
                  
                  <span className="text-[9px] text-green-600 font-bold bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-md ml-auto uppercase tracking-wide">
                    20% Off
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  setToast("Added to cart 🛒");
                }}
                className="w-full mt-4 product-card-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer scale-hover"
              >
                Add to Cart
              </button>
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