import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import Button from '../components/Button'
import Toast from '../components/Toast'
import {useCart} from '../hooks/useCart'


const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {addToCart} = useCart()
  const [toast, setToast] = useState(null)

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetch(`https://api.escuelajs.co/api/v1/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const cleanedImages = (data.images || []).map((img) => {
          try {
            const parsed = JSON.parse(img)
            return typeof parsed === 'string' ? parsed : img
          } catch {
            return img.replace(/[\[\]"']/g, '')
          }
        })

        const finalProduct = { ...data, images: cleanedImages }
        setProduct(finalProduct)
      })
      .catch((err) => console.log(err))
  }, [id])

  useEffect(() => {
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0])
    }
  }, [product])

  if (!product) {
    return (
      <div className="flex items-center justify-center h-screen text-lg">
        Loading product...
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Back to Home button */}
      <div className='mb-6 mt-6 flex-1 justify-end'>
      <Button text={'<- Back to Home'} handleClick={() => navigate('/')} />
      </div>
      
      {/* Main container */}
      <div className="flex flex-col md:flex-row gap-10 bg-white p-6 rounded-2xl shadow-lg">

        {/* LEFT SIDE - IMAGES */}
        <div className="md:w-1/2">

          {/* Main Image */}
          <div className="bg-gray-50 rounded-xl p-4">
            <img
              src={selectedImage}
              alt="Product"
              className="w-full max-h-[500px] object-contain rounded-xl transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          <div className="flex gap-3 mt-4 overflow-x-auto">
            {product?.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 hover:scale-105
                ${selectedImage === img ? "border-blue-500" : "border-gray-200"}`}
                alt={`thumb-${index}`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE - DETAILS */}
        <div className="md:w-1/2 flex flex-col gap-5">

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {product.title}
          </h1>

          {/* Price */}
          <p className="text-2xl font-semibold text-green-600">
            ${product.price}
          </p>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">
            {product.description}
          </p>

          {/* Category */}
          {product.category?.name && (
            <span className="text-sm text-gray-500">
              Category: {product.category.name}
            </span>
          )}

          {/* Rating UI (static) */}
          <div className="flex items-center gap-2 text-yellow-500">
            ⭐⭐⭐⭐☆
            <span className="text-gray-600 text-sm">(120 reviews)</span>
          </div>

          {/* Button */}
          <button
           className="mt-4 w-full cursor-pointer bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2"
           onClick={(e) => {
            e.stopPropagation()
            addToCart(product)
            setToast("Added to cart 🛒")
            setTimeout(() => setToast(null),3000)
           }}
           >
            <ShoppingBag size={18} />
            Add to Cart
          </button>

        </div>
      </div>  
      {toast && (
        <Toast
          message={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
  
}

export default ProductDetails