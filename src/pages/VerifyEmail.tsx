import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { CheckCircle, XCircle } from "lucide-react";

const VerifyEmail: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token from URL parameters
        const token_hash = searchParams.get("token_hash");
        const type = searchParams.get("type");

        if (!token_hash || type !== "signup") {
          setError("Invalid verification link.");
          setLoading(false);
          return;
        }

        // Verify the email using the token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "signup",
        });

        if (error) {
          setError(error.message);
        } else if (data.user) {
          setVerified(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (err) {
        console.error("Email verification error:", err);
        setError("An unexpected error occurred during verification.");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/hphoto.jpg')" }}
      >
        <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-hp-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">CD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifying Email...
          </h1>
          <div className="animate-pulse text-hp-blue">
            Please wait while we verify your email address.
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{ backgroundImage: "url('/hphoto.jpg')" }}
      >
        <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your email has been successfully verified. You can now sign in to
            your account.
          </p>
          <div className="animate-pulse text-hp-blue">
            Redirecting to login in 3 seconds...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: "url('/hphoto.jpg')" }}
    >
      <div className="max-w-sm w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verification Failed
        </h1>
        <p className="text-red-600 dark:text-red-400 mb-4">
          {error || "Unable to verify your email address."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="w-full bg-hp-blue hover:bg-hp-dark-blue text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;
