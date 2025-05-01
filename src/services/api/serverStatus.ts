
/**
 * Server status management module
 * Handles checking and tracking the availability of the backend server
 */

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.arbitragetrade.com/api' 
  : 'http://localhost:5000/api';

// Server status state
let _isServerAvailable: boolean | null = null;

/**
 * Checks the health of the backend server
 * @returns Promise<boolean> indicating if the server is available
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    _isServerAvailable = response.ok;
    return response.ok;
  } catch (error) {
    console.info('سرور در دسترس نیست، از داده موقت استفاده می‌شود');
    _isServerAvailable = false;
    return false;
  }
}

/**
 * Gets the current server availability status
 */
export function getServerAvailability(): boolean | null {
  return _isServerAvailable;
}

/**
 * Get the base API URL
 */
export function getApiBaseUrl(): string {
  return API_URL;
}
