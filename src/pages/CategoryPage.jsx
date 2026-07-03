import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService } from '../services/apiService';
import { SearchX } from 'lucide-react';



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

      // --- 4. COMBINE AND DEDUPLICATE ---
      let combinedApiItems = [...djItems, ...fsItems];
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

      const combined = [...sellerItems, ...combinedApiItems];
      const seenIds = new Set();
      const uniqueProducts = [];

      for (const p of combined) {
        if (p && p.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          uniqueProducts.push(p);
        }
      }

      setProducts(uniqueProducts);
      setLoading(false);
    };

    loadCategoryProducts();
  }, [id, subQuery]);

  const pageTitle = subQuery
    ? `${subQuery.charAt(0).toUpperCase() + subQuery.slice(1)}`
    : products[0]?.category || "Category";

  return (
    <div className='max-w-7xl mx-auto px-4 py-12 animate-fade-in'>
      <h1 className='text-4xl font-extrabold text-gray-900 text-center mb-10 capitalize tracking-tight animate-slide-up'>{pageTitle} Collection</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl animate-fade-in">
          <div className="p-6 bg-white rounded-full shadow-sm mb-6">
            <SearchX size={48} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No products found</h2>
          <p className="text-gray-500 mb-8 max-w-md text-center">We couldn't find any products in the "{pageTitle}" category right now. Try exploring our other collections.</p>
          <Link to="/" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            Explore Homepage
          </Link>
        </div>
      ) : (
        <div className="animate-slide-up" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
          <ProductCard products={products} />
        </div>
      )}
    </div>
  );
};

export default CategoryPage;