import { createContext, useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem("tallerdata_user");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) localStorage.setItem("tallerdata_user", JSON.stringify(user));
        else localStorage.removeItem("tallerdata_user");
    }, [user]);

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => setErrors([]), 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);

    // Verifica sesión llamando al backend (no usa js-cookie - no funciona con HttpOnly)
    useEffect(() => {
        const checkLogin = async () => {
            try {
                const res = await axios.get('/verify');
                if (!res.data) { setIsAuthenticated(false); setLoading(false); return; }
                const userData = {
                    id: res.data.id,
                    username: res.data.username,
                    nombres: res.data.nombres,
                    apellidos: res.data.apellidos,
                    cargo: res.data.cargo,
                    email: res.data.email,
                    profileImage: res.data.profileImage,
                };
                setUser(userData);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                setUser(null);
                localStorage.removeItem("tallerdata_user");
            } finally {
                setLoading(false);
            }
        };
        checkLogin();
    }, []);

    const signup = async (userData) => {
        try {
            const res = await axios.post('/register', userData);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            setErrors(error.response?.data || ["Error al registrar"]);
        }
    };

    const signin = async (credentials) => {
        try {
            const res = await axios.post('/login', credentials);
            const userData = {
                id: res.data.id,
                username: res.data.username,
                nombres: res.data.nombres,
                apellidos: res.data.apellidos,
                cargo: res.data.cargo,
                email: res.data.email,
                profileImage: res.data.profileImage,
            };
            setUser(userData);
            setIsAuthenticated(true);
            setErrors([]);
        } catch (error) {
            const msg = error.response?.data?.message || "Error al iniciar sesión";
            setErrors([msg]);
            throw error;
        }
    };

    const logout = async () => {
        try { await axios.post('/logout'); } catch {}
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("tallerdata_user");
    };

    const updateUserProfile = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{
            signup, signin, logout, updateUserProfile,
            user, isAuthenticated, setIsAuthenticated, errors, loading,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = { children: PropTypes.node.isRequired };
