import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import SalesVisitService from "../services/salesVisit/SalesVisitService1";

const AuthContext = createContext(null);

const USER_STORAGE_KEY = "salesvisit_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    try {
      const response = await SalesVisitService.login(email, password);

      if (!response || response.status !== "Success") {
        return {
          error: response?.message || "Invalid credentials.",
        };
      }

      const userData = response?.data || null;

      if (!userData) {
        return {
          error: "User data not found in login response.",
        };
      }

      sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);

      return { error: null, data: userData };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        error: error?.message || "Something went wrong while signing in.",
      };
    }
  };

  const signUp = async ({ name, email, role, reportingManagerId }) => {
    try {
      const response = await SalesVisitService.UserRegister(
        name,
        email,
        role,
        reportingManagerId || null,
      );

      if (!response || response.status !== "Success") {
        return {
          error: response?.message || "Unable to create account.",
        };
      }

      return { error: null, data: response?.data };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        error: error?.message || "Something went wrong while creating account.",
      };
    }
  };

  const signOut = async () => {
    sessionStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);
      const response = await SalesVisitService.UserProfileByID(parsedUser.id);

      if (response?.status === "Success" && response?.data) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signUp,
      signOut,
      setUser,
      refreshUser,
      isDatabaseUnconfigured: false,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
