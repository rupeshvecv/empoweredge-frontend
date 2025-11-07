import api from "./api"; // Import the new JWT-authenticated axios instance

export const getMasters = async () => {
  const res = await api.get("/empoweredge/masters");
  return res.data;
};

export const usersApi = {
  // getAllUsers: () => api.get("/empoweredge/users"),
   getAllUsers: () => api.get("/empoweredge/allusers"),
  getUserById: (id) => api.get(`/empoweredge/users/${id}`),
  createUser: (data) => api.post("/empoweredge/users", data),
  updateUser: (id, data) => api.put(`/empoweredge/users/${id}`, data),
  removeUser: (id) => api.delete(`/empoweredge/users/${id}`),
};

// Upload profile picture for a user
export const uploadApi = {
  uploadProfilePic: (id, file) => {
    const formData = new FormData();
    formData.append('profilePic', file);
    return api.post(`empoweredge/uploads/profilePic/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

export const hrbpApi = {
  getDistinctHrbpUsersInHR: () => api.get("/empoweredge/users/hrbps"),
  getActiveUsersByHrbpId: (hrbpId) => api.get(`/empoweredge/users/hrbp/${hrbpId}`),
};

export const departmentsApi = {
  getAllDepartments: () => api.get("/empoweredge/departments"),
  getDepartmentById: (id) => api.get(`/empoweredge/department/${id}`),
  createDepartment: (data) => api.post("/empoweredge/department", data),
  updateDepartment: (id, data) => api.put(`/empoweredge/department/${id}`, data),
  removeDepartment: (id) => api.delete(`/empoweredge/department/${id}`),
};

export const rolesApi = {
  getAllRoles: () => api.get("/empoweredge/roles"),
  getRoleById: (id) => api.get(`/empoweredge/roles/${id}`),
  createRole: (data) => api.post("/empoweredge/roles", data),
  updateRole: (id, data) => api.put(`/empoweredge/roles/${id}`, data),
  removeRole: (id) => api.delete(`/empoweredge/roles/${id}`),
};

export const designationsApi = {
  getAllDesignations: () => api.get("/empoweredge/designations"),
  getDesignationById: (id) => api.get(`/empoweredge/designation/${id}`),
  createDesignation: (data) => api.post("/empoweredge/designation", data),
  updateDesignation: (id, data) => api.put(`/empoweredge/designation/${id}`, data),
  removeDesignation: (id) => api.delete(`/empoweredge/designation/${id}`),
};

export const statusesApi = {
  getAllStatuses: () => api.get("/empoweredge/statuss"),
  getStatusById: (id) => api.get(`/empoweredge/status/${id}`),
  createStatus: (data) => api.post("/empoweredge/status", data),
  updateStatus: (id, data) => api.put(`/empoweredge/status/${id}`, data),
  removeStatus: (id) => api.delete(`/empoweredge/status/${id}`),
};

export const locationsApi = {
  getAllLocations: () => api.get("/empoweredge/locations"),
  getLocationById: (id) => api.get(`/empoweredge/location/${id}`),
  createLocation: (data) => api.post("/empoweredge/location", data),
  updateLocation: (id, data) => api.put(`/empoweredge/location/${id}`, data),
  removeLocation: (id) => api.delete(`/empoweredge/location/${id}`),
};
