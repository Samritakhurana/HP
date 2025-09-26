import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://voobuquyzgsbkpucfuwx.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb2J1cXV5emdzYmtwdWNmdXd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTMzMDgsImV4cCI6MjA2Nzk4OTMwOH0.t9uTepW-SxFAixV-L3BkXG2VgRAr-9NpsTj70so5ux4";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection on initialization
supabase
  .from("users")
  .select("count", { count: "exact", head: true })
  .then(({ error }) => {
    if (error) {
      console.error("Supabase connection test failed:", error);
    } else {
      console.log("Supabase connection successful");
    }
  });

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signUp = async (
  email: string,
  password: string,
  fullName: string,
  role: "admin" | "employee" = "employee"
) => {
  // Use the simplified signup approach that actually sends emails
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
      // Don't specify emailRedirectTo - let Supabase use default flow
    },
  });

  console.log("Signup response:", { data, error });

  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Check if user can send OTP (rate limiting)
export const canSendOTP = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc("can_send_otp", {
      user_email: email,
    });
    if (error) {
      console.error("Error checking OTP rate limit:", error);
      return true; // Default to allow if check fails
    }
    return data;
  } catch (err) {
    console.error("Failed to check OTP rate limit:", err);
    return true; // Default to allow if check fails
  }
};

// Send OTP with rate limiting check
export const sendOTPWithRateLimit = async (email: string) => {
  console.log("Attempting to send OTP to:", email);

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      // Don't specify redirect URL for OTP - let it work simply
    },
  });

  console.log("OTP send response:", { data, error });

  // Log OTP generation attempt (but don't fail if logging fails)
  try {
    await supabase.rpc("log_otp_attempt", {
      user_email: email,
      attempt_type: "generation",
    });
  } catch (logError) {
    console.warn("Failed to log OTP attempt:", logError);
    // Continue anyway - logging is not critical
  }

  return { data, error };
};

// Verify OTP with logging
export const verifyOTPWithLogging = async (email: string, token: string) => {
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

  return { data, error };
};
