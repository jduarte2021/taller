import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Intenta recuperar usuario del localStorage al iniciar
    try {
      const saved = localStorage.getItem("tallerdata_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Persiste usuario en localStorage cuando cambia
  useEffect(() => {
    if (user) localStorage.setItem("tallerdata_user", JSON.stringify(user));
    else localStorage.removeItem("tallerdata_user");
  }, [user]);

  // Al montar, verificar token con el backend
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("/api/verify", { withCredentials: true });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch {
        // Token inválido o expirado - limpiar estado
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("tallerdata_user");
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const signin = async (credentials) => {
    try {
      const res = await axios.post("/api/login", credentials, { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
      return res.data;
    } catch (error) {
      const msg = error.response?.data;
      setErrors(Array.isArray(msg) ? msg : [msg?.message || "Error al iniciar sesión"]);
      throw error;
    }
  };

  const logout = async () => {
    try { await axios.post("/api/logout", {}, { withCredentials: true }); } catch {}
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("tallerdata_user");
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, errors, loading, signin, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
