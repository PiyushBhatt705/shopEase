import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Lock, Shield, Eye, Trash2, HelpCircle, Save, Check, RefreshCw, Volume2, Sparkles, Smartphone } from "lucide-react";
import Toast from "../components/Toast";
import { soundService } from "../services/soundService";

const Settings = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  
  // Notification States
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    orderUpdates: true
  });

  // Security States
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [activeSessions, setActiveSessions] = useState([
    { id: "sess_1", device: "Chrome - Windows 11", location: "Mumbai, IN", time: "Active Now", current: true },
    { id: "sess_2", device: "Safari - iPhone 15 Pro", location: "Bengaluru, IN", time: "2 hours ago", current: false },
    { id: "sess_3", device: "ShopEase App - Android", location: "New Delhi, IN", time: "2 days ago", current: false }
  ]);

  // Privacy States
  const [privacy, setPrivacy] = useState({
    profilePublic: false,
    personalizedAds: true,
    trackingCookies: true
  });

  // Gen-Z styling options
  const [soundEffects, setSoundEffects] = useState(() => localStorage.getItem("soundEffects") !== "false");
  const [accentColor, setAccentColor] = useState(localStorage.getItem("accentColor") || "cyan");

  const handleSoundToggle = () => {
    const nextVal = !soundEffects;
    setSoundEffects(nextVal);
    localStorage.setItem("soundEffects", nextVal ? "true" : "false");
    // Play sound immediately to confirm toggle
    if (nextVal) {
      soundService.playSuccess();
    } else {
      soundService.playTrash();
    }
    setToast(`Interactive sounds ${nextVal ? "enabled 🔊" : "disabled 🔇"}!`);
    setTimeout(() => setToast(""), 1500);
  };

  useEffect(() => {
    // Apply accent class to body if needed
    document.body.setAttribute("data-accent", accentColor);
  }, [accentColor]);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    setToast("Notification preference saved! 🔔");
    setTimeout(() => setToast(""), 1500);
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    setToast("Privacy configuration updated! 🔒");
    setTimeout(() => setToast(""), 1500);
  };

  const handleSessionRevoke = (id) => {
    setActiveSessions(prev => prev.filter(sess => sess.id !== id));
    setToast("Session successfully terminated! 🔴");
    setTimeout(() => setToast(""), 1500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setToast("Please fill all password fields ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setToast("New passwords do not match! ❌");
      setTimeout(() => setToast(""), 2000);
      return;
    }
    setToast("Password updated successfully! 🚀");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordChange(false);
    setTimeout(() => setToast(""), 2000);
  };

  const handleAccentChange = (color) => {
    setAccentColor(color);
    localStorage.setItem("accentColor", color);
    setToast(`Accent style changed to ${color.toUpperCase()}! 🎨`);
    setTimeout(() => setToast(""), 1500);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your local recommendation profile? This cannot be undone.")) {
      setToast("Browsing profile and recommendations cleared! 🧹");
      setTimeout(() => setToast(""), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Back Link */}
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
          <span className="genz-gradient-text genz-text-glow">Preferences & Security ⚙️</span>
        </h1>
        <p className="text-sm text-slate-500 font-medium">Fine-tune your app notification behaviors, security parameters, and privacy protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Theme Vibe & Sound (Gen-Z Customization) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Accent Color picker */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-pink-500" />
              <span>Glow Aesthetics</span>
            </h2>
            <p className="text-xs text-slate-400 mb-5 font-semibold">Change your system highlight color to match your vibe.</p>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Cyan Accent */}
              <button 
                onClick={() => handleAccentChange("cyan")}
                className={`py-3 rounded-2xl border font-bold text-xs cursor-pointer transition ${
                  accentColor === "cyan" 
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20" 
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                Electric Cyan
              </button>

              {/* Pink Accent */}
              <button 
                onClick={() => handleAccentChange("pink")}
                className={`py-3 rounded-2xl border font-bold text-xs cursor-pointer transition ${
                  accentColor === "pink" 
                    ? "bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20" 
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                Bubblegum Pink
              </button>

              {/* Green Accent */}
              <button 
                onClick={() => handleAccentChange("green")}
                className={`py-3 rounded-2xl border font-bold text-xs cursor-pointer transition ${
                  accentColor === "green" 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20" 
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                Acid Green
              </button>

              {/* Gold Accent */}
              <button 
                onClick={() => handleAccentChange("gold")}
                className={`py-3 rounded-2xl border font-bold text-xs cursor-pointer transition ${
                  accentColor === "gold" 
                    ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20" 
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"
                }`}
              >
                Sunset Gold
              </button>
            </div>

            {/* Sound effects toggle */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-6 pt-5">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-slate-400" />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-700 dark:text-slate-200">Interactive Sounds</h4>
                  <p className="text-[10px] text-slate-400">Play snappy clicks on hover & purchase</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={soundEffects} 
                  onChange={handleSoundToggle}
                  className="sr-only settings-toggle-checkbox" 
                />
                <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-850 transition duration-350 settings-toggle-label">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform duration-350 absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Quick FAQ info Card */}
          <div className="bg-gradient-to-br from-slate-900 to-purple-950 rounded-3xl p-6 text-white border border-slate-800">
            <h4 className="font-extrabold text-sm mb-2 flex items-center gap-1.5"><Shield size={16} className="text-pink-400" /> Privacy Shield Active</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              We practice full transparency. No cookies are shared with third-party advertising networks. Your radar and address settings are stored locally on your device storage.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: Toggles & Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* NOTIFICATION PREFERENCES */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Bell size={20} className="text-cyan-500" />
              <span>Notification Preferences</span>
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {/* Item 1: Email alerts */}
              <div className="flex items-center justify-between py-4 first:pt-0">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Email Alerts & Promotions</h4>
                  <p className="text-xs text-slate-400">Receive discount coupons, recommendations and newsletters.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.emailAlerts} 
                    onChange={() => handleNotificationToggle("emailAlerts")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>

              {/* Item 2: SMS notifications */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">SMS Direct Updates</h4>
                  <p className="text-xs text-slate-400">Receive direct alerts for high-priority flash discounts on mobile.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.smsAlerts} 
                    onChange={() => handleNotificationToggle("smsAlerts")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>

              {/* Item 3: Push alerts */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Browser Push Alerts</h4>
                  <p className="text-xs text-slate-400">Receive real-time web notifications for cart items drops.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.pushAlerts} 
                    onChange={() => handleNotificationToggle("pushAlerts")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>

              {/* Item 4: Order status */}
              <div className="flex items-center justify-between py-4 last:pb-0">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Order Delivery Updates</h4>
                  <p className="text-xs text-slate-400">Critical emails detailing package tracking and dispatch events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notifications.orderUpdates} 
                    onChange={() => handleNotificationToggle("orderUpdates")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* SECURITY CENTER */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Lock size={20} className="text-cyan-500" />
              <span>Security Protocols</span>
            </h2>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1">Two-Factor Authentication (2FA) <span className="bg-slate-100 text-slate-500 dark:bg-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded">High Security</span></h4>
                <p className="text-xs text-slate-400">Requires a temporal security code sent to your mail to login.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={twoFactor} 
                  onChange={() => {
                    setTwoFactor(!twoFactor);
                    setToast(twoFactor ? "2FA Deactivated 🔓" : "2FA Activated successfully! 🔒");
                    setTimeout(() => setToast(""), 1500);
                  }}
                  className="sr-only settings-toggle-checkbox" 
                />
                <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                  <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                </div>
              </label>
            </div>

            {/* Change Password Trigger */}
            <div className="py-5 border-b border-slate-100 dark:border-slate-850">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Account Access Credentials</h4>
                  <p className="text-xs text-slate-400">Update your access password to protect inventory.</p>
                </div>
                <button
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-cyan-500 hover:text-white transition font-extrabold text-xs px-4.5 py-2.5 rounded-xl cursor-pointer"
                >
                  {showPasswordChange ? "Hide Input" : "Update Password"}
                </button>
              </div>

              {/* Password update form */}
              {showPasswordChange && (
                <form onSubmit={handlePasswordSubmit} className="mt-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="password"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3.5 py-2.5 rounded-xl outline-none"
                    />
                    <input 
                      type="password"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3.5 py-2.5 rounded-xl outline-none"
                    />
                    <input 
                      type="password"
                      placeholder="Verify new password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-3.5 py-2.5 rounded-xl outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-black dark:bg-slate-800 text-white font-extrabold text-xs py-2 px-5 rounded-lg hover:bg-cyan-600 cursor-pointer transition"
                  >
                    Save Password
                  </button>
                </form>
              )}
            </div>

            {/* Active Sessions list */}
            <div className="pt-5">
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <Smartphone size={16} className="text-slate-400" /> Active Logged-in Terminals
              </h4>
              <div className="space-y-3">
                {activeSessions.map(sess => (
                  <div key={sess.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-xs bg-slate-50/50 dark:bg-slate-950/20">
                    <div>
                      <p className="font-extrabold text-slate-850 dark:text-slate-200">{sess.device}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{sess.location} • {sess.time}</p>
                    </div>
                    {sess.current ? (
                      <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold px-2 py-0.5 rounded text-[10px]">
                        This Device
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleSessionRevoke(sess.id)}
                        className="text-[10px] text-red-500 hover:text-red-700 font-extrabold cursor-pointer transition"
                      >
                        Revoke Access
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* PRIVACY CONTROLS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Eye size={20} className="text-cyan-500" />
              <span>Data & Privacy Options</span>
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-850 text-xs">
              <div className="flex items-center justify-between py-3.5 first:pt-0">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">Personalized Product Recommendations</h4>
                  <p className="text-slate-400 text-xs">Permit local machine learning algorithms to personalize shop items.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.personalizedAds} 
                    onChange={() => handlePrivacyToggle("personalizedAds")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">Public profile details</h4>
                  <p className="text-slate-400 text-xs">Make reviews and store status visible to other shoppers.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={privacy.profilePublic} 
                    onChange={() => handlePrivacyToggle("profilePublic")}
                    className="sr-only settings-toggle-checkbox" 
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full dark:bg-slate-800 transition settings-toggle-label">
                    <div className="w-3.5 h-3.5 bg-white rounded-full transition-transform absolute left-0.5 top-0.5 settings-toggle-dot"></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3.5 last:pb-0">
                <div>
                  <h4 className="font-bold text-slate-850 dark:text-slate-200">Purge Browsing Profile Cache</h4>
                  <p className="text-slate-400 text-xs">Deletes tracked clicks, cart predictions and mock profile telemetry.</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="border border-red-200 dark:border-red-950/60 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-2.5 rounded-xl cursor-pointer transition flex items-center gap-1"
                >
                  <Trash2 size={12} /> Clear Cache
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;
