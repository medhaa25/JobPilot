import axios from "axios";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// If any request comes back 401 (session expired, cookie deleted), mark the user as logged out.
// RequireAuth then redirects to /login. Auth endpoints are skipped: a wrong password is also a 401,
// and /auth/me already treats 401 as "not logged in".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCall = String(error?.config?.url ?? "").startsWith("/auth/");
    if (axios.isAxiosError(error) && error.response?.status === 401 && !isAuthCall) {
      queryClient.setQueryData(queryKeys.me, null);
    }
    return Promise.reject(error);
  },
);