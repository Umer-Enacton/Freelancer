import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const api = axios.create({
  baseURL: process.env.PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 Unauthorized (Invalid/Expired Token)
    // NOT on 400 Bad Request (validation errors)
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Invalid or Expired Token"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
