import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Checkout() {
  const [cart, setCart] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [cartRes, profileRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/cart/", { headers: getAuthHeader() }),
          axios.get("http://127.0.0.1:8000/api/user/profile/", { headers: getAuthHeader() }),
        ]);

        setCart({
          items: cartRes.data.items || [],
          total_price: parseFloat(cartRes.data.total_price || 0),
          shipping_charge: parseFloat(cartRes.data.shipping_charge || 0),
          total_price_with_shipping: parseFloat(cartRes.data.total_price_with_shipping || 0),
        });

        const prof = profileRes.data;
        setProfile({
          ...prof,
          image:
            prof.image && prof.image.trim() !== ""
              ? prof.image.startsWith("http")
                ? prof.image
                : `http://127.0.0.1:8000${prof.image}`
              : null,
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to load data. Please login.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePayment = async () => {
    if (!profile?.address) {
      alert("Please add a shipping address in your profile before ordering.");
      return;
    }
    if (!cart?.items?.length) {
      alert("Your cart is empty!");
      navigate("/");
      return;
    }

    setPaymentLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/payment/initiate/",
        { total_amount: cart.total_price_with_shipping.toFixed(2) },
        { headers: getAuthHeader() }
      );

      const { payment_url } = res.data;
      if (payment_url) {
        window.location.href = payment_url; // Redirect to payment page
      } else {
        setError("Could not get payment URL from server.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate payment.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-600 text-center text-xl">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6 flex flex-col items-center">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl p-8 space-y-10">
        <h1 className="text-5xl font-extrabold text-green-700 mb-10 text-center">Checkout</h1>

        {/* Profile */}
        <section className="flex items-center gap-6 border p-6 rounded-2xl shadow-lg bg-gradient-to-r from-white to-green-50">
          <img
            src={
              profile.image
                ? profile.image
                : "https://via.placeholder.com/120?text=No+Image"
            }
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-green-600 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/120?text=No+Image";
            }}
          />
          <div>
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            <p className="text-gray-700">{profile.email}</p>
            <p className="mt-1">📞 {profile.phone || "Not provided"}</p>
            <p className="mt-1">📍 {profile.address || "Not provided"}</p>
          </div>
        </section>

        {/* Cart Items */}
        <section>
          <h2 className="text-3xl font-bold mb-6 border-b pb-2 text-gray-800">
            Cart Items ({cart.items.length})
          </h2>
          {cart.items.length > 0 ? (
            <div className="space-y-6">
              {cart.items.map((item) => {
                const price = parseFloat(item.product.discount_price ?? item.product.price) || 0;
                const originalPrice = parseFloat(item.product.price) || 0;
                const subtotal = price * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border rounded-2xl shadow hover:shadow-lg transition bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={`http://127.0.0.1:8000${item.product.image}`}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-xl border shadow"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/100?text=No+Image";
                        }}
                      />
                      <div>
                        <h3 className="text-xl font-semibold">{item.product.name}</h3>
                        <p className="text-gray-600 mt-1">
                          Price:{" "}
                          {price !== originalPrice && (
                            <span className="line-through text-gray-400 mr-2">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="text-pink-600 font-bold">${price.toFixed(2)}</span>
                        </p>
                        <p className="mt-1">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right font-bold text-xl text-gray-800">
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-lg">Your cart is empty.</p>
          )}
        </section>

        {/* Order Summary */}
        <section className="border-t pt-6 text-right space-y-2">
          <p className="text-lg font-medium">
            Subtotal: <span className="font-bold text-gray-800">${cart.total_price.toFixed(2)}</span>
          </p>
          <p className="text-lg font-medium">
            Shipping: <span className="font-bold text-gray-800">${cart.shipping_charge.toFixed(2)}</span>
          </p>
          <h3 className="text-3xl font-extrabold text-pink-600 mt-4">
            Total: ${cart.total_price_with_shipping.toFixed(2)}
          </h3>
        </section>

        {/* Pay Button */}
        <div className="flex justify-end">
          <button
            disabled={paymentLoading}
            onClick={handlePayment}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg transition shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {paymentLoading ? "Processing..." : "Pay with SSLCOMMERZ"}
          </button>
        </div>
      </div>
    </div>
  );
}