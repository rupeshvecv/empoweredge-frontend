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

export const getDepartments = () => api.get("/empoweredge/departments");
export const getDepartmentById = (id) => api.get(`/empoweredge/department/${id}`);
export const addDepartment = (department) => api.post("/empoweredge/department", department);
export const updateDepartment = (id, department) => api.put(`/empoweredge/department/${id}`, department);
export const deleteDepartment = (id) => api.delete(`/empoweredge/department/${id}`);

// Role API calls
export const getRoles = () => api.get("/empoweredge/roles");
export const getRoleById = (id) => api.get(`/empoweredge/roles/${id}`);
export const addRole = (role) => api.post("/empoweredge/roles", role);
export const updateRole = (id, role) => api.put(`/empoweredge/roles/${id}`, role);
export const deleteRole = (id) => api.delete(`/empoweredge/roles/${id}`);

// Designation API calls
export const getDesignations = () => api.get("/empoweredge/designations");
export const getDesignationById = (id) => api.get(`/empoweredge/designation/${id}`);
export const addDesignation = (designation) => api.post("/empoweredge/designation", designation);
export const updateDesignation = (id, designation) => api.put(`/empoweredge/designation/${id}`, designation);
export const deleteDesignation = (id) => api.delete(`/empoweredge/designation/${id}`);

// Status API calls
export const getStatuses = () => api.get("/empoweredge/statuss");
export const getStatusById = (id) => api.get(`/empoweredge/status/${id}`);
export const addStatus = (status) => api.post("/empoweredge/status", status);
export const updateStatus = (id, status) => api.put(`/empoweredge/status/${id}`, status);
export const deleteStatus = (id) => api.delete(`/empoweredge/status/${id}`);

// Location API calls
export const getLocations = () => api.get("/empoweredge/locations");
export const getLocationById = (id) => api.get(`/empoweredge/location/${id}`);
export const addLocation = (location) => api.post("/empoweredge/location", location);
export const updateLocation = (id, location) => api.put(`/empoweredge/location/${id}`, location);
export const deleteLocation = (id) => api.delete(`/empoweredge/location/${id}`);

// Profile Picture API calls
export const getProfilePictureByUsername = (username) => api.get(`/empoweredge/view/profilePic/${username}`, { responseType: 'blob' });

export default api;
