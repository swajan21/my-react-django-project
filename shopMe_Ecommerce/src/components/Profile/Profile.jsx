import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    axios
      .get("http://127.0.0.1:8000/api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data;
        setUser({
          ...data,
          image:
            data.image && data.image.trim() !== ""
              ? data.image.startsWith("http")
                ? data.image
                : `http://127.0.0.1:8000${data.image}`
              : null,
        });
      })
      .catch(() => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        navigate("/login");
      });
  }, [navigate]);

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-gray-200 flex justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Banner */}
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <img
              src={
                user.image
                  ? user.image
                  : "https://via.placeholder.com/150?text=No+Image"
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150?text=No+Image";
              }}
              className="h-32 w-32 rounded-full border-4 border-white shadow-md object-cover"
              alt="User Profile"
            />
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 pb-10 px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500 mb-2">{user.email}</p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">📞 Phone</h3>
              <p className="font-medium text-gray-700">
                {user.phone || "Not provided"}
              </p>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl shadow-sm">
              <h3 className="text-sm text-gray-500 mb-1">📍 Address</h3>
              <p className="font-medium text-gray-700">
                {user.address || "Not provided"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/edit-profile")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow-lg transition"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
