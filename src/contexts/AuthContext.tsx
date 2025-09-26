import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthResponse {
  data?: any;
  error?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  requiresOTP: boolean;
  pendingEmail: string | null;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  sendOTP: (email: string) => Promise<AuthResponse>;
  verifyOTP: (email: string, token: string) => Promise<AuthResponse>;
  resendOTP: () => Promise<AuthResponse>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updatePassword: (password: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Check if user has verified email
      if (session?.user && !session.user.email_confirmed_at) {
        setRequiresOTP(true);
        setPendingEmail(session.user.email || null);
        setUser(null);
      } else {
        setUser(session?.user ?? null);
        setRequiresOTP(false);
        setPendingEmail(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && !session.user.email_confirmed_at) {
        setRequiresOTP(true);
        setPendingEmail(session.user.email || null);
        setUser(null);
      } else {
        setUser(session?.user ?? null);
        setRequiresOTP(false);
        setPendingEmail(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      // Check if email is confirmed
      if (!data.user.email_confirmed_at) {
        setRequiresOTP(true);
        setPendingEmail(email);
        // Send OTP automatically
        await sendOTP(email);
        return { data: { requiresOTP: true }, error: null };
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRequiresOTP(false);
    setPendingEmail(null);
  };

  const sendOTP = async (email: string): Promise<AuthResponse> => {
    console.log("Sending OTP to:", email);

    // Set the pending email for OTP verification
    setPendingEmail(email);
    setRequiresOTP(true);

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create user, just send OTP
      },
    });

    console.log("SendOTP response:", { data, error });

    // Log OTP generation attempt (but don't fail if logging fails)
    try {
      await supabase.rpc("log_otp_attempt", {
        user_email: email,
        attempt_type: "generation",
      });
    } catch (logError) {
      console.warn("Failed to log OTP attempt:", logError);
      // Continue anyway - logging should not block the main flow
    }

    return { data, error };
  };
  const verifyOTP = async (
    email: string,
    token: string
  ): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    });

    // Log OTP verification attempt
    try {
      await supabase.rpc("log_otp_attempt", {
        user_email: email,
        attempt_type: error ? "verification_failed" : "verification_success",
      });
    } catch (logError) {
      console.warn("Failed to log OTP verification:", logError);
    }

    if (!error && data.user) {
      setRequiresOTP(false);
      setPendingEmail(null);
      setUser(data.user);
    }

    return { data, error };
  };

  const resendOTP = async (): Promise<AuthResponse> => {
    if (!pendingEmail) {
      return { data: null, error: { message: "No pending email for OTP" } };
    }
    return sendOTP(pendingEmail);
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Log password reset attempt
    try {
      await supabase.rpc("log_otp_attempt", {
        user_email: email,
        attempt_type: "password_reset_request",
      });
    } catch (logError) {
      console.warn("Failed to log password reset attempt:", logError);
    }

    return { data, error };
  };

  const updatePassword = async (password: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (!error && data.user) {
      // Log password update
      try {
        await supabase.rpc("log_otp_attempt", {
          user_email: data.user.email || "",
          attempt_type: "password_reset_success",
        });
      } catch (logError) {
        console.warn("Failed to log password update:", logError);
      }
    }

    return { data, error };
  };

  const value = {
    user,
    loading,
    requiresOTP,
    pendingEmail,
    signIn,
    signOut,
    sendOTP,
    verifyOTP,
    resendOTP,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
