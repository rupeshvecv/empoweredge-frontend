import axios from 'axios';
import * as jwtDecodeModule from 'jwt-decode';

// `jwt-decode` sometimes bundles as CommonJS or ESM depending on install/resolution.
// Normalize to a callable `jwtDecode` function that works in both environments.
const jwtDecode = (jwtDecodeModule && (jwtDecodeModule.default || jwtDecodeModule)) || ((t) => { throw new Error('jwt-decode unavailable'); });

// Main axios instance (authenticated)
const api = axios.create({
  baseURL: '/api',
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = getToken();
  try {
    console.log('[api] request:', config.method, config.url, 'token present?', !!token);
  } catch (e) {}
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      console.error('[api] response error', error.response?.status, error.config?.url, error.response?.data);
    } catch (e) {}
    return Promise.reject(error);
  }
);

// Unauthenticated axios instance (for forgot-password flow)
const unauthenticatedApi = axios.create({ baseURL: '/api' });

// Auth related functions
export const requestPasswordOtp = async (email) => {
  const res = await unauthenticatedApi.post('/empoweredge/auth/users/password_otp_generate_mail', null, { params: { email } });
  return res.data;
};

export const resetPassword = async (email, otp, newPassword) => {
  const res = await unauthenticatedApi.post('/empoweredge/auth/users/verify_otp_reset_password', null, { params: { email, otp, newPassword } });
  return res.data;
};

export const login = async (username, password) => {
  const response = await api.post('/empoweredge/auth/login', { userName: username, password });
  const { token } = response.data;
  const user = jwtDecode(token);
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  return token;
};

export const getToken = () => localStorage.getItem('token');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (e) {
    return false;
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  if (user !== null && user !== 'undefined') {
    try {
      return JSON.parse(user);
    } catch (e) {
      localStorage.removeItem('user');
    }
  }
  const token = getToken();
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    return null;
  }
};

const authService = { login, getToken, logout, isAuthenticated, getCurrentUser };
export default authService;

// ------- master and api endpoints (previous api.js & masterService.js consolidated) -------

// Departments
export const getDepartments = () => api.get('/empoweredge/departments');
export const getDepartmentById = (id) => api.get(`/empoweredge/department/${id}`);
export const addDepartment = (department) => api.post('/empoweredge/department', department);
export const updateDepartment = (id, department) => api.put(`/empoweredge/department/${id}`, department);
export const deleteDepartment = (id) => api.delete(`/empoweredge/department/${id}`);

// Roles
export const getRoles = () => api.get('/empoweredge/roles');
export const getRoleById = (id) => api.get(`/empoweredge/roles/${id}`);
export const addRole = (role) => api.post('/empoweredge/roles', role);
export const updateRole = (id, role) => api.put(`/empoweredge/roles/${id}`, role);
export const deleteRole = (id) => api.delete(`/empoweredge/roles/${id}`);

// Designations
export const getDesignations = () => api.get('/empoweredge/designations');
export const getDesignationById = (id) => api.get(`/empoweredge/designation/${id}`);
export const addDesignation = (designation) => api.post('/empoweredge/designation', designation);
export const updateDesignation = (id, designation) => api.put(`/empoweredge/designation/${id}`, designation);
export const deleteDesignation = (id) => api.delete(`/empoweredge/designation/${id}`);

// Status
export const getStatuses = () => api.get('/empoweredge/statuss');
export const getStatusById = (id) => api.get(`/empoweredge/status/${id}`);
export const addStatus = (status) => api.post('/empoweredge/status', status);
export const updateStatus = (id, status) => api.put(`/empoweredge/status/${id}`, status);
export const deleteStatus = (id) => api.delete(`/empoweredge/status/${id}`);

// Locations
export const getLocations = () => api.get('/empoweredge/locations');
export const getLocationById = (id) => api.get(`/empoweredge/location/${id}`);
export const addLocation = (location) => api.post('/empoweredge/location', location);
export const updateLocation = (id, location) => api.put(`/empoweredge/location/${id}`, location);
export const deleteLocation = (id) => api.delete(`/empoweredge/location/${id}`);

// Users API (from masterService.usersApi)
export const usersApi = {
  getAllUsers: () => api.get('/empoweredge/allusers'),
  getUserById: (id) => api.get(`/empoweredge/users/${id}`),
  createUser: (data) => api.post('/empoweredge/users', data),
  updateUser: (id, data) => api.put(`/empoweredge/users/${id}`, data),
  removeUser: (id) => api.delete(`/empoweredge/users/${id}`),
};

// HRBP APIs
export const hrbpApi = {
  getDistinctHrbpUsersInHR: () => api.get('/empoweredge/users/hrbps'),
  getActiveUsersByHrbpId: (hrbpId) => api.get(`/empoweredge/users/hrbp/${hrbpId}`),
};

// Convenience grouped APIs for master lists
export const departmentsApi = {
  getAllDepartments: () => api.get('/empoweredge/departments'),
  getDepartmentById: (id) => api.get(`/empoweredge/department/${id}`),
  createDepartment: (data) => api.post('/empoweredge/department', data),
  updateDepartment: (id, data) => api.put(`/empoweredge/department/${id}`, data),
  removeDepartment: (id) => api.delete(`/empoweredge/department/${id}`),
};

export const rolesApi = {
  getAllRoles: () => api.get('/empoweredge/roles'),
  getRoleById: (id) => api.get(`/empoweredge/roles/${id}`),
  createRole: (data) => api.post('/empoweredge/roles', data),
  updateRole: (id, data) => api.put(`/empoweredge/roles/${id}`, data),
  removeRole: (id) => api.delete(`/empoweredge/roles/${id}`),
};

export const designationsApi = {
  getAllDesignations: () => api.get('/empoweredge/designations'),
  getDesignationById: (id) => api.get(`/empoweredge/designation/${id}`),
  createDesignation: (data) => api.post('/empoweredge/designation', data),
  updateDesignation: (id, data) => api.put(`/empoweredge/designation/${id}`, data),
  removeDesignation: (id) => api.delete(`/empoweredge/designation/${id}`),
};

export const statusesApi = {
  getAllStatuses: () => api.get('/empoweredge/statuss'),
  getStatusById: (id) => api.get(`/empoweredge/status/${id}`),
  createStatus: (data) => api.post('/empoweredge/status', data),
  updateStatus: (id, data) => api.put(`/empoweredge/status/${id}`, data),
  removeStatus: (id) => api.delete(`/empoweredge/status/${id}`),
};

export const locationsApi = {
  getAllLocations: () => api.get('/empoweredge/locations'),
  getLocationById: (id) => api.get(`/empoweredge/location/${id}`),
  createLocation: (data) => api.post('/empoweredge/location', data),
  updateLocation: (id, data) => api.put(`/empoweredge/location/${id}`, data),
  removeLocation: (id) => api.delete(`/empoweredge/location/${id}`),
};

export const getMasters = async () => {
  const res = await api.get('/empoweredge/masters');
  return res.data;
};
