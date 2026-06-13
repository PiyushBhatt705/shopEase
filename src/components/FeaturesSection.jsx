import { Lock, Truck, RotateCwSquare, Headset } from 'lucide-react'
import React from 'react'

const FeaturesSection = () => {
  return (
    <div className="w-full px-2 sm:px-4 bg-gray-100 py-6 sm:py-8 shadow-sm" style={{boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'}}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
          {/* Free Shipping card */}
          <div className="w-full sm:w-1/2 md:w-auto p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-3">
            <div className="flex-shrink-0">
              <Truck className="text-blue-500" size={32} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Free Shipping</h3>
              <p className="text-xs text-gray-600">On orders over ₹999</p>
            </div>
          </div>
          
          {/* Secure Payments card */}
          <div className="w-full sm:w-1/2 md:w-auto p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-3">
            <div className="flex-shrink-0">
              <Lock className="text-green-500" size={32} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Secure Payments</h3>
              <p className="text-xs text-gray-600">100% secure payment</p>
            </div>
          </div>

          {/* Easy returns */}
          <div className="w-full sm:w-1/2 md:w-auto p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-3">
            <div className="flex-shrink-0">
              <RotateCwSquare className="text-red-500" size={32} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-gray-900">Easy Returns</h3>
              <p className="text-xs text-gray-600">30 days return policy</p>
            </div>
          </div>
          
          {/* 24/7 customer support */}
          <div className="w-full sm:w-1/2 md:w-auto p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition flex items-center gap-3">
            <div className="flex-shrink-0">
              <Headset className="text-yellow-500" size={32} />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-bold text-gray-900">24/7 Support</h3>
              <p className="text-xs text-gray-600">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturesSection