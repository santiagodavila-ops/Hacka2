import axios from "axios";

export const TOKEN_KEY = "tropelcare_token";

// La URL base sale del archivo .env (VITE_API_URL).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Interceptor: adjunta el JWT en cada request automáticamente.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
