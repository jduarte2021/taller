import axios from "axios";

const instance = axios.create({
    baseURL: "https://taller-8qh1.onrender.com/api",
    withCredentials: true
})

export default instance;