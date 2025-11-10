import { jwtDecode } from "jwt-decode"; // Import jwt-decode
import axios from "axios"; // Import axios directly for unauthenticated calls
import api from "./api"; // Import the configured axios instance for authenticated calls

// Create a separate axios instance for unauthenticated requests (e.g., forgot password)
const unauthenticatedApi = axios.create({
  baseURL: "/api", // Use relative path to leverage Vite proxy
});

// Forgot-password / OTP endpoints
export const requestPasswordOtp = async (email) => {
  try {
    // Backend expects email as request param
    const res = await unauthenticatedApi.post('/empoweredge/auth/users/password_otp_generate_mail', null, { params: { email } });
    return res.data;
  } catch (error) {
    console.error('requestPasswordOtp failed:', error);
    throw error;
  }
};

// Backend exposes a combined verify+reset endpoint
export const resetPassword = async (email, otp, newPassword) => {
  try {
    // Send as query params since backend maps @RequestParam
    const res = await unauthenticatedApi.post('/empoweredge/auth/users/verify_otp_reset_password', null, { params: { email, otp, newPassword } });
    return res.data;
  } catch (error) {
    console.error('resetPassword failed:', error);
    throw error;
  }
};

// Function to fetch user profile from the backend
    const fetchUserProfile = async () => {
      try {
        // Assuming there's an endpoint like /api/users/profile that returns the current user's details
        // based on the JWT in the Authorization header.
        const response = await api.get("/users/profile");
        console.log("DEBUG: fetchUserProfile response data:", response.data); // Add logging here
        return response.data;
      } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
    };


export const login = async (username, password) => {
  try {
    const response = await api.post("/empoweredge/auth/login", { userName:username, password });
    const { token } = response.data;
    localStorage.setItem('token', token);

    // Fetch the full user profile after login to get the correct 'id' and other details
    const decodedTokenFromLogin = jwtDecode(token); // Decode token immediately after receiving it

    // Fetch the full user profile after login to get the correct 'id' and other details
    const userProfile = await fetchUserProfile();
    if (userProfile) {
      // Ensure userProfile has an 'id', using empCode as fallback if not present
      // Also, explicitly merge profilePic from the decoded token if available,
      // prioritizing it over userProfile's profilePic if both exist.
      const userToStore = {
        ...userProfile,
        id: userProfile.id || userProfile.empCode,
        profilePic: decodedTokenFromLogin.profilepic || userProfile.profilePic // Prioritize token's profilepic (lowercase 'p')
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
    } else {
      // Fallback to decoded token if profile fetch fails
      // Ensure decodedUser has an 'id', using empCode as fallback if not present
      const userToStore = {
        ...decodedTokenFromLogin, // Use the already decoded token
        id: decodedTokenFromLogin.id || decodedTokenFromLogin.empCode,
        profilePic: decodedTokenFromLogin.profilepic // Use profilepic from token (lowercase 'p')
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      console.warn('Failed to fetch full user profile after login, falling back to decoded token.');
    }
    return Promise.resolve(token);
  } catch (error) {
    console.error("Login failed:", error);
    throw error; // Re-throw the error to be handled by the component
  }
};

export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // Also remove user details if stored separately
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) {
    return false;
  }
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp > currentTime;
  } catch (error) {
    console.error("Error decoding token:", error);
    return false;
  }
};

export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  if (user !== null && user !== "undefined") { // Check for null and "undefined" string
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser;
    } catch (error) {
      console.error("Error parsing user from local storage:", error);
      localStorage.removeItem("user"); // Clear potentially corrupted data
    }
  }

  const token = localStorage.getItem("token");
  if (!token) {
    return null;
  }
  try {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Exporting as named exports instead of default
const authService = {
  login,
  getToken,
  logout,
  isAuthenticated,
  getCurrentUser,
};

export default authService;
