import axios from "axios";
import { getToken } from "./authService";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode

const api = axios.create({
  baseURL: "/api", // Use relative path to leverage Vite proxy
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    try {
      const decodedToken = jwtDecode(token);
      // console.log("Decoded JWT Token in API Interceptor:", decodedToken); // Removed as per user feedback
    } catch (error) {
      console.error("Error decoding token in API Interceptor:", error);
    }
  }
  // Debug: log outgoing requests relevant to upload debugging
  try {
    // Only log when running in a browser console to avoid noisy server logs
    if (typeof window !== 'undefined' && window.console && config.url && config.url.includes('empoweredge')) {
      const safeHeaders = {
        Authorization: config.headers?.Authorization,
        'Content-Type': config.headers?.['Content-Type'] || config.headers?.['content-type'],
      };
      // console.debug('API request:', { method: config.method, url: config.baseURL ? config.baseURL + config.url : config.url, headers: safeHeaders }); // Removed as per user feedback
    }
  } catch (e) {
    // swallow
  }
  return config;
});

// Log response errors to help debug 4xx/5xx from the server
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    try {
      if (typeof window !== 'undefined' && window.console && error.config && error.config.url && error.config.url.includes('empoweredge')) {
        console.debug('API response error:', {
          url: error.config.baseURL ? error.config.baseURL + error.config.url : error.config.url,
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
      }
    } catch (e) {}
    return Promise.reject(error);
  }
);




export default api;
