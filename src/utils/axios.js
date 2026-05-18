import axios from "axios";
import { useTokens } from "../stores/tokenStore.js";
import { refreshTokens } from "./utils.js";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const { accessToken, setLoading } = useTokens.getState();

    if (setLoading) setLoading(true);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const { setLoading } = useTokens.getState();
    if (setLoading) setLoading(false);
    return response;
  },
  async (error) => {
    const {
      setLoading,
      clearTokens,
      setAccessToken,
      setRoles,
    } = useTokens.getState();

    if (setLoading) setLoading(false);

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const data = await refreshTokens();


        setAccessToken(data.accessToken);
        setRoles(data.roles);

        processQueue(null, data.accessToken);

        originalRequest.headers.Authorization =
          "Bearer " + data.accessToken;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;