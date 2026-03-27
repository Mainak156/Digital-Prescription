import axios from "axios";

// ✅ Use environment variable (MANDATORY for deployment)
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

// ✅ Create Axios instance
const API = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================= 🔥 REQUEST INTERCEPTOR =================
// (Useful later for auth tokens, hospital ID, etc.)
API.interceptors.request.use(
  (config) => {
    // Example: attach token in future
    // const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= 🔥 RESPONSE INTERCEPTOR =================
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API RESPONSE ERROR:", error.response.data);

      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.response.data?.detail || "Server Error",
      });
    } else if (error.request) {
      console.error("❌ NETWORK ERROR:", error.message);

      return Promise.reject({
        message:
          "Backend not reachable. Check deployment (Render/Server down)",
      });
    } else {
      console.error("❌ UNKNOWN ERROR:", error.message);

      return Promise.reject({
        message: error.message,
      });
    }
  }
);

// ================= 🧠 PRESCRIPTION APIs =================

export const createPrescription = async (data) => {
  const res = await API.post("/prescription/create", data);
  return res.data;
};

export const generateAI = async (id) => {
  const res = await API.post(`/prescription/generate-ai/${id}`);
  return res.data;
};

export const publishPrescription = async (id) => {
  const res = await API.post(`/prescription/publish/${id}`);
  return res.data;
};

// ================= 🏥 HOSPITAL APIs =================

export const createHospital = async (formData) => {
  const res = await API.post("/hospital/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const getHospital = async (id) => {
  const res = await API.get(`/hospital/${id}`);
  return res.data;
};

// ================= 🔥 HEALTH CHECK (VERY IMPORTANT) =================
// Helps debug deployment in real-time
export const healthCheck = async () => {
  const res = await API.get("/");
  return res.data;
};

export default API;
