import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../services/apiService";
import SearchBar from "../components/SearchBar";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search") || "";
  const filterQuery = searchParams.get("filter") || "";
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setTimeout(() => {
      setLocalSearch(searchQuery);
    }, 0);
  }, [searchQuery]);

  // Sort & Filter States
  const [sortBy, setSortBy] = useState("default"); // default, priceLowHigh, priceHighLow, nameAZ
  const [maxPrice, setMaxPrice] = useState(1000);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
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

      // Sort: Merchant products first, then fake products
      const sorted = uniqueProducts.sort((a, b) => {
        const isMerchantA = !!(a.sellerId || a.seller_id);
        const isMerchantB = !!(b.sellerId || b.seller_id);
        if (isMerchantA && !isMerchantB) return -1;
        if (!isMerchantA && isMerchantB) return 1;
        return 0;
      });

      setProducts(sorted);
      setLoading(false);
    };

    fetchAllProducts();
  }, []);

  // Filter products by search query
  const searchedProducts = products.filter((product) => {
    if (!searchQuery) return true;
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Filter products by category filter
  let finalProducts = searchedProducts;
  let pageTitle = "All Products";

  if (filterQuery) {
    if (filterQuery === "new") {
      pageTitle = "New Arrivals";
      // Reverse array to show latest additions
      finalProducts = [...searchedProducts].reverse();
    } else if (filterQuery === "best") {
      pageTitle = "Best Sellers";
      // Show products in index mod 3 to simulate best sellers
      finalProducts = searchedProducts.filter((_, idx) => idx % 3 === 0);
    } else if (filterQuery === "collections") {
      pageTitle = "Curated Collections";
      finalProducts = searchedProducts.filter((_, idx) => idx % 2 === 0);
    } else if (filterQuery === "deals") {
      pageTitle = "Today's Deals";
      finalProducts = searchedProducts.filter((p) => (p.price || 0) < 100);
    } else if (filterQuery === "flash") {
      pageTitle = "Flash Sale";
      finalProducts = searchedProducts.filter((p) => (p.price || 0) < 80);
    } else if (filterQuery === "clearance") {
      pageTitle = "Clearance Outlet";
      finalProducts = searchedProducts.filter((_, idx) => idx % 4 === 0);
    } else if (filterQuery === "coupons") {
      pageTitle = "Coupon Offers";
      finalProducts = searchedProducts.filter((p) => (p.price || 0) > 150);
    } else if (filterQuery === "top") {
      pageTitle = "Top Rated";
      finalProducts = searchedProducts.filter((_, idx) => idx % 3 === 1);
    } else if (filterQuery === "featured") {
      pageTitle = "Featured Products";
      finalProducts = searchedProducts.filter((_, idx) => idx % 3 === 2);
    } else if (filterQuery === "sale") {
      pageTitle = "On Sale";
      finalProducts = searchedProducts.filter((p) => (p.price || 0) < 120);
    }
  } else if (searchQuery) {
    pageTitle = `Search Results for: "${searchQuery}"`;
  }

  // Apply price range filter
  let filteredProducts = finalProducts.filter((p) => (p.price || 0) <= maxPrice);

  // Apply sorting
  if (sortBy === "priceLowHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceHighLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "nameAZ") {
    filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-10 animate-scale-in-dash">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="genz-gradient-text genz-text-glow">{pageTitle} Catalog 🛍️</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1.5">
            Explore our curated items catalog. Showing {filteredProducts.length} of {finalProducts.length} products. Keep scrolling.
          </p>
        </div>
        <Button text={"← Back to Home"} handleClick={() => navigate("/")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR FILTERS - Left side (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Search Catalog Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Search Catalog</h3>
            <SearchBar
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setSearchParams({ search: e.target.value, filter: filterQuery });
              }}
              placeholder="Type to search..."
              inputClassName="w-full bg-gray-50 border border-gray-205 rounded-xl p-3 pl-10 outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold text-gray-700 shadow-sm"
              iconClassName="left-3.5"
              iconSize={18}
            />
          </div>
          
          {/* Sorting Box */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold text-gray-700 cursor-pointer"
            >
              <option value="default">Featured / Default</option>
              <option value="priceLowHigh">Price: Low to High</option>
              <option value="priceHighLow">Price: High to Low</option>
              <option value="nameAZ">Name: A to Z</option>
            </select>
          </div>

          {/* Price Filter Slider */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider">Filter Price</h3>
              <span className="text-blue-600 text-sm font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                Max: ${maxPrice}
              </span>
            </div>
            
            <input
              type="range"
              min={10}
              max={1000}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold">
              <span>$10</span>
              <span>$500</span>
              <span>$1000</span>
            </div>
          </div>

          {/* Quick Categories Filter Shortcut */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-xs">
            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <div className="flex flex-col gap-2.5">
              <button onClick={() => navigate("/products?filter=deals")} className="text-left text-sm text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">🔥 Today's Deals</button>
              <button onClick={() => navigate("/products?filter=new")} className="text-left text-sm text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">📦 New Arrivals</button>
              <button onClick={() => navigate("/products?filter=best")} className="text-left text-sm text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">⭐ Best Sellers</button>
              <button onClick={() => navigate("/products")} className="text-left text-sm text-gray-600 hover:text-blue-600 font-semibold transition cursor-pointer">🛍️ View All Products</button>
            </div>
          </div>

        </div>

        {/* PRODUCT GRID - Right side (9 cols) */}
        <div className="lg:col-span-9">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 text-blue-500">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
               <p className="font-semibold text-gray-500">Loading global catalog...</p>
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-xs">
              <div className="text-gray-500 text-lg font-semibold py-10">
                No products found matching your active price & category filters.
              </div>
            </div>
          ) : (
            <ProductCard products={filteredProducts} gridClass="grid-cols-1 sm:grid-cols-2 md:grid-cols-3" />
          )}
        </div>

      </div>
    </div>
  );
};

export default AllProducts;