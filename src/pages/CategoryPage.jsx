import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService } from '../services/apiService';



const CategoryPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const subQuery = searchParams.get("sub") || "";
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategoryProducts = async () => {
      setLoading(true);
      const keyword = subQuery.toLowerCase();
      
      let djItems = [];
      let fsItems = [];
      let pItems = [];

      try {
        // --- 1. GATHER PRODUCTS FROM DUMMYJSON ---
        let djUrl = "";
        if (keyword === "mobiles") djUrl = "https://dummyjson.com/products/category/smartphones?limit=30";
        else if (keyword === "laptops") djUrl = "https://dummyjson.com/products/category/laptops?limit=30";
        else if (keyword === "watch") djUrl = "https://dummyjson.com/products/category/mens-watches?limit=30";
        else if (keyword === "men") djUrl = "https://dummyjson.com/products/category/mens-shirts?limit=30";
        else if (keyword === "women") djUrl = "https://dummyjson.com/products/category/womens-dresses?limit=30";
        else if (keyword === "accessories") djUrl = "https://dummyjson.com/products/category/sunglasses?limit=30";
        else if (keyword === "shoes") djUrl = "https://dummyjson.com/products/category/mens-shoes?limit=30";
        else if (keyword === "furniture") djUrl = "https://dummyjson.com/products/category/furniture?limit=30";
        else if (keyword === "decor") djUrl = "https://dummyjson.com/products/category/home-decoration?limit=30";
        else if (keyword === "makeup") djUrl = "https://dummyjson.com/products/category/beauty?limit=30";
        else if (keyword === "skincare") djUrl = "https://dummyjson.com/products/category/skin-care?limit=30";
        else if (keyword === "perfume") djUrl = "https://dummyjson.com/products/category/fragrances?limit=30";
        else djUrl = `https://dummyjson.com/products/search?q=${keyword}&limit=30`;

        const res1 = await fetch(djUrl);
        const data1 = await res1.json();
        djItems = (data1.products || []).map(p => ({ ...p, id: `dj_${p.id}` }));
      } catch (e) {
        console.warn("DummyJSON query failed:", e.message);
      }

      try {
        // --- 2. GATHER PRODUCTS FROM FAKESTOREAPI ---
        let fsUrl = "";
        if (keyword === "men") fsUrl = "https://fakestoreapi.com/products/category/men's clothing";
        else if (keyword === "women") fsUrl = "https://fakestoreapi.com/products/category/women's clothing";
        else if (keyword === "accessories") fsUrl = "https://fakestoreapi.com/products/category/jewelery";
        else if (keyword === "mobiles" || keyword === "laptops" || keyword === "headphones" || keyword === "camera") {
          fsUrl = "https://fakestoreapi.com/products/category/electronics";
        }

        if (fsUrl) {
          const res2 = await fetch(fsUrl);
          const data2 = await res2.json();
          fsItems = (data2 || []).map(p => ({
            ...p,
            id: `fs_${p.id}`,
            images: [p.image]
          }));
        }
      } catch (e) {
        console.warn("FakeStore query failed:", e.message);
      }

      try {
        // --- 3. GATHER PRODUCTS FROM PLATZI FAKE STORE API ---
        let pUrl = "";
        if (keyword === "shoes") pUrl = "https://api.escuelajs.co/api/v1/categories/4/products?limit=35";
        else if (keyword === "furniture") pUrl = "https://api.escuelajs.co/api/v1/categories/3/products?limit=35";
        else if (keyword === "men" || keyword === "women" || keyword === "kids" || keyword === "accessories") pUrl = "https://api.escuelajs.co/api/v1/categories/1/products?limit=35";
        else if (keyword === "mobiles" || keyword === "laptops" || keyword === "watch" || keyword === "headphones") pUrl = "https://api.escuelajs.co/api/v1/categories/2/products?limit=35";
        else pUrl = `https://api.escuelajs.co/api/v1/products?limit=100`;

        const res3 = await fetch(pUrl);
        const data3 = await res3.json();
        const rawPlatzi = data3 || [];
        
        pItems = rawPlatzi
          .filter(item => {
            const title = (item.title || "").toLowerCase();
            if (keyword === "headphones") return title.includes("headphone") || title.includes("audio") || title.includes("ear") || title.includes("sound");
            if (keyword === "camera") return title.includes("camera") || title.includes("lens") || title.includes("photo");
            if (keyword === "decor") return title.includes("decor") || title.includes("vase") || title.includes("lamp") || title.includes("mirror");
            if (keyword === "kitchen") return title.includes("kitchen") || title.includes("mug") || title.includes("plate") || title.includes("pot");
            return true;
          })
          .map(item => {
            const cleanedImages = (item.images || []).map(img => {
              try {
                const parsed = JSON.parse(img);
                return typeof parsed === "string" ? parsed : img;
              } catch {
                return img.replace(/[\[\]"']/g, "");
              }
            });
            return { ...item, images: cleanedImages };
          });
      } catch (e) {
        console.warn("Platzi query failed:", e.message);
      }

      // --- 4. COMBINE AND DEDUPLICATE ---
      let combinedApiItems = [...djItems, ...fsItems, ...pItems];
      const seenTitles = new Set();
      combinedApiItems = combinedApiItems.filter(item => {
        const title = (item.title || "").toLowerCase();
        if (seenTitles.has(title)) return false;
        seenTitles.add(title);
        return true;
      });



      // --- 7. QUERY CUSTOM SELLER PRODUCTS FROM MONGO ---
      let sellerItems = [];
      try {
        const allProducts = await apiService.products.listAll();
        sellerItems = allProducts.filter(p => {
          if (!p.seller_id && !p.sellerId) return false;
          
          const pCat = (p.category || "").toLowerCase();
          if (keyword === "mobiles" && pCat === "smartphones") return true;
          if (keyword === "laptops" && pCat === "laptops") return true;
          if (keyword === "men" && pCat === "mens-shirts") return true;
          if (keyword === "shoes" && pCat === "mens-shoes") return true;
          if (keyword === "furniture" && pCat === "furniture") return true;
          if ((keyword === "makeup" || keyword === "skincare" || keyword === "perfume") && pCat === "beauty") return true;
          
          return pCat === keyword || pCat === id;
        });
      } catch (err) {
        console.error("Failed to query seller products for category:", err);
      }

      // Merge seller items at the front so they display first!
      setProducts([...sellerItems, ...combinedApiItems]);
      setLoading(false);
    };

    loadCategoryProducts();
  }, [id, subQuery]);

  const pageTitle = subQuery
    ? `${subQuery.charAt(0).toUpperCase() + subQuery.slice(1)}`
    : products[0]?.category || "Products";

  return (
    <div className='max-w-7xl mx-auto px-4 py-12'>
      <h1 className='text-4xl font-extrabold text-gray-900 text-center mb-10 capitalize tracking-tight'>{pageTitle} Collection</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <ProductCard products={products} />
      )}
    </div>
  );
};

export default CategoryPage;