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

    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">

      {/* Background Glow Effects */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse -translate-x-1/2 -translate-y-1/2"></div>

      {/* Login Card */}
      <div className="float-card w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-lg">
            PB
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-extrabold text-center mb-2">
          Welcome Back 👋
        </h1>

        <p className="text-center text-gray-300 mb-8">
          Login to continue shopping
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="
              w-full
              bg-white/5
              border
              border-white/20
              rounded-xl
              px-4
              py-3
              outline-none
              text-white
              placeholder-gray-400
              transition-all
              duration-300
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-500/20
              focus:scale-[1.02]
            "
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="
              w-full
              bg-white/5
              border
              border-white/20
              rounded-xl
              px-4
              py-3
              outline-none
              text-white
              placeholder-gray-400
              transition-all
              duration-300
              focus:border-cyan-400
              focus:ring-4
              focus:ring-cyan-500/20
              focus:scale-[1.02]
            "
          />

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="
              w-full
              bg-white
              text-black
              font-bold
              py-3
              rounded-xl
              cursor-pointer
              transition-all
              duration-300
              hover:scale-105
              hover:shadow-2xl
              active:scale-95
            "
          >
            Login 🚀
          </button>
        </form>

        <p className="text-center mt-6 text-gray-300">
          Don't have an account?
          <Link
            to="/signup"
            className="text-cyan-400 font-semibold ml-2 hover:text-cyan-300"
          >
            Sign Up
          </Link>
        </p>

        <div className="text-center mt-8">
          <p className="text-xs tracking-[4px] text-gray-400">
            MADE BY PIYUSH BHATT -⚡
          </p>
        </div>

      </div>
    </div>
  </>
);
};

export default Login;
