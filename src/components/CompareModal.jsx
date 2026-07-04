import React from "react";
import { useCompare } from "../hooks/useCompare";
import { useCart } from "../hooks/useCart";
import { X, ShoppingCart, Scale, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { soundService } from "../services/soundService";

const CompareModal = () => {
  const {
    compareList,
    showCompareModal,
    setShowCompareModal,
    removeFromCompare,
    setCompareToast
  } = useCompare();

  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!showCompareModal || compareList.length === 0) return null;

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    soundService.playAddCart();
    setCompareToast("Added to cart from comparison! 🛒");
    setTimeout(() => setCompareToast(""), 2000);
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    soundService.playClick();
    setShowCompareModal(false);
    navigate("/checkout", { state: { buyNowProduct: product } });
  };

  const handleClose = () => {
    soundService.playTrash();
    setShowCompareModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-scale-in">
        
        {/* Close Modal Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between bg-slate-50 dark:bg-slate-900/30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-xs">
              <Scale size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                Product Comparison Details
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Review features, specifications, prices and reviews side by side
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-150 dark:hover:bg-slate-800 p-2.5 rounded-2xl transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="overflow-y-auto p-5 md:p-8 flex-grow">
          {compareList.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-slate-400 text-sm font-semibold">
                You need at least 2 items to compare. Add more items!
              </p>
            </div>
          ) : (
            <div className="min-w-[600px] overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-zinc-800">
                    {/* Left corner empty cell */}
                    <th className="w-1/4 text-left pb-4 font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest text-[10px]">
                      Specs & Details
                    </th>
                    
                    {/* Compared columns */}
                    {compareList.map((product) => (
                      <th key={product.id} className="w-1/3 text-left pb-6 px-4 relative group">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="absolute top-0 right-4 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 dark:bg-slate-850 dark:hover:bg-red-950/40 p-1.5 rounded-full transition shadow-sm cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Remove item"
                        >
                          <X size={12} />
                        </button>
                        
                        <div className="flex flex-col items-center text-center mt-2">
                          <div className="w-32 h-32 bg-slate-50 dark:bg-slate-850 rounded-2xl p-3 flex items-center justify-center border border-slate-100 dark:border-zinc-800 shadow-xs mb-3 group-hover:shadow-md transition">
                            <img
                              src={product.images?.[0] || product.thumbnail || ""}
                              alt={product.title}
                              className="h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/200x200?text=No+Image";
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 pr-2">
                            {product.title}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  
                  {/* PRICE ROW */}
                  <tr>
                    <td className="py-4 font-bold text-xs text-slate-500 dark:text-slate-400">
                      Pricing Details
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="py-4 px-4">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white">
                            ${parseFloat(product.price || 0).toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <>
                              <span className="text-xs text-slate-400 line-through">
                                ${parseFloat(product.originalPrice).toFixed(2)}
                              </span>
                              <span className="text-[9px] text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-150 px-1.5 py-0.5 rounded font-bold uppercase">
                                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* CATEGORY ROW */}
                  <tr>
                    <td className="py-4 font-bold text-xs text-slate-500 dark:text-slate-400">
                      Product Category
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="py-4 px-4 capitalize font-semibold text-xs text-slate-700 dark:text-slate-300">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {product.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* STOCK STATUS ROW */}
                  <tr>
                    <td className="py-4 font-bold text-xs text-slate-500 dark:text-slate-400">
                      Availability
                    </td>
                    {compareList.map((product) => {
                      const inStock = product.stock > 0;
                      return (
                        <td key={product.id} className="py-4 px-4 text-xs font-semibold">
                          {inStock ? (
                            product.stock <= 10 ? (
                              <span className="text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 px-2 py-0.5 rounded font-bold text-[10px]">
                                ONLY {product.stock} LEFT
                              </span>
                            ) : (
                              <span className="text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-100 px-2 py-0.5 rounded font-bold text-[10px]">
                                IN STOCK ({product.stock} items)
                              </span>
                            )
                          ) : (
                            <span className="text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 px-2 py-0.5 rounded font-bold text-[10px]">
                              OUT OF STOCK
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* DESCRIPTION ROW */}
                  <tr>
                    <td className="py-5 font-bold text-xs text-slate-500 dark:text-slate-400 align-top">
                      Specifications & Info
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="py-5 px-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium align-top max-w-[280px]">
                        <p className="line-clamp-6" title={product.description}>
                          {product.description}
                        </p>
                      </td>
                    ))}
                  </tr>

                  {/* ACTION ROW */}
                  <tr>
                    <td className="py-6 font-bold text-xs text-slate-500 dark:text-slate-400">
                      Checkout Actions
                    </td>
                    {compareList.map((product) => (
                      <td key={product.id} className="py-6 px-4">
                        <div className="flex flex-col gap-2.5 max-w-[180px]">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs hover:shadow-indigo-500/10 transition scale-hover"
                            disabled={product.stock <= 0}
                            style={{ opacity: product.stock <= 0 ? 0.6 : 1 }}
                          >
                            <ShoppingCart size={13} />
                            <span>Add to Cart</span>
                          </button>
                          
                          <button
                            onClick={(e) => handleBuyNow(e, product)}
                            className="bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-755 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition scale-hover"
                            disabled={product.stock <= 0}
                            style={{ opacity: product.stock <= 0 ? 0.6 : 1 }}
                          >
                            <span>Buy Instantly</span>
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>

                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-white hover:bg-slate-250 dark:hover:bg-slate-700 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompareModal;
