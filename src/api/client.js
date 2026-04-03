import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

let loaderController = null;

export const bindApiLoader = (controller) => {
  loaderController = controller;
};

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!config.meta?.skipLoader && loaderController?.increment) {
    loaderController.increment();
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (!response.config?.meta?.skipLoader && loaderController?.decrement) {
      loaderController.decrement();
    }
    return response;
  },
  (error) => {
    if (!error.config?.meta?.skipLoader && loaderController?.decrement) {
      loaderController.decrement();
    }
    return Promise.reject(error);
  }
);

export default api;
