import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api/v1", // URL dasar API Backend kamu
  headers: {
    "Content-Type": "application/json",
  },
});

// Otomatis menyelipkan token JWT di setiap request jika token tersedia di localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
