import Axios from "axios";

const axios = Axios.create({
    baseURL: process.env.VITE_PRODUCTION === "true" ? "/" : process.env.VITE_BACKEND_API_URL,
    withCredentials: true
});

export default axios;