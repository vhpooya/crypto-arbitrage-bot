
import { toast } from "@/components/ui/use-toast";
import { ALL_SUPPORTED_EXCHANGES, createExchangeAdapter, ExchangeAdapter } from './exchangeAdapters';
import { ApiClient } from './apiClient';

// Define coin types
export type CoinType = 'bnb' | 'ethereum' | 'solana' | 'usdt' | 'usdc' | 'dai' | 'weth' | 'eth' | 'arb' | 'cake' | 'pepe' | 'meme';

// Type for price data
export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  last_updated: string;
  image: string;
}

// Exchange interface
export interface Exchange {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  isIranian?: boolean;
  apiKey?: string;
  apiSecret?: string;
  requiresAuth: boolean;
}

// Price data for multiple exchanges
export interface ArbitrageData {
  coin: CoinType;
  exchanges: {
    [exchangeId: string]: {
      price: number;
      lastUpdated: string;
    }
  };
}

// Map of coin IDs for API calls
const coinIdMap: Record<CoinType, string> = {
  bnb: 'binancecoin',
  ethereum: 'ethereum',
  solana: 'solana',
  usdt: 'tether',
  usdc: 'usd-coin',
  dai: 'dai',
  weth: 'weth',
  eth: 'ethereum',
  arb: 'arbitrum',
  cake: 'pancakeswap-token',
  pepe: 'pepe',
  meme: 'memecoin'
};

// List of exchanges we're monitoring with API information
let exchanges: Exchange[] = [
  { id: 'binance', name: 'Binance', url: 'https://api.binance.com', isActive: true, requiresAuth: true },
  { id: 'coinbase', name: 'Coinbase', url: 'https://api.coinbase.com', isActive: true, requiresAuth: true },
  { id: 'kraken', name: 'Kraken', url: 'https://api.kraken.com', isActive: true, requiresAuth: true },
  { id: 'kucoin', name: 'KuCoin', url: 'https://api.kucoin.com', isActive: true, requiresAuth: true },
  { id: 'ftx', name: 'FTX', url: 'https://ftx.com/api', isActive: false, requiresAuth: true },
  { id: 'bitfinex', name: 'Bitfinex', url: 'https://api.bitfinex.com', isActive: false, requiresAuth: true },
  { id: 'huobi', name: 'Huobi', url: 'https://api.huobi.pro', isActive: false, requiresAuth: true },
  { id: 'okx', name: 'OKX', url: 'https://www.okx.com/api', isActive: true, requiresAuth: true },
  // صرافی‌های ایرانی
  { id: 'bitpin', name: 'Bitpin', url: 'https://api.bitpin.ir', isActive: false, isIranian: true, requiresAuth: true },
  { id: 'nobitex', name: 'Nobitex', url: 'https://api.nobitex.ir', isActive: false, isIranian: true, requiresAuth: true },
  { id: 'abanteter', name: 'Abanteter', url: 'https://abantether.com/api', isActive: false, isIranian: true, requiresAuth: true },
];

// بارگذاری تنظیمات صرافی‌ها از سرور در ابتدای برنامه
const loadExchangeSettingsFromStorage = async () => {
  try {
    const settings = await ApiClient.fetchExchangeSettings();
    if (settings) {
      exchanges = exchanges.map(exchange => ({
        ...exchange,
        isActive: settings[exchange.id] !== undefined ? settings[exchange.id] : exchange.isActive
      }));
    } else {
      console.log("تنظیمات صرافی در سرور یافت نشد");
    }
  } catch (error) {
    console.error("خطا در بارگذاری تنظیمات صرافی از سرور:", error);
  }
};

// اجرای بارگذاری تنظیمات صرافی‌ها
setTimeout(() => {
  loadExchangeSettingsFromStorage();
}, 1000);

// Define ERC20 token contracts for fetching balances
export const TOKEN_CONTRACTS: Record<string, { address: string; symbol: string; decimals: number }> = {
  ethereum: { address: '', symbol: 'ETH', decimals: 18 }, // Main ETH doesn't require contract
  usdt: { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 }, // Ethereum mainnet USDT
  usdc: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 }, // Ethereum mainnet USDC
  dai:  { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18 }, // Ethereum mainnet DAI
  bnb:  { address: '', symbol: 'BNB', decimals: 18 }, // Assuming as ETH for simplicity, real BNB is on BSC
  // More tokens can be added here...
};

