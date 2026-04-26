import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta.env.VITE_URL_URL ||
      "https://employee-management-system-server-mauve.vercel.app") + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
