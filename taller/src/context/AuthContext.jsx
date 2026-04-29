import { createContext, useState, useEffect, useContext } from "react";
import { registerRequest, loginRequest, verifyTokenRequest } from "../api/auth";
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';




export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser utilizado dentro de un AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({});
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);


    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);

        } catch (error) {
            console.log(error.response);
            setErrors(error.response.data);
        }

    };


    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            console.log(res.data); // Verifica aquí si llegan los campos correctamente
            setIsAuthenticated(true);
            setUser({
                nombres: res.data.nombres,
                apellidos: res.data.apellidos,
                cargo: res.data.cargo,
                email: res.data.email,
                profileImage: res.data.profileImage, // u otros campos adicionales
            });
        } catch (error) {
            console.error(error.response?.data?.message || "Error desconocido");
            setErrors([error.response.data.message]);
        }
    };


    const logout = () => {
        // Limpiar el estado del usuario, localStorage y Cookies
        setUser(null);
        localStorage.removeItem("user"); // Remover del localStorage
        Cookies.remove("token"); // Remover la cookie del token
    };

    const updateUserProfile = (updatedData) => {
        setUser((prevUser) => ({ ...prevUser, ...updatedData }));
      };
      


    // Funcion para dejar error mostrandose por 5 segundos

    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer); ///Limpiar timer y no gastar recursos
        }
    }, [errors])

    useEffect(() => {
        async function checkLogin() {
            const cookies = Cookies.get();
    
            if (!cookies.token) {
                setIsAuthenticated(false);
                setLoading(false);
                return setUser(null);
            }
            try {
                const res = await verifyTokenRequest(cookies.token);
    
                if (!res.data) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }
    
                setIsAuthenticated(true);
                setUser({
                    nombres: res.data.nombres,
                    apellidos: res.data.apellidos,
                    cargo: res.data.cargo,
                    email: res.data.email,
                    profileImage: res.data.profileImage,
                });
                setLoading(false);
            } catch (error) {
                console.error("Error verificando token:", error);
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
            }
        }
        checkLogin();
    }, []);
    



    return (
        <AuthContext.Provider
            value={{
                signup,
                signin,
                user,
                isAuthenticated,
                setIsAuthenticated,
                errors,
                loading,
                logout,
                updateUserProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};