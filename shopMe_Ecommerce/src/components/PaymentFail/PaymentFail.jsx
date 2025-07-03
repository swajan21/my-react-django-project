import { Link } from "react-router-dom";

export default function PaymentFail() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">❌ Payment Failed!</h1>
      <p className="text-lg mb-6">Something went wrong. Please try again.</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Go to Home
      </Link>
    </div>
  );
}