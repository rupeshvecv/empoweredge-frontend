// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:9080/api/empoweredge",
  headers: { "Content-Type": "application/json" }
});

// helper: attach token to every future request
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;



//extra
// import axios from "axios";

// const api = axios.create({
//   baseURL: "http://localhost:8080/api/empoweredge",
//   headers: { "Content-Type": "application/json" }
// });

// export function setAuthToken(token) {
//   api.defaults.headers.common.Authorization = `Bearer ${token}`;
// }

// export default api;
