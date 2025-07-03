import { useState, useEffect } from "react";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/wishlists/", {
        headers: getAuthHeader(),
      });
      if (res.data.length > 0) {
        setWishlistItems(res.data[0].items); // Assuming 1 wishlist per user
      } else {
        setWishlistItems([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch wishlist.");
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:8000/api/wishlists/remove-item/`,
        { product_id: productId },
        { headers: getAuthHeader() }
      );
      fetchWishlist(); // Refresh list after removal
    } catch (err) {
      console.error(err);
      alert("Failed to remove item.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-4 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiHeart size={28} className="text-pink-500" /> My Wishlist
      </h1>

      {wishlistItems.length === 0 ? (
        <p className="text-gray-500 text-lg">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-32 h-35 object-cover mb-4 rounded-xl"
              />
              <h2 className="text-xl font-semibold">{item.product.name}</h2>
              <p className="text-gray-600 mb-4">${item.product.price}</p>
              <button
                onClick={() => removeItem(item.product.id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
              >
                <FiTrash2 /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
