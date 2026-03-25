import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: API_URL,
});

// ================= PRESCRIPTION =================

export const createPrescription = (data) =>
  API.post("/prescription/create", data);

export const generateAI = (id) =>
  API.post(`/prescription/generate-ai/${id}`);

export const publishPrescription = (id) =>
  API.post(`/prescription/publish/${id}`);


// ================= HOSPITAL =================

export const createHospital = (formData) =>
  API.post("/hospital/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getHospital = (id) =>
  API.get(`/hospital/${id}`);