import React from 'react'
import Logo from './Logo'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa"

const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 text-gray-800 border-t border-gray-200">
      {/* Top Section - Footer Columns */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1 - Logo, Tagline & Social Icons */}
          <div className="flex flex-col items-start gap-4">
            <Logo />
            <p className="text-sm text-gray-500 leading-relaxed">
              Your one-stop shop for all your needs.
            </p>
            <div className="flex flex-row gap-3 text-gray-500 mt-2">
              <a href="#" aria-label="Facebook" className="hover:text-blue-600 transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-pink-600 transition-colors">
                <FaInstagram size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-blue-400 transition-colors">
                <FaTwitter size={20} />
              </a>
              <a href="#" aria-label="YouTube" className="hover:text-red-600 transition-colors">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2 - Company */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3 - Help */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Help</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Shipping & Delivery</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Returns</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Track Order</a></li>
            </ul>
          </div>

          {/* Column 4 - Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">Customer Service</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Refund Policy</a></li>
            </ul>
          </div>

          {/* Column 5 - Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-gray-500">
              Subscribe to get updates on new arrivals & offers.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-row w-full gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Divider Line */}
        <hr className="my-8 border-gray-200" />

        {/* Bottom Section - Copyright & Payment Badges */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} ShopEase. All Rights Reserved.
          </p>
          
          {/* Payment Badges */}
          <div className="flex items-center gap-3">
            {/* Visa */}
            <div className="h-6 w-10 bg-[#1A1F71] rounded flex items-center justify-center border border-gray-200 select-none cursor-default shadow-sm">
              <span className="text-white text-[10px] font-black italic tracking-wider">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="h-6 w-10 bg-gray-900 rounded flex items-center justify-center border border-gray-200 relative overflow-hidden select-none cursor-default shadow-sm">
              <div className="flex space-x-[-4px]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] opacity-90"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90"></div>
              </div>
            </div>
            {/* PayPal */}
            <div className="h-6 w-10 bg-white rounded flex items-center justify-center border border-gray-200 select-none cursor-default shadow-sm">
              <span className="text-[#003087] text-[10px] font-black italic">Pay</span>
              <span className="text-[#0079C1] text-[10px] font-black italic">Pal</span>
            </div>
            {/* UPI */}
            <div className="h-6 w-10 bg-white rounded flex items-center justify-center border border-gray-300 select-none cursor-default shadow-sm">
              <span className="text-teal-600 text-[9px] font-bold tracking-tight">UPI</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer