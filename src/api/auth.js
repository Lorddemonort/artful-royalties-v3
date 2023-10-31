import axios from 'axios';

const API_URL = "http://localhost:5000";  // Adjust this if your backend runs on a different port or domain

export const signup = async (userData) => {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
};
