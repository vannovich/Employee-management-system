import { useEffect, useState } from "react";
import api from "../api/axios";
import AuthContext from "./authContext";
import toast from "react-hot-toast";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get("/auth/session");
      setUser(data.user);
    } catch (error) {
      // console.error("SESSION ERROR:", error.response?.data);
      toast.error("Failed to Login");

      // ❌ REMOVE THIS:
      // localStorage.removeItem("token");

      // Only clear if explicitly invalid (optional later)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (email, password, role_type) => {
    // console.log("🚀 LOGIN START");

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        role_type,
      });

      // console.log("✅ RESPONSE RECEIVED:", response);

      const data = response.data;

      console.log("📦 DATA:", data);

      if (!data.token) {
        console.error("❌ NO TOKEN IN RESPONSE");
        return;
      }

      localStorage.setItem("token", data.token);

      // console.log("💾 TOKEN SAVED:", localStorage.getItem("token"));

      setToken(data.token);
      setUser(data.user);

      return data.user;
    } catch (error) {
      // console.error("🔥 LOGIN ERROR:", error.response || error.message);
      toast.error(error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = { user, token, loading, login, logout, refreshSession };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
