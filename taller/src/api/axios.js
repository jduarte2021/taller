import axios from "axios";

const instance = axios.create({
    baseURL: "https://taller-8qh1.onrender.com/api",
    withCredentials: true,
});

// Interceptor de respuesta: silencia el 401 del /verify (normal al cargar sin sesión)
// El error igual llega al catch del código — solo evita que axios lo loguee en rojo
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const url    = error?.config?.url || "";

        // 401 en /verify es esperado (sin sesión) — no mostrarlo como error
        if (status === 401 && url.includes("/verify")) {
            return Promise.reject(error); // rechaza sin loguear
        }

        // Cualquier otro error: dejarlo pasar normalmente
        return Promise.reject(error);
    }
);

export default instance;
