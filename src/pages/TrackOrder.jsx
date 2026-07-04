import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Phone,
  MessageSquare,
  Package,
  Truck,
  Home,
  Navigation as NavigationIcon,
  Clock,
  ArrowLeft,
  Play,
  Sparkles,
  Loader2,
  CheckCircle2
} from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const TrackOrder = () => {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0: Confirmed, 1: Shipped, 2: Out for Delivery, 3: Delivered
  const [isAutoSimulating, setIsAutoSimulating] = useState(true);

  const [callModal, setCallModal] = useState(false);
  const [chatModal, setChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState([
    { sender: "agent", text: "Hello! I am Rahul from ShopEase Delivery. I will be delivering your package today." }
  ]);

  // Load order details from localStorage and update step based on global elapsed time
  useEffect(() => {
    const updateTrackingStep = () => {
      const savedOrder = localStorage.getItem("activeOrder");
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        setOrder(parsed);

        // If order status is marked delivered
        if (parsed.status === "delivered") {
          setCurrentStep(4);
          setIsLoading(false);
          return;
        }

        // Compute step from elapsed seconds
        const orderTimestamp = parsed.timestamp || Date.now();
        const elapsedSeconds = (Date.now() - orderTimestamp) / 1000;

        if (elapsedSeconds < 10) {
          setCurrentStep(0);
        } else if (elapsedSeconds < 20) {
          setCurrentStep(1);
        } else if (elapsedSeconds < 30) {
          setCurrentStep(2);
        } else {
          setCurrentStep(3);
        }
      } else {
        setOrder(null);
      }
      setIsLoading(false);
    };

    updateTrackingStep();

    window.addEventListener("activeOrderChanged", updateTrackingStep);
    window.addEventListener("ordersChanged", updateTrackingStep);

    // Update locally every 2 seconds
    const interval = setInterval(updateTrackingStep, 2000);

    return () => {
      window.removeEventListener("activeOrderChanged", updateTrackingStep);
      window.removeEventListener("ordersChanged", updateTrackingStep);
      clearInterval(interval);
    };
  }, [navigate]);

  // Simulated Time logs
  const [timeLogs, setTimeLogs] = useState([]);

  useEffect(() => {
    if (!order) return;
    
    const getRelativeTime = (minsAgo) => {
      const d = new Date();
      d.setMinutes(d.getMinutes() - minsAgo);
      return `${d.toLocaleDateString()} - ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    const logs = [
      { title: "Order Placed & Confirmed", desc: "Your payment has been successfully authorized and the seller confirmed your order.", time: order.date || getRelativeTime(20), status: "done" },
      { title: "Processed at Sorting Facility", desc: "Package packed, weighed, and sorted at ShopEase Warehouse.", time: getRelativeTime(15), status: currentStep >= 1 ? getRelativeTime(15) : "pending" },
      { title: "In Transit", desc: "Package left the warehouse and is traveling towards your local delivery center.", time: getRelativeTime(10), status: currentStep >= 2 ? "done" : "pending" },
      { title: "Out for Delivery", desc: "Delivery agent Rahul Sharma has picked up the package and is en route.", time: currentStep >= 3 ? "Out for Delivery" : "pending", status: currentStep >= 3 ? "done" : "pending" },
      { title: "Delivered", desc: "Package successfully hand-delivered and verified.", time: currentStep >= 4 ? "Delivered" : "--:--", status: currentStep >= 4 ? "done" : "pending" }
    ];

    if (currentStep === 0) {
      logs[1].status = "active";
    } else if (currentStep === 1) {
      logs[1].status = "done";
      logs[2].status = "active";
    } else if (currentStep === 2) {
      logs[1].status = "done";
      logs[2].status = "done";
      logs[3].status = "active";
    } else if (currentStep >= 3) {
      logs[1].status = "done";
      logs[2].status = "done";
      logs[3].status = "done";
      logs[4].status = "active";
    }
    if (currentStep >= 4) {
      logs[4].status = "done";
    }

    setTimeout(() => {
      setTimeLogs(logs);
    }, 0);
  }, [order, currentStep]);

  const handleNextStep = async () => {
    if (order) {
      try {
        const updated = await apiService.orders.advance(order.orderId);
        localStorage.setItem("activeOrder", JSON.stringify(updated));
        window.dispatchEvent(new Event("ordersChanged"));
        window.dispatchEvent(new Event("activeOrderChanged"));
        setToast("Advancing shipment stage... 🚀");
        setTimeout(() => setToast(""), 1500);
      } catch (err) {
        console.error("Failed to advance shipment:", err);
      }
    }
  };

  // handleResetSimulation was removed to prevent duplicate delivery notifications

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = { sender: "user", text: chatMessage };
    setChatLog((prev) => [...prev, userMsg]);
    setChatMessage("");

    // Simulate Agent Auto-Reply
    setTimeout(() => {
      let replyText = "Sure, I am on my way. I will reach in about 10-15 minutes.";
      if (currentStep >= 3) {
        replyText = "The package has already been delivered. Thank you!";
      } else if (currentStep === 0) {
        replyText = "Hello, your order is currently being processed at the store. I will pick it up soon.";
      }
      setChatLog((prev) => [...prev, { sender: "agent", text: replyText }]);
    }, 1500);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Clock className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-600 font-semibold">Retrieving tracking information...</p>
      </div>
    );
  }



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-600 font-semibold font-sans">Connecting to satellite tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-3xl border border-gray-150 p-10 text-center shadow-sm max-w-xl w-full">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs animate-bounce">
            <Truck size={44} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">No Active Shipments</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed font-medium">
            You don't have any orders currently in transit. Once you complete a purchase, you'll be able to track your real-time delivery route and status here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover btn-glow text-sm"
            >
              Start Shopping 🛍️
            </button>
            <button
              onClick={() => navigate("/orders")}
              className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-850 font-bold py-3.5 px-6 rounded-xl cursor-pointer transition scale-hover text-sm"
            >
              View Order History 📦
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (order.status === "delivered") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh]">
        <div className="bg-white rounded-3xl border border-gray-150 p-10 text-center shadow-sm max-w-xl w-full">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs animate-bounce">
            <CheckCircle2 size={44} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Order Delivered! 🎉</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed font-medium">
            This shipment has been successfully delivered and is no longer being tracked live. You can view the order's summary, items, and download receipt details in the Delivered History.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover btn-glow text-sm"
            >
              Back to Shopping 🛍️
            </button>
            <button
              onClick={() => navigate("/delivered-orders")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg scale-hover text-sm"
            >
              View Delivered History 📦
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.2; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .pulse-circle {
          position: absolute;
          border-radius: 9999px;
          background-color: #3b82f6;
          animation: pulseGlow 2s infinite ease-in-out;
        }
        .bike-icon {
          animation: float 2.5s infinite ease-in-out;
        }
        .timeline-line {
          transition: height 0.5s ease-in-out, width 0.5s ease-in-out;
        }
      `}</style>

      {/* TOP HEADER NAVIGATION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
          >
            <ArrowLeft size={18} />
            Back to Shop
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Live Tracking</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-200 uppercase animate-pulse flex items-center gap-1.5">
              <Sparkles size={12} />
              Simulated Live
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Order ID: <span className="font-mono text-gray-800 font-semibold">{order.orderId}</span> | Placed: {order.date}
          </p>
        </div>

        {/* SIMULATION CONTROLS */}
        <div className="flex flex-wrap gap-2.5 bg-white border border-gray-100 p-2.5 rounded-2xl shadow-sm">
          <button
            onClick={handleNextStep}
            disabled={currentStep >= 3}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              currentStep >= 3 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm btn-glow"
            }`}
          >
            <Play size={14} />
            <span>Next Stage</span>
          </button>



          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer scale-hover ${
              isAutoSimulating 
                ? "bg-green-50 text-green-700 border border-green-200" 
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
            }`}
          >
            {isAutoSimulating ? "Autoplay ON (15s)" : "Autoplay PAUSED"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Map Route & Live Timeline */}
        <div className="lg:col-span-8 space-y-6">

          {/* VISUAL MAP ROUTE SIMULATION */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm overflow-hidden relative">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <NavigationIcon className="text-blue-500" size={20} />
              <span>Real-Time Route Map</span>
            </h2>

            {/* ROUTE CANVAS / MOCK MAP CONTAINER */}
            {/* ROUTE CANVAS / MOCK MAP CONTAINER */}
            <div className="relative h-64 w-full bg-slate-900 rounded-2xl overflow-x-auto border border-slate-800 shadow-inner scrollbar-thin">
              <div className="relative h-full min-w-[820px]">
                
                {/* Mock Map Background Grids */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Glow effects for active map */}
                <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>

                {/* MAP ROADS (SVG PATHS) */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  {/* Main Path */}
                  <path
                    d="M 60 180 Q 200 80, 320 180 T 580 100 T 800 130"
                    fill="transparent"
                    stroke="#334155"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  
                  {/* Active path overlay (draws progress) */}
                  <path
                    d="M 60 180 Q 200 80, 320 180 T 580 100 T 800 130"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    strokeDashoffset={
                      currentStep === 0 ? 1000 :
                      currentStep === 1 ? 750 :
                      currentStep === 2 ? 400 : 0
                    }
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>

                {/* CHECKPOINTS ON THE MAP */}
                {/* Hub 1: Seller Facility */}
                <div className="absolute left-[45px] top-[165px] group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                    currentStep >= 0 ? "bg-blue-600 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]" : "bg-slate-800 border-slate-700"
                  }`}>
                    <Home size={14} className="text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap opacity-80 pointer-events-none">
                    Seller Store
                  </div>
                </div>

                {/* Hub 2: Local Sorting Warehouse */}
                <div className="absolute left-[305px] top-[165px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                    currentStep >= 1 ? "bg-blue-600 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]" : "bg-slate-800 border-slate-700"
                  }`}>
                    <Package size={14} className="text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap opacity-80 pointer-events-none">
                    Sorting Hub
                  </div>
                </div>

                {/* Hub 3: Delhi Courier Point */}
                <div className="absolute left-[565px] top-[85px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                    currentStep >= 2 ? "bg-blue-600 border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.5)]" : "bg-slate-800 border-slate-700"
                  }`}>
                    <Truck size={14} className="text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap opacity-80 pointer-events-none">
                    Delhi Hub
                  </div>
                </div>

                {/* Hub 4: Delivery Location */}
                <div className="absolute left-[785px] top-[115px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition ${
                    currentStep >= 3 ? "bg-green-600 border-green-300 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-slate-800 border-slate-700"
                  }`}>
                    <MapPin size={14} className="text-white" />
                  </div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap opacity-80 pointer-events-none">
                    Home (You)
                  </div>
                </div>

                {/* ANIMATED DELIVERY BIKE ICON ON ROUTE */}
                {currentStep < 3 && (
                  <div
                    className="absolute w-10 h-10 bg-blue-500 border border-blue-400 text-white rounded-full flex items-center justify-center bike-icon shadow-[0_0_15px_#3b82f6] transition-all duration-1000 ease-out"
                    style={{
                      left: 
                        currentStep === 0 ? "70px" :
                        currentStep === 1 ? "340px" :
                        currentStep === 2 ? "600px" : "800px",
                      top:
                        currentStep === 0 ? "130px" :
                        currentStep === 1 ? "150px" :
                        currentStep === 2 ? "55px" : "110px"
                    }}
                  >
                    <NavigationIcon size={18} className="rotate-45 text-white animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DYNAMIC TIMELINE STATUS */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="text-blue-500" size={20} />
              <span>Live Timeline Logs</span>
            </h2>

            <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-6">
              {timeLogs.map((log, idx) => (
                <div key={idx} className="relative group">
                  
                  {/* Indicator Dot */}
                  <span className={`absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 transition ${
                    log.status === "done"
                      ? "bg-green-500 border-green-200 shadow-sm"
                      : log.status === "active"
                      ? "bg-blue-500 border-blue-200 animate-ping"
                      : "bg-white border-gray-300"
                  }`}></span>

                  {log.status === "active" && (
                    <span className="absolute -left-[31px] top-1 w-4.5 h-4.5 rounded-full border-2 bg-blue-500 border-blue-200"></span>
                  )}

                  {/* Log Content */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                    log.status === "done"
                      ? "bg-green-50/20 border-green-100 text-gray-800"
                      : log.status === "active"
                      ? "bg-blue-50/40 border-blue-200 text-gray-900 shadow-sm translate-x-1"
                      : "bg-white border-transparent text-gray-400"
                  }`}>
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm sm:text-base">{log.title}</h4>
                      <span className="text-xs font-semibold font-mono bg-white border border-gray-150 px-2 py-0.5 rounded-md shadow-xs flex-shrink-0">
                        {log.time}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed opacity-95">{log.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Items, Address, Delivery Agent Card */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* DELIVERY AGENT CARD */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Executive</h3>
            
            <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl mb-4">
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-extrabold rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-white">
                RS
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Rahul Sharma</h4>
                <p className="text-xs text-gray-500">ShopEase Delivery Partner</p>
                <div className="flex items-center gap-1.5 text-xs text-yellow-500 mt-1">
                  <span>⭐⭐⭐⭐⭐</span>
                  <span className="font-bold text-gray-700">(4.9)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCallModal(true)}
                className="flex items-center justify-center gap-2 border hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition cursor-pointer text-sm scale-hover shadow-xs"
              >
                <Phone size={16} className="text-blue-500" />
                <span>Call Agent</span>
              </button>
              <button
                onClick={() => setChatModal(true)}
                className="flex items-center justify-center gap-2 border hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl transition cursor-pointer text-sm scale-hover shadow-xs"
              >
                <MessageSquare size={16} className="text-blue-500" />
                <span>Chat Now</span>
              </button>
            </div>
          </div>

          {/* SHIPPING INFO & ITEMS IN ORDER */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-base mb-3.5 flex items-center gap-1.5">
                <MapPin size={16} className="text-blue-500" />
                <span>Delivery Address</span>
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-600 space-y-1">
                <p className="font-bold text-gray-800">{order.shippingDetails?.fullName}</p>
                <p>{order.shippingDetails?.address}</p>
                <p>{order.shippingDetails?.city}, {order.shippingDetails?.state} - {order.shippingDetails?.zipCode}</p>
                <p className="pt-2 text-xs font-semibold text-gray-500">Phone: {order.shippingDetails?.phone}</p>
              </div>
            </div>

            <div className="border-t pt-5">
              <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-1.5">
                <Package size={16} className="text-blue-500" />
                <span>Items in Order</span>
              </h3>
              
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                    <img
                      src={item.images?.[0] || "https://via.placeholder.com/50"}
                      alt={item.title}
                      className="w-10 h-10 object-contain bg-gray-50 border rounded-lg p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-800 truncate">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 font-semibold">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-800">${item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-gray-900 border-t pt-3 mt-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                <span>Total Amount Paid</span>
                <span className="text-green-600 text-base">${order.amount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOCK CALL OVERLAY */}
      {callModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 text-white rounded-3xl w-full max-w-xs text-center p-8 border border-slate-800 shadow-2xl animate-scale-in">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_#3b82f6] animate-pulse">
              <Phone size={36} />
            </div>
            <h4 className="font-extrabold text-xl mb-1">Calling Rahul Sharma</h4>
            <p className="text-xs text-slate-400">Connecting to agent +91 98765 4XXXX...</p>
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setCallModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl cursor-pointer transition shadow-md"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOCK CHAT OVERLAY */}
      {chatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in border border-gray-100 flex flex-col h-[500px]">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4.5 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 font-bold rounded-xl flex items-center justify-center text-sm border border-white/20">
                  RS
                </div>
                <div>
                  <h4 className="font-bold text-sm">Rahul Sharma</h4>
                  <p className="text-[10px] text-blue-200">Delivery Executive | Online</p>
                </div>
              </div>
              <button
                onClick={() => setChatModal(false)}
                className="text-white hover:text-gray-300 font-bold text-lg cursor-pointer px-2"
              >
                ✕
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
              {chatLog.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Footer */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 form-input py-2.5 text-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
