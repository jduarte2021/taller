import axios from "axios";

// Normaliza la URL base: siempre termina en /api
const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    // Si por error la env var no trae /api al final, lo agrega
    return url.endsWith("/api") ? url : `${url.replace(/\/$/, "")}/api`;
};

const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

export default instance;
