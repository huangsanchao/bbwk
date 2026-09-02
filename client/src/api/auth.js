import http from '../utils/http.js';

export function login(data) {
  return http.post('/auth/login', data);
}

export function register(data) {
  return http.post('/auth/register', data);
}

export function logout() {
  return http.post('/auth/logout');
}

export function refreshToken(data) {
  return http.post('/auth/refresh', data);
}

export function getCurrentUser() {
  return http.get('/users/me');
}
