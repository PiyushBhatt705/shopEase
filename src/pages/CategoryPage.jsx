import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
  const { id } = useParams();
  const[products, setProducts] = useState([])
  useEffect(() => {
    fetch(`https://api.escuelajs.co/api/v1/categories/${id}/products`)
    .then((res) => res.json())
    .then((data) => setProducts(data))
    .catch((err) => console.log(err))
  },[])
  return (
    <div className='max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold text-center mt-8 mb-10'>{products[0]?.category?.name} Category</h1>
        <ProductCard products={products}/>
    </div>
  )
}

export default CategoryPage