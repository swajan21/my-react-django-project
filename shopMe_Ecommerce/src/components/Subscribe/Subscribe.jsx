import { useState } from "react";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubscribe = async () => {
  if (!email) return setStatus("Please enter an email.");

  try {
    const response = await fetch("http://127.0.0.1:8000/api/subscribe/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (response.status === 201) {
      setStatus("Subscribed successfully!");
      setEmail("");
    } else if (response.status === 200 && data.message === "Already subscribed") {
      setStatus("You're already subscribed.");
    } else {
      setStatus(`Subscription failed: ${data.error || JSON.stringify(data)}`);
    }
  } catch (error) {
    console.error("Network error:", error);
    setStatus("Error connecting to server.");
  }
};


  return (
    <div className="subscribe" id="subscribe">
    <div data-aos="zoom-in" className="mb-20 bg-slate-700 dark:bg-gray-800 text-white">
      <div className="container backdrop-blur-sm py-10">
        <div className="space-y-6 max-w-xl mx-auto">
          <h1 className="text-2xl !text-center sm:text-left sm:text-4xl font-semibold">
            Get Notified About New Products
          </h1>
          <div className="flex gap-2">
            <input
              data-aos="fade-up"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 text-black"
            />
            <button
              onClick={handleSubscribe}
              className="bg-blue-600 px-4 py-3 rounded hover:bg-blue-700"
            >
              Subscribe
            </button>
          </div>
          {status && <p className="text-sm text-center mt-2">{status}</p>}
        </div>
      </div>
    </div>
    </div>
  );
};

export default Subscribe;
