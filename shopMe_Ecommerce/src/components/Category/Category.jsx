import React from "react";
import Img1 from "../../assets/women/women.png";
import Img2 from "../../assets/women/women2.jpg";
import Img3 from "../../assets/women/women3.jpg";
import Img4 from "../../assets/women/women4.jpg";
import { FaStar } from "react-icons/fa6";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Category() {
  const [category, setCategory] = useState([]);
  const [viewAll, setViewAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/categories/")
      .then((response) => setCategory(response.data.slice(0, 5)))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleViewAll = () => {
    axios
      .get("http://127.0.0.1:8000/api/categories/")
      .then((response) => {
        setCategory(response.data);
        setViewAll(true);
      })
      .catch((error) => console.error("Error fetching all categories:", error));
  };

  return (
    <div className="mt-14 mb-12">
      <div className="container">
        {/* Header section */}
        <div className="text-center mb-10 max-w-[600px] mx-auto">
          <p data-aos="fade-up" className="text-sm text-primary">
            Top Selling Products for you
          </p>
          <h1 data-aos="fade-up" className="text-3xl font-bold">
            Categories
          </h1>
          <p data-aos="fade-up" className="text-xs text-gray-400">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sit
            asperiores modi Sit asperiores modi
          </p>
        </div>
        {/* Body section */}
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 place-items-center gap-20">
            {/* card section */}
            {category.map((data) => (
              <div
                data-aos="fade-up"
                data-aos-delay={data.aosDelay}
                className="space-y-30"
                key={data.id}
                onClick={() => navigate(`/category/${data.id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={data.image}
                  alt=""
                  className="h-[350px] w-[220px] object-cover rounded-md"
                />
                <div>
                  <h1 className="text-xl font-bold">{data.name}</h1>
                  <div className="flex items-center gap-1">
                    <span>{data.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* view all button */}
          {!viewAll && (
            <div className="flex justify-center">
              <button
                onClick={handleViewAll}
                className="text-center mt-10 cursor-pointer bg-primary text-white py-1 px-5 rounded-md"
              >
                View All Categories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Category;
