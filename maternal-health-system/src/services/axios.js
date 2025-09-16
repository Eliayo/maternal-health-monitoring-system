import axios from "axios";
import { getAccessToken } from "./authService"; // Reuse your auth logic

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api", // 🔁 Reuse for all endpoints
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Attach token to every request if available
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
