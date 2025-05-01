
/**
 * Bot settings service module
 * Handles bot configuration related API calls
 */
import { checkServerHealth, getApiBaseUrl } from './serverStatus';
import { DEFAULT_BOT_SETTINGS } from './mockData';
import { StrategiesConfig } from '../tradingStrategies';

/**
 * Fetches bot settings from the server
 * @returns Promise with bot settings
 */
export async function fetchBotSettings(): Promise<any> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، از داده موقت استفاده می‌شود');
      return DEFAULT_BOT_SETTINGS;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/bot-settings`);
    if (!response.ok) {
      throw new Error('خطا در دریافت تنظیمات ربات');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت تنظیمات ربات:', error);
    return DEFAULT_BOT_SETTINGS;
  }
}

/**
 * Saves bot settings to the server
 * @param settings Bot settings to save
 * @returns Promise indicating success/failure
 */
export async function saveBotSettings(settings: any): Promise<boolean> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، تنظیمات ذخیره نشد');
      return false;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/bot-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error('خطا در ذخیره تنظیمات ربات');
    }
    
    return true;
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات ربات:', error);
    return false;
  }
}

/**
 * Fetches strategy settings from the server
 * @returns Promise with strategy settings
 */
export async function fetchStrategySettings(): Promise<StrategiesConfig | null> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، از تنظیمات استراتژی پیش‌فرض استفاده می‌شود');
      return null;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/strategy-settings`);
    if (!response.ok) {
      throw new Error('خطا در دریافت تنظیمات استراتژی');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت تنظیمات استراتژی:', error);
    return null;
  }
}

/**
 * Saves strategy settings to the server
 * @param settings Strategy settings to save
 * @returns Promise indicating success/failure
 */
export async function saveStrategySettings(settings: StrategiesConfig): Promise<boolean> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، تنظیمات استراتژی ذخیره نشد');
      return false;
    }
    
    const response = await fetch(`${getApiBaseUrl()}/strategy-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settings)
    });
    
    if (!response.ok) {
      throw new Error('خطا در ذخیره تنظیمات استراتژی');
    }
    
    return true;
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات استراتژی:', error);
    return false;
  }
}
