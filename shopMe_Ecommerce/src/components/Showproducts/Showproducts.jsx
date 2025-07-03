import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Category from "../Category/Category";

function Showproducts() {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    {
      /* for category name */
    }
    axios
      .get(`http://127.0.0.1:8000/api/categories/${categoryId}/`)
      .then((res) => setCategoryName(res.data.name));

    {
      /* for products */
    }
    axios
      .get(`http://127.0.0.1:8000/api/categories/${categoryId}/products/`)
      .then((res) => setProducts(res.data));
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-center text-blue-900 drop-shadow">
          {categoryName}
        </h1>

        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No products found in this category.
          </p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white shadow-xl rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={`http://localhost:8000${product.image}`}
                    alt={product.name}
                    className="w-full h-85 object-cover rounded-lg mb-4"
                  />

                  <div className="absolute top-2 left-2">
                    {product.stock > 0 ? (
                      <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full shadow">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                    ${product.price}
                  </span>

                  <div className="absolute top-40 right-2">
                    {product.discount_percent ? (
                      <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                        {product.discount_percent}% OFF
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    {product.name}
                  </h2>
                  <Link to={`/products/${product.id}`}>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-semibold">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Showproducts;
