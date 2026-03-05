import axios from "axios";

const API = axios.create({
  // 192.168.18.31 es tu IP actual
  // 10000 es el puerto que definiste en tu index.js
  baseURL: "http://192.168.18.31:5000/api",
  headers: { "Content-Type": "application/json" },
});

export default API;
