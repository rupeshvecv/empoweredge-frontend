import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:9080/api' });

// helper to attach token (call this after login)
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
