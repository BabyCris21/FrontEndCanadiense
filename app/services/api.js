import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.18.49:5000/api", // misma IP y puerto
  headers: { "Content-Type": "application/json" },
});

export default API;
