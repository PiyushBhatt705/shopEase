import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Moon, Sun, Award, MapPin, Navigation, Map, Trash2, Plus, Check, Loader2 } from "lucide-react";
import Toast from "../components/Toast";

const Settings = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  
  // Theme State
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem("theme") || "light");
  
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

  // Initialize and load saved values
  useEffect(() => {
    // Apply theme
    applyThemeClass(activeTheme);
    
    // Load saved addresses
    const saved = localStorage.getItem("addresses");
    if (saved) {
      setAddresses(JSON.parse(saved));
    } else {
      // Seed default addresses
      const defaults = [
        {
          id: "addr_1",
          fullName: "Rahul Sharma (Home)",
          address: "Flat 405, Block C, Silver Oak Apartments, Outer Ring Road",
          city: "Bengaluru",
          state: "Karnataka",
          zipCode: "560103",
          phone: "+91 98765 43210",
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
    setToast(`Theme updated to ${theme.toUpperCase()}! ✨`);
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

    const map = window.L.map("leaflet-map").setView([initialLat, initialLng], 13);
    setMapInstance(map);

    // Google Maps Roadmap tile layer
    const googleStreets = window.L.tileLayer("https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
    });

    // Google Maps Satellite/Hybrid tile layer
    const googleSatellite = window.L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>'
    });

    // Default to Google Streets
    googleStreets.addTo(map);

    // Add Layer Control
    const baseLayers = {
      "Google Streets": googleStreets,
      "Google Satellite": googleSatellite
    };
    window.L.control.layers(baseLayers, null, { position: "topright" }).addTo(map);

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
        () => {
          // If denied, fallback to default Bengaluru values
        }
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
        
        // If map is loaded, fly to position
        if (mapInstance && markerInstance) {
          mapInstance.flyTo([latitude, longitude], 15);
          markerInstance.setLatLng([latitude, longitude]);
        }

        // Fetch actual reverse-geocode location details
        updateAddressFromCoords(position.coords.latitude, position.coords.longitude);
        
        setIsLocating(false);
        setToast("Location pinpointed! 📍");
        setTimeout(() => setToast(""), 2000);
      },
      (error) => {
        setIsLocating(false);
        setToast("Unable to fetch location: Access denied or Timeout ⚠️");
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
    setToast("Address saved successfully! 🏡");
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
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-8">Settings & Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Theme settings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sun size={20} className="text-blue-500" />
              <span>Theme Appearance</span>
            </h2>
            <p className="text-xs text-gray-500 mb-6">Choose a theme to personalize your ShopEase workspace experience.</p>
            
            <div className="flex flex-col gap-3">
              {/* Light Slate */}
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center justify-between p-4 rounded-2xl border font-bold text-sm cursor-pointer transition ${
                  activeTheme === "light" 
                    ? "bg-slate-50 border-blue-500 text-blue-600 shadow-xs" 
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
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
                    ? "bg-slate-900 border-blue-500 text-blue-400 shadow-xs" 
                    : "border-gray-200 hover:bg-gray-50 text-gray-750"
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
                    ? "bg-amber-950/20 border-amber-500 text-amber-500 shadow-xs" 
                    : "border-gray-200 hover:bg-gray-50 text-gray-750"
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
        </div>

        {/* RIGHT COLUMN: Address management with geolocation map picker */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Saved addresses list */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-blue-500" />
              <span>Saved Delivery Addresses</span>
            </h2>

            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No addresses saved. Add one below!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="border border-gray-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xs relative">
                    <button 
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900 text-sm">{addr.fullName}</p>
                      <p className="text-xs text-gray-500 leading-relaxed pr-6">{addr.address}</p>
                      <p className="text-xs text-gray-500">{addr.city}, {addr.state} - {addr.zipCode}</p>
                      <p className="text-xs text-gray-500 font-semibold pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Navigation size={12} className="text-blue-500" />
                      <span>GPS Coordinates: {addr.lat}, {addr.lng}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new address container with map selection */}
          <div className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-1.5">
              <Plus size={18} className="text-blue-500" />
              <span>Add New Delivery Location</span>
            </h3>

            {/* MAP & GEOLOCATOR CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
              
              {/* Interactive OpenStreetMap Map Picker (7 cols) */}
              <div className="md:col-span-7 space-y-3 z-10">
                <div className="flex justify-between items-center text-xs font-semibold text-gray-500">
                  <span className="flex items-center gap-1"><Map size={14} /> Drag marker or click map to set delivery address</span>
                </div>

                <div 
                  id="leaflet-map"
                  className="h-52 w-full bg-slate-100 border border-gray-200 rounded-2xl overflow-hidden relative shadow-inner z-10"
                >
                  {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 flex-col gap-2 z-20">
                      <Loader2 className="animate-spin text-blue-600" size={24} />
                      <span className="text-xs text-gray-500 font-semibold">Loading Map Street Layer...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Geolocator trigger card (5 cols) */}
              <div className="md:col-span-5 bg-gray-50/50 border border-gray-150 p-4 rounded-2xl flex flex-col justify-between h-fit gap-4 self-end">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm mb-1">Auto-Detect GPS</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Uses your device's GPS to find your location and reverse-geocode address fields instantly.
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm scale-hover text-xs btn-glow"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Pinpointing...</span>
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
                  <label className="text-xs font-semibold text-gray-500 uppercase">Contact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma (Home)"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="Flat No, House No, Street name"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Bengaluru"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Karnataka"
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">ZIP Code</label>
                  <input
                    type="text"
                    required
                    placeholder="560001"
                    value={addressForm.zipCode}
                    onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Coordinates</label>
                  <input
                    type="text"
                    readOnly
                    placeholder="Lat, Lng"
                    value={`${addressForm.lat}, ${addressForm.lng}`}
                    className="form-input bg-gray-50 text-gray-400 font-mono text-xs select-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-black hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 text-sm scale-hover"
              >
                <Plus size={16} />
                <span>Save New Address</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
