import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Howl } from "howler";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function Login({ setUser, fetchUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/token/", {
        email,
        password,
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      setSuccess(true);

      // 🔁 Fetch user after login
      await fetchUser();
      // Optional sound effect
      // const sound = new Howl({ src: ["/sounds/success.mp3"], volume: 1.0 });
      // sound.play();

      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 relative overflow-hidden">
      {success && <Confetti width={width} height={height} recycle={false} />}

      <form
        onSubmit={handleLogin}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md z-10"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login to Your Account
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-2 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="text-right mb-4">
          <Link
            to="/forgot-password"
            className="text-sm text-indigo-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        {success && (
          <div className="flex justify-center mb-4">
            <div className="text-green-600 text-lg font-semibold flex items-center">
              <svg
                className="h-6 w-6 text-green-500 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Login Successful!
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`w-full py-3 rounded-xl text-white font-semibold transition duration-200 ${
            loading || success
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center mt-6 text-sm text-gray-600">
          Not registered yet?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
