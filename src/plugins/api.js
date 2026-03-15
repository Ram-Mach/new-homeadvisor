import axios from 'axios';

const DEFAULT_API_BASE_URL = 'https://api.homeadvisor.co.il/api';
const TOKEN_STORAGE_KEY = 'ha-token';
const apiBaseURL = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL);

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}

const bootToken = localStorage.getItem(TOKEN_STORAGE_KEY);
if (bootToken) {
  setAuthToken(bootToken);
}

/**
 * Centralized API request helper.
 * @param {string} endpoint Relative API endpoint (e.g. /projects)
 * @param {object} data Request payload for POST/PUT/PATCH or query params for GET
 * @param {string} method HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @returns {Promise<any>} Response payload
 */
export async function makeRequest(endpoint, data = {}, method = 'GET') {
  try {
    const normalizedMethod = method.toUpperCase();
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await apiClient({
      url: endpoint,
      method: normalizedMethod,
      ...(normalizedMethod === 'GET' ? { params: data } : { data }),
      ...(isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
    });

    return response.data;
  } catch (error) {
    console.error('[API] Request failed:', {
      endpoint,
      method,
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });

    throw error;
  }
}

export default apiClient;
