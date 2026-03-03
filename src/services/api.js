import axios from "axios";

// const API_BASE = "http://127.0.0.1:8000/api";

const isDevelopment = import.meta.env.DEV;

const API_BASE = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

// ====================== API FETCH WITH AUTO REFRESH ======================
export const apiFetch = async (
  endpoint,
  method = "GET",
  body = null,
  auth = false,
  token = null
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  let accessToken = token || localStorage.getItem("accessToken");

  if (auth && accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : null,
  });

  // ================= TOKEN EXPIRED =================
  if (response.status === 401) {
    let errData = {};
    try {
      errData = await response.json();
    } catch {}

    if (errData.code === "token_not_valid") {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // logout cleanly
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
      }

      const refreshResponse = await fetch(`${API_BASE}/user/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();

        // ✅ store new access token
        localStorage.setItem("accessToken", refreshData.access);
        accessToken = refreshData.access;

        headers["Authorization"] = `Bearer ${refreshData.access}`;

        // Retry original request
        response = await fetch(`${API_BASE}${endpoint}`, {
          method,
          headers,
          credentials: "include",
          body: body ? JSON.stringify(body) : null,
        });
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return null;
      }
    }
  }

  // ================= HANDLE ERRORS =================
  if (!response.ok) {
    let errText = "";
    try {
      errText = await response.text();
    } catch {}
    throw new Error(errText || response.statusText);
  }

  // DELETE / 204 No Content
  if (response.status === 204) {
    return null;
  }

  // Safe JSON parsing
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error("Server returned non-JSON response");
  }
};

// ======================= USER AUTH =======================

// ✅ helper
export const isLoggedIn = () => !!localStorage.getItem("accessToken");

// ✅ Save tokens safely (supports different response shapes)
const saveTokens = (data) => {
  const access =
    data?.access ||
    data?.accessToken ||
    data?.tokens?.access ||
    data?.data?.access;

  const refresh =
    data?.refresh ||
    data?.refreshToken ||
    data?.tokens?.refresh ||
    data?.data?.refresh;

  if (access) localStorage.setItem("accessToken", access);
  if (refresh) localStorage.setItem("refreshToken", refresh);

  if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

  return { access, refresh };
};

// ✅ Ensure user is stored even if login response doesn't include user
const ensureUserStored = async () => {
  try {
    const existing = localStorage.getItem("user");
    if (existing) return JSON.parse(existing);

    // /user/me/ should return user profile
    const me = await apiFetch("/user/me/", "GET", null, true);
    if (me) localStorage.setItem("user", JSON.stringify(me));
    return me;
  } catch (e) {
    console.error("ensureUserStored failed:", e);
    return null;
  }
};

// ✅ UPDATED: login + save tokens + ensure user
export const loginUser = async (identifier, password) => {
  const data = await apiFetch("/user/login/", "POST", { identifier, password });

  console.log("LOGIN RESPONSE =", data);

  const { access } = saveTokens(data);

  console.log("SAVED accessToken =", localStorage.getItem("accessToken"));
  console.log("SAVED refreshToken =", localStorage.getItem("refreshToken"));

  if (access && !localStorage.getItem("user")) {
    await ensureUserStored();
  }

  console.log("SAVED user =", localStorage.getItem("user"));
  return data;
};

// ✅ Google login (Firebase ID token -> Django JWT) + ensure user
export const googleLogin = async (token) => {
  const data = await apiFetch("/user/google-login/", "POST", { token }, false);

  console.log("GOOGLE LOGIN RESPONSE =", data);

  const { access } = saveTokens(data);

  console.log("SAVED accessToken =", localStorage.getItem("accessToken"));
  console.log("SAVED refreshToken =", localStorage.getItem("refreshToken"));

  if (access && !localStorage.getItem("user")) {
    await ensureUserStored();
  }

  console.log("SAVED user =", localStorage.getItem("user"));
  return data;
};

export const signupUser = (data) => apiFetch("/user/register/", "POST", data);

export const logoutUser = async () => {
  const refresh = localStorage.getItem("refreshToken");
  const access = localStorage.getItem("accessToken");

  if (!refresh || !access) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return { message: "No tokens found" };
  }

  const response = await apiFetch("/user/logout/", "POST", { refresh }, true, access);

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  return response;
};

// ======================= PRODUCTS =======================
export const fetchProducts = async ({ page = 1, page_size = 12 } = {}) => {
  return await apiFetch(
    `/catalog/products/?page=${page}&page_size=${page_size}`,
    "GET",
    null,
    false
  );
};

export const fetchProductById = (id) => apiFetch(`/catalog/products/${id}/`);

export const fetchCategories = (all = false) =>
  apiFetch(`/catalog/categories/${all ? "?all=true" : ""}`);

export const fetchProductsByCategory = (categoryId) =>
  apiFetch(`/catalog/products/?category=${encodeURIComponent(categoryId)}`);

export const searchProducts = (query, categoryId = "", limit = 5) => {
  let url = `/catalog/products/?search=${encodeURIComponent(query)}&limit=${limit}`;
  if (categoryId) url += `&category=${encodeURIComponent(categoryId)}`;
  return apiFetch(url);
};

// ======================= REVIEWS =======================
export const fetchReviewsByProduct = (productId) =>
  apiFetch(`/catalog/products/${productId}/reviews/`, "GET", null, false);

export const createReview = (productId, payload) =>
  apiFetch(`/catalog/products/${productId}/reviews/`, "POST", payload, true);

// ======================= SUGGESTED PRODUCTS =======================
export const fetchSuggestedProducts = ({ categoryId, excludeId, limit = 8 }) =>
  apiFetch(
    `/catalog/products/?category=${encodeURIComponent(categoryId)}&exclude=${encodeURIComponent(
      excludeId
    )}&page_size=${limit}`,
    "GET",
    null,
    false
  );

// ======================= ADDRESS =======================
export const fetchAddresses = async () => {
  const response = await apiFetch("/user/addresses/", "GET", null, true);
  const results = Array.isArray(response?.results) ? response.results : [];

  return results.map((addr) => ({
    id: addr.id,
    full_name: addr.full_name || "",
    phone_number: addr.phone_number || "",
    company_name: addr.company_name || "",
    gst_number: addr.gst_number || "",
    street_address: addr.street_address || "",
    city: addr.city || "",
    state: addr.state || "",
    postal_code: addr.postal_code || "",
    country: addr.country || "India",
    address_type: addr.address_type || "billing",
    is_default: !!addr.is_default,
  }));
};

export const createAddress = async (data) => {
  const payload = {
    full_name: data.full_name || "",
    phone_number: data.phone_number || "",
    company_name: data.company_name || "",
    gst_number: data.gst_number || "",
    street_address: data.street_address || "",
    city: data.city || "",
    state: data.state || "",
    postal_code: data.postal_code || "",
    country: data.country || "India",
    address_type: data.address_type || "billing",
    is_default: !!data.is_default,
  };
  return apiFetch("/user/addresses/", "POST", payload, true);
};

export const updateAddress = async (id, data) => {
  const payload = {
    full_name: data.full_name || "",
    phone_number: data.phone_number || "",
    company_name: data.company_name || "",
    gst_number: data.gst_number || "",
    street_address: data.street_address || "",
    city: data.city || "",
    state: data.state || "",
    postal_code: data.postal_code || "",
    country: data.country || "India",
    address_type: data.address_type || "billing",
    is_default: !!data.is_default,
  };
  return apiFetch(`/user/addresses/${id}/`, "PUT", payload, true);
};

export const deleteAddress = async (id) =>
  apiFetch(`/user/addresses/${id}/`, "DELETE", null, true);

// ======================= SELECT ADDRESS HELPER =======================
export const handleSelectAddress = (
  address,
  type,
  setBilling,
  setShipping,
  setSelectedBillingId,
  setSelectedShippingId
) => {
  const safeAddress = {
    id: address.id,
    full_name: address.full_name || "",
    phone_number: address.phone_number || "",
    company_name: address.company_name || "",
    gst_number: address.gst_number || "",
    street_address: address.street_address || "",
    city: address.city || "",
    state: address.state || "",
    postal_code: address.postal_code || "",
    country: address.country || "India",
  };

  if (type === "billing") {
    setBilling(safeAddress);
    setSelectedBillingId(address.id);
  } else {
    setShipping(safeAddress);
    setSelectedShippingId(address.id);
  }
};
// ✅ PHONE LOGIN (public endpoints)
export const phoneLoginSendOtp = (phone_number) =>
  apiFetch("/user/phone/login/send-otp/", "POST", { phone_number }, false);

export const phoneLoginVerifyOtp = (phone_number, otp) =>
  apiFetch("/user/phone/login/verify-otp/", "POST", { phone_number, otp }, false);

// ======================= CART =======================
// ✅ IMPORTANT: These MUST be auth=true after login
export const getCart = async () => apiFetch("/user/cart/", "GET", null, true);

export const addToCart = (productId, quantity = 1) =>
  apiFetch("/user/cart/add/", "POST", { product: productId, quantity }, true);

export const removeCartItem = (itemId) =>
  apiFetch(`/user/cart/remove/${itemId}/`, "DELETE", null, true);

// ======================= ORDERS =======================
export const fetchOrders = () => apiFetch("/user/orders/", "GET", null, true);

export const fetchOrderById = (orderId) =>
  apiFetch(`/user/orders/${orderId}/`, "GET", null, true);

// ======================= PROFILE =======================
export const fetchUserProfile = () => apiFetch("/user/me/", "GET", null, true);

export const updateUserProfile = (profileData) =>
  apiFetch("/user/me/", "PUT", profileData, true);

// ======================= RFQ =======================
export const submitRFQ = (rfqData) => apiFetch("/rfq/submit/", "POST", rfqData, true);

// ======================= LATEST & FEATURED PRODUCTS =======================
export const fetchLatestProducts = (limit = 5) =>
  apiFetch(`/catalog/products/latest/?limit=${limit}`);

export const fetchFeaturedProducts = (limit = 5) =>
  apiFetch(`/catalog/products/featured/?limit=${limit}`);

// ======================= PASSWORD RESET =======================
export const forgotPassword = (email) =>
  apiFetch("/user/auth/forgot-password/", "POST", { email }, false);

export const resetPassword = (email, otp, password) =>
  apiFetch("/user/auth/reset-password/", "POST", { email, otp, password }, false);

// ======================= QUOTATION =======================
export const submitQuotation = (quotationData) =>
  apiFetch("/user/quotation/submit/", "POST", quotationData, true);

// ======================= HELPDESK =======================
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
};

export const submitHelpDeskTicket = (formData) => {
  return axios.post(`${API_BASE}/helpdesk/tickets/`, formData, {
    withCredentials: true,
    headers: { "X-CSRFToken": getCookie("csrftoken") },
  });
};