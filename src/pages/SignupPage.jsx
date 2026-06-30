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
      )}

      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4">

        {/* Animated Blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse -translate-x-1/2 -translate-y-1/2"></div>

        {/* Signup Card */}
        <div className="w-full max-w-md backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 text-white animate-[float_5s_ease-in-out_infinite]">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-lg">
              PB
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-center mb-2">
            Create Account
          </h1>

          <p className="text-center text-gray-300 mb-8">
            Join the next generation shopping experience
          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:scale-[1.02]"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:scale-[1.02]"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:scale-[1.02]"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 outline-none text-white placeholder-gray-400 transition-all duration-300 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 focus:scale-[1.02]"
            />

            <button
              type="submit"
              className="w-full bg-white text-black font-bold py-3 rounded-xl mt-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
            >
              Create Account 🚀
            </button>
          </form>

          <p className="text-center mt-6 text-gray-300">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 font-semibold hover:text-cyan-300"
            >
              Login
            </Link>
          </p>

          <div className="text-center mt-8">
            <p className="text-xs tracking-[4px] text-gray-400">
              MADE BY Piyush Bhatt-⚡
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
