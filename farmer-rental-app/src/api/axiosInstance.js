import axios from "axios";

// Prefer environment variable so Docker/Compose can control the API base URL
// Local dev fallback: if running on localhost, use Spring Boot at 8080; otherwise use "/api" (for Docker/Nginx)
const baseURL = process.env.REACT_APP_API_BASE_URL
  || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:8090/api" : "/api");

const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
