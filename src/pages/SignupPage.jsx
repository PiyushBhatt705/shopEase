import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const SignupPage = () => {
  const navigate = useNavigate();

  const [toast, setToast] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setToast("Please fill all fields");
      return;
    }

    if (!emailRegex.test(formData.email)) {
      setToast("Please enter a valid email");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setToast("Passwords do not match");
      return;
    }

    try {
      const createdUser = await apiService.auth.register(formData.name, formData.email, formData.password);
      localStorage.setItem("userData", JSON.stringify(createdUser));
      localStorage.setItem("isLoggedIn", "true");
      setToast("Account Created Successfully 🚀");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setToast(err.message || "Failed to create account");
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast("")}
        />
      )}    <div className="min-h-screen relative overflow-hidden bg-linear-to-br from-black via-slate-950 to-purple-950 flex items-center justify-center px-4 py-8">

      {/* Floating Cyber Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-500/25 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Floating Sparkles & Slang Tags */}
      <div className="absolute top-10 left-10 md:left-24 text-gray-500/30 text-xs sm:text-sm font-black tracking-widest uppercase select-none genz-animate-float">
        ✨ SERVING LOOKS ✨
      </div>
      <div className="absolute bottom-10 right-10 md:right-24 text-gray-500/30 text-xs sm:text-sm font-black tracking-widest uppercase select-none genz-animate-float" style={{ animationDelay: '2s' }}>
        💅 AESTHETIC DEALS 💅
      </div>

      {/* Signup Card */}
      <div className="genz-card-pink w-full max-w-md rounded-3xl p-8 text-white relative z-10">

        {/* Glow Ring behind logo */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-1 bg-linear-to-r from-pink-500 to-violet-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-black text-white border border-white/20 flex items-center justify-center font-black text-2xl">
              <span className="genz-gradient-text">PB</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-2 tracking-tight">
          <span className="genz-gradient-text genz-text-glow">Glow Up A Profile 💅</span>
        </h1>

        <p className="text-center text-pink-300/80 text-sm font-semibold tracking-wide mb-8">
          Join the next-gen shopping elite. No cap. 🚀
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-pink-400 font-extrabold px-1">Your Identity (Name)</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Charlie Brown"
              value={formData.name}
              onChange={handleChange}
              className="w-full genz-input-pink placeholder-slate-500 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-extrabold px-1">Your Digital Inbox</label>
            <input
              type="email"
              name="email"
              placeholder="e.g. Charlie@shopease.xyz"
              value={formData.email}
              onChange={handleChange}
              className="w-full genz-input-pink placeholder-slate-500 text-sm font-semibold focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-pink-400 font-extrabold px-1">Secret Password</label>
            <input
              type="password"
              name="password"
              placeholder="Make it spicy 🌶️"
              value={formData.password}
              onChange={handleChange}
              className="w-full genz-input-pink placeholder-slate-500 text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-cyan-400 font-extrabold px-1">Prove It's You (Repeat Password)</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Make it match 🤞"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full genz-input-pink placeholder-slate-500 text-sm font-semibold focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            />
          </div>

          <button
            type="submit"
            className="w-full genz-btn-gradient py-3.5 mt-4 flex items-center justify-center gap-2 text-sm uppercase tracking-widest font-black shadow-lg"
          >
            CREATE & SHINE ✨
          </button>
        </form>

        <p className="text-center mt-6 text-xs sm:text-sm text-slate-400 font-semibold">
          Already got the keys?{" "}
          <Link
            to="/login"
            className="text-pink-400 font-bold ml-2 hover:text-pink-300 underline underline-offset-4 decoration-2"
          >
            Login
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

export default SignupPage;
