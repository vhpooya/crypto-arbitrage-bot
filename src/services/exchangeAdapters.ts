
/**
 * سیستم ماژولار برای اتصال به صرافی‌ها
 * این فایل شامل کلاس‌های مختلف برای اتصال به صرافی‌های مختلف است
 */

import { CoinType } from './cryptoApi';

// رابط برای همه آداپتورهای صرافی
export interface ExchangeAdapter {
  id: string;
  name: string;
  url: string;
  isIranian: boolean;
  getMarketSymbol(coin: CoinType, baseCurrency?: string): string;
  fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null>;
  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit;
  parsePriceResponse(data: any): number | null;
  executeTrade(coin: CoinType, action: 'buy' | 'sell', amount: number, apiKey: string, apiSecret: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;
}

// کلاس پایه برای همه آداپتورهای صرافی
export abstract class BaseExchangeAdapter implements ExchangeAdapter {
  id: string;
  name: string;
  url: string;
  isIranian: boolean;

  constructor(id: string, name: string, url: string, isIranian: boolean = false) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.isIranian = isIranian;
  }

  abstract getMarketSymbol(coin: CoinType, baseCurrency?: string): string;
  abstract fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null>;
  abstract signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit;
  abstract parsePriceResponse(data: any): number | null;
  abstract executeTrade(coin: CoinType, action: 'buy' | 'sell', amount: number, apiKey: string, apiSecret: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }>;

  // روش تولید امضای HMAC برای احراز هویت درخواست‌ها
  protected generateHmacSignature(message: string, secret: string): string {
    const encoder = new TextEncoder();
    const key = encoder.encode(secret);
    const data = encoder.encode(message);
    
    // در یک پیاده‌سازی واقعی، از crypto.subtle.sign استفاده می‌شود
    // فعلاً یک هش نمونه برمی‌گردانیم
    return Array.from(new Uint8Array(32))
      .map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0'))
      .join('');
  }
}

// آداپتور بایننس
export class BinanceAdapter extends BaseExchangeAdapter {
  constructor() {
    super('binance', 'Binance', 'https://api.binance.com', false);
  }

  getMarketSymbol(coin: CoinType, baseCurrency: string = 'USDT'): string {
    const coinSymbol = coin.toUpperCase();
    return `${coinSymbol}${baseCurrency}`;
  }

  async fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null> {
    try {
      const symbol = this.getMarketSymbol(coin);
      const endpoint = `${this.url}/api/v3/ticker/price?symbol=${symbol}`;
      
      let requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (apiKey && apiSecret) {
        requestOptions = this.signRequest(endpoint, apiKey, apiSecret);
      }

      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price from ${this.name}: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parsePriceResponse(data);
    } catch (error) {
      console.error(`Error fetching price from ${this.name} for ${coin}:`, error);
      return null;
    }
  }

  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit {
    const timestamp = Date.now().toString();
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const signature = this.generateHmacSignature(
      `${queryString}&timestamp=${timestamp}`,
      apiSecret
    );

    return {
      headers: {
        'X-MBX-APIKEY': apiKey,
        'Content-Type': 'application/json'
      },
      method: 'GET',
    };
  }

  parsePriceResponse(data: any): number | null {
    if (data && data.price) {
      return parseFloat(data.price);
    }
    return null;
  }

  async executeTrade(
    coin: CoinType, 
    action: 'buy' | 'sell', 
    amount: number, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const symbol = this.getMarketSymbol(coin);
      const endpoint = `${this.url}/api/v3/order`;
      const params = {
        symbol,
        side: action.toUpperCase(),
        type: 'MARKET',
        quantity: amount.toString(),
        timestamp: Date.now().toString()
      };
      
      const requestOptions = this.signRequest(endpoint, apiKey, apiSecret, params as Record<string, string>);
      requestOptions.method = 'POST';
      requestOptions.body = JSON.stringify(params);
      
      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Binance API error: ${errorData.msg || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        transactionId: data.orderId
      };
    } catch (error) {
      console.error(`Error executing trade on ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// آداپتور کوین‌بیس
export class CoinbaseAdapter extends BaseExchangeAdapter {
  constructor() {
    super('coinbase', 'Coinbase', 'https://api.coinbase.com', false);
  }

  getMarketSymbol(coin: CoinType, baseCurrency: string = 'USD'): string {
    const coinSymbol = coin.toUpperCase();
    return `${coinSymbol}-${baseCurrency}`;
  }

  async fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null> {
    try {
      const symbol = this.getMarketSymbol(coin);
      const endpoint = `${this.url}/v2/prices/${symbol}/spot`;
      
      let requestOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (apiKey && apiSecret) {
        requestOptions = this.signRequest(endpoint, apiKey, apiSecret);
      }

      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price from ${this.name}: ${response.status}`);
      }
      
