// v2 - fix: baseURL normalizado para evitar /api/api duplicado
import axios from "axios";

const getBaseURL = () => {
    const url = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    return url.endsWith("/api") ? url : `${url.replace(/\/$/, "")}/api`;
};

const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
});

export default instance;
