import axios from "axios";


/*const API_URL = "http://localhost:9080/api/auth/login";

const loginUser = async (login, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { login, password });
    console.log(response.data);  // <-- fixed "console" typo
    return response.data; // contains token, username, roles
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
export default loginUser;   //default export
*/
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
