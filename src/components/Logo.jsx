import React from 'react'
import { Link } from 'react-router-dom'

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity">
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Shop</span>
        <span className="text-lg sm:text-xl md:text-2xl font-bold text-blue-500">Ease</span>
    </Link>
  )
}

export default Logo