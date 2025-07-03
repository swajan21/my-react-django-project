import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { CartProvider } from "./components/CartContext/CartContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
 
  <CartProvider>
    <App />
  </CartProvider>
  
);

  