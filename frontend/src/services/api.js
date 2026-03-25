import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// ================= PRESCRIPTION =================

export const createPrescription = (data) =>
  API.post("/prescription/create", data);

export const generateAI = (id) =>
  API.post(`/prescription/generate-ai/${id}`);

export const publishPrescription = (id) =>
  API.post(`/prescription/publish/${id}`);


// ================= HOSPITAL =================

// ✅ FIXED ENDPOINT + supports FormData
export const createHospital = (formData) =>
  API.post("/hospital/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getHospital = (id) =>
  API.get(`/hospital/${id}`);