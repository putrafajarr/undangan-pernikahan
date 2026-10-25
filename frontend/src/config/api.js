// Konfigurasi endpoint API
// Jika VITE_API_URL ditentukan di environment variable Netlify (misal: https://backend-kamu.onrender.com),
// maka frontend akan mengarah ke sana.
// Jika kosong, frontend menggunakan relative path '/api' (otomatis di-handle oleh Netlify Function / Proxy / Vite Dev)
const envApiUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE = envApiUrl.replace(/\/+$/, '');

export const getApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};

export default getApiUrl;
