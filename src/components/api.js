import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Interceptors
API.interceptors.request.use(config => {
  const token = localStorage.getItem('pf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const cleanUploadsUrls = (obj) => {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.includes('/uploads/')) {
      const idx = obj.indexOf('/uploads/');
      return obj.substring(idx);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanUploadsUrls);
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cleaned[key] = cleanUploadsUrls(obj[key]);
      }
    }
    return cleaned;
  }
  return obj;
};

API.interceptors.response.use(
  res => {
    if (res.data) {
      res.data = cleanUploadsUrls(res.data);
    }
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pf_token');
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const generateAPI = {
  generate: (data) => {
    const isFormData = data instanceof FormData;
    return API.post('/generate', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
      timeout: 180000
    });
  },
  batch: (data) => API.post('/generate/batch', data, { timeout: 300000 }),
};

export const upscaleAPI = {
  upscale: (formData, onProgress) => API.post('/upscale', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress,
    timeout: 120000
  }),
};

export const historyAPI = {
  getHistory: (params) => API.get('/history', { params }),
  deleteImage: (id) => API.delete(`/history/${id}`),
  toggleFavorite: (id) => API.patch(`/history/${id}/favorite`),
};

export const imageAPI = {
  getStats: () => API.get('/images/stats'),
};

export default API;
