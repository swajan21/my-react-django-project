import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirm_password: "",
    address: "",
    phone: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Check if passwords match
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const { confirm_password, ...formData } = form; // exclude confirm_password from API payload
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        formData
      );
      setSuccess(true);
    } catch (err) {
      const responseData = err.response?.data;
      if (responseData?.email) {
        setError(responseData.email[0] || "Email is already registered.");
      } else if (responseData?.phone) {
        setError(
          responseData.phone[0] || "Phone number is already registered."
        );
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else {
        setError("Registration failed: " + JSON.stringify(responseData));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-xl rounded-2xl w-full max-w-lg p-8 space-y-5 animate-fade-in"
      >
        <h2 className="text-3xl font-bold text-center text-indigo-700">
          Create Account
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError("")}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              aria-label="Close"
            >
              <svg
                className="fill-current h-6 w-6 text-red-500"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 5.652a.5.5 0 0 0-.707 0L10 9.293 6.36 5.652a.5.5 0 1 0-.707.707L9.293 10l-3.64 3.64a.5.5 0 0 0 .707.707L10 10.707l3.64 3.64a.5.5 0 0 0 .707-.707L10.707 10l3.64-3.64a.5.5 0 0 0 0-.708z" />
              </svg>
            </button>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4">
            <p className="text-green-600 font-semibold text-lg">
              🎉 Registration Successful!
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
            >
              Go to Login Page
            </button>
          </div>
        ) : (
          <>
            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              name="confirm_password"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            <input
              name="address"
              placeholder="Address"
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />

            {form.role === "vendor" && (
              <input
                name="shop_name"
                placeholder="Shop Name"
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            )}

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
            >
              Register
            </button>
            <div className="text-center mt-4 text-sm text-gray-600">
              Already registered?{" "}
              <a href="/login" className="text-indigo-600 hover:underline">
                Login here
              </a>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
