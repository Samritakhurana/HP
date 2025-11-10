import React, { useState } from "react";
import { Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import OTPVerification from "./OTPVerification";

export default function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"employee" | "administrator">("employee");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [useOTPLogin, setUseOTPLogin] = useState(false);

  const { signIn, sendOTP, requiresOTP, pendingEmail } = useAuth();

  // If OTP verification is required, show the OTP component
  if (requiresOTP && pendingEmail) {
    return <OTPVerification />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isSignUp) {
        setMessage("Sign up functionality - to be implemented");
      } else {
        if (useOTPLogin) {
          await sendOTP(email);
          setMessage("OTP sent to your email! Check your inbox.");
        } else {
          await signIn(email, password);
        }
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/lap.jpg')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative z-10">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent"
              required
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent"
                required
              />
            </div>
          )}

          {!isSignUp && !useOTPLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent"
                required
              />
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "employee" | "administrator")
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-hp-blue focus:border-transparent bg-white"
                required
              >
                <option value="employee">Employee</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          )}

          {!isSignUp && (
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setUseOTPLogin(!useOTPLogin)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  useOTPLogin
                    ? "bg-hp-blue text-white border-hp-blue"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Shield size={20} />
                <span>{useOTPLogin ? "Use Password" : "Use OTP"}</span>
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-hp-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Sign Up"
              : useOTPLogin
              ? "Send OTP"
              : "Sign In"}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm ${
              message.includes("error") || message.includes("Error")
                ? "bg-red-50 text-red-800"
                : "bg-green-50 text-green-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-hp-blue hover:text-blue-700 font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Need an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
