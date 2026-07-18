import { createContext, useContext, useState, useEffect, useRef } from "react";
import { apiCall } from "../utils/apiCall";
import { AUTH_UNAUTHORIZED_EVENT, clearAuthStorage } from "../utils/authSession";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    clearAuthStorage();
    setUser(null);
  };

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const authCheckRef = useRef(false);

  useEffect(() => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = localStorage.getItem("user");
      if (userData) {
        try { setUser({ token, ...JSON.parse(userData) }); } catch (e) { /* ignore */ }
      } else {
        setUser({ token });
      }

      try {
        const response = await apiCall("/accounts", "GET");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const fetchedUser = { token, ...result.data };
            setUser(fetchedUser);
            localStorage.setItem("user", JSON.stringify(result.data));
            if (result.data.username) localStorage.setItem("username", result.data.username);
            if (result.data.mobile) localStorage.setItem("mobile", result.data.mobile);
            if (result.data.user_type) localStorage.setItem("user_type", result.data.user_type);
          } else {
            clearSession();
          }
        } else {
          clearSession();
        }
      } catch (error) {
        console.error("Server unreachable:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    if (userData.token) localStorage.setItem("token", userData.token);
    if (userData.username) localStorage.setItem("username", userData.username);
    if (userData.mobile) localStorage.setItem("mobile", userData.mobile);
    if (userData.user_type) localStorage.setItem("user_type", userData.user_type);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // payload: {} for current session only, { logout_all: true } for all devices
  const logout = async (payload = {}) => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearSession();
      return;
    }

    try {
      const body = Object.keys(payload).length > 0 ? payload : undefined;
      const response = await apiCall("/accounts/logout", "POST", body);
      if (response && !response.ok) {
        console.error("Logout API call failed with status:", response.status);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};