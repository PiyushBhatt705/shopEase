import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, HelpCircle, Ticket, Wallet } from "lucide-react";
import { apiService } from "../services/apiService";
import { soundService } from "../services/soundService";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

const Chatbot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I am your ShopEase AI Assistant. Ask me about active coupons, product recommendations, or check your wallet balance! Type **help** to see all options."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      soundService.playPop();
    } else {
      soundService.playTrash();
    }
  };

  const parseUserQuery = async (query) => {
    const q = query.toLowerCase().trim();

    // 1. HELP / FAQ
    if (q.includes("help") || q.includes("faq") || q.includes("what can you")) {
      return "I can assist you with:\n- **Coupons**: Type 'show coupons' to get discount codes.\n- **Wallet**: Type 'check balance' to see your wallet details.\n- **Delivery**: Ask 'is delivery free?' or 'how long does shipping take?'\n- **Recommendations**: Type 'recommend shoes' or 'show bags' to find products!";
    }

    // 2. COUPONS / PROMO
    if (q.includes("coupon") || q.includes("promo") || q.includes("discount") || q.includes("code")) {
      return "🎟️ **Active Promo Coupons Available**:\n\n1. **EASE20** - 20% discount on orders above $50.\n2. **FREESHIP** - Free delivery sitewide (no minimum purchase!).\n\nCopy these codes and enter them at the checkout screen to save!";
    }

    // 3. WALLET / BALANCE
    if (q.includes("wallet") || q.includes("balance") || q.includes("money") || q.includes("cash")) {
      const userData = JSON.parse(localStorage.getItem("userData"));
      if (userData && userData.id) {
        // Fetch current user details or fetch from db.json if exists
        try {
          const res = await fetch(`${BACKEND_URL}/api/users/${userData.id}`);
          if (res.ok) {
            const data = await res.json();
            return `💳 **Wallet Details**:\n\nAccount: **${data.name}**\nEmail: **${data.email}**\nActive Wallet Balance: **$${parseFloat(data.walletBalance || 0).toFixed(2)}**`;
          }
        } catch (e) {
          // fallback
        }
        return `💳 **Wallet Balance**: Your active balance is **$${parseFloat(userData.walletBalance || 0).toFixed(2)}**. You can reload it in your Wallet dashboard!`;
      }
      return "🔑 Please log in to check your active wallet balance and purchase items.";
    }

    // 4. SHIPPING / DELIVERY
    if (q.includes("shipping") || q.includes("delivery") || q.includes("track") || q.includes("ship")) {
      return "🚚 **Shipping & Delivery Policies**:\n\n- Standard Shipping: **3-5 business days**.\n- Express Delivery: **1-2 business days** (additional $5).\n- Free Shipping code: Use coupon **FREESHIP** during checkout!\n- You can track active shipments on the **Track Order** page.";
    }

    // 5. RECOMMENDATIONS / PRODUCT LOOKUPS
    if (
      q.includes("recommend") ||
      q.includes("show") ||
      q.includes("find") ||
      q.includes("product") ||
      q.includes("buy") ||
      q.includes("laptop") ||
      q.includes("phone") ||
      q.includes("clothing") ||
      q.includes("electronics") ||
      q.includes("bag") ||
      q.includes("shoe") ||
      q.includes("shirt")
    ) {
      try {
        const products = await apiService.products.listAll();
        // Determine search keyword (remove verbs/generic words)
        const stopwords = ["recommend", "show", "find", "product", "products", "buy", "me", "some", "a", "the", "please", "any"];
        const keywords = q.split(" ").filter(w => !stopwords.includes(w) && w.length > 2);

        let matches = [];
        if (keywords.length > 0) {
          matches = products.filter(p => {
            return keywords.some(keyword => 
              p.title.toLowerCase().includes(keyword) || 
              p.category.toLowerCase().includes(keyword) ||
              p.description.toLowerCase().includes(keyword)
            );
          });
        } else {
          // If no specific keyword, recommend random top products
          matches = products.slice(0, 3);
        }

        if (matches.length > 0) {
          return {
            text: `🛍️ **Here are some matching recommendations I found for you**:\n\nClick on any product card below to view its details instantly!`,
            products: matches.slice(0, 3)
          };
        }
      } catch (err) {
        console.error("Chatbot product fetch failed:", err);
      }
      return "🛍️ I couldn't find any specific matching products right now. However, you can browse our categories on the home page or search the main inventory catalog!";
    }

    // 6. DEFAULT FALLBACK
    return "🤖 I'm still learning! You can ask me about:\n- Active **coupons** (e.g. 'show coupons')\n- Product **recommendations** (e.g. 'recommend electronics')\n- Check **wallet balance**\n- **Delivery** details\n\nType **help** to see all capabilities.";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    // Add user message
    setMessages(prev => [...prev, { sender: "user", text: userText }]);
    setInputValue("");
    soundService.playClick();
    
    // Trigger typing indicator
    setIsTyping(true);

    // Get reply
    const reply = await parseUserQuery(userText);

    setTimeout(() => {
      setIsTyping(false);
      if (typeof reply === "string") {
        setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      } else {
        setMessages(prev => [...prev, { sender: "bot", text: reply.text, products: reply.products }]);
      }
      soundService.playPop();
    }, 800);
  };

  const formatText = (text) => {
    // Simple markdown formatting helper for bolding and list lines
    return text.split("\n").map((line, key) => {
      let element = line;
      // Bold matches **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      element = element.replace(boldRegex, "<strong>$1</strong>");
      
      // Italics matches *text*
      const italicRegex = /\*(.*?)\*/g;
      element = element.replace(italicRegex, "<em>$1</em>");

      return <p key={key} dangerouslySetInnerHTML={{ __html: element || "&nbsp;" }} className="text-xs leading-relaxed mb-1" />;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[99] flex flex-col items-end">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-3xl w-[calc(100vw-2rem)] sm:w-[360px] max-w-sm chatbot-window h-[450px] max-h-[85vh] flex flex-col mb-4 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-inner">
                <Bot size={20} className="text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs tracking-wide flex items-center gap-1">
                  ShopEase Bot <Sparkles size={12} className="text-yellow-350 fill-yellow-350" />
                </h3>
                <span className="text-[10px] text-indigo-150 font-semibold flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                  Online Shopping Assistant
                </span>
              </div>
            </div>
            
            <button
              onClick={handleToggle}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Option Bar */}
          <div className="bg-slate-50 dark:bg-slate-850 px-3 py-2 border-b border-slate-100 dark:border-zinc-800 flex gap-2 overflow-x-auto text-[10px] scrollbar-none font-bold text-slate-600 dark:text-slate-350">
            <button
              onClick={() => {
                setInputValue("Show coupons");
                soundService.playClick();
              }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs hover:text-indigo-650 cursor-pointer flex-shrink-0"
            >
              <Ticket size={11} /> Coupons
            </button>
            <button
              onClick={() => {
                setInputValue("Check wallet balance");
                soundService.playClick();
              }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs hover:text-indigo-650 cursor-pointer flex-shrink-0"
            >
              <Wallet size={11} /> Wallet
            </button>
            <button
              onClick={() => {
                setInputValue("Recommend laptop");
                soundService.playClick();
              }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs hover:text-indigo-650 cursor-pointer flex-shrink-0"
            >
              <Bot size={11} /> Laptops
            </button>
            <button
              onClick={() => {
                setInputValue("Help & FAQs");
                soundService.playClick();
              }}
              className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-zinc-800 px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs hover:text-indigo-650 cursor-pointer flex-shrink-0"
            >
              <HelpCircle size={11} /> Help
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/10">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl shadow-xs leading-normal animate-fade-in ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : "bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 border border-slate-150 dark:border-zinc-800/80 rounded-tl-none"
                  }`}
                >
                  {msg.sender === "bot" ? formatText(msg.text) : <p className="text-xs">{msg.text}</p>}
                  
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3.5 space-y-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/40">
                      {msg.products.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            soundService.playClick();
                            setIsOpen(false);
                            navigate(`/product/${product.id}`);
                          }}
                          className="flex items-center gap-2.5 p-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900/60 dark:hover:bg-slate-900 border border-slate-100 dark:border-zinc-800/50 hover:border-indigo-200 rounded-xl cursor-pointer transition duration-200 group"
                        >
                          <img
                            src={product.images?.[0] || product.thumbnail || ""}
                            alt={product.title}
                            className="w-10 h-10 object-contain rounded-lg bg-white p-0.5"
                          />
                          <div className="flex-grow min-w-0 text-left">
                            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-250 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400">
                              {product.title}
                            </h4>
                            <span className="text-[10px] font-black text-slate-900 dark:text-white mt-0.5 block">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          </div>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-bold uppercase shrink-0">
                            View →
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-850 border border-slate-150 dark:border-zinc-800/80 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-550 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-150 dark:border-zinc-800 bg-white dark:bg-slate-900 flex gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about ShopEase..."
              className="flex-grow bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-250 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-2.5 shadow-xs transition duration-200 hover:shadow-indigo-500/10 cursor-pointer flex-shrink-0 flex items-center justify-center"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING TRIGGER BUTTON */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 bg-gradient-to-tr from-indigo-600 via-indigo-650 to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition duration-300 relative border-2 border-indigo-400/20 group cursor-pointer z-50 chatbot-trigger-btn"
      >
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500 text-[8px] text-white font-extrabold items-center justify-center">1</span>
        </span>
        
        {isOpen ? (
          <X size={24} className="transition duration-300" />
        ) : (
          <MessageSquare size={24} className="group-hover:rotate-6 transition duration-300" />
        )}
      </button>
    </div>
  );
};

export default Chatbot;
