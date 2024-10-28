// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const loginUser = async (email, password) => {
  return await axios.post(`${API_URL}/auth/login`, { email, password });
};

// Add more API functions as needed