      const data = await response.json();
      return this.parsePriceResponse(data);
    } catch (error) {
      console.error(`Error fetching price from ${this.name} for ${coin}:`, error);
      return null;
    }
  }

  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = 'GET';
    const path = endpoint.replace(this.url, '');
    const signature = this.generateHmacSignature(
      `${timestamp}${method}${path}${params ? JSON.stringify(params) : ''}`,
      apiSecret
    );

    return {
      headers: {
        'CB-ACCESS-KEY': apiKey,
        'CB-ACCESS-SIGN': signature,
        'CB-ACCESS-TIMESTAMP': timestamp,
        'Content-Type': 'application/json'
      },
      method: 'GET',
    };
  }

  parsePriceResponse(data: any): number | null {
    if (data && data.data && data.data.amount) {
      return parseFloat(data.data.amount);
    }
    return null;
  }

  async executeTrade(
    coin: CoinType, 
    action: 'buy' | 'sell', 
    amount: number, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const endpoint = `${this.url}/v2/accounts/${action === 'buy' ? 'buy' : 'sell'}`;
      const params = {
        amount: amount.toString(),
        currency: coin.toUpperCase()
      };
      
      const requestOptions = this.signRequest(endpoint, apiKey, apiSecret, params as Record<string, string>);
      requestOptions.method = 'POST';
      requestOptions.body = JSON.stringify(params);
      
      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Coinbase API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        transactionId: data.data.id
      };
    } catch (error) {
      console.error(`Error executing trade on ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// آداپتور بیت‌پین (صرافی ایرانی)
export class BitpinAdapter extends BaseExchangeAdapter {
  constructor() {
    super('bitpin', 'Bitpin', 'https://api.bitpin.ir', true);
  }

  getMarketSymbol(coin: CoinType, baseCurrency: string = 'TMN'): string {
    const coinSymbol = coin.toUpperCase();
    return `${coinSymbol}${baseCurrency}`;
  }

  async fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null> {
    try {
      // در بیت‌پین، می‌توانیم از API عمومی برای دریافت قیمت‌ها استفاده کنیم
      const endpoint = `${this.url}/v1/mkt/markets`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price from ${this.name}: ${response.status}`);
      }
      
      const data = await response.json();
      
      // پیدا کردن بازار مربوط به ارز مورد نظر
      const coinSymbol = coin.toUpperCase();
      const market = data.results.find((m: any) => 
        m.currency1.code.toUpperCase() === coinSymbol && 
        m.currency2.code.toUpperCase() === 'TMN'
      );
      
      if (!market) {
        console.warn(`Market not found for ${coinSymbol}-TMN on Bitpin`);
        return null;
      }
      
      return parseFloat(market.price);
    } catch (error) {
      console.error(`Error fetching price from ${this.name} for ${coin}:`, error);
      return null;
    }
  }

  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit {
    // پیاده‌سازی امضا بر اساس مستندات API بیت‌پین
    return {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'GET',
    };
  }

  parsePriceResponse(data: any): number | null {
    // این تابع برای بیت‌پین در fetchPrice اجرا می‌شود
    return null;
  }

  async executeTrade(
    coin: CoinType, 
    action: 'buy' | 'sell', 
    amount: number, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // نکته: این پیاده‌سازی باید بر اساس مستندات API بیت‌پین تکمیل شود
      const endpoint = `${this.url}/v1/order/create/`;
      
      const requestOptions = this.signRequest(endpoint, apiKey, apiSecret);
      requestOptions.method = 'POST';
      requestOptions.body = JSON.stringify({
        market: this.getMarketSymbol(coin),
        amount,
        price: 0, // برای سفارش بازار
        type: action === 'buy' ? 'buy' : 'sell'
      });
      
      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Bitpin API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        transactionId: data.id
      };
    } catch (error) {
      console.error(`Error executing trade on ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// آداپتور نوبیتکس (صرافی ایرانی)
export class NobitexAdapter extends BaseExchangeAdapter {
  constructor() {
    super('nobitex', 'Nobitex', 'https://api.nobitex.ir', true);
  }

  getMarketSymbol(coin: CoinType, baseCurrency: string = 'rls'): string {
    const coinSymbol = coin.toLowerCase();
    return `${coinSymbol}${baseCurrency}`;
  }

  async fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null> {
    try {
      const symbol = this.getMarketSymbol(coin);
      const endpoint = `${this.url}/v2/orderbook/${symbol}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price from ${this.name}: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data.status || data.status !== 'ok') {
        throw new Error(`Nobitex API error: ${data.message || 'Unknown error'}`);
      }
      
      // استفاده از میانگین قیمت خرید و فروش
      const asks = data.asks;
      const bids = data.bids;
      
      if (!asks.length || !bids.length) {
        return null;
      }
      
      const lowestAsk = parseFloat(asks[0][0]);
      const highestBid = parseFloat(bids[0][0]);
      
      return (lowestAsk + highestBid) / 2;
    } catch (error) {
      console.error(`Error fetching price from ${this.name} for ${coin}:`, error);
      return null;
    }
  }

  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit {
    // نوبیتکس از توکن احراز هویت استفاده می‌کند
    return {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'application/json'
      },
      method: 'GET',
    };
  }

  parsePriceResponse(data: any): number | null {
    // این تابع برای نوبیتکس در fetchPrice اجرا می‌شود
    return null;
  }

  async executeTrade(
    coin: CoinType, 
    action: 'buy' | 'sell', 
    amount: number, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      const endpoint = `${this.url}/market/orders/add`;
      const symbol = this.getMarketSymbol(coin);
      
      const requestOptions = this.signRequest(endpoint, apiKey, apiSecret);
      requestOptions.method = 'POST';
      requestOptions.body = JSON.stringify({
        type: action,
        execution: 'market', // سفارش بازار
        srcCurrency: action === 'buy' ? 'rls' : coin.toLowerCase(),
        dstCurrency: action === 'buy' ? coin.toLowerCase() : 'rls',
        amount: amount.toString(),
      });
      
      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Nobitex API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      if (!data.status || data.status !== 'ok') {
        throw new Error(`Nobitex API error: ${data.message || 'Unknown error'}`);
      }
      
      return {
        success: true,
        transactionId: data.order.id
      };
    } catch (error) {
      console.error(`Error executing trade on ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// آداپتور آبان‌تتر (صرافی ایرانی)
export class AbanteterAdapter extends BaseExchangeAdapter {
  constructor() {
    super('abanteter', 'Abanteter', 'https://abantether.com/api', true);
  }

  getMarketSymbol(coin: CoinType, baseCurrency: string = 'IRT'): string {
    const coinSymbol = coin.toUpperCase();
    return `${coinSymbol}_${baseCurrency}`;
  }

  async fetchPrice(coin: CoinType, apiKey?: string, apiSecret?: string): Promise<number | null> {
    try {
      // نکته: این API باید با مستندات واقعی آبان‌تتر تطبیق داده شود
      const endpoint = `${this.url}/v1/ticker`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price from ${this.name}: ${response.status}`);
      }
      
      const data = await response.json();
      const symbol = this.getMarketSymbol(coin);
      
      if (data[symbol]) {
        return parseFloat(data[symbol].last);
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching price from ${this.name} for ${coin}:`, error);
      return null;
    }
  }

  signRequest(endpoint: string, apiKey: string, apiSecret: string, params?: Record<string, string>): RequestInit {
    // پیاده‌سازی امضا بر اساس مستندات آبان‌تتر
    return {
      headers: {
        'API-Key': apiKey,
        'API-Secret': apiSecret,
        'Content-Type': 'application/json'
      },
      method: 'GET',
    };
  }

  parsePriceResponse(data: any): number | null {
    // این تابع برای آبان‌تتر در fetchPrice اجرا می‌شود
    return null;
  }

  async executeTrade(
    coin: CoinType, 
    action: 'buy' | 'sell', 
    amount: number, 
    apiKey: string, 
    apiSecret: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // نکته: این پیاده‌سازی باید بر اساس مستندات API آبان‌تتر تکمیل شود
      const endpoint = `${this.url}/v1/orders`;
      
      const requestOptions = this.signRequest(endpoint, apiKey, apiSecret);
      requestOptions.method = 'POST';
      requestOptions.body = JSON.stringify({
        symbol: this.getMarketSymbol(coin),
        side: action,
        type: 'MARKET',
        quantity: amount
      });
      
      const response = await fetch(endpoint, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Abanteter API error: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        transactionId: data.orderId
      };
    } catch (error) {
      console.error(`Error executing trade on ${this.name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// فانکشن برای ساخت آداپتورهای صرافی
export function createExchangeAdapter(exchangeId: string): ExchangeAdapter | null {
  switch (exchangeId.toLowerCase()) {
    case 'binance':
      return new BinanceAdapter();
    case 'coinbase':
      return new CoinbaseAdapter();
    case 'bitpin':
      return new BitpinAdapter();
    case 'nobitex':
      return new NobitexAdapter();
    case 'abanteter':
      return new AbanteterAdapter();
    default:
      console.warn(`No adapter available for exchange: ${exchangeId}`);
      return null;
  }
}

// لیست همه صرافی‌های پشتیبانی شده
export const ALL_SUPPORTED_EXCHANGES: ExchangeAdapter[] = [
  new BinanceAdapter(),
  new CoinbaseAdapter(),
  new BitpinAdapter(),
  new NobitexAdapter(),
  new AbanteterAdapter(),
  // می‌توانید صرافی‌های بیشتری اضافه کنید
];
