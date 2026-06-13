import React, { useState } from 'react'
import { Heart, Search, ShoppingCart, User, ChevronDown, Menu, X } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import {useCart} from "../hooks/useCart";

const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

 const handleLogout = () => {
  localStorage.setItem("isLoggedIn", "false");

  navigate("/");
};
const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const { cart } = useCart();

  const cartCount = (cart || []).reduce(
    (total, item) => total + item.quantity,
    0
  );


  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };


  return (
    <div className="bg-white">
      {/* Main Navbar */}
      <nav className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-0">
        {/* Logo */}
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Shop</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">Ease</span>
        </div>

        {/* Middle Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <a href="#" className="text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer">Home</a>
          
          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('shop')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer">
              <span>Shop</span>
              <ChevronDown size={16} />
            </button>
            {openDropdown === 'shop' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <ul className="py-2">
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">All Products</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">New Arrivals</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Best Sellers</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Collections</a></li>
                </ul>
              </div>
            )}
          </div>

          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('categories')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer">
              <span>Categories</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('deals')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer">
              <span>Deals</span>
              <ChevronDown size={16} />
            </button>
            {openDropdown === 'deals' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 transition-all duration-200 ease-out transform origin-top">
                <ul className="py-2">
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Today's Deals</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Flash Sale</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Clearance</a></li>
                  <li><a href="#" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Coupon Offers</a></li>
                </ul>
              </div>
            )}
          </div>

          <a href="#" className="text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer">New Arrivals</a>
        </div>

        {/* Right Side - Search and Icons */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-grow md:flex-grow-0">
          {/* Search Bar - Visible on all screens with responsive width */}
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full md:w-48 lg:w-56 pl-8 pr-3 py-2 bg-gray-100 rounded-md border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Icons - Hidden on Mobile, visible on md and above */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* User Icon */}
            {isLoggedIn ? (
              <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
              ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                Login
              </Link>
            )}

            {/* Wishlist Icon */}
            <button className="text-gray-700 hover:text-blue-500 transition relative">
              <Heart size={20} />
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">5</span>
            </button>

            {/* Cart Icon */}
            <Link
            to="/cart"
            className="text-gray-700 hover:text-blue-500 hover:scale-110 transition-all duration-300 relative cursor-pointer"
            >
            <ShoppingCart size={20} />

            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {cartCount}
                </span>
            )}
            </Link>
          </div>

          {/* Hamburger Menu - Visible only on Mobile */}
          <button
            className="lg:hidden text-gray-700 hover:text-blue-500 transition flex-shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} className="sm:size-24" /> : <Menu size={20} className="sm:size-24" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Navigation Links */}
            <a href="#" className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Home</a>
            <a href="#" className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Shop</a>
            <a href="#" className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Categories</a>
            <a href="#" className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Deals</a>
            <a href="#" className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">New Arrivals</a>

            {/* Mobile Icons */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              {isLoggedIn ? (
                <button
                onClick={handleLogout}
                className="
                    px-4
                    py-2
                    bg-red-500
                    text-white
                    rounded-lg
                    hover:bg-red-600
                    transition
                " >
                    Logout
                </button>
                ) : (
                    <Link
                    to="/login"
                    className="
                    px-4
                    py-2
                    bg-cyan-500
                    text-white
                    rounded-lg
                    hover:bg-cyan-600
                    transition
                    "
                    >
                    Login
                    </Link>
                )}
              <button className="text-gray-700 hover:text-blue-500 transition relative">
                <Heart size={20} />
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">5</span>
              </button>
              <Link
              to="/cart"
              className="text-gray-700 hover:text-blue-500 hover:scale-110 transition-all duration-300 relative cursor-pointer"
              >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs animate-pulse">
                {cartCount}
                </span>
              )}
            </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mega Dropdown Menu - Desktop Only */}
      {openDropdown === 'categories' && (
        <div className="hidden lg:block bg-white border-t border-gray-200 px-6 py-6 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {/* Fashion */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center mr-2">📦</span>
                Fashion
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Men</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Women</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Kids</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Shoes</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Accessories</a></li>
              </ul>
            </div>

            {/* Electronics */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Electronics</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Mobiles</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Laptops</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Headphones</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Smart Watches</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Cameras</a></li>
              </ul>
            </div>

            {/* Home & Living */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Home & Living</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Furniture</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Home Decor</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Kitchen</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Bedding</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Lighting</a></li>
              </ul>
            </div>

            {/* Beauty */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Beauty</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Makeup</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Skincare</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Haircare</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Fragrances</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-500 text-sm">Wellness</a></li>
              </ul>
            </div>

            {/* Sidebar - Featured */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>📦</span>
                  <span>All Products</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>⭐</span>
                  <span>Best Sellers</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>👍</span>
                  <span>Top Rated</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>✨</span>
                  <span>Featured</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>🏷️</span>
                  <span>On Sale</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>🆕</span>
                  <span>New Arrivals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar