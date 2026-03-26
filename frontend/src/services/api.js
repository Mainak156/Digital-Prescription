import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 🔥 prevent hanging requests
  withCredentials: false, // 🔥 important for CORS
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 GLOBAL RESPONSE HANDLER
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API RESPONSE ERROR:", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error("❌ NETWORK ERROR:", error.message);
      return Promise.reject({ error: "Network Error: Backend not reachable" });
    } else {
      console.error("❌ UNKNOWN ERROR:", error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

// ================= PRESCRIPTION =================

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

// ================= HOSPITAL =================

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

export default API;