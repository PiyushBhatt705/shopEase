import React from "react";
import {useCart} from "../hooks/useCart";
import { useNavigate } from "react-router-dom";
import EmptyCart from "../components/EmptyCart";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    clearCart,
    increaseQuantity,
    decreaseQuantity,
    updateQuantity
  } = useCart();

  const navigate = useNavigate();

  const cartItems = cart || [];

  const total = parseFloat(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* ANIMATION */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .cart-card {
          animation: fadeUp 0.4s ease forwards;
          transition: all 0.3s ease;
        }

        .cart-card:hover {
          transform: scale(1.01);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 animate-scale-in-dash">
        <div>
          <h1 className="text-4xl font-black tracking-tight">
            <span className="genz-gradient-text genz-text-glow">Your Shopping Cart 🛒</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">Review your selections, adjust quantities, and head to checkout. Secure Deal.</p>
        </div>
      </div>

      {/* CART ITEMS */}
      <div className="space-y-5">

        {cartItems.map((item, index) => (
          <div
            key={item.id}
            className="cart-card flex flex-col md:flex-row gap-5 bg-white border rounded-2xl p-5"
            style={{ animationDelay: `${index * 0.05}s` }}
          >

            {/* IMAGE SECTION */}
            <div className="w-full md:w-32 flex-shrink-0">
              <img
                src={
                  item.images?.[0] ||
                  "https://via.placeholder.com/150"
                }
                alt={item.title}
                className="w-full h-28 object-contain rounded-lg bg-gray-100 p-2"
              />
            </div>

            {/* INFO SECTION */}
            <div className="flex-1">

              <h2 className="font-semibold text-lg text-gray-800 line-clamp-2">
                {item.title}
              </h2>

              <p className="text-gray-500 text-sm mt-1">
                Price: ₹{item.price}
              </p>

              <p className="text-black font-semibold mt-2">
                Subtotal: ${item.price * item.quantity}
              </p>

              {/* ACTION ROW */}
              <div className="flex flex-wrap items-center gap-4 mt-4">

                {/* QUANTITY CONTROLS */}
                <div className="flex items-center gap-3 bg-gray-100 px-3 py-1 rounded-full">

                  <button
                    onClick={() => decreaseQuantity(item.id)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-200"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    value={item.quantity === 0 ? "" : item.quantity}
                    onChange={(e) => {
                      const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        updateQuantity(item.id, Math.max(0, val));
                      }
                    }}
                    onBlur={() => {
                      if (item.quantity <= 0) {
                        updateQuantity(item.id, 1);
                      }
                    }}
                    className="w-10 text-center font-bold bg-transparent focus:outline-none text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="1"
                  />

                  <button
                    onClick={() => increaseQuantity(item.id)}
                    className="cursor-pointer w-7 h-7 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-200"
                  >
                    +
                  </button>

                </div>

                {/* REMOVE */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>

              </div>

            </div>

          </div>
        ))}

      </div>

      {/* TOTAL SECTION */}
      <div className="mt-10 border-t pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

        <h2 className="text-2xl font-bold">
          Total: ${total.toFixed(2)}
        </h2>

        <div className="flex flex-wrap gap-3">

          <button
            onClick={clearCart}
            className="cursor-pointer bg-red-500 text-white px-5 py-2.5 rounded-xl hover:bg-red-600 transition font-semibold btn-danger-glow"
          >
            Clear Cart
          </button>

          <button
            onClick={() => navigate("/")}
            className="cursor-pointer bg-gray-200 text-gray-800 px-5 py-2.5 rounded-xl hover:bg-gray-300 transition font-semibold scale-hover shadow-xs"
          >
            Continue Shopping
          </button>

          <button
            onClick={() => navigate("/checkout")}
            className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition font-bold shadow-md hover:shadow-lg btn-glow"
          >
            Proceed to Checkout
          </button>

        </div>

      </div>

    </div>
  );
};

export default Cart;