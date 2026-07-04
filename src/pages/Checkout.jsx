import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Truck, 
  Lock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowLeft,
  ShieldCheck,
  Navigation as NavigationIcon
} from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";
import { soundService } from "../services/soundService";
import Confetti from "../components/Confetti";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [toast, setToast] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  // Determine if checking out a single item (Buy Now) or full cart
  const buyNowProduct = location.state?.buyNowProduct;
  const checkoutItems = buyNowProduct ? [{ ...buyNowProduct, quantity: 1 }] : cart || [];

  // Redirect if no items to checkout
  useEffect(() => {
    if (checkoutItems.length === 0) {
      setTimeout(() => {
        setToast("Your cart is empty. Redirecting...");
      }, 0);
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [checkoutItems, navigate]);

  // Form States
  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Payment States
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, netbanking, cod
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");

  // Gateway Simulation States
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState("connecting"); // connecting, otp, processing, success, failure
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [simulationFail, setSimulationFail] = useState(false); // Toggle to simulate failure
  const [transactionId, setTransactionId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [isLocatingAtCheckout, setIsLocatingAtCheckout] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleUseLocationAtCheckout = () => {
    if (!navigator.geolocation) {
      setToast("Geolocation is not supported by your browser ⚠️");
      setTimeout(() => setToast(""), 2000);
      return;
    }

    setIsLocatingAtCheckout(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);

        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
          .then((res) => res.json())
          .then((data) => {
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.suburb || "";
            const state = addr.state || "";
            const zip = addr.postcode || "";
            const displayAddress = data.display_name || "";

            setShippingForm((prev) => ({
              ...prev,
              address: displayAddress,
              city: city,
              state: state,
              zipCode: zip
            }));
            setIsLocatingAtCheckout(false);
            setToast("Radar address pinpointed! 📍");
            setTimeout(() => setToast(""), 2000);
          })
          .catch((err) => {
            console.error(err);
            setIsLocatingAtCheckout(false);
            setToast("Reverse-lookup failed, please enter manually ⚠️");
            setTimeout(() => setToast(""), 2500);
          });
      },
      (error) => {
        setIsLocatingAtCheckout(false);
        setToast("Unable to fetch location: Access denied ⚠️");
        setTimeout(() => setToast(""), 3050);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Auto-fill logged-in user data & poll wallet balance
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setTimeout(() => {
        setShippingForm((prev) => ({
          ...prev,
          fullName: userData.fullName || userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        }));
      }, 0);

      const fetchWallet = () => {
        if (userData.id) {
          apiService.user.getWallet(userData.id)
            .then(res => {
              setWalletBalance(res.balance || 0);
            })
            .catch(() => {});
        }
      };

      fetchWallet();
      const interval = setInterval(fetchWallet, 2000);
      return () => clearInterval(interval);
    }
  }, []);

  // Calculation
  const subtotal = parseFloat(checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
  const shipping = subtotal > 100 || appliedCoupon === "FREESHIP" ? 0.00 : 10.00;
  const discount = parseFloat((appliedCoupon === "EASE20" ? subtotal * 0.20 : 0.00).toFixed(2));
  const tax = parseFloat(((subtotal - discount) * 0.08).toFixed(2)); // 8% simulated tax
  const grandTotal = parseFloat(Math.max(0, subtotal - discount + shipping + tax).toFixed(2));
  const autoUseWallet = useWallet || paymentMethod === "wallet";
  const walletDeduction = parseFloat((autoUseWallet ? Math.min(grandTotal, walletBalance) : 0.00).toFixed(2));
  const total = parseFloat((grandTotal - walletDeduction).toFixed(2));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (code === "EASE20") {
      setAppliedCoupon("EASE20");
      setCouponStatus("Coupon 'EASE20' applied! 20% discount added.");
      setToast("Coupon applied! 🎉");
    } else if (code === "FREESHIP") {
      setAppliedCoupon("FREESHIP");
      setCouponStatus("Coupon 'FREESHIP' applied! Shipping cost is waived.");
      setToast("Coupon applied! 🎉");
    } else {
      setCouponStatus("Invalid coupon code ⚠️");
      setAppliedCoupon("");
    }
    setCouponCode("");
    setTimeout(() => setToast(""), 2000);
  };

  // Handle Input Changes
  const handleShippingChange = (e) => {
    setShippingForm({
      ...shippingForm,
      [e.target.name]: e.target.value,
    });
    // Clear error
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: "" });
    }
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;

    // Formatting Inputs
    if (name === "cardNumber") {
      // Remove all non-digits and format as groups of 4
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (name === "expiry") {
      // Format as MM/YY
      value = value.replace(/\D/g, "").slice(0, 4);
      if (value.length > 2) {
        value = value.slice(0, 2) + "/" + value.slice(2);
      }
    } else if (name === "cvv") {
      value = value.replace(/\D/g, "").slice(0, 3);
    }

    setCardForm({
      ...cardForm,
      [name]: value,
    });
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!shippingForm.fullName.trim()) errors.fullName = "Full Name is required";
    if (!shippingForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(shippingForm.email)) {
      errors.email = "Invalid email address";
    }
    if (!shippingForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (shippingForm.phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Phone must be at least 10 digits";
    }
    if (!shippingForm.address.trim()) errors.address = "Address is required";
    if (!shippingForm.city.trim()) errors.city = "City is required";
    if (!shippingForm.state.trim()) errors.state = "State is required";
    if (!shippingForm.zipCode.trim()) {
      errors.zipCode = "ZIP Code is required";
    } else if (shippingForm.zipCode.replace(/\D/g, "").length < 5) {
      errors.zipCode = "ZIP Code must be 5-6 digits";
    }

    // Payment validation errors
    if (paymentMethod === "card") {
      if (cardForm.cardNumber.replace(/\s/g, "").length !== 16) errors.cardNumber = "Enter valid 16-digit Card Number";
      if (!cardForm.cardName.trim()) errors.cardName = "Enter name on card";
      if (cardForm.expiry.length !== 5) errors.expiry = "Enter valid expiry (MM/YY)";
      if (cardForm.cvv.length !== 3) errors.cvv = "Enter 3-digit CVV";
    } else if (paymentMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        errors.upiId = "Enter a valid UPI ID (e.g. user@okhdfcbank)";
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        errors.selectedBank = "Please select a bank";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      soundService.playError();
      setToast("Please fill in all details correctly ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < grandTotal) {
      soundService.playError();
      setToast("Insufficient wallet balance for this purchase ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    // Generate simulated transaction ID
    const txId = "TXN" + Math.floor(1000000000 + Math.random() * 9000000000);
    setTransactionId(txId);

    // Launch mock payment gateway
    setShowGateway(true);
    setGatewayStep("connecting");
    setEnteredOtp("");
    setOtpError("");

    // Simulate connection delay
    setTimeout(() => {
      if (paymentMethod === "cod" || paymentMethod === "wallet") {
        // Cash on delivery and wallet go directly to processing then success
        setGatewayStep("processing");
        setTimeout(async () => {
          try {
            // Save order to database or local storage
            const user = JSON.parse(localStorage.getItem("userData"));
            const activeOrder = {
              id: txId,
              orderId: txId,
              user_id: user?.id || "anonymous",
              items: checkoutItems,
              shipping_details: shippingForm,
              amount: grandTotal,
              discount: discount,
              date: `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              status: "placed",
              timestamp: Date.now(),
              useWallet: autoUseWallet,
              userId: user?.id || "anonymous"
            };
            localStorage.setItem("activeOrder", JSON.stringify(activeOrder));
            
            try {
              await apiService.orders.create(activeOrder);
            } catch (err) {
              console.error("Order creation api error, proceeding locally:", err);
            }

            setGatewayStep("success");
            setShowConfetti(true);
            soundService.playSuccess();
            window.dispatchEvent(new Event("walletUpdate"));
            if (!buyNowProduct) {
              clearCart();
            }
          } catch (err) {
            console.error("Checkout COD/Wallet error:", err);
            setGatewayStep("success");
            setShowConfetti(true);
            soundService.playSuccess();
          }
        }, 1500);
      } else {
        // Online payments need OTP verification
        setGatewayStep("otp");
      }
    }, 2000);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (enteredOtp !== "123456") {
      soundService.playError();
      setOtpError("Invalid OTP. For testing, enter 123456.");
      return;
    }

    setGatewayStep("processing");

    setTimeout(async () => {
      if (simulationFail) {
        setGatewayStep("failure");
      } else {
        try {
          // Save order to database or local storage
          const user = JSON.parse(localStorage.getItem("userData"));
          const activeOrder = {
            id: transactionId,
            orderId: transactionId,
            user_id: user?.id || "anonymous",
            items: checkoutItems,
            shipping_details: shippingForm,
            amount: grandTotal,
            discount: discount,
            date: `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            status: "placed",
            timestamp: Date.now(),
            useWallet: autoUseWallet,
            userId: user?.id || "anonymous"
          };
          localStorage.setItem("activeOrder", JSON.stringify(activeOrder));

          try {
            await apiService.orders.create(activeOrder);
          } catch (err) {
            console.error("Order creation api error, proceeding locally:", err);
          }

          setGatewayStep("success");
          setShowConfetti(true);
          soundService.playSuccess();
          window.dispatchEvent(new Event("walletUpdate"));
          if (!buyNowProduct) {
            clearCart();
          }
        } catch (err) {
          console.error("Checkout OTP error:", err);
          setGatewayStep("success");
        }
      }
    }, 2000);
  };

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
        <p className="text-gray-600 font-semibold">{toast || "Loading checkout..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {showConfetti && <Confetti duration={6000} />}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.25; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .form-input {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
          background-color: #ffffff;
        }
        .payment-tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          color: #374151;
          background-color: #ffffff;
          transition: all 0.2s ease;
          justify-content: center;
        }
        .payment-tab:hover {
          border-color: #93c5fd;
          background-color: #f0f9ff;
          color: #1d4ed8;
        }
        .payment-tab.active {
          border-color: #3b82f6;
          background-color: #1d4ed8;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
        }
      `}</style>

      {/* BACK LINK */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover hover:translate-x-[-3px]"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Secure Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Shipping & Payment */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SHIPPING FORM */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
            </div>

            <div className="mb-6 p-4 bg-gradient-to-r from-cyan-500/10 to-indigo-500/5 border border-cyan-200 dark:border-cyan-900/30 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">Autodetect Delivery Radar 📍</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold leading-relaxed">Use browser geolocation coordinates to reverse lookup your address instantly.</p>
              </div>
              <button
                type="button"
                onClick={handleUseLocationAtCheckout}
                disabled={isLocatingAtCheckout}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 text-xs select-none shadow-sm cursor-pointer"
              >
                {isLocatingAtCheckout ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    <span>Radar...</span>
                  </>
                ) : (
                  <>
                    <NavigationIcon size={14} />
                    <span>Detect Location</span>
                  </>
                )}
              </button>
            </div>

            <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="John Doe"
                  value={shippingForm.fullName}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.fullName && <p className="text-xs text-red-500">{formErrors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={shippingForm.email}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g. 555-0199"
                  value={shippingForm.phone}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.phone && <p className="text-xs text-red-500">{formErrors.phone}</p>}
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Apt 4B, 123 Main St"
                  value={shippingForm.address}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.address && <p className="text-xs text-red-500">{formErrors.address}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="New Delhi"
                  value={shippingForm.city}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.city && <p className="text-xs text-red-500">{formErrors.city}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Delhi"
                  value={shippingForm.state}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.state && <p className="text-xs text-red-500">{formErrors.state}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ZIP / Pin Code</label>
                <input
                  type="text"
                  name="zipCode"
                  placeholder="110001"
                  value={shippingForm.zipCode}
                  onChange={handleShippingChange}
                  className="form-input"
                />
                {formErrors.zipCode && <p className="text-xs text-red-500">{formErrors.zipCode}</p>}
              </div>
            </form>
          </div>

          {/* PAYMENT METHODS SELECTION */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard size={20} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Payment Option</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              <button
                type="button"
                className={`payment-tab ${paymentMethod === "card" ? "active" : ""}`}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard size={16} />
                <span className="text-xs">Card</span>
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === "upi" ? "active" : ""}`}
                onClick={() => setPaymentMethod("upi")}
              >
                <Smartphone size={16} />
                <span className="text-xs">UPI</span>
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === "netbanking" ? "active" : ""}`}
                onClick={() => setPaymentMethod("netbanking")}
              >
                <Building2 size={16} />
                <span className="text-xs">NetBank</span>
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === "cod" ? "active" : ""}`}
                onClick={() => setPaymentMethod("cod")}
              >
                <Truck size={16} />
                <span className="text-xs">COD</span>
              </button>
              <button
                type="button"
                className={`payment-tab ${paymentMethod === "wallet" ? "active" : ""}`}
                onClick={() => setPaymentMethod("wallet")}
              >
                <Lock size={16} />
                <span className="text-xs">Wallet</span>
              </button>
            </div>

            {/* PAYMENT CONTENT BLOCKS */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 56** **** ****"
                        value={cardForm.cardNumber}
                        onChange={handleCardChange}
                        className="form-input pr-10"
                      />
                      <CreditCard className="absolute right-3 top-3.5 text-gray-400" size={18} />
                    </div>
                    {formErrors.cardNumber && <p className="text-xs text-red-500">{formErrors.cardNumber}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Cardholder Name</label>
                    <input
                      type="text"
                      name="cardName"
                      placeholder="John Doe"
                      value={cardForm.cardName}
                      onChange={handleCardChange}
                      className="form-input"
                    />
                    {formErrors.cardName && <p className="text-xs text-red-500">{formErrors.cardName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="MM/YY"
                        value={cardForm.expiry}
                        onChange={handleCardChange}
                        className="form-input text-center"
                      />
                      {formErrors.expiry && <p className="text-xs text-red-500">{formErrors.expiry}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-500 uppercase">CVV</label>
                      <input
                        type="password"
                        name="cvv"
                        placeholder="***"
                        value={cardForm.cvv}
                        onChange={handleCardChange}
                        className="form-input text-center"
                      />
                      {formErrors.cvv && <p className="text-xs text-red-500">{formErrors.cvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. john@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="form-input"
                    />
                    {formErrors.upiId && <p className="text-xs text-red-500">{formErrors.upiId}</p>}
                  </div>

                  <div className="flex gap-2 flex-wrap pt-2">
                    {["@upi", "@okaxis", "@okicici", "@ybl", "@paytm"].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => {
                          const base = upiId.split("@")[0] || "username";
                          setUpiId(base + suffix);
                        }}
                        className="text-xs bg-white hover:bg-gray-100 border text-gray-600 px-3 py-1.5 rounded-lg transition"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Select Bank</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="form-input"
                    >
                      <option value="">-- Choose your Bank --</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                    </select>
                    {formErrors.selectedBank && <p className="text-xs text-red-500">{formErrors.selectedBank}</p>}
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="text-center py-4 text-gray-600">
                  <Truck className="mx-auto text-blue-500 mb-2 animate-bounce" size={32} />
                  <h3 className="font-semibold text-gray-800">Cash on Delivery (COD)</h3>
                  <p className="text-sm mt-1">Pay with cash or UPI on your doorstep. A ₹10 shipping charge applies to orders under $100.</p>
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="text-center py-4 text-gray-650">
                  <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="font-semibold text-gray-800">ShopEase Secure Wallet Payment</h3>
                  <p className="text-sm mt-1">Available Balance: <span className="font-bold text-blue-600">${walletBalance.toFixed(2)}</span></p>
                  {walletBalance < (subtotal - discount + shipping + tax) ? (
                    <div className="mt-3 bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200 text-xs font-semibold">
                      ⚠️ Insufficient wallet balance for this purchase. Please select another payment option.
                    </div>
                  ) : (
                    <p className="text-xs text-green-600 font-bold mt-2">✓ Full wallet payment covered!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* ITEMS LIST */}
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mb-6 pr-1">
              {checkoutItems.map((item) => (
                <div key={item.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                  <img
                    src={item.images?.[0] || "https://via.placeholder.com/60"}
                    alt={item.title}
                    className="w-12 h-12 object-contain bg-gray-50 border rounded-lg p-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-gray-800">${item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* COUPON INPUT */}
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo Code (EASE20, FREESHIP)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 form-input text-xs"
                />
                <button
                  type="submit"
                  className="bg-gray-800 hover:bg-black text-white text-xs px-4 py-2 rounded-xl transition cursor-pointer font-semibold scale-hover"
                >
                  Apply
                </button>
              </div>
              {couponStatus && (
                <p className={`text-[10px] mt-1.5 font-bold ${appliedCoupon ? "text-green-600" : "text-red-500"}`}>
                  {couponStatus}
                </p>
              )}
            </form>

            {/* BREAKDOWN */}
            <div className="space-y-3 border-t pt-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-800">${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount (20%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-gray-800">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (Est. 8%)</span>
                <span className="font-semibold text-gray-800">${tax.toFixed(2)}</span>
              </div>

              {useWallet && walletDeduction > 0 && (
                <div className="flex justify-between text-blue-600 font-bold">
                  <span>Wallet Applied</span>
                  <span>-${walletDeduction.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t pt-3 mt-3">
                <span>Grand Total</span>
                <span className="text-green-600">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* WALLET TOGGLE */}
            {walletBalance > 0 && (
              <div className="flex items-center gap-3 mt-4 p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition">
                <input
                  id="wallet-toggle"
                  type="checkbox"
                  checked={useWallet}
                  onChange={(e) => setUseWallet(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="wallet-toggle" className="text-xs text-blue-800 font-bold cursor-pointer select-none flex-1">
                  Pay with Wallet Balance
                  <span className="block text-[10px] text-blue-600 font-semibold mt-0.5">${walletBalance.toFixed(2)} available</span>
                </label>
              </div>
            )}

            {/* SIMULATE TOGGLE FOR FAIL */}
            <div className="flex items-center gap-2 mt-6 p-3 bg-red-50/50 hover:bg-red-50 border border-red-100 rounded-xl transition">
              <input
                id="fail-toggle"
                type="checkbox"
                checked={simulationFail}
                onChange={(e) => setSimulationFail(e.target.checked)}
                className="rounded text-red-600 focus:ring-red-500 h-4 w-4"
              />
              <label htmlFor="fail-toggle" className="text-xs text-red-800 font-semibold cursor-pointer select-none">
                Simulate Payment Failure
              </label>
            </div>

            {/* PAY NOW BUTTON */}
            <button
              onClick={handlePlaceOrder}
              disabled={paymentMethod === "wallet" && walletBalance < grandTotal}
              className="mt-4 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl cursor-pointer hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 btn-glow"
            >
              <Lock size={16} />
              <span>
                {paymentMethod === "cod" 
                  ? "Place COD Order" 
                  : paymentMethod === "wallet" 
                    ? `Pay $${grandTotal.toFixed(2)} with Wallet` 
                    : `Pay $${total.toFixed(2)}`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-gray-400">
              <ShieldCheck size={14} />
              <span>Secure 256-bit SSL encrypted transaction</span>
            </div>
          </div>
        </div>
      </div>

      {/* MOCK PAYMENT GATEWAY OVERLAY MODAL */}
      {showGateway && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in border border-gray-100">
            
            {/* GATEWAY HEADER */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <ShieldCheck size={20} className="text-blue-200" />
                <h3 className="text-lg font-bold tracking-wide uppercase">ShopEase SafePay Gateway</h3>
              </div>
              <p className="text-xs text-blue-200">Merchant: ShopEase Pvt. Ltd.</p>
            </div>

            {/* CONNECTING STEP */}
            {gatewayStep === "connecting" && (
              <div className="p-10 text-center space-y-4">
                <Loader2 className="animate-spin text-blue-600 mx-auto h-12 w-12" />
                <h4 className="font-bold text-gray-800 text-lg">Connecting to Secure Gateway</h4>
                <p className="text-sm text-gray-500">Please do not refresh this page or click back button.</p>
              </div>
            )}

            {/* OTP VERIFICATION STEP */}
            {gatewayStep === "otp" && (
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 text-lg">One-Time Password (OTP)</h4>
                  <p className="text-xs text-gray-500 mt-1">An OTP has been sent to your registered mobile number for Verification.</p>
                  <p className="text-sm font-semibold text-blue-600 mt-2 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-100">
                    MOCK CODE: <span className="font-mono text-base">123456</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enter OTP</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="######"
                      value={enteredOtp}
                      onChange={(e) => {
                        setEnteredOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setOtpError("");
                      }}
                      className="form-input text-center font-mono text-2xl tracking-[8px] bg-gray-50 border border-gray-200"
                    />
                    {otpError && <p className="text-xs text-red-500 text-center">{otpError}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowGateway(false)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition cursor-pointer scale-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={enteredOtp.length !== 6}
                      className={`flex-1 font-semibold py-3 rounded-xl transition text-white ${
                        enteredOtp.length === 6 ? "bg-blue-600 hover:bg-blue-700 cursor-pointer btn-glow" : "bg-blue-300 cursor-not-allowed"
                      }`}
                    >
                      Submit OTP
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2 border-t text-xs text-gray-400">
                  Transaction Amount: <span className="font-bold text-gray-700">${total}</span> | Ref: {transactionId.slice(0, 8)}...
                </div>
              </div>
            )}

            {/* PROCESSING STEP */}
            {gatewayStep === "processing" && (
              <div className="p-10 text-center space-y-4">
                <Loader2 className="animate-spin text-green-600 mx-auto h-12 w-12" />
                <h4 className="font-bold text-gray-800 text-lg">Authorizing Transaction</h4>
                <p className="text-sm text-gray-500">Securing payment response from issuing bank...</p>
              </div>
            )}

            {/* SUCCESS STEP */}
            {gatewayStep === "success" && (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={40} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-2xl text-green-600">Payment Successful!</h4>
                  <p className="text-sm text-gray-500 mt-1">Thank you! Your order has been placed.</p>
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-left text-sm space-y-2.5 font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Transaction ID:</span>
                    <span className="font-mono text-gray-800">{transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Amount Paid:</span>
                    <span className="text-green-600 font-bold">${total}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-gray-500">Shipping To:</span>
                    <span className="text-gray-800 truncate max-w-[180px]">{shippingForm.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Estimated Delivery:</span>
                    <span className="text-gray-800">In 3-5 Business Days</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setShowGateway(false);
                      navigate("/track-order");
                    }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl cursor-pointer transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    Track Order 🚚
                  </button>

                  <button
                    onClick={() => {
                      setShowGateway(false);
                      navigate("/");
                    }}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 border border-gray-700"
                  >
                    🛍️ Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* FAILURE STEP */}
            {gatewayStep === "failure" && (
              <div className="p-8 text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <XCircle size={40} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold text-2xl text-red-600">Transaction Failed</h4>
                  <p className="text-sm text-gray-500 mt-1">Your payment could not be processed.</p>
                </div>

                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 inline-block">
                  Error Code 402: Insufficient funds or card validation failure.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGateway(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setGatewayStep("connecting");
                      setTimeout(() => {
                        setGatewayStep("otp");
                      }, 1500);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
