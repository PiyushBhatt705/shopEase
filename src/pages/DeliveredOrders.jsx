import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Calendar, ClipboardList, Package, ExternalLink, ShieldCheck } from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const DeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadDeliveredOrders = async () => {
      const user = JSON.parse(localStorage.getItem("userData"));
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      try {
        const delivered = await apiService.orders.listDelivered(user.id);
        setOrders(delivered || []);
      } catch (err) {
        console.error("Failed to load delivered orders:", err);
      }
      setLoading(false);
    };

    loadDeliveredOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <span className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <p className="text-gray-600 font-semibold font-sans">Retrieving delivered order logs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
          >
            <ArrowLeft size={18} />
            Back to Active Orders
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Delivered Orders</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 uppercase flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={12} />
              Delivered
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Historical logs of your successfully delivered purchases.
          </p>
        </div>

        <Link
          to="/"
          className="bg-blue-600 hover:bg-blue-750 text-white font-bold py-3 px-6 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover text-sm font-sans"
        >
          Browse More Products 🛍️
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center shadow-sm max-w-xl mx-auto mt-10">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs animate-bounce">
            <ClipboardList size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Delivered Orders</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You don't have any completed or delivered orders yet. Once your active shipments arrive, they will appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order, index) => (
            <div key={order.orderId || index} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs relative hover:shadow-md transition-all duration-300">
              
              {/* Order Info Bar */}
              <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-4 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</p>
                  <p className="font-mono text-sm font-bold text-gray-800">{order.orderId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Placed On</p>
                  <p className="text-sm font-medium text-gray-700">{order.date}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Paid</p>
                  <p className="text-sm font-bold text-green-600">${order.amount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Time</p>
                  <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {order.deliveryDate || "Verified Completed"}
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3.5 py-1.5 rounded-full font-bold shadow-sm">
                    <ShieldCheck size={14} />
                    <span>Delivered 📦</span>
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Package size={14} />
                  <span>Delivered Items</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.items?.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100/50 transition">
                      <img
                        src={item.images?.[0] || "https://via.placeholder.com/60"}
                        alt={item.title}
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                        }}
                        className="w-14 h-14 object-contain bg-white border border-gray-150 rounded-lg p-1.5 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-gray-800 truncate pr-2">{item.title}</h4>
                          <span className="text-xs font-semibold text-gray-500">Qty: {item.quantity}</span>
                        </div>
                        <p className="text-xs font-bold text-gray-700 mt-1">${item.price}</p>
                        
                        {/* Interactive Review Call-to-Action */}
                        <div className="mt-2.5 flex items-center gap-2">
                          <Link
                            to={`/product/${item.id}`}
                            className="text-[10px] text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider flex items-center gap-0.5"
                          >
                            <span>Write Review ⭐</span>
                            <ExternalLink size={10} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveredOrders;
