import { BsCartFill } from "react-icons/bs";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../CartContext/CartContext";


export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [totalWithShipping, setTotalWithShipping] = useState(0);
  const navigate = useNavigate();
  const { setCartCount } = useCart();
  

  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCart = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/cart/", {
        headers: getAuthHeader(),
      });
      setCartItems(res.data.items);
      setTotalPrice(res.data.total_price);
      setShippingCharge(res.data.shipping_charge);
      setTotalWithShipping(res.data.total_price_with_shipping);
      setCartCount(res.data.items.length);
    } catch (err) {
      console.error(err);
      setCartItems([]);
      setTotalPrice(0);
      setShippingCharge(0);
      setTotalWithShipping(0);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        { product_id: productId, quantity: newQuantity },
        { headers: getAuthHeader() }
      );
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Failed to update quantity.");
    }
  };

  const removeItem = async (productId) => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/remove/",
        { product_id: productId },
        { headers: getAuthHeader() }
      );
      fetchCart();
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-50 to-blue-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 text-pink-600">
            <BsCartFill /> Shopping Cart
          </h1>
          <button
            onClick={() => navigate("/")}
            className="bg-pink-500 text-white px-6 py-3 rounded-xl hover:bg-pink-600 transition"
          >
            Continue Shopping
          </button>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-500">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center gap-6">
                  <img
                    src={`http://127.0.0.1:8000${item.product.image}`}
                    alt={item.product.name}
                    className="w-24 h-30 object-cover rounded-xl border"
                  />
                  <div>
                    <h2 className="font-semibold text-xl">
                      {item.product.name}
                    </h2>
                    <p className="text-gray-500">
                      Price: $
                      {item.product.discount_price ?? item.product.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-xl">
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="p-2 hover:bg-gray-200 rounded disabled:opacity-50"
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="p-2 hover:bg-gray-200 rounded"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>

                  <p className="font-bold text-xl w-24 text-center">
                    $
                    {(
                      (item.product.discount_price ?? item.product.price) *
                      item.quantity
                    ).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total & Checkout */}
        {cartItems.length > 0 && (
          <>
            <div className="mt-8 space-y-2 border-t pt-6 text-right">
              <p className="text-lg font-medium">
                Subtotal:{" "}
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </p>
              <p className="text-lg font-medium">
                Shipping:{" "}
                <span className="font-bold">${shippingCharge.toFixed(2)}</span>
              </p>
              <h2 className="text-2xl font-bold text-pink-600">
                Total: ${totalWithShipping.toFixed(2)}
              </h2>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-green-500 text-white px-8 py-4 rounded-2xl text-lg hover:bg-green-600 transition shadow-lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
