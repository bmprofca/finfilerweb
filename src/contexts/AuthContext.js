import { createContext, useContext, useState, useEffect } from "react";
import { apiCall } from "../utils/apiCall";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("mobile");
    localStorage.removeItem("user_type");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Attempt to load from localStorage first for fast render
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser({ token, ...JSON.parse(userData) });
        } catch (e) {
          // Ignore
        }
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
          if (response.status !== 401) {
             clearSession();
          }
        }
      } catch (error) {
        console.error("Server unreachable:", error);
        if (window.location.pathname !== "/server-error") {
          window.location.href = "/server-error";
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    // userData matches the "data" object from the successful login response
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    if (userData.username) {
      localStorage.setItem("username", userData.username);
    }
    if (userData.mobile) {
      localStorage.setItem("mobile", userData.mobile);
    }
    if (userData.user_type) {
      localStorage.setItem("user_type", userData.user_type);
    }
    
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      clearSession();
      return;
    }

    try {
      const response = await apiCall("/accounts/logout", "POST");
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
