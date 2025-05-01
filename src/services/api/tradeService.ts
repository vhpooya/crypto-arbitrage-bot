
/**
 * Trade service module
 * Handles trade-related API calls
 */
import { toast } from "@/components/ui/use-toast";
import { Trade } from '../arbitrageBot';
import { checkServerHealth, getApiBaseUrl } from './serverStatus';
import { generateMockTrades } from './mockData';

/**
 * Fetches trades from the server or returns mock data if server is unavailable
 * @returns Promise with array of trades
 */
export async function fetchTrades(): Promise<Trade[]> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، از داده موقت استفاده می‌شود');
      return generateMockTrades();
    }
    
    const response = await fetch(`${getApiBaseUrl()}/trades`);
    if (!response.ok) {
      throw new Error('خطا در دریافت معاملات');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در دریافت معاملات:', error);
    return generateMockTrades();
  }
}

/**
 * Saves a new trade to the server
 * @param trade Trade data to save
 * @returns Promise with trade ID or null if failed
 */
export async function saveTrade(trade: Omit<Trade, 'id'>): Promise<{ id: string } | null> {
  try {
    const isServerAvailable = await checkServerHealth();
    
    if (!isServerAvailable) {
      console.info('سرور در دسترس نیست، معامله ذخیره نشد');
      // ایجاد یک ID موقت برای معامله
      return { id: `temp-${Date.now()}` };
    }
    
    const response = await fetch(`${getApiBaseUrl()}/trades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trade)
    });
    
    if (!response.ok) {
      throw new Error('خطا در ذخیره معامله');
    }
    
    return await response.json();
  } catch (error) {
    console.error('خطا در ذخیره معامله:', error);
    toast({
      variant: "destructive",
      title: "خطا در ذخیره معامله",
      description: error instanceof Error ? error.message : "خطای نامشخص"
    });
    return null;
  }
}
