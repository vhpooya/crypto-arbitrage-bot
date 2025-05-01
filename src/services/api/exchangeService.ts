
/**
 * Exchange service module
 * Handles exchange-related API calls
 */
import { checkServerHealth, getApiBaseUrl } from './serverStatus';
import { DEFAULT_EXCHANGE_SETTINGS } from './mockData';

// Re-export serverStatus functions needed by components
export { checkServerHealth } from './serverStatus';

/**
 * Fetches exchange settings from the server
 * @returns Promise with exchange settings
 */
export async function fetchExchangeSettings(): Promise<Record<string, boolean> | null> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('استفاده از داده موقت برای تنظیمات صرافی‌ها');
      return DEFAULT_EXCHANGE_SETTINGS;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/exchange-settings`);
    if (!response.ok) {
      throw new Error('خطا در دریافت تنظیمات صرافی');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت تنظیمات صرافی:', error);
    return DEFAULT_EXCHANGE_SETTINGS;
  }
}

/**
 * Saves exchange settings to the server
 * @param exchangeId Exchange ID
 * @param isActive Active status
 * @returns Promise indicating success/failure
 */
export async function saveExchangeSettings(exchangeId: string, isActive: boolean): Promise<boolean> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، تنظیمات صرافی ذخیره نشد');
      return false;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/exchange-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ exchangeId, isActive })
    });
    
    if (!response.ok) {
      throw new Error('خطا در ذخیره تنظیمات صرافی');
    }
    
    return true;
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات صرافی:', error);
    return false;
  }
}

/**
 * Fetches exchange API keys from the server
 * @param exchangeId Exchange ID
 * @returns Promise with API keys
 */
export async function getExchangeApiKeys(
  exchangeId: string
): Promise<{ apiKey: string; apiSecret: string } | null> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، کلیدهای API از localStorage خوانده می‌شود');
      
      // خواندن از localStorage
      const storedKeys = localStorage.getItem(`exchange_keys_${exchangeId}`);
      if (storedKeys) {
        return JSON.parse(storedKeys);
      }
      
      return null;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/exchange-keys/${exchangeId}`);
    
    if (response.status === 404) {
      return null; // کلیدی وجود ندارد
    }
    
    if (!response.ok) {
      throw new Error('خطا در دریافت کلیدهای API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت کلیدهای API:', error);
    return null;
  }
}

/**
 * Saves exchange API keys to the server
 * @param exchangeId Exchange ID
 * @param apiKey API key
 * @param apiSecret API secret
 * @returns Promise indicating success/failure
 */
export async function saveExchangeApiKeys(
  exchangeId: string, 
  apiKey: string, 
  apiSecret: string
): Promise<boolean> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، کلیدهای API در localStorage ذخیره می‌شود');
      
      // ذخیره در localStorage (در حالت واقعی، این داده‌ها باید رمزگذاری شوند)
      const keys = { apiKey, apiSecret };
      localStorage.setItem(`exchange_keys_${exchangeId}`, JSON.stringify(keys));
      
      return true;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/exchange-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        exchangeId,
        apiKey,
        apiSecret
      })
    });
    
    if (!response.ok) {
      throw new Error('خطا در ذخیره کلیدهای API');
    }
    
    return true;
  } catch (error) {
    console.error('خطا در ذخیره کلیدهای API:', error);
    return false;
  }
}
