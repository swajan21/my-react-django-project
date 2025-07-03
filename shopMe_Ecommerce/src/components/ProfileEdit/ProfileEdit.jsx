import React, { useEffect, useState } from "react";
import axiosInstance from "../Axios_instance/Axios_instance";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profileImage: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosInstance.get("user/profile/");
        const data = res.data;
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          profileImage: data.image
            ? data.image.startsWith("http")
              ? data.image
              : `http://127.0.0.1:8000${data.image}`
            : null,
        });
      } catch {
        setError("❌ Failed to load profile.");
      }
    }
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setProfile((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone);
      formData.append("address", profile.address);
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await axiosInstance.put("user/profile/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = await axiosInstance.get("user/profile/");
      const updatedData = updated.data;

      setProfile({
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        address: updatedData.address,
        profileImage: updatedData.image
          ? updatedData.image.startsWith("http")
            ? updatedData.image
            : `http://127.0.0.1:8000${updatedData.image}`
          : null,
      });

      setSuccess("✅ Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile"); // Change the path if your profile route is different
      }, 1000);
      setSelectedFile(null);
    } catch {
      setError("❌ Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 bg-indigo-600 flex flex-col items-center justify-center p-8 text-white relative">
          <div className="relative">
            <img
              src={
                profile.profileImage
                  ? profile.profileImage
                  : "https://via.placeholder.com/150?text=No+Image"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg"
            />
            <label
              htmlFor="imageUpload"
              title="Change Profile Image"
              className="absolute bottom-0 right-0 bg-indigo-700 p-2 rounded-full cursor-pointer hover:bg-indigo-800 transition"
            >
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </label>
          </div>
          <h3 className="mt-6 text-xl font-semibold">
            {profile.name || "Your Name"}
          </h3>
          <p className="mt-1 text-indigo-300">
            {profile.email || "your.email@example.com"}
          </p>
        </div>

        {/* Form */}
        <div className="flex-1 p-10">
          <h2 className="text-3xl font-bold mb-8 text-slate-700">
            Edit Profile
          </h2>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Name
              </label>
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                rows={3}
                className="w-full border border-slate-300 rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
