import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import Button from "../components/Button";
import {  useNavigate } from "react-router-dom";
const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate()

  useEffect(() => {
    fetch("https://api.escuelajs.co/api/v1/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      
      {/* Heading */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">
            All Products
          </h1>
          <p className="text-gray-500 mt-2">
            Showing {products.length} products
          </p>
        </div>
      <Button text={' <- Back to home'} handleClick={navigate('/')} />
      </div>

      {/* Product Grid */}
      <ProductCard products={products} />
    </div>
  );
};

export default AllProducts;