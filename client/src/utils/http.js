import axios from 'axios';
import { useUserStore } from '../stores/user.js';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动携带 Token
http.interceptors.request.use(
  (config) => {
    const userStore = useUserStore();
    if (userStore.accessToken) {
      config.headers.Authorization = `Bearer ${userStore.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 401 时尝试刷新 Token
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

http.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const { config, response } = error;
    const userStore = useUserStore();

    // 401 - Token 过期，尝试刷新
    if (response && response.status === 401 && !config._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            resolve(http(config));
          });
        });
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${http.defaults.baseURL}/auth/refresh`, {
          refreshToken: userStore.refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data.data;
        userStore.setTokens(accessToken, newRefreshToken);
        onRefreshed(accessToken);
        isRefreshing = false;

        config.headers.Authorization = `Bearer ${accessToken}`;
        return http(config);
      } catch (refreshError) {
        isRefreshing = false;
        userStore.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 其他错误
    const message = response?.data?.message || '网络错误，请稍后重试';
    return Promise.reject(new Error(message));
  }
);

export default http;
