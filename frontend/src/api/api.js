import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Climate
export const getClimate = () => api.get("/climate/");

// Materials
export const getMaterials = () => api.get("/materials/");

// Insulation
export const getInsulation = () => api.get("/insulation/");

// Designs
export const createDesign = (designData) =>
  api.post("/designs/", designData);

export const getDesigns = () =>
  api.get("/designs/");

export const getDesign = (id) =>
  api.get(`/designs/${id}/`);

// Simulation
export const simulateDesign = (climateId, designId) =>
  api.post("/simulate/", {
    climate_id: climateId,
    design_id: designId,
  });

export const getSimulations = () =>
  api.get("/simulations/");

export const getSimulation = (id) =>
  api.get(`/simulations/${id}/`);

// Optimize
export const optimizeDesign = (payload) =>
  api.post("/optimize/", payload);

export default api;