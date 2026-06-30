import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, ArrowLeft, Loader2, Truck, CheckCircle2, ChevronRight, Package, Calendar } from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const Orders = () => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  // Load orders lists on mount and subscribe to background shifts
  useEffect(() => {
    const loadOrders = async () => {
      const user = JSON.parse(localStorage.getItem("userData"));
      if (!user || !user.id) {
        setLoading(false);
        return;
      }
      try {
        const active = await apiService.orders.listActive(user.id);
        const delivered = await apiService.orders.listDelivered(user.id);
        setActiveOrders(active);
        setDeliveredOrders(delivered);
      } catch (err) {
        console.error("Failed to load database orders:", err);
      }
      setLoading(false);
    };

    loadOrders();

    window.addEventListener("ordersChanged", loadOrders);
    return () => {
      window.removeEventListener("ordersChanged", loadOrders);
    };
  }, []);

  const handleTrackOrder = (order) => {
    localStorage.setItem("activeOrder", JSON.stringify(order));
    navigate("/track-order");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-600 font-semibold">Loading orders history...</p>
      </div>
    );
  }

  const totalCount = activeOrders.length + deliveredOrders.length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      {/* Back to Home */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back to Home
      </button>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Order Center</h1>
        {totalCount > 0 && (
          <span className="bg-blue-50 border border-blue-150 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            {totalCount} Orders Total
          </span>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-150 p-12 text-center shadow-sm max-w-xl mx-auto mt-10">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs animate-pulse">
            <ClipboardList size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders found</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            You haven't placed any orders yet. Add items to your cart and complete checkout to see them here!
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover btn-glow"
          >
            Go Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* SECTION 1: Active Shipments (In Transit) */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <Truck className="text-blue-500" size={20} />
                <span>Active Shipments (In Transit)</span>
                <span className="text-xs bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold ml-2">
                  {activeOrders.length}
                </span>
              </h2>

              <div className="space-y-6">
                {activeOrders.map((order, index) => (
                  <div key={order.orderId || index} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs relative">
                    {/* Order Details Header */}
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
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                          <Truck size={12} />
                          In Transit / Shipping
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() => handleTrackOrder(order)}
                          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer transition flex items-center justify-center gap-1.5 shadow-sm scale-hover btn-glow"
                        >
                          <Truck size={14} />
                          <span>Track Shipment</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Package size={14} />
                        <span>Items</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex gap-3 bg-gray-50/50 border border-gray-100 rounded-xl p-3">
                            <img
                              src={item.images?.[0] || "https://via.placeholder.com/60"}
                              alt={item.title}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                              }}
                              className="w-12 h-12 object-contain bg-white border border-gray-150 rounded-lg p-1 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">{item.title}</h4>
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Quantity: {item.quantity}</p>
                              <p className="text-xs font-bold text-gray-700 mt-1">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: Delivered History */}
          {deliveredOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
                <CheckCircle2 className="text-emerald-500" size={20} />
                <span>Orders Delivered</span>
                <span className="text-xs bg-emerald-50 border border-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold ml-2">
                  {deliveredOrders.length}
                </span>
              </h2>

              <div className="space-y-6">
                {deliveredOrders.map((order, index) => (
                  <div key={order.orderId || index} className="bg-white border border-gray-150 rounded-2xl p-6 shadow-xs relative opacity-90 hover:opacity-100 transition-opacity">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between md:items-center border-b pb-4 mb-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Order ID</p>
                        <p className="font-mono text-sm font-bold text-gray-800">{order.orderId}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date Placed</p>
                        <p className="text-sm font-medium text-gray-750">{order.date}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Paid</p>
                        <p className="text-sm font-bold text-green-600">${order.amount}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivery Time</p>
                        <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                          <Calendar size={13} />
                          {order.deliveryDate || "Completed"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</p>
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-bold">
                          <CheckCircle2 size={12} />
                          Delivered 📦
                        </span>
                      </div>
                    </div>

                    {/* Items Grid */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Package size={14} />
                        <span>Delivered Items</span>
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex gap-3 bg-gray-50/55 border border-gray-100 rounded-xl p-3">
                            <img
                              src={item.images?.[0] || "https://via.placeholder.com/60"}
                              alt={item.title}
                              onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
                              }}
                              className="w-12 h-12 object-contain bg-white border border-gray-150 rounded-lg p-1 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold text-gray-800 truncate">{item.title}</h4>
                              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Quantity: {item.quantity}</p>
                              <p className="text-xs font-bold text-gray-700 mt-1">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default Orders;
