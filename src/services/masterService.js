import api from "./api"; // Import the new JWT-authenticated axios instance

export const getMasters = async () => {
  const res = await api.get("/empoweredge/masters");
  return res.data;
};

export const usersApi = {
  getAll: () => api.get("/users"),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

export const departmentsApi = {
  getAll: () => api.get("/empoweredge/departments"),
  getById: (id) => api.get(`/empoweredge/department/${id}`),
  create: (data) => api.post("/empoweredge/department", data),
  update: (id, data) => api.put(`/empoweredge/department/${id}`, data),
  remove: (id) => api.delete(`/empoweredge/department/${id}`),
};

export const rolesApi = {
  getAll: () => api.get("/empoweredge/roles"),
  getById: (id) => api.get(`/empoweredge/roles/${id}`),
  create: (data) => api.post("/empoweredge/roles", data),
  update: (id, data) => api.put(`/empoweredge/roles/${id}`, data),
  remove: (id) => api.delete(`/empoweredge/roles/${id}`),
};

export const designationsApi = {
  getAll: () => api.get("/empoweredge/designations"),
  getById: (id) => api.get(`/empoweredge/designation/${id}`),
  create: (data) => api.post("/empoweredge/designation", data),
  update: (id, data) => api.put(`/empoweredge/designation/${id}`, data),
  remove: (id) => api.delete(`/empoweredge/designation/${id}`),
};

export const statusesApi = {
  getAll: () => api.get("/empoweredge/statuss"),
  getById: (id) => api.get(`/empoweredge/status/${id}`),
  create: (data) => api.post("/empoweredge/status", data),
  update: (id, data) => api.put(`/empoweredge/status/${id}`, data),
  remove: (id) => api.delete(`/empoweredge/status/${id}`),
};
