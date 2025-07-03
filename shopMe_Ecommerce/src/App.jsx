import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";

import Home from "./components/Home/Home";
import Showproducts from "./components/Showproducts/Showproducts";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ProductDetail from "./components/ProductDetails/ProductDetails";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Profile from "./components/Profile/Profile";
import ProfileEdit from "./components/ProfileEdit/ProfileEdit";
import Wishlist from "./components/Wishlist/Wishlist";
import ShoppingCart from "./components/ShoppingCart/ShoppingCart";
import { CartProvider } from "./components/CartContext/CartContext";
import Checkout from "./components/Checkout/Checkout";
import PaymentSuccess from "./components/PaymentSuccess/PaymentSuccess";
import PaymentFail from "./components/PaymentFail/PaymentFail";

const App = () => {
  

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    const token = localStorage.getItem("access");
    if (token) {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/user/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        setUser({
          ...data,
          image: data.image?.startsWith("http")
            ? data.image
            : `http://127.0.0.1:8000${data.image}`,
        });
      } catch (err) {
        setUser(null);
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <CartProvider>
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/paymentSuccess" element={<PaymentSuccess />} />
        <Route path="/paymentfail" element={<PaymentFail />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/shoppingcart" element={<ShoppingCart />} />
        <Route path="/login" element={<Login setUser={setUser} fetchUser={fetchUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/category/:categoryId" element={<Showproducts />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />
    </Router>
    </CartProvider>
  );
};

export default App;
