import Axios from "axios";

const axios = Axios.create({
    baseURL: "/",
    withCredentials: true
});

export default axios;