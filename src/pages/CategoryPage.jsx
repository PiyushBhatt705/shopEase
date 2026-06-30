import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { apiService } from '../services/apiService';

// --- HIGH-QUALITY CATEGORIES IMAGE CATALOG MAP ---
const categoryImageMap = {
  mobiles: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600",
    "https://images.unsplash.com/photo-1565849563873-ea06ec21781b?w=600",
    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600",
    "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600",
    "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=600",
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600",
    "https://images.unsplash.com/photo-1550513760-eb970c4330fb?w=600",
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600",
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600"
  ],
  laptops: [
    "https://images.unsplash.com/photo-1496181130204-755241524eab?w=600",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600",
    "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600",
    "https://images.unsplash.com/photo-1504707748692-419802cf939d?w=600",
    "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600",
    "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600"
  ],
  watch: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600",
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    "https://images.unsplash.com/photo-1539874754764-5a96559165b0?w=600",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=600",
    "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600",
    "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600",
    "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600"
  ],
  men: [
    "https://images.unsplash.com/photo-1505022610485-0249ba5b3675?w=600",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600",
    "https://images.unsplash.com/photo-1490367532201-b9bc1dc483f6?w=600",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
    "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=600",
    "https://images.unsplash.com/photo-1504593811423-6dd665756598?w=600",
    "https://images.unsplash.com/photo-1512484776495-a09d92e87c3b?w=600",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600"
  ],
  women: [
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600",
    "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600",
    "https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?w=600",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600"
  ],
  shoes: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600",
    "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600",
    "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600",
    "https://images.unsplash.com/photo-1515347619252-60a4bf4eff4c?w=600",
    "https://images.unsplash.com/photo-1534330207526-8e81f10ec6fe?w=600"
  ],
  furniture: [
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600",
    "https://images.unsplash.com/photo-1503602642458-232111445657?w=600",
    "https://images.unsplash.com/photo-1581428982868-e410dd047a90?w=600",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600",
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600",
    "https://images.unsplash.com/photo-1506898667547-42e22a46e125?w=600",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600",
    "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600"
  ],
  decor: [
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    "https://images.unsplash.com/photo-1534349762230-e0add2c17a5b?w=600",
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600",
    "https://images.unsplash.com/photo-1565192647048-f997ded87ab7?w=600"
  ],
  makeup: [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600"
  ],
  skincare: [
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600",
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600"
  ],
  headphones: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600",
    "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600",
    "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600",
    "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    "https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=600",
    "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600",
    "https://images.unsplash.com/photo-1599669454699-248893623440?w=600",
    "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600",
    "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600",
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600",
    "https://images.unsplash.com/photo-1631526348049-383b4b732e78?w=600",
    "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=600",
    "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600",
    "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600",
    "https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?w=600",
    "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600"
  ]
};

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

      // --- 5. SANITIZE IMAGES (OVERRIDE PLATZI OR REPETITIVE IMAGES) ---
      combinedApiItems = combinedApiItems.map((item, idx) => {
        const imgUrl = item.images && item.images[0] ? item.images[0].toLowerCase() : "";
        const needsOverride = !imgUrl || 
                              imgUrl.includes("placeimg.com") || 
                              imgUrl.includes("picsum.photos") || 
                              imgUrl.includes("placeholder") ||
                              imgUrl.includes("escuelajs.co") ||
                              imgUrl.includes("default") ||
                              String(item.id).startsWith("fs_"); // Override FakeStore's low quality same-cloth shapes

        if (needsOverride) {
          const list = categoryImageMap[keyword] || categoryImageMap.mobiles;
          const replacementImage = list[idx % list.length];
          return {
            ...item,
            images: [replacementImage]
          };
        }
        return item;
      });

      // --- 6. INJECT PREMIUM EXTRA MOCK ITEMS IF TOTAL IS LESS THAN 30 ---
      if (combinedApiItems.length < 30) {
        const remainingNeeded = 35 - combinedApiItems.length;
        const mockAssets = {
          headphones: {
            images: categoryImageMap.headphones,
            titles: ["Pro ANC Wireless Headset", "Classic Walnut Studio Monitors", "Vibrant Red Sport Audio", "Ocean DJ Over-Ear", "Rosewood Wireless Buds", "Crystal Pods Pro", "Deep Bass Monitors"]
          },
          mobiles: {
            images: categoryImageMap.mobiles,
            titles: ["ShopEase X-Phone Pro", "Titanium Edge Ultra", "Zeta Fold Foldable", "Pinnacle 5G Smartphone", "Nova Cam Phone"]
          },
          laptops: {
            images: categoryImageMap.laptops,
            titles: ["Titan Ultra Book Pro 15", "Aero Stream Slim", "Centurion RTX Gaming Rig", "ShopEase CreatorBook Core"]
          },
          men: {
            images: categoryImageMap.men,
            titles: ["Sleek Linen Summer Shirt", "Modern Fit Wool Blazer", "Urban Cargo Joggers", "ShopEase Essential Oxford"]
          },
          women: {
            images: categoryImageMap.women,
            titles: ["Chiffon Floral Summer Dress", "Wool Knit Cozy Cardigan", "High Rise Wide Leg Trouser", "Silk Wrap Evening Gown"]
          },
          shoes: {
            images: categoryImageMap.shoes,
            titles: ["Retro Suede Court Sneakers", "Classic Leather Oxford Brogues", "Active Trail Running Shoes", "Comfort Mesh Trainers"]
          },
          furniture: {
            images: categoryImageMap.furniture,
            titles: ["Minimalist Oak Coffee Table", "Ergonomic Mesh Office Chair", "Mid-Century Modern Sofa", "Scandinavian Armchair"]
          }
        };

        const currentAsset = mockAssets[keyword] || mockAssets.headphones;
        for (let i = 0; i < remainingNeeded; i++) {
          const img = currentAsset.images[i % currentAsset.images.length];
          const rawTitle = currentAsset.titles[i % currentAsset.titles.length];
          combinedApiItems.push({
            id: `mock_${keyword}_${Date.now()}_${i}`,
            title: `${rawTitle} Edition ${String.fromCharCode(65 + i)}`,
            price: 49 + (i * 15),
            description: `Experience state-of-the-art premium craftsmanship, advanced features, and durable build quality.`,
            category: keyword,
            images: [img],
            rating: 4.5
          });
        }
      }

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