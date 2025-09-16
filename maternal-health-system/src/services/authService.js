import axios from "axios";
import jwt_decode from "jwt-decode";

const API_BASE = "http://localhost:8000/api/";

export const loginUser = async (username, password) => {
  const response = await axios.post(`${API_BASE}login/`, {
    username,
    password,
  });

  const { access, refresh, must_change_password } = response.data;
  const decoded = jwt_decode(access);
  const role = decoded.role;
  const expiry = decoded.exp * 1000;

  localStorage.setItem("access", access);
  localStorage.setItem("refresh", refresh);
  localStorage.setItem("role", role);
  localStorage.setItem("username", decoded.username);
  localStorage.setItem("token_expiry", expiry);
  localStorage.setItem("must_change_password", must_change_password);

  return { role, must_change_password };
};

export const logoutUser = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("token_expiry");
};

export const getAccessToken = () => localStorage.getItem("access");
export const getUserRole = () => localStorage.getItem("role");
export const getUsername = () => localStorage.getItem("username");

export const isAuthenticated = () => {
  const token = getAccessToken();
  if (!token) return false;

  const expiry = parseInt(localStorage.getItem("token_expiry"), 10);
  return Date.now() < expiry;
};

export const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const response = await axios.post(`${API_BASE}token/refresh/`, { refresh });
    const { access } = response.data;
    const decoded = jwt_decode(access);
    const expiry = decoded.exp * 1000;

    localStorage.setItem("access", access);
    localStorage.setItem("token_expiry", expiry);

    return access;
  } catch (error) {
    logoutUser();
    return null;
  }
};
