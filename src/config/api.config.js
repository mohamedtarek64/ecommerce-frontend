/**
 * API Configuration
 * Centralized API base URL configuration for all services
 * Uses environment variable with fallback to localhost
 */

export const API_CONFIG = {
  // Base URL from environment or default
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://web-production-62770.up.railway.app/api',

  // Remove /api suffix for full base URL
  BASE_URL_WITHOUT_API: (import.meta.env.VITE_API_BASE_URL || 'http://web-production-62770.up.railway.app/api').replace('/api', ''),

  // Timeout settings
  TIMEOUT: 10000,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,

  // Environment
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
}

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint (with or without leading slash)
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_CONFIG.BASE_URL}${cleanEndpoint}`
}

/**
 * Build full URL without /api suffix
 * @param {string} endpoint - Endpoint path
 * @returns {string} Full URL
 */
export const buildFullUrl = (endpoint) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_CONFIG.BASE_URL_WITHOUT_API}${cleanEndpoint}`
}

export default API_CONFIG
