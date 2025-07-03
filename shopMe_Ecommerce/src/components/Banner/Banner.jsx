import React, { useEffect, useState } from "react";
import axios from "axios";
import { GrSecure } from "react-icons/gr";
import { IoFastFood } from "react-icons/io5";
import { GiFoodTruck } from "react-icons/gi";

// Map icon names from backend to react-icons components
const iconMap = {
  GrSecure: GrSecure,
  IoFastFood: IoFastFood,
  GiFoodTruck: GiFoodTruck,
};

// Map background color names from backend to Tailwind CSS classes
const bgColorMap = {
  violet: "bg-violet-200 dark:bg-violet-400",
  orange: "bg-orange-100 dark:bg-orange-400",
  green: "bg-green-100 dark:bg-green-400",
  yellow: "bg-yellow-100 dark:bg-yellow-400",
};

const Banner = () => {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/banner/active/") // Your Django API endpoint
      .then((response) => {
        setBanner(response.data);
      })
      .catch((error) => {
        console.error("Failed to load banner data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading banner...</div>;
  }

  if (!banner || !banner.title) {
    return <div className="text-center p-8">No banner data available.</div>;
  }

  return (
    <div className="min-h-[550px] flex justify-center items-center py-12 sm:py-0">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* image section */}
          <div data-aos="zoom-in">
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="max-w-[500px] h-[450px] w-full mx-auto object-cover"
              />
            ) : (
              <div className="max-w-[400px] h-[350px] w-full mx-auto bg-gray-200 flex items-center justify-center">
                No Image Available
              </div>
            )}
          </div>

          {/* text details section */}
          <div className="flex flex-col justify-center gap-6 sm:pt-0">
            <h1 data-aos="fade-up" className="text-3xl sm:text-4xl font-bold">
              {banner.title}
            </h1>
            <p
              data-aos="fade-up"
              className="text-sm text-gray-500 tracking-wide leading-5"
            >
              {banner.description}
            </p>
            <div className="flex flex-col gap-4">
              {banner.features && banner.features.length > 0 ? (
                banner.features.map(({ icon, text, bg_color }, idx) => {
                  const IconComponent = iconMap[icon];
                  const bgClass = bgColorMap[bg_color] || "bg-gray-100";

                  return (
                    <div
                      key={idx}
                      data-aos="fade-up"
                      className="flex items-center gap-4"
                    >
                      {IconComponent && (
                        <IconComponent
                          className={`text-4xl h-12 w-12 shadow-sm p-4 rounded-full ${bgClass}`}
                        />
                      )}
                      <p>{text}</p>
                    </div>
                  );
                })
              ) : (
                <p>No features to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
