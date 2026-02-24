import axios from "axios";


const API_BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const adminApi = axios.create({
  baseURL: API_BASE + "/admin",
});

// Attach ADMIN token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto logout on 401
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_access");
      localStorage.removeItem("admin_refresh");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
    return Promise.reject(error);
  }
);

export const updateProduct = async (productId, payload) => {
  // If your update endpoint is different, change this URL.
  // Example: /api/admin/catalog/products/:id/
  const res = await axios.patch(`${base}/admin/catalog/products/${productId}/`, payload, {
    withCredentials: true,
  });
  return res.data;
};

export default adminApi;
