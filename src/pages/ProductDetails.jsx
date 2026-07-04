import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingBag, Heart, MessageSquare, Send, AlertTriangle } from 'lucide-react'
import Button from '../components/Button'
import Toast from '../components/Toast'
import {useCart} from '../hooks/useCart'
import { apiService } from '../services/apiService'

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const {addToCart} = useCart()
  const [toast, setToast] = useState(null)

  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [wishlist, setWishlist] = useState([])
  const [reviews, setReviews] = useState([])
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState("")

  // Wishlist logic
  useEffect(() => {
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const isWishlisted = (id) => wishlist.some((item) => item.id === id);

  const toggleWishlist = () => {
    let updated;
    if (isWishlisted(product.id)) {
      updated = wishlist.filter((item) => item.id !== product.id);
      setToast("Removed from wishlist 💔");
    } else {
      updated = [...wishlist, product];
      setToast("Added to wishlist ❤️");
    }
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdate"));
    setTimeout(() => setToast(null), 2000);
  };

  // Review logic
  useEffect(() => {
    if (product?.id) {
      const saved = localStorage.getItem(`reviews_${product.id}`);
      if (saved) {
        setReviews(JSON.parse(saved));
      } else {
        const defaults = [
          { name: "Jessica T.", rating: 5, comment: "Absolutely love it! Exceeded my expectations. Build quality is solid.", date: "2026-06-15" },
          { name: "Mark D.", rating: 4, comment: "Very good product. Delivery took one day longer, but overall satisfied.", date: "2026-06-18" }
        ];
        setReviews(defaults);
        localStorage.setItem(`reviews_${product.id}`, JSON.stringify(defaults));
      }
    }
  }, [product]);

  const handleAddReview = (e) => {
    e.preventDefault();
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setToast("Please login first to submit a review ⚠️");
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    const newReview = {
      name: userData?.name || "Verified Customer",
      rating: ratingInput,
      comment: commentInput,
      date: new Date().toISOString().split("T")[0]
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updated));
    setCommentInput("");
    setToast("Review submitted! Thank you ⭐");
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    apiService.products.getById(id)
      .then((data) => {
        if (data) {
          const finalProduct = {
            ...data,
            id: id,
            images: data.images || [data.thumbnail]
          };
          setProduct(finalProduct);
        } else {
          // Fallback to Platzi Fake Store API directly
          fetch(`https://api.escuelajs.co/api/v1/products/${id}`)
            .then(res => res.ok ? res.json() : null)
            .then(platziData => {
              if (platziData) {
                const cleanedImages = (platziData.images || []).map((img) => {
                  try {
                    const parsed = JSON.parse(img);
                    return typeof parsed === 'string' ? parsed : img;
                  } catch {
                    return img.replace(/[\[\]"']/g, '');
                  }
                });
                setProduct({
                  ...platziData,
                  id: id,
                  images: cleanedImages
                });
              }
            });
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

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
          <div className="flex items-baseline gap-3">
            <p className="text-3xl font-black text-gray-900">
              ${parseFloat(product.price || 0).toFixed(2)}
            </p>
            {(product.originalPrice && product.originalPrice > product.price) && (
              <>
                <p className="text-lg text-gray-400 line-through font-semibold">
                  ${parseFloat(product.originalPrice).toFixed(2)}
                </p>
                <p className="text-xs text-green-600 font-bold bg-green-50 border border-green-100 px-2 py-1 rounded-lg uppercase tracking-wider">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% Off
                </p>
              </>
            )}
          </div>
          
          {product.stock <= 10 && product.stock > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-150 w-fit uppercase tracking-wide shadow-sm animate-pulse">
              <AlertTriangle size={13} className="text-amber-500" />
              <span>Hurry, only {product.stock} items left in stock!</span>
            </div>
          )}

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

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
             className="flex-1 cursor-pointer bg-gray-100 border border-gray-200 text-gray-800 py-3.5 rounded-xl hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-300 flex items-center justify-center gap-2 font-bold scale-hover shadow-sm"
             onClick={(e) => {
              e.stopPropagation()
              if (addToCart(product)) {
                setToast("Added to cart 🛒")
                setTimeout(() => setToast(null),3000)
              }
             }}
             >
              <ShoppingBag size={18} />
              Add to Cart
            </button>

            <button
             className="flex-1 cursor-pointer bg-black hover:bg-blue-600 text-white py-3.5 rounded-xl transition duration-300 flex items-center justify-center gap-2 font-bold scale-hover shadow-md btn-glow"
             onClick={(e) => {
              e.stopPropagation()
              navigate("/checkout", { state: { buyNowProduct: product } })
             }}
             >
              Buy Now
            </button>

            <button
             onClick={toggleWishlist}
             className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all scale-hover flex items-center justify-center shadow-xs cursor-pointer"
             title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
             >
              <Heart size={20} fill={isWishlisted(product.id) ? "red" : "none"} className={isWishlisted(product.id) ? "text-red-500" : "text-gray-500"} />
            </button>
          </div>

        </div>
      </div>  

      {/* REVIEWS SECTION */}
      <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare size={22} className="text-blue-500" />
          <span>Customer Reviews</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Review Form */}
          <div className="lg:col-span-4 bg-gray-50 border border-gray-100 p-5 rounded-xl space-y-4 h-fit">
            <h3 className="font-bold text-gray-800 text-lg">Write a Review</h3>
            
            <form onSubmit={handleAddReview} className="space-y-4">
              {/* Rating Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingInput(star)}
                      className="text-2xl transition hover:scale-110 cursor-pointer"
                    >
                      {star <= ratingInput ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Review Comments</label>
                <textarea
                  rows={3}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share your thoughts about this product..."
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 outline-none text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm scale-hover btn-glow text-sm"
              >
                <Send size={14} />
                <span>Submit Review</span>
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8 space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-center py-10">No reviews yet. Be the first to review this product!</p>
            ) : (
              reviews.map((rev, idx) => (
                <div key={idx} className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-gray-800 text-sm block">{rev.name}</span>
                      <span className="text-yellow-500 text-xs">
                        {"⭐".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{rev.date}</span>
                  </div>
                  <p className="text-sm text-gray-650 leading-relaxed font-medium">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
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