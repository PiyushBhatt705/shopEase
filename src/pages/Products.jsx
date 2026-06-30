import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../services/apiService";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get("search") || "";
  const filterQuery = searchParams.get("filter") || "";

  // Sort & Filter States
  const [sortBy, setSortBy] = useState("default"); // default, priceLowHigh, priceHighLow, nameAZ
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    apiService.products.listAll()
      .then((data) => {
        setProducts(data || []);
      })
      .catch((err) => console.error(err));
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b pb-6 border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Showing {filteredProducts.length} of {finalProducts.length} products
          </p>
        </div>
        <Button text={"<- Back to Home"} handleClick={() => navigate("/")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDEBAR FILTERS - Left side (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
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
          {filteredProducts.length === 0 ? (
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