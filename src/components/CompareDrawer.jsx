import React from "react";
import { useCompare } from "../hooks/useCompare";
import { X, Scale, RefreshCw } from "lucide-react";
import Toast from "./Toast";

const CompareDrawer = () => {
  const {
    compareList,
    removeFromCompare,
    clearCompare,
    setShowCompareModal,
    compareToast,
    setCompareToast
  } = useCompare();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 md:px-8 md:pb-6 pointer-events-none animate-slide-up">
      {compareToast && (
        <Toast message={compareToast} onClose={() => setCompareToast("")} />
      )}
      
      <div className="max-w-4xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-zinc-800 shadow-2xl rounded-3xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto transition-all duration-300">
        
        {/* Left Side: Count & Icons */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shadow-xs">
            <Scale size={20} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-250">
              Compare Products ({compareList.length}/3)
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              Select up to 3 products to compare side-by-side
            </p>
          </div>
        </div>

        {/* Center: Selected Products Preview list */}
        <div className="flex items-center gap-3.5 overflow-x-auto py-1 max-w-full sm:max-w-xs md:max-w-md">
          {compareList.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-2 bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-zinc-800 rounded-2xl py-1.5 pl-2 pr-2.5 flex-shrink-0 group relative hover:border-indigo-300 dark:hover:border-indigo-800 transition duration-200"
            >
              <img
                src={product.images?.[0] || product.thumbnail || ""}
                alt={product.title}
                className="w-7 h-7 object-contain rounded-md bg-white p-0.5"
                onError={(e) => {
                  e.target.src = "https://placehold.co/100x100?text=No+Image";
                }}
              />
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                {product.title}
              </span>
              <button
                onClick={() => removeFromCompare(product.id)}
                className="text-slate-400 hover:text-red-500 rounded-full p-0.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {compareList.length < 3 && (
            <div className="h-10 w-24 border border-dashed border-slate-250 dark:border-zinc-800 rounded-2xl flex items-center justify-center text-[10px] text-slate-400 font-semibold gap-1 select-none">
              <span>+ Add {3 - compareList.length}</span>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold px-3 py-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => setShowCompareModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-md hover:shadow-indigo-500/20 transition cursor-pointer flex items-center gap-1.5 scale-hover btn-glow"
            disabled={compareList.length < 2}
            style={{ opacity: compareList.length < 2 ? 0.6 : 1 }}
            title={compareList.length < 2 ? "Add at least 2 items to compare" : "Compare now"}
          >
            <span>Compare Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default CompareDrawer;
