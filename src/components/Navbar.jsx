import { useState, useEffect } from 'react'
import { Heart, Search, ShoppingCart, User, ChevronDown, Menu, X, Truck, CheckCircle, Bell } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import {useCart} from "../hooks/useCart";
import { apiService } from "../services/apiService";
import Toast from "./Toast";
const Navbar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [isSeller, setIsSeller] = useState(false);

  const handleLogout = () => {
    localStorage.setItem("isLoggedIn", "false");
    navigate("/");
  };
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (!isLoggedIn) return;
      const user = JSON.parse(localStorage.getItem("userData"));
      if (user && user.id) {
        try {
          const store = await apiService.seller.getStore(user.id);
          if (store) setIsSeller(true);
        } catch (err) {
          console.warn("Seller status check failed:", err.message);
        }
      }
    };
    checkSellerStatus();
  }, [isLoggedIn]);

  const { cart } = useCart();

  const cartCount = (cart || []).reduce(
    (total, item) => total + item.quantity,
    0
  );

  const [wishlistCount, setWishlistCount] = useState(0);

  const syncWishlist = () => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlistCount(JSON.parse(saved).length);
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      syncWishlist();
    }, 0);
    window.addEventListener("wishlistUpdate", syncWishlist);
    return () => {
      window.removeEventListener("wishlistUpdate", syncWishlist);
    };
  }, []);

  const [walletBalance, setWalletBalance] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [latestToast, setLatestToast] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    const user = JSON.parse(localStorage.getItem("userData"));
    if (!user || !user.id) return;

    const fetchWalletAndNotifs = async () => {
      try {
        const wData = await apiService.user.getWallet(user.id);
        setWalletBalance(wData.balance || 0);

        const notifs = await apiService.user.getNotifications(user.id);
        if (notifs && notifs.length > notifications.length) {
          setLatestToast(notifs[0].message);
        }
        setNotifications(notifs || []);
      } catch (err) {
        console.error("Failed to fetch wallet/notifs:", err.message);
      }
    };

    fetchWalletAndNotifs();
    const interval = setInterval(fetchWalletAndNotifs, 3000);
    window.addEventListener("walletUpdate", fetchWalletAndNotifs);

    return () => {
      clearInterval(interval);
      window.removeEventListener("walletUpdate", fetchWalletAndNotifs);
    };
  }, [isLoggedIn, notifications.length]);

  // Fetch wallet & notifications immediately when user opens account or notification dropdown
  useEffect(() => {
    if ((openDropdown === 'user' || openDropdown === 'notifications') && isLoggedIn) {
      window.dispatchEvent(new Event("walletUpdate"));
    }
  }, [openDropdown, isLoggedIn]);



  return (
    <div className="bg-white">
      {latestToast && <Toast message={latestToast} onClose={() => setLatestToast(null)} />}
      {/* Main Navbar */}
      <nav className="bg-white shadow-sm px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-2 md:gap-0">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 cursor-pointer">
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Shop</span>
          <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">Ease</span>
        </Link>

        {/* Middle Navigation - Hidden on Mobile */}
        <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          <Link to="/" className="text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer link-underline">Home</Link>
          
          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('shop')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer link-underline">
              <span>Shop</span>
              <ChevronDown size={16} />
            </button>
            {openDropdown === 'shop' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                <ul className="py-2">
                  <li><Link to="/products" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">All Products</Link></li>
                  <li><Link to="/products?filter=new" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">New Arrivals</Link></li>
                  <li><Link to="/products?filter=best" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Best Sellers</Link></li>
                  <li><Link to="/products?filter=collections" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Collections</Link></li>
                </ul>
              </div>
            )}
          </div>

          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('categories')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer link-underline">
              <span>Categories</span>
              <ChevronDown size={16} />
            </button>
          </div>

          <div
            className="relative group"
            onMouseEnter={() => setOpenDropdown('deals')}
            onMouseLeave={() => setOpenDropdown(null)}
          >
            <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer link-underline">
              <span>Deals</span>
              <ChevronDown size={16} />
            </button>
            {openDropdown === 'deals' && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20 transition-all duration-200 ease-out transform origin-top">
                <ul className="py-2">
                  <li><Link to="/products?filter=deals" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Today's Deals</Link></li>
                  <li><Link to="/products?filter=flash" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Flash Sale</Link></li>
                  <li><Link to="/products?filter=clearance" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Clearance</Link></li>
                  <li><Link to="/products?filter=coupons" onClick={() => setOpenDropdown(null)} className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-500 text-sm">Coupon Offers</Link></li>
                </ul>
              </div>
            )}
          </div>

          <Link to="/products?filter=new" className="text-gray-700 hover:text-blue-500 font-medium text-sm cursor-pointer link-underline">New Arrivals</Link>
        </div>

        {/* Right Side - Search and Icons */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-grow md:flex-grow-0">
          {/* Search Bar - Visible on all screens with responsive width */}
          <div className="relative flex-grow md:flex-grow-0 group">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim() !== "") {
                  navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
              className="w-full md:w-48 lg:w-56 pl-9 pr-4 py-2 bg-gray-100 hover:bg-gray-50 rounded-full border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white focus:border-blue-400 focus:shadow-md transition-all duration-300 ease-in-out md:focus:w-64 lg:focus:w-72"
            />
          </div>

          {/* Icons - Hidden on Mobile, visible on md and above */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
            {/* User Account Dropdown (Flipkart / Amazon style) */}
            <Link 
              to={isLoggedIn ? "/account" : "/login"}
              className="flex items-center space-x-1.5 text-gray-700 hover:text-blue-500 font-semibold text-sm cursor-pointer transition py-1"
            >
              <div className="p-1.5 bg-gray-100 rounded-full text-gray-650 hover:bg-blue-50 hover:text-blue-600 transition">
                <User size={18} />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-[10px] text-gray-400 font-extrabold leading-none uppercase flex items-center gap-1">
                  Hello, {isLoggedIn ? (JSON.parse(localStorage.getItem("userData"))?.name?.split(" ")[0] || "User") : "Sign In"}
                  {isSeller && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm shadow-blue-300" title="Verified Merchant Account"></span>}
                </p>
                <p className="text-xs font-extrabold flex items-center gap-0.5 mt-0.5">
                  <span>Account</span>
                </p>
              </div>
            </Link>

            {/* Wishlist Icon */}
            <Link 
              to="/wishlist"
              className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer group"
            >
              <Heart size={20} className="icon-bounce" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center">{wishlistCount}</span>
              )}
            </Link>

            {/* Track Order Icon */}
            <Link
              to="/track-order"
              className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer group"
            >
              <Truck size={20} className="icon-bounce" />
              <span className="absolute bottom-[-32px] left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-md pointer-events-none tracking-wide z-30 border border-slate-800">
                Track Order 🚚
              </span>
            </Link>

            {/* Notification Bell */}
            {isLoggedIn && (
              <div
                className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer group mr-1"
                onMouseEnter={() => setOpenDropdown('notifications')}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <div 
                  className="p-1.5 hover:bg-gray-100 rounded-full transition flex items-center justify-center relative"
                  onClick={async () => {
                    if (notifications.length > 0) {
                      const user = JSON.parse(localStorage.getItem("userData"));
                      await apiService.user.markNotificationsRead(user.id);
                      setNotifications([]);
                    }
                  }}
                >
                  <Bell size={20} className="icon-bounce" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center animate-pulse shadow-sm shadow-red-200">
                      {notifications.length}
                    </span>
                  )}
                </div>
                
                {openDropdown === 'notifications' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-35 py-3 animate-scale-in text-gray-800">
                    <div className="px-4 pb-2 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <span className="font-extrabold text-xs text-gray-400 uppercase tracking-wider">Notifications</span>
                      {notifications.length > 0 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const user = JSON.parse(localStorage.getItem("userData"));
                            await apiService.user.markNotificationsRead(user.id);
                            setNotifications([]);
                            setOpenDropdown(null);
                          }}
                          className="text-[10px] text-blue-600 hover:text-blue-700 font-extrabold cursor-pointer uppercase transition"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-gray-400 font-medium">
                          No new notifications 🔔
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id || n._id} className="px-4 py-3.5 hover:bg-gray-50 transition flex flex-col gap-1">
                            <p className="text-xs text-gray-700 font-semibold leading-relaxed">{n.message}</p>
                            <span className="text-[9px] text-gray-400 font-medium block">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Icon */}
            <Link
            to="/cart"
            className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer group"
            >
            <ShoppingCart size={20} className="icon-bounce" />

            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center animate-pulse">
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
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Home</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Shop</Link>
            <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Categories</Link>
            <Link to="/products?filter=deals" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">Deals</Link>
            <Link to="/products?filter=new" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">New Arrivals</Link>
            <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer">My Orders 📦</Link>
            <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer font-semibold text-cyan-600">Account Control Center 👾</Link>
            <Link to="/manage-account" onClick={() => setMobileMenuOpen(false)} className="block text-slate-500 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer font-semibold">Account Hub & Radar 🛰️</Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer font-semibold text-pink-650">Preferences & Security ⚙️</Link>
            <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="block text-gray-700 hover:text-blue-500 font-medium text-sm py-2 cursor-pointer font-semibold text-blue-600">Track Order 🚚</Link>

            {/* Mobile Icons */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              {isLoggedIn ? (
                <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="
                    px-4
                    py-2
                    bg-red-500
                    text-white
                    rounded-lg
                    hover:bg-red-600
                    transition scale-hover font-semibold
                " >
                    Logout
                </button>
                ) : (
                    <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="
                    px-4
                    py-2
                    bg-cyan-500
                    text-white
                    rounded-lg
                    hover:bg-cyan-600
                    transition scale-hover font-semibold
                    "
                    >
                    Login
                    </Link>
                )}
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer"
              >
                <Heart size={20} className="icon-bounce" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">{wishlistCount}</span>
                )}
              </Link>
              
              <Link
                to="/track-order"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer"
              >
                <Truck size={20} className="icon-bounce" />
              </Link>

              <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-500 transition relative cursor-pointer"
              >
              <ShoppingCart size={20} className="icon-bounce" />

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
        <div className="hidden lg:block bg-white border-t border-gray-200 px-6 py-6 shadow-lg" onMouseEnter={() => setOpenDropdown('categories')} onMouseLeave={() => setOpenDropdown(null)}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-8">
            {/* Fashion */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4 flex items-center">
                <span className="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center mr-2">📦</span>
                Fashion
              </h3>
              <ul className="space-y-2">
                <li><Link to="/category/1?sub=men" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Men</Link></li>
                <li><Link to="/category/1?sub=women" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Women</Link></li>
                <li><Link to="/category/1?sub=kids" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Kids</Link></li>
                <li><Link to="/category/4?sub=shoes" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Shoes</Link></li>
                <li><Link to="/category/1?sub=accessories" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Accessories</Link></li>
              </ul>
            </div>

            {/* Electronics */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Electronics</h3>
              <ul className="space-y-2">
                <li><Link to="/category/2?sub=mobiles" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Mobiles</Link></li>
                <li><Link to="/category/2?sub=laptops" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Laptops</Link></li>
                <li><Link to="/category/2?sub=headphones" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Headphones</Link></li>
                <li><Link to="/category/2?sub=watch" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Smart Watches</Link></li>
                <li><Link to="/category/2?sub=camera" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Cameras</Link></li>
              </ul>
            </div>

            {/* Home & Living */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Home & Living</h3>
              <ul className="space-y-2">
                <li><Link to="/category/3?sub=furniture" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Furniture</Link></li>
                <li><Link to="/category/3?sub=decor" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Home Decor</Link></li>
                <li><Link to="/category/3?sub=kitchen" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Kitchen</Link></li>
                <li><Link to="/category/3?sub=bedding" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Bedding</Link></li>
                <li><Link to="/category/3?sub=lighting" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Lighting</Link></li>
              </ul>
            </div>

            {/* Beauty */}
            <div>
              <h3 className="text-gray-900 font-bold mb-4">Beauty</h3>
              <ul className="space-y-2">
                <li><Link to="/category/5?sub=makeup" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Makeup</Link></li>
                <li><Link to="/category/5?sub=skincare" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Skincare</Link></li>
                <li><Link to="/category/5?sub=hair" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Haircare</Link></li>
                <li><Link to="/category/5?sub=perfume" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Fragrances</Link></li>
                <li><Link to="/category/5?sub=wellness" onClick={() => setOpenDropdown(null)} className="text-gray-600 hover:text-blue-500 text-sm block font-semibold transition">Wellness</Link></li>
              </ul>
            </div>

            {/* Sidebar - Featured */}
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="space-y-3">
                <Link to="/products" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>📦</span>
                  <span>All Products</span>
                </Link>
                <Link to="/products?filter=best" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>⭐</span>
                  <span>Best Sellers</span>
                </Link>
                <Link to="/products?filter=top" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>👍</span>
                  <span>Top Rated</span>
                </Link>
                <Link to="/products?filter=featured" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>✨</span>
                  <span>Featured</span>
                </Link>
                <Link to="/products?filter=sale" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>🏷️</span>
                  <span>On Sale</span>
                </Link>
                <Link to="/products?filter=new" onClick={() => setOpenDropdown(null)} className="flex items-center space-x-2 text-gray-700 text-sm cursor-pointer hover:text-blue-500">
                  <span>🆕</span>
                  <span>New Arrivals</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Navbar