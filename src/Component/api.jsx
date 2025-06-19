import React from "react";
import axios from "axios";

const token = localStorage.getItem("token");
const baseURL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: `${baseURL}`, 
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Include the token in the headers
  },
});

export default api;
