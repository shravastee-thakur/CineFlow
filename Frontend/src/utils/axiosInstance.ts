import axios from "axios";
import { useAuthStore } from "../store/authStore";

// 1. Create axios instance that sends cookies
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Sends refreshToken cookie automatically
});

// 2. Before every request: attach accessToken if we have one
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 3. If a request fails with 401: try to refresh the token
api.interceptors.response.use(
  (res) => res, // Success: just return it
  async (error: any) => {
    // Only handle 401 errors that haven't been retried yet
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true; // Mark as retried to avoid infinite loop

      try {
        // Call your backend refresh endpoint
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/refresh`,
          {},
          { withCredentials: true }, // Sends refreshToken cookie
        );

        // Update Zustand with the new accessToken
        useAuthStore.getState().setAccessToken(res.data.accessToken);
        useAuthStore.getState().setIsVerified(true);

        // Retry the original request with the new token
        error.config.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return api(error.config);
      } catch {
        // Refresh failed: clear auth and go to login
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
