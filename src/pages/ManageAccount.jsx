import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Award, MapPin, Navigation, Map, Trash2, Plus, Check, Loader2, User, Globe, Cpu } from "lucide-react";
import Toast from "../components/Toast";

const ManageAccount = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  
  // Theme State
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("theme") || "light");
  
  // User Data State
  const [userData, setUserData] = useState({
    name: "Bestie Guest",
    email: "guest@shopease.xyz",
    id: ""
  });

  // Addresses State
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    lat: "12.9716",
    lng: "77.5946"
  });

  const [isLocating, setIsLocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [markerInstance, setMarkerInstance] = useState(null);

  // Load user data and saved values
  useEffect(() => {
    // Apply theme
    applyThemeClass(activeTheme);
    
    // Load user data
    const savedUser = localStorage.getItem("userData");
    if (savedUser) {
      setUserData(JSON.parse(savedUser));
    }

    // Load saved addresses
    const saved = localStorage.getItem("addresses");
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      // Seed default addresses (no personal details)
      const defaults = [
        {
          id: "addr_1",
          fullName: "Charlie Brown (Home)",
          address: "123 Main Street, Sector 45",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560001",
          phone: "555-0199",
          lat: "12.9716",
          lng: "77.5946"
        }
      ];
      setAddresses(defaults);
      localStorage.setItem("addresses", JSON.stringify(defaults));
    }
  }, []);

  const applyThemeClass = (theme) => {
    const body = document.body;
    body.classList.remove("dark-theme-active", "gold-theme-active");
    if (theme === "dark") {
      body.classList.add("dark-theme-active");
    } else if (theme === "gold") {
      body.classList.add("gold-theme-active");
    }
  };

  const handleThemeChange = (theme) => {
    setActiveTheme(theme);
    localStorage.setItem("theme", theme);
    applyThemeClass(theme);
    setToast(`Theme shifted to ${theme.toUpperCase()}! ✨`);
    setTimeout(() => setToast(""), 2000);
  };

  // Load Leaflet CDN script & styles
  useEffect(() => {
    if (window.L) {
      setMapLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.body.removeChild(script);
      } catch (err) {
        // Ignore removal
      }
    };
  }, []);

  const updateAddressFromCoords = (lat, lng) => {
    const latitude = parseFloat(lat).toFixed(4);
    const longitude = parseFloat(lng).toFixed(4);

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`)
      .then((res) => res.json())
      .then((data) => {
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || "Unknown City";
        const state = addr.state || "Unknown State";
        const zip = addr.postcode || "";
        const displayAddress = data.display_name || `Location Near Lat ${latitude}, Lng ${longitude}`;

        setAddressForm((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          address: displayAddress,
          city: city,
          state: state,
          zipCode: zip
        }));
      })
      .catch((err) => {
        console.error("Reverse geocode error:", err);
        setAddressForm((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
          address: `Location Near Lat ${latitude}, Lng ${longitude}`
        }));
      });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || !window.L) return;

    const initialLat = parseFloat(addressForm.lat) || 12.9716;
    const initialLng = parseFloat(addressForm.lng) || 77.5946;

    // Fix default marker icon path issue in Leaflet CDN
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });

    const map = window.L.map("leaflet-map-acc").setView([initialLat, initialLng], 13);
    setMapInstance(map);

    // Google Maps Roadmap tile layer
    const googleStreets = window.L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
    });

    googleStreets.addTo(map);

    // Add marker
    const marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
    setMarkerInstance(marker);

    // Auto-pinpoint user's current location on mount if permitted
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude.toFixed(4);
          const longitude = position.coords.longitude.toFixed(4);
          map.setView([latitude, longitude], 13);
          marker.setLatLng([latitude, longitude]);
          updateAddressFromCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {}
      );
    }

    // Update form when marker is dragged
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      updateAddressFromCoords(position.lat, position.lng);
    });

    // Update marker and form when map is clicked
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      updateAddressFromCoords(lat, lng);
    });

    return () => {
      map.remove();
    };
  }, [mapLoaded]);

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setToast("Geolocation is not supported by your browser ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(4);
        const longitude = position.coords.longitude.toFixed(4);
        
        if (mapInstance && markerInstance) {
          mapInstance.flyTo([latitude, longitude], 15);
          markerInstance.setLatLng([latitude, longitude]);
        }

        updateAddressFromCoords(position.coords.latitude, position.coords.longitude);
        
        setIsLocating(false);
        setToast("Location pinpointed! 📍");
        setTimeout(() => setToast(""), 2000);
      },
      (error) => {
        setIsLocating(false);
        setToast("Unable to fetch location: Access denied ⚠️");
        setTimeout(() => setToast(""), 3000);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Add Address Form Submit
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.address.trim() || !addressForm.phone.trim()) {
      setToast("Please fill in all details correctly ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    const newAddress = {
      id: "addr_" + Date.now(),
      ...addressForm
    };

    const updated = [...addresses, newAddress];
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));

    // Reset Form
    setAddressForm({
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      lat: "12.9716",
      lng: "77.5946"
    });
    setToast("Address saved to local storage! 🏡");
    setTimeout(() => setToast(""), 2000);
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    const updated = addresses.filter((addr) => addr.id !== id);
    setAddresses(updated);
    localStorage.setItem("addresses", JSON.stringify(updated));
    setToast("Address deleted 🗑️");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Back to Home */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-black dark:hover:text-white mb-6 font-semibold transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      {/* Hero Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          <span className="genz-gradient-text genz-text-glow">Control Hub & Addresses 🛰️</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">Manage your delivery radar and visual profile settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Profile & Theme settings */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-pink-500 flex items-center justify-center text-white font-extrabold shadow-md">
                <User size={22} />
              </div>
              <div>
                <span className="bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-900/60 uppercase tracking-widest">
                  Elite VIP
                </span>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base mt-0.5">{userData.name}</h3>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <span className="font-extrabold text-slate-700 dark:text-slate-350 truncate max-w-[180px]">{userData.email}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Shopper Rank</span>
                <span className="font-extrabold text-cyan-500">Tier 1: No Cap</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wider">Radar Status</span>
                <span className="font-extrabold text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Active
                </span>
              </div>
            </div>
          </div>

          {/* Theme appearance card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sun size={20} className="text-cyan-500" />
              <span>Theme Appearance</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6 font-medium">Choose a theme vibe to personalize your ShopEase workspace experience.</p>
            
            <div className="flex flex-col gap-3">
              {/* Light Slate */}
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-between p-4 rounded-2xl border font-bold text-sm cursor-pointer transition ${
                  activeTheme === "light" 
                    ? "bg-slate-50 border-cyan-500 text-cyan-600 shadow-sm dark:bg-slate-850" 
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={18} />
                  <span>Light Slate (Default)</span>
                </div>
                {activeTheme === "light" && <Check size={16} />}
              </button>

              {/* Midnight Dark */}
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center justify-between p-4 rounded-2xl border font-bold text-sm cursor-pointer transition ${
                  activeTheme === "dark" 
                    ? "bg-slate-900 border-pink-500 text-pink-400 shadow-sm" 
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={18} />
                  <span>Sleek Midnight (Dark)</span>
                </div>
                {activeTheme === "dark" && <Check size={16} />}
              </button>

              {/* Imperial Gold */}
              <button
                onClick={() => handleThemeChange("gold")}
                className={`flex items-center justify-between p-4 rounded-2xl border font-bold text-sm cursor-pointer transition ${
                  activeTheme === "gold" 
                    ? "bg-amber-950/20 border-amber-500 text-amber-500 shadow-sm" 
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award size={18} />
                  <span>Imperial Gold (Luxury Dark)</span>
                </div>
                {activeTheme === "gold" && <Check size={16} />}
              </button>
            </div>
          </div>

          {/* Browser Stats (Diagnostics) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm text-xs">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={14} className="text-pink-500" /> System Diagnostics
            </h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex justify-between"><span className="font-semibold">Loc. Accuracy:</span> <span className="font-mono text-slate-600 dark:text-slate-300">~15 meters</span></p>
              <p className="flex justify-between"><span className="font-semibold">Radar API:</span> <span className="font-mono text-emerald-500">Operational</span></p>
              <p className="flex justify-between"><span className="font-semibold">Local Storage Cache:</span> <span className="font-mono text-slate-600 dark:text-slate-300">Used (~2.4 KB)</span></p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Address management with geolocation map picker */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Saved addresses list */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-cyan-500" />
              <span>Saved Delivery Addresses</span>
            </h2>

            {addresses.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No addresses saved. Add one below!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-sm relative bg-slate-50/50 dark:bg-slate-950/20">
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{addr.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-6">{addr.address}</p>
                      <p className="text-xs text-slate-400">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-xs text-slate-500 font-bold pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-850 flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                      <Navigation size={12} className="text-cyan-500" />
                      <span>GPS: {addr.lat}, {addr.lng}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new address container with map selection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Plus size={18} className="text-cyan-500" />
              <span>Add New Delivery Location</span>
            </h3>

            {/* MAP & GEOLOCATOR CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
              
              {/* Interactive OpenStreetMap Map Picker (7 cols) */}
              <div className="md:col-span-7 space-y-3 z-10">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><Map size={14} /> Click or drag marker on map to pinpoint delivery</span>
                </div>

                <div 
                  id="leaflet-map-acc"
                  className="h-56 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden relative shadow-inner z-10"
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-55 dark:bg-slate-955 flex-col gap-2 z-20">
                      <Loader2 className="animate-spin text-cyan-500" size={24} />
                      <span className="text-xs text-slate-400 font-semibold">Loading Map Street Layer...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geolocator trigger card (5 cols) */}
              <div className="md:col-span-5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 p-4 rounded-2xl flex flex-col justify-between h-fit gap-4 self-end">
                <div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm mb-1">Auto-Detect GPS</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Queries device geolocation instantly to lookup details and populate shipping fields automatically.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm text-xs"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Radar Active...</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={14} />
                      <span>Use Current Location</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* FORM INPUTS */}
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Charlie Brown"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 555-0199"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apartment, Suite, Street name"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 dark:text-slate-250 focus:border-cyan-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">GPS Coords</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Lat, Lng"
                    value={`${addressForm.lat}, ${addressForm.lng}`}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-400 select-none font-mono text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-black dark:bg-slate-800 hover:bg-cyan-600 dark:hover:bg-cyan-600 text-white font-extrabold py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md flex items-center justify-center gap-1.5 text-sm"
              >
                <Plus size={16} />
                <span>Save New Radar Location</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ManageAccount;
