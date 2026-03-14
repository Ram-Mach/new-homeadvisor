import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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

    const response = await apiClient({
      url: endpoint,
      method: normalizedMethod,
      ...(normalizedMethod === 'GET' ? { params: data } : { data }),
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
