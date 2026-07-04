  import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const Login = () => {
  const navigate = useNavigate();

  const [toast, setToast] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await apiService.auth.login(formData.email, formData.password);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userData", JSON.stringify(loggedUser));
      setToast("Login Successful 🚀");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setToast(err.message || "Invalid Email or Password");
    }
  };

  return (
  <>
    {toast && (
      <Toast
        message={toast}
        onClose={() => setToast("")}
      />
    )}

    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-slate-950 to-purple-950 flex items-center justify-center px-4">

      {/* Floating Cyber Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Floating Sparkles & Slang Tags */}
      <div className="absolute top-10 left-10 md:left-24 text-gray-500/30 text-xs sm:text-sm font-black tracking-widest uppercase select-none genz-animate-float">
        ✨ NO CAP SHOPPING ✨
      </div>
      <div className="absolute bottom-10 right-10 md:right-24 text-gray-500/30 text-xs sm:text-sm font-black tracking-widest uppercase select-none genz-animate-float" style={{ animationDelay: '2s' }}>
        💅 GLOW UP THREADS 💅
      </div>

      {/* Login Card */}
      <div className="genz-card-cyan w-full max-w-md rounded-3xl p-8 text-white relative z-10">
        
        {/* Glow Ring behind logo */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-pink-500 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-black text-white border border-white/20 flex items-center justify-center font-black text-2xl">
              <span className="genz-gradient-text">SE</span>
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 tracking-tight">
          <span className="genz-gradient-text genz-text-glow">Main Character Energy ⚡</span>
        </h1>

        <p className="text-center text-cyan-300/80 text-sm font-semibold tracking-wide mb-8">
          Sign in to secure the haul 🛍️
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-extrabold px-1">Your Digital Address</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. bestie@shopease.xyz"
              value={formData.email}
              onChange={handleChange}
              className="w-full genz-input placeholder-slate-500 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-widest text-pink-400 font-extrabold px-1">Super Secret Key (Password)</label>
            <input
              type="password"
              name="password"
              placeholder="Make it spicy 🌶️"
              value={formData.password}
              onChange={handleChange}
              className="w-full genz-input placeholder-slate-500 text-sm font-semibold focus:border-pink-500 focus:bg-pink-500/5 focus:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-xs text-pink-400 hover:text-pink-300 font-extrabold tracking-wide transition-colors"
            >
              Forgot Key? 🧐
            </button>
          </div>

          <button
            type="submit"
            className="w-full genz-btn-gradient py-3.5 mt-2 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-black shadow-lg"
          >
            LET ME IN 🚀
          </button>
        </form>

        <p className="text-center mt-8 text-xs sm:text-sm text-slate-400 font-semibold">
          Don't have a profile yet?
          <Link
            to="/signup"
            className="text-cyan-400 font-bold ml-2 hover:text-cyan-300 underline underline-offset-4 decoration-2"
          >
            Sign Up & Glow Up
          </Link>
        </p>

        <div className="text-center mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-[10px] tracking-[4px] text-slate-500 font-black">
            POWERED BY PIYUSH BHATT - ⚡
          </p>
        </div>

      </div>
    </div>
  </>
);
};

export default Login;
