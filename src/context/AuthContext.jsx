import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import staticUsers from "../data/staticUsers";

const AuthContext = createContext(null);

const PASSWORD = "password@123";

const getStoredUser = () => {
  try {
    const raw = sessionStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Error parsing stored user:", error);
    return null;
  }
};

const mapUserForSession = (sourceUser) => {
  const fullName = (sourceUser?.name || "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  return {
    emp_id: sourceUser?.id || "",
    emp_no: sourceUser?.email?.split("@")[0]?.toUpperCase() || "",
    first_name: parts[0] || "",
    last_name: parts.slice(1).join(" ") || "",
    dept_id: 7,
    department: sourceUser?.department || "ABP Sales",
    emp_email: sourceUser?.email || "",
    emp_mobile: "765123",
    active: sourceUser?.is_approved ? 1 : 0,
    role: sourceUser?.role || "",
    name: sourceUser?.name || "",
    region: sourceUser?.region || "",
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const existingUser = getStoredUser();
    setUser(existingUser);
    setLoading(false);
  }, []);

  const signIn = async ({ email, password }) => {
    const normalizedEmail = (email || "").trim().toLowerCase();

    const matchedUser = staticUsers.find(
      (item) => item.email?.toLowerCase() === normalizedEmail,
    );

    if (!matchedUser || password !== PASSWORD) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    const sessionUser = mapUserForSession(matchedUser);
    sessionStorage.setItem("user", JSON.stringify(sessionUser));
    setUser(sessionUser);

    return {
      success: true,
      user: sessionUser,
    };
  };

  const signOut = async () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn,
      signOut,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