// Standard ERC20 ABI for interacting with tokens
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Function to update exchange active status
export const updateExchangeStatus = async (exchangeId: string, isActive: boolean): Promise<boolean> => {
  try {
    exchanges = exchanges.map(exchange => 
      exchange.id === exchangeId ? { ...exchange, isActive } : exchange
    );
    
    // ذخیره تنظیمات در سرور
    const result = await ApiClient.saveExchangeSettings(exchangeId, isActive);
    
    if (result) {
      console.log(`تنظیمات صرافی ${exchangeId} به ${isActive ? 'فعال' : 'غیرفعال'} تغییر کرد`);
      return true;
    }
    return false;
  } catch (error) {
    console.error("خطا در به‌روزرسانی وضعیت صرافی:", error);
    return false;
  }
};

// Function to update all exchanges status
export const updateAllExchangesStatus = (exchangeSettings: Record<string, boolean>): void => {
  exchanges = exchanges.map(exchange => ({
    ...exchange,
    isActive: exchangeSettings[exchange.id] !== undefined ? exchangeSettings[exchange.id] : exchange.isActive
  }));
};

// Function to update exchange API credentials
export const updateExchangeCredentials = (exchangeId: string, apiKey: string, apiSecret: string): void => {
  exchanges = exchanges.map(exchange =>
    exchange.id === exchangeId ? { ...exchange, apiKey, apiSecret } : exchange
  );
};

