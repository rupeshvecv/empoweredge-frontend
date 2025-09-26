import axios from "axios";
import { getToken } from "./authService";

const api = axios.create({
  baseURL: "/api", // Use relative path to leverage Vite proxy
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export default api;
