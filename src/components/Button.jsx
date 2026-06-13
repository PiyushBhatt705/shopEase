import React from 'react'

const Button = ({text, handleClick}) => {
  return (
     <button
            className="group px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
            onClick={handleClick}
          >
            {text}  
            </button>
  )
}

export default Button