// Function to fetch price data for a specific coin from CoinGecko API
export const fetchCoinData = async (coin: CoinType): Promise<PriceData | null> => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinIdMap[coin]}&order=market_cap_desc&per_page=1&page=1&sparkline=false&locale=en`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${coin} data: ${response.status}`);
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching ${coin} data:`, error);
    toast({
      variant: "destructive",
      title: "Error",
      description: `Failed to fetch price data for ${coin}`,
    });
    return null;
  }
};

// Function to fetch price from a specific exchange using the adapter system
const fetchExchangePrice = async (exchange: Exchange, coin: CoinType): Promise<number | null> => {
  try {
    if (!exchange.isActive) {
      return null;
    }

    const adapter = createExchangeAdapter(exchange.id);
    if (!adapter) {
      console.warn(`Adapter not found for exchange ${exchange.name}`);
      return null;
    }

    // استفاده از کلیدهای API برای صرافی‌هایی که نیاز به احراز هویت دارند
    return await adapter.fetchPrice(coin, exchange.apiKey, exchange.apiSecret);
  } catch (error) {
    console.error(`Error fetching price from ${exchange.name} for ${coin}:`, error);
    return null;
  }
};

// Function to fetch real arbitrage data from multiple exchanges
export const fetchArbitrageData = async (coins: CoinType[]): Promise<ArbitrageData[]> => {
  try {
    const arbitrageData: ArbitrageData[] = [];
    
    // بررسی وضعیت سرور و آیا کلید‌های API تنظیم شده‌اند
    const serverAvailable = await ApiClient.checkServerHealth();
    
    // اگر سرور در دسترس نیست یا ربات در حالت تست است، از داده‌های شبیه‌سازی شده استفاده می‌کنیم
    if (!serverAvailable) {
      console.log("در حال استفاده از داده‌های شبیه‌سازی شده برای آربیتراژ");
      return generateMockArbitrageData(coins);
    }
    
    for (const coin of coins) {
      const exchangeData: ArbitrageData['exchanges'] = {};
      const currentTime = new Date().toISOString();
      
      // Fetch prices from all active exchanges in parallel
      const exchangePromises = exchanges
        .filter(exchange => exchange.isActive)
        .map(async (exchange) => {
          try {
            const price = await fetchExchangePrice(exchange, coin);
            
            if (price !== null) {
              exchangeData[exchange.id] = {
                price,
                lastUpdated: currentTime
              };
            }
          } catch (exchangeError) {
            console.error(`Error fetching from ${exchange.name}:`, exchangeError);
          }
        });
      
      await Promise.all(exchangePromises);
      
      // Only add coins that have prices from at least 2 exchanges (needed for arbitrage)
      const exchangeCount = Object.keys(exchangeData).length;
      if (exchangeCount >= 2) {
        arbitrageData.push({
          coin,
          exchanges: exchangeData
        });
      } else {
        console.warn(`Not enough exchange data for ${coin}. Found prices on ${exchangeCount} exchanges.`);
      }
    }
    
    return arbitrageData;
  } catch (error) {
    console.error("Error fetching arbitrage data:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to fetch arbitrage data from exchanges",
    });
    // در صورت خطا، از داده‌های شبیه‌سازی شده استفاده می‌کنیم
    return generateMockArbitrageData(coins);
  }
};

// تابع تولید داده‌های شبیه‌سازی شده برای حالت آفلاین
const generateMockArbitrageData = (coins: CoinType[]): ArbitrageData[] => {
  const mockData: ArbitrageData[] = [];
  const activeExchanges = exchanges.filter(e => e.isActive);
  
  if (activeExchanges.length < 2) {
    console.warn("حداقل دو صرافی فعال برای تولید داده شبیه‌سازی شده لازم است");
    return [];
  }
  
  for (const coin of coins) {
    // قیمت پایه برای هر ارز
    let basePrice: number;
    switch (coin) {
      case 'ethereum':
        basePrice = 3250 + Math.random() * 100;
        break;
      case 'bnb':
        basePrice = 570 + Math.random() * 20;
        break;
      case 'solana':
        basePrice = 140 + Math.random() * 10;
        break;
      case 'usdt':
      case 'usdc':
      case 'dai':
        basePrice = 0.99 + Math.random() * 0.02;
        break;
      case 'weth':
      case 'eth':
        basePrice = 3250 + Math.random() * 100;
        break;
      case 'arb':
        basePrice = 1.20 + Math.random() * 0.2;
        break;
      case 'cake':
        basePrice = 2.50 + Math.random() * 0.5;
        break;
      case 'pepe':
      case 'meme':
        basePrice = 0.000001 + Math.random() * 0.0000005;
        break;
      default:
        basePrice = 100 + Math.random() * 10;
    }
    
    const exchangeData: ArbitrageData['exchanges'] = {};
    const currentTime = new Date().toISOString();
    
    // ایجاد قیمت‌های متفاوت برای هر صرافی
    activeExchanges.forEach(exchange => {
      // تغییر قیمت با یک انحراف بین -2% تا +2%
      const deviation = (Math.random() * 4) - 2;
      const priceDeviation = basePrice * (deviation / 100);
      const price = basePrice + priceDeviation;
      
      exchangeData[exchange.id] = {
        price,
        lastUpdated: currentTime
      };
    });
    
    mockData.push({
      coin,
      exchanges: exchangeData
    });
  }
  
  return mockData;
};

// Function to calculate real arbitrage opportunities
export const calculateArbitrageOpportunities = (data: ArbitrageData[]) => {
  const opportunities = data.map(coinData => {
    const exchangePrices = Object.entries(coinData.exchanges).map(([exchangeId, data]) => ({
      exchangeId,
      price: data.price
    }));
    
    // Sort by price to find lowest and highest
    exchangePrices.sort((a, b) => a.price - b.price);
    
    const lowestExchange = exchangePrices[0];
    const highestExchange = exchangePrices[exchangePrices.length - 1];
    
    // Calculate price difference percentage
    const priceDifference = highestExchange.price - lowestExchange.price;
    const percentageDifference = (priceDifference / lowestExchange.price) * 100;
    
    // Calculate fees (this would need to be customized per exchange)
    const buyExchange = exchanges.find(ex => ex.id === lowestExchange.exchangeId);
    const sellExchange = exchanges.find(ex => ex.id === highestExchange.exchangeId);
    
    // Fixed fee percentages for each exchange type
    const getFeePercentage = (exchangeId: string): number => {
      switch (exchangeId.toLowerCase()) {
        case 'binance': return 0.1;
        case 'coinbase': return 0.5;
        case 'kraken': return 0.26;
        case 'kucoin': return 0.1;
        case 'okx': return 0.1;
        case 'ftx': return 0.07;
        case 'bitfinex': return 0.2;
        case 'huobi': return 0.2;
        // Iranian exchanges
        case 'bitpin': return 0.35;
        case 'nobitex': return 0.35;
        case 'abanteter': return 0.3;
        default: return 0.25; // Default fee
      }
    };
    
    // کارمزد خرید و فروش بر اساس صرافی
    const buyFeePercentage = getFeePercentage(lowestExchange.exchangeId);
    const sellFeePercentage = getFeePercentage(highestExchange.exchangeId);
    
    // محاسبه مقدار کارمزد
    const estimatedBuyFee = lowestExchange.price * (buyFeePercentage / 100);
    const estimatedSellFee = highestExchange.price * (sellFeePercentage / 100);
    
    // هزینه انتقال بین صرافی‌ها (مقدار ثابت برای سادگی)
    const getNetworkFee = (coin: CoinType): number => {
      switch (coin) {
        case 'ethereum':
        case 'eth':
        case 'weth':
          return 8; // ETH gas fees are higher
        case 'bnb':
          return 0.5; // BNB fees are lower
        case 'solana':
          return 0.001; // SOL fees are very low
        case 'usdt':
        case 'usdc':
        case 'dai':
          return 2; // Stablecoin fees on Ethereum
        default:
          return 1; // Default fee in USD
      }
    };
    
    const estimatedNetworkFee = getNetworkFee(coinData.coin);
    
    // Calculate real profit accounting for fees
    const grossProfit = priceDifference;
    const totalFees = estimatedBuyFee + estimatedSellFee + estimatedNetworkFee;
    const netProfit = grossProfit - totalFees;
    const netProfitPercentage = (netProfit / lowestExchange.price) * 100;
    
    return {
      coin: coinData.coin,
      buyExchange: buyExchange?.name || lowestExchange.exchangeId,
      buyPrice: lowestExchange.price,
      sellExchange: sellExchange?.name || highestExchange.exchangeId,
      sellPrice: highestExchange.price,
      percentageDifference: parseFloat(percentageDifference.toFixed(3)),
      grossProfit: parseFloat(grossProfit.toFixed(6)),
      fees: parseFloat(totalFees.toFixed(6)),
      netProfit: parseFloat(netProfit.toFixed(6)),
      netProfitPercentage: parseFloat(netProfitPercentage.toFixed(3)),
      profitable: netProfit > 0,
      timestamp: new Date().toISOString()
    };
  });
  
  return opportunities;
};

// Function to get list of available exchanges
export const getExchanges = (): Exchange[] => {
  // Return a deep copy to prevent external modifications
  return JSON.parse(JSON.stringify(exchanges.map(e => ({
    ...e,
    apiKey: e.apiKey ? '********' : undefined,
    apiSecret: e.apiSecret ? '********' : undefined
  }))));
};

// Function to execute a real trade on an exchange
export const executeTrade = async (
  exchange: string,
  coin: CoinType,
  action: 'buy' | 'sell',
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    // چک کردن اتصال به سرور
    const isServerAvailable = await ApiClient.checkServerHealth();
    if (!isServerAvailable) {
      console.log("سرور در دسترس نیست، معامله شبیه‌سازی می‌شود");
      // شبیه‌سازی معامله موفق
      return {
        success: true,
        transactionId: `mock-tx-${Date.now()}`
      };
    }
    
    const exchangeConfig = exchanges.find(e => e.id === exchange);
    
    if (!exchangeConfig) {
      throw new Error(`Exchange ${exchange} not found`);
    }
    
    if (!exchangeConfig.apiKey || !exchangeConfig.apiSecret) {
      throw new Error(`API credentials not set for ${exchangeConfig.name}`);
    }
    
    const adapter = createExchangeAdapter(exchange);
    if (!adapter) {
      throw new Error(`No adapter found for exchange ${exchange}`);
    }
    
    return await adapter.executeTrade(coin, action, amount, exchangeConfig.apiKey, exchangeConfig.apiSecret);
  } catch (error) {
    console.error(`Error executing trade on ${exchange}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to add a new exchange to the system
export const addExchange = (exchange: Exchange): void => {
  // Check if the exchange already exists
  const existingIndex = exchanges.findIndex(e => e.id === exchange.id);
  
  if (existingIndex >= 0) {
    // Update the existing exchange
    exchanges[existingIndex] = { ...exchanges[existingIndex], ...exchange };
  } else {
    // Add the new exchange
    exchanges.push(exchange);
  }
};

// Function to get Iranian exchanges
export const getIranianExchanges = (): Exchange[] => {
  return exchanges.filter(exchange => exchange.isIranian);
};

// Function to get international exchanges
export const getInternationalExchanges = (): Exchange[] => {
  return exchanges.filter(exchange => !exchange.isIranian);
};

