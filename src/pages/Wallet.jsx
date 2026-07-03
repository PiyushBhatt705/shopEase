import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Wallet as WalletIcon, 
  ArrowLeft, 
  Plus, 
  TrendingDown, 
  TrendingUp, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Lock, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building
} from "lucide-react";
import Toast from "../components/Toast";
import { apiService } from "../services/apiService";

const Wallet = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Deposit Form State
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // card, netbanking, upi
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: "",
  });
  const [selectedBank, setSelectedBank] = useState("");
  const [upiId, setUpiId] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [transactions, setTransactions] = useState([]);

  // Load User Data & Wallet Balance
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      setUser(userData);
      fetchWallet(userData.id);
      loadTransactionHistory(userData.id);
      
      const interval = setInterval(() => {
        fetchWallet(userData.id);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setToast("Please login to view wallet 🔒");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  const fetchWallet = async (userId) => {
    try {
      const res = await apiService.user.getWallet(userId);
      setWalletBalance(res.balance || 0);
    } catch (err) {
      console.error("Failed to fetch wallet balance:", err);
    }
  };

  const loadTransactionHistory = (userId) => {
    const key = `wallet_txs_${userId}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setTransactions(JSON.parse(saved));
    } else {
      const defaultTxs = [
        { id: "tx_1", type: "deposit", desc: "Welcome Bonus Credit", amount: 50.00, date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), status: "success" }
      ];
      setTransactions(defaultTxs);
      localStorage.setItem(key, JSON.stringify(defaultTxs));
    }
  };

  const saveTransaction = (userId, type, desc, amountVal) => {
    const key = `wallet_txs_${userId}`;
    const newTx = {
      id: "tx_" + Date.now(),
      type,
      desc,
      amount: parseFloat(amountVal),
      date: new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "success"
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  // Card Formatting & Input Changes
  const handleCardChange = (e) => {
    let { name, value } = e.target;
    if (name === "cardNumber") {
      value = value.replace(/\D/g, "").slice(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    } else if (name === "expiry") {
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

  const validateForm = () => {
    const errors = {};
    const depositAmt = parseFloat(amount);

    if (isNaN(depositAmt) || depositAmt <= 0) {
      errors.amount = "Please enter a valid deposit amount";
    }

    if (paymentMethod === "card") {
      if (cardForm.cardNumber.replace(/\s/g, "").length !== 16) errors.cardNumber = "Enter valid 16-digit Card Number";
      if (!cardForm.cardName.trim()) errors.cardName = "Enter cardholder name";
      if (cardForm.expiry.length !== 5) errors.expiry = "Enter expiry (MM/YY)";
      if (cardForm.cvv.length !== 3) errors.cvv = "Enter 3-digit CVV";
    } else if (paymentMethod === "upi") {
      if (!upiId.trim() || !upiId.includes("@")) {
        errors.upiId = "Enter a valid UPI ID (e.g. name@upi)";
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        errors.selectedBank = "Please select your bank";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setToast("Please fill all payment details correctly ⚠️");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const depositAmt = parseFloat(amount);
      const res = await apiService.user.deposit(user.id, depositAmt);
      
      setWalletBalance(res.balance || (walletBalance + depositAmt));
      saveTransaction(user.id, "deposit", `Deposited via ${paymentMethod.toUpperCase()}`, depositAmt);
      
      setToast(`Successfully added $${depositAmt.toFixed(2)} to your wallet! 🎉`);
      setAmount("");
      setCardForm({ cardNumber: "", cardName: "", expiry: "", cvv: "" });
      setUpiId("");
      setSelectedBank("");
      
      // Dispatch event to refresh Navbar wallet balance instantly
      window.dispatchEvent(new Event("walletUpdate"));
    } catch (err) {
      setToast(err.message || "Failed to add money");
    }
    setLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  const handleWithdrawAll = async () => {
    if (walletBalance <= 0) {
      setToast("No funds available to withdraw 🏦");
      setTimeout(() => setToast(""), 3000);
      return;
    }

    if (!window.confirm(`Are you sure you want to withdraw $${walletBalance.toFixed(2)} to your linked bank account?`)) {
      return;
    }

    setLoading(true);
    try {
      await apiService.user.withdraw(user.id);
      saveTransaction(user.id, "withdrawal", "Withdrawn to Bank Account", walletBalance);
      setWalletBalance(0);
      setToast("Withdrawal request processed! Funds will clear shortly. 🏦");
      
      window.dispatchEvent(new Event("walletUpdate"));
    } catch (err) {
      setToast("Failed to initiate withdrawal");
    }
    setLoading(false);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <style>{`
        .payment-option-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          cursor: pointer;
          font-weight: 700;
          font-size: 0.875rem;
          color: #4b5563;
          background-color: #ffffff;
          transition: all 0.2s ease;
          justify-content: center;
        }
        .payment-option-btn:hover {
          border-color: #3b82f6;
          background-color: #f0f9ff;
          color: #2563eb;
        }
        .payment-option-btn.active {
          border-color: #2563eb;
          background-color: #2563eb;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        .form-field-input {
          width: 100%;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 0.2s ease;
        }
        .form-field-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          background-color: #ffffff;
        }
        .shortcut-badge {
          background-color: #f3f4f6;
          border: 1px solid #e5e7eb;
          border-radius: 9999px;
          padding: 0.375rem 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .shortcut-badge:hover {
          background-color: #e0f2fe;
          border-color: #bae6fd;
          color: #0369a1;
          transform: translateY(-1px);
        }
      `}</style>

      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition cursor-pointer scale-hover"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
        <WalletIcon className="text-blue-600" size={32} />
        My Secure Wallet
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Wallet Card & Transactions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* DIGITAL CARD */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-56">
            {/* Glossy background detail */}
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start z-10">
              <div>
                <p className="text-[10px] text-blue-200 font-extrabold tracking-widest uppercase">ShopEase Wallet Card</p>
                <h3 className="text-2xl font-black mt-1">${walletBalance.toFixed(2)}</h3>
              </div>
              <div className="w-10 h-7 bg-white/15 rounded-md flex items-center justify-center font-bold text-xs uppercase border border-white/20">
                Visa
              </div>
            </div>

            <div className="z-10">
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider mb-0.5">Card Member</p>
              <p className="text-sm font-bold tracking-wide truncate">{user?.name || "Verified Customer"}</p>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-4 z-10">
              <div>
                <p className="text-[9px] text-blue-200 font-bold uppercase tracking-wider">Linked Account</p>
                <p className="font-mono text-xs tracking-[1px] mt-0.5">•••• •••• •••• {user?.id?.slice(-4) || "8840"}</p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-1 rounded-lg border border-emerald-500/30">
                <ShieldCheck size={12} /> Secure
              </div>
            </div>
          </div>

          {/* QUICK WITHDRAW SECTION */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Withdraw Payout</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Instantly settle and withdraw your wallet balance back to your linked banking checking account. Settlements process inside 1-2 hours.
            </p>
            <button
              onClick={handleWithdrawAll}
              disabled={walletBalance <= 0 || loading}
              className="w-full bg-gray-950 hover:bg-black text-white py-3.5 rounded-xl cursor-pointer font-bold transition disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-center text-sm shadow-sm scale-hover flex items-center justify-center gap-2"
            >
              <Building size={16} />
              Withdraw Payout (${walletBalance.toFixed(2)})
            </button>
          </div>

          {/* TRANSACTION HISTORY */}
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
              <Clock size={16} className="text-gray-500" />
              <h3 className="font-bold text-gray-900 text-base">Transaction Log</h3>
            </div>
            
            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1">
              {transactions.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No transaction logs available.</p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="py-3 flex justify-between items-center gap-2 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{tx.desc}</p>
                      <span className="text-[10px] text-gray-400 font-medium block mt-0.5">{tx.date}</span>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-black flex items-center justify-end gap-0.5 ${tx.type === "deposit" ? "text-green-600" : "text-amber-600"}`}>
                        {tx.type === "deposit" ? <Plus size={10} /> : <TrendingDown size={10} />}
                        ${tx.amount.toFixed(2)}
                      </p>
                      <span className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded-sm border font-bold uppercase tracking-wider mt-0.5 inline-block">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Deposit Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-gray-150 p-6 shadow-sm">
            
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Load Money to Wallet
            </h2>

            <form onSubmit={handleAddMoney} className="space-y-6">
              
              {/* AMOUNT FIELD */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deposit Amount ($)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-lg font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount (e.g. 100)"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (formErrors.amount) setFormErrors({ ...formErrors, amount: "" });
                    }}
                    className="form-field-input pl-8 text-lg font-black text-gray-850"
                  />
                </div>
                {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}

                {/* Shortcuts */}
                <div className="flex gap-2 flex-wrap pt-1.5">
                  {[10, 20, 50, 100, 200, 500].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt.toString());
                        if (formErrors.amount) setFormErrors({ ...formErrors, amount: "" });
                      }}
                      className="shortcut-badge"
                    >
                      +${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT OPTION SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Select Funding Source</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    className={`payment-option-btn ${paymentMethod === "card" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard size={15} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={`payment-option-btn ${paymentMethod === "netbanking" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <Building2 size={15} />
                    <span>NetBank</span>
                  </button>
                  <button
                    type="button"
                    className={`payment-option-btn ${paymentMethod === "upi" ? "active" : ""}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <Smartphone size={15} />
                    <span>UPI</span>
                  </button>
                </div>
              </div>

              {/* DYNAMIC FORMS */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                {paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="1234 56** **** ****"
                        value={cardForm.cardNumber}
                        onChange={handleCardChange}
                        className="form-field-input"
                      />
                      {formErrors.cardNumber && <p className="text-xs text-red-500">{formErrors.cardNumber}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        placeholder="Name on card"
                        value={cardForm.cardName}
                        onChange={handleCardChange}
                        className="form-field-input"
                      />
                      {formErrors.cardName && <p className="text-xs text-red-500">{formErrors.cardName}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Expiry Date</label>
                        <input
                          type="text"
                          name="expiry"
                          placeholder="MM/YY"
                          value={cardForm.expiry}
                          onChange={handleCardChange}
                          className="form-field-input text-center"
                        />
                        {formErrors.expiry && <p className="text-xs text-red-500">{formErrors.expiry}</p>}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">CVV / Security</label>
                        <input
                          type="password"
                          name="cvv"
                          placeholder="***"
                          value={cardForm.cvv}
                          onChange={handleCardChange}
                          className="form-field-input text-center"
                        />
                        {formErrors.cvv && <p className="text-xs text-red-500">{formErrors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "netbanking" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Choose Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="form-field-input cursor-pointer"
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

                {paymentMethod === "upi" && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. mobile@okaxis"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="form-field-input"
                      />
                      {formErrors.upiId && <p className="text-xs text-red-500">{formErrors.upiId}</p>}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-1.5">
                      {["@upi", "@okaxis", "@okicici", "@paytm"].map((sfx) => (
                        <button
                          key={sfx}
                          type="button"
                          onClick={() => setUpiId((upiId.split("@")[0] || "username") + sfx)}
                          className="text-xs bg-white border hover:bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg transition"
                        >
                          {sfx}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 btn-glow"
              >
                <Lock size={15} />
                <span>{loading ? "Authorizing Transfer..." : `Authorize Deposit of $${parseFloat(amount || 0).toFixed(2)}`}</span>
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Wallet;
