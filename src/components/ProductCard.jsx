import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import Toast from "../components/Toast";

const ProductCard = ({products}) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [toast, setToast] = useState(null);

  

  const badges = ["Sale", "New", "Hot", "Trending"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product, index) => (
          <div
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            className="product-card bg-white rounded-2xl overflow-hidden cursor-pointer"
          >
            <div className="relative bg-gray-100 p-6">
              {(index % 5 === 0 || index % 7 === 0) && (
                <span className="absolute top-3 left-3 bg-black text-white text-xs px-3 py-1 rounded-full">
                  {badges[index % badges.length]}
                </span>
              )}

              <img
                src={product.images[0]}
                alt={product.title}
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                }}
                className="h-56 w-full object-contain transition-transform duration-500 hover:scale-110"
              />
            </div>

            <div className="p-4">
              <h3 className="font-semibold line-clamp-2">
                {product.title}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold">
                  ${product.price || 0}
                </span>

                <span className="text-sm text-gray-400 line-through">
                  ${((product.price || 0) * 1.2).toFixed(2)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product);
                  setToast("Added to cart 🛒");
                }}
                className="w-full mt-4 bg-black text-white py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 cursor-pointer"
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