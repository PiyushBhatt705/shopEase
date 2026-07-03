import { useEffect, useState } from 'react'
import HeroSlider from '../components/HeroSlider'
import FeaturesSection from '../components/FeaturesSection'
import Category from '../components/Category'
import ProductCard from '../components/ProductCard'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import { apiService } from '../services/apiService'
import { Ticket, Gift, Copy, Check, X } from 'lucide-react'
import Toast from '../components/Toast'

const Home = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");
  const [toast, setToast] = useState("");

  const coupons = [
    { code: "EASE20", discount: "20% OFF", desc: "Get 20% flat discount on any order subtotal above $50.", tag: "Sitewide Deal" },
    { code: "FREESHIP", discount: "FREE DELIVERY", desc: "Waive all shipping charges from your checkout subtotal.", tag: "Delivery Offer" }
  ];

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToast(`Coupon code "${code}" copied to clipboard! 📋`);
    setTimeout(() => {
      setCopiedCode("");
      setToast("");
    }, 2500);
  };

  useEffect(() => {
    const fetchHomeProducts = async () => {
      let customItems = [];
      let fsItems = [];

      try {
        customItems = await apiService.products.listAll() || [];
      } catch (err) {
        console.error(err);
      }

      try {
        const res = await fetch("https://fakestoreapi.com/products?limit=5");
        const data = await res.json();
        fsItems = (data || []).map(p => ({ ...p, id: `fs_${p.id}`, images: [p.image] }));
      } catch (err) {
        console.error(err);
      }

      const combined = [...customItems, ...fsItems];
      const seenIds = new Set();
      const uniqueProducts = [];
      
      for (const p of combined) {
        if (p && p.id && !seenIds.has(p.id)) {
          seenIds.add(p.id);
          uniqueProducts.push(p);
        }
      }

      const sorted = uniqueProducts.sort((a, b) => {
        const isMerchantA = !!(a.sellerId || a.seller_id);
        const isMerchantB = !!(b.sellerId || b.seller_id);
        if (isMerchantA && !isMerchantB) return -1;
        if (!isMerchantA && isMerchantB) return 1;
        return 0;
      });

      setProducts(sorted);
    };

    fetchHomeProducts();
  }, []);

  return (
    <div className="relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* banner slider */}
      <HeroSlider />

      {/* PREMIUM INTERACTIVE COUPON BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div 
          onClick={() => setShowPromoModal(true)}
          className="cursor-pointer bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-2xl transition duration-300 transform scale-hover border-2 border-indigo-400/25 relative overflow-hidden group"
        >
          {/* Decorative floating spheres */}
          <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition duration-500"></div>
          <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-115 transition duration-500"></div>

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
              <Gift size={28} className="text-yellow-300 animate-bounce" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight">Unlock Premium Coupon Discounts!</h3>
              <p className="text-indigo-100 text-sm mt-1 font-medium leading-relaxed">
                Click to explore exclusive promo codes. Copy instantly and apply them at checkout to save big!
              </p>
            </div>
          </div>

          <div className="bg-white text-indigo-700 font-bold px-6 py-3.5 rounded-2xl shadow-lg border border-white/30 text-sm hover:bg-indigo-50 transition font-sans flex items-center gap-2 flex-shrink-0 cursor-pointer relative z-10">
            <Ticket size={16} />
            <span>Show Offers & Coupons</span>
          </div>
        </div>
      </div>
      
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
        <ProductCard products={products.slice(0, 12)}/>
      </div>

      {/* GLASSMORPHISM COUPON CENTER MODAL */}
      {showPromoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-gray-150 p-6 md:p-8 shadow-2xl relative animate-scale-in">
            {/* Close Button */}
            <button 
              onClick={() => setShowPromoModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black hover:bg-gray-100 p-2 rounded-xl transition cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-xs">
                <Ticket size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Active Promo Coupons</h2>
                <p className="text-xs text-gray-500 font-medium">Use these codes during payment step at checkout</p>
              </div>
            </div>

            <div className="space-y-4">
              {coupons.map((coupon, idx) => (
                <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-150 rounded-2xl p-5 hover:border-indigo-300 transition duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2.5 py-1 rounded-md border border-indigo-250 uppercase tracking-wider">
                      {coupon.tag}
                    </span>
                    <span className="text-xs text-green-600 font-bold">{coupon.discount}</span>
                  </div>
                  
                  <h4 className="font-bold text-gray-800 text-base">{coupon.desc}</h4>
                  
                  <div className="mt-4 flex items-center justify-between gap-3 bg-white border border-gray-150 rounded-xl p-2">
                    <span className="font-mono text-gray-700 font-extrabold text-sm pl-2 select-all uppercase">
                      {coupon.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
                        copiedCode === coupon.code
                          ? "bg-green-600 text-white shadow-sm"
                          : "bg-gray-900 hover:bg-indigo-600 text-white shadow-sm"
                      }`}
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={13} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowPromoModal(false)}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-xl cursor-pointer transition text-sm text-center"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home;