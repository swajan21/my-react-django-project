import { IoMdSearch } from "react-icons/io";
import DarkMode from "./DarkMode";
import { FiShoppingBag } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { FaCartShopping, FaCaretDown, FaUser } from "react-icons/fa6";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { AiFillHeart } from "react-icons/ai";
import { useCart } from "../CartContext/CartContext";

const Navbar = ({ user, setUser, handleOrderPopup }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState("home");
  const navigate = useNavigate();
  const { cartCount } = useCart();

  // Fetch categories on mount
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories/")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const categoryItems = useMemo(() => {
    return categories.map((cat) => (
      <li
        key={cat.id}
        className="flex items-center justify-between p-2 hover:bg-gray-100 cursor-pointer rounded"
        onClick={() => navigate(`/category/${cat.id}`)}
      >
        <span>{cat.name}</span>
        <img
          src={cat.image}
          alt={cat.name}
          loading="lazy"
          className="w-10 h-10 object-cover rounded"
        />
      </li>
    ));
  }, [categories]);

  // Search debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length >= 1) {
        axios
          .get(`http://127.0.0.1:8000/api/products/?search=${query}`)
          .then((res) => setResults(res.data))
          .catch((err) => console.error(err));
      } else {
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSearchClick = () => {
    if (query.trim().length >= 1) {
      axios
        .get(`http://127.0.0.1:8000/api/products/?search=${query}`)
        .then((res) => {
          const products = res.data;
          if (products.length > 0) {
            navigate(`/products/${products[0].id}`);
            setQuery("");
            setResults([]);
          } else {
            alert("No products found.");
            setResults([]);
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="shadow-md bg-white dark:bg-slate-800 dark:text-white duration-200 relative z-40">
      <div className="bg-primary/40 py-2">
        <div className="container flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl flex items-center gap-1">
            <FiShoppingBag size="30" />
            MyShop
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative w-[200px] sm:w-[250px]">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="w-full rounded-lg border border-gray-300 py-1 px-2 text-sm focus:outline-none focus:border-primary dark:border-gray-500 dark:bg-slate-800"
              />
              <button
                onClick={handleSearchClick}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-800 dark:text-gray-300"
              >
                <IoMdSearch />
              </button>
              {(results.length > 0 ||
                (results.length === 0 && query.length > 0)) && (
                <div className="absolute top-full mt-2 w-full max-h-64 overflow-auto bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 shadow-lg rounded-lg z-50 text-black dark:text-white p-2">
                  {results.length === 0 ? (
                    <p className="p-2">No products found.</p>
                  ) : (
                    <ul>
                      {results.map((product) => (
                        <li
                          key={product.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer rounded"
                          onClick={() => handleProductClick(product)}
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) =>
                              (e.target.src = "/placeholder-image.png")
                            }
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {product.category}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Cart Dropdown */}
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                <FaCartShopping size={24} />
              </div>

              <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white p-2 text-black shadow-md max-h-72 overflow-auto">
                <Link
                  to="/shoppingcart"
                  className="block px-5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span>View Cart</span>
                    {/* Show cartCount only if user is logged in */}
                    {user && cartCount > 0 && (
                      <span className="font-semibold text-purple-600">
                        {cartCount}
                      </span>
                    )}
                  </div>
                </Link>
                <Link
                  to="/orders"
                  className="block px-5 py-2 mt-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <span>Your Orders</span>
                    <span className="font-semibold text-purple-600">5</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-pink-700 text-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <AiFillHeart size={22} />
            </Link>

            {/* User Profile Dropdown */}
            {user ? (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-1 px-2 py-2 bg-gradient-to-r from-blue-400 to-blue-600  text-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200">
                  {user.image && user.image.trim() !== "" ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-white"
                    />
                  ) : (
                    <FaUser size={24} />
                  )}
                </div>

                <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white p-2 text-black shadow-md max-h-72 overflow-auto">
                  <Link
                    to="/profile"
                    className="block px-5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      setUser(null);
                      navigate("/login");
                    }}
                    className="block w-full text-left px-5 py-2 mt-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-2 px-3 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-300">
                  <FaUser />
                </div>

                <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white p-2 text-black shadow-md max-h-72 overflow-auto">
                  <Link
                    to="/login"
                    className="block px-5 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-5 py-2 mt-1 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md transition-colors duration-200"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}

            {/* Dark Mode Toggle */}
            <DarkMode />
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div data-aos="zoom-in" className="flex justify-center py-2">
        <ul className="sm:flex hidden items-center gap-4">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <a
              href="#top_product"
              onClick={() => setMenu("BestProducts")}
              className={menu === "BestProducts" ? "active" : ""}
            >
              BestProducts
            </a>
          </li>
          <li>
            <a
              href="#subscribe"
              onClick={() => setMenu("Subscribe")}
              className={menu === "Subscribe" ? "active" : ""}
            >
              Subscribe
            </a>
          </li>
          <li>
            <a
              href="#about"
              onClick={() => setMenu("About")}
              className={menu === "About" ? "active" : ""}
            >
              About
            </a>
          </li>
          <li className="group relative cursor-pointer">
            <a href="#" className="flex items-center gap-[2px] py-2">
              Categories
              <FaCaretDown className="transition-all duration-200 group-hover:rotate-180" />
            </a>
            <div className="absolute z-[9999] hidden group-hover:block w-[200px] rounded-md bg-white p-2 text-black shadow-md max-h-72 overflow-auto">
              <ul>
                {categories.length === 0 ? (
                  <li className="p-2 flex justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent animate-spin rounded-full"></div>
                  </li>
                ) : (
                  categoryItems
                )}
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Navbar;
