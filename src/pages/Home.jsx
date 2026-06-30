import React, { useEffect, useState } from 'react'
import HeroSlider from '../components/HeroSlider'
import FeaturesSection from '../components/FeaturesSection'
import Category from '../components/Category'
import ProductCard from '../components/ProductCard'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { apiService } from '../services/apiService'

const Home = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiService.products.listAll()
      .then((data) => {
        setProducts(data || []);
      })
      .catch((err) => console.error(err));
  }, []);
  return (
    <div>
      {/* banner slider */}
      <HeroSlider />
      
      {/* Features Section */}
      <div className="w-full py-8 md:py-12 lg:py-16 bg-gray-100">
        <FeaturesSection />
      </div>

      {/* shop by category section */}
      <Category />

      {/* featured products section */}
      <div className="w-full py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
         <Button text={'View All'} handleClick={() => navigate('/products')}/>
        </div>
        <ProductCard  products={products.slice(0, 12)}/>
      </div>
    </div>
  )
}

export default Home