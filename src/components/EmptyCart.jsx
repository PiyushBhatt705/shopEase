import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'

const EmptyCart = () => {
    const navigate = useNavigate()
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
                <div className="bg-gray-100 rounded-full p-8">
                    <ShoppingCart size={64} className="text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-500 text-center max-w-sm">
                    Looks like you haven't added anything yet. Start shopping and add items to your cart!
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 cursor-pointer"
                >
                    Continue Shopping
                </button>
            </div>
  )
}
export default EmptyCart;