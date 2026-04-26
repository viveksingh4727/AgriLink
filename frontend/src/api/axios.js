import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const buildAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "";
  }

  if (assetPath.startsWith("http")) {
    return assetPath;
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
  const origin = apiBase.replace("/api", "");
  return `${origin}${assetPath}`;
};

export default api;
