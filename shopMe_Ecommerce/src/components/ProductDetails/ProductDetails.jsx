import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function ProductDetail() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/products/${productId}/`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error(err));
  }, [productId]);

  const getAuthHeader = () => {
    const token = localStorage.getItem("access");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const checkLogin = () => {
    return !!localStorage.getItem("access");
  };

  const handleAddToCart = async () => {
    if (!checkLogin()) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        { product_id: productId, quantity: 1 },
        { headers: getAuthHeader() }
      );
      navigate("/shoppingcart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart.");
    }
  };

  const handleBuyNow = async () => {
    if (!checkLogin()) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/add/",
        { product_id: productId, quantity: 1 },
        { headers: getAuthHeader() }
      );
      navigate("/shoppingcart");
    } catch (err) {
      console.error(err);
      alert("Failed to add to cart.");
    }
  };

  const handleAddToWishlist = async () => {
    if (!checkLogin()) {
      navigate("/login");
      return;
    }

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/wishlists/add-item/`,
        { product_id: productId },
        { headers: getAuthHeader() }
      );
      alert("Added to wishlist!");
    } catch (error) {
      console.error("Wishlist error:", error);
      alert("Failed to add to wishlist.");
    }
  };

  if (!product) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Product Image */}
        <div className="rounded-xl overflow-hidden shadow-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          {product.discount_percent ? (
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              {product.discount_percent}% OFF
            </span>
          ) : null}

          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            {product.name}
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            <strong>Description:</strong> {product.description}
          </p>

          <div className="mb-6">
            {product.discount_price ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="text-red-500 text-lg line-through border border-red-300 rounded px-3 py-1">
                  Original Price:{" "}
                  <span className="font-semibold">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>

                <div className="bg-green-600 text-white text-xl font-bold rounded px-5 py-2 shadow-md">
                  Discount Price: $
                  {parseFloat(product.discount_price).toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="text-green-700 text-2xl font-extrabold">
                Price: ${parseFloat(product.price).toFixed(2)}
              </div>
            )}

            {product.discount_price && (
              <div className="mt-2 text-black text-xs font-bold px-3 py-1 rounded-full shadow">
                You save ${(product.price - product.discount_price).toFixed(2)}!
              </div>
            )}
          </div>

          <div className="mb-6">
            {product.stock > 0 ? (
              <span className="text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium shadow">
                In Stock
              </span>
            ) : (
              <span className="text-sm text-red-700 bg-red-100 px-3 py-1 rounded-full font-medium shadow">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action Buttons */}
          {product.stock > 0 ? (
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-semibold shadow"
              >
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold shadow"
              >
                Buy Now
              </button>
            </div>
          ) : (
            <div className="flex gap-4 mt-4">
              <button
                onClick={handleAddToWishlist}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-semibold shadow"
              >
                Add to Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
