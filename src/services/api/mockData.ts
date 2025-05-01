
/**
 * Mock data generation module
 * Provides simulated data for testing and development
 */
import { Trade } from '../arbitrageBot';

/**
 * Generates mock trade data for testing and development
 * @returns Array of mock trade objects
 */
export function generateMockTrades(): Trade[] {
  return [
    {
      id: 'mock-1',
      coin: 'ethereum',
      buyExchange: 'Binance',
      sellExchange: 'Coinbase',
      buyPrice: 3250.75,
      sellPrice: 3275.50,
      amount: 0.5,
      profit: 12.38,
      profitPercentage: 0.76,
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'mock-2',
      coin: 'bnb',
      buyExchange: 'KuCoin',
      sellExchange: 'Binance',
      buyPrice: 570.25,
      sellPrice: 574.50,
      amount: 2,
      profit: 8.50,
      profitPercentage: 0.74,
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'mock-3',
      coin: 'solana',
      buyExchange: 'OKX',
      sellExchange: 'Kraken',
      buyPrice: 142.25,
      sellPrice: 144.50,
      amount: 10,
      profit: 22.50,
      profitPercentage: 1.58,
      status: 'completed',
      timestamp: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 'mock-4',
      coin: 'ethereum',
      buyExchange: 'Coinbase',
      sellExchange: 'OKX',
      buyPrice: 3240.25,
      sellPrice: 3235.50,
      amount: 0.1,
      profit: -0.48,
      profitPercentage: -0.15,
      status: 'failed',
      timestamp: new Date(Date.now() - 14400000).toISOString()
    }
  ];
}

/**
 * Default bot settings for when the server is unavailable
 */
export const DEFAULT_BOT_SETTINGS = {
  active: false,
  refreshInterval: 10000,
  coins: {
    bnb: { activeCoin: true, minimumProfitPercentage: 0.5, tradeAmount: 1, maxTradesPerDay: 10 },
    ethereum: { activeCoin: true, minimumProfitPercentage: 0.5, tradeAmount: 0.1, maxTradesPerDay: 10 },
    solana: { activeCoin: true, minimumProfitPercentage: 0.5, tradeAmount: 5, maxTradesPerDay: 10 },
    usdt: { activeCoin: false, minimumProfitPercentage: 0.2, tradeAmount: 1000, maxTradesPerDay: 10 },
    usdc: { activeCoin: false, minimumProfitPercentage: 0.2, tradeAmount: 1000, maxTradesPerDay: 10 },
    dai: { activeCoin: false, minimumProfitPercentage: 0.2, tradeAmount: 1000, maxTradesPerDay: 10 },
    weth: { activeCoin: false, minimumProfitPercentage: 0.5, tradeAmount: 0.1, maxTradesPerDay: 10 },
    eth: { activeCoin: false, minimumProfitPercentage: 0.5, tradeAmount: 0.1, maxTradesPerDay: 10 },
    arb: { activeCoin: false, minimumProfitPercentage: 0.5, tradeAmount: 100, maxTradesPerDay: 10 },
    cake: { activeCoin: false, minimumProfitPercentage: 0.5, tradeAmount: 100, maxTradesPerDay: 10 },
    pepe: { activeCoin: false, minimumProfitPercentage: 1.0, tradeAmount: 1000000, maxTradesPerDay: 10 },
    meme: { activeCoin: false, minimumProfitPercentage: 1.0, tradeAmount: 1000000, maxTradesPerDay: 10 }
  },
  autoTrade: false,
  exchanges: {
    binance: true,
    coinbase: true,
    kraken: true,
    kucoin: true,
    ftx: false,
    bitfinex: false,
    huobi: false,
    okx: true,
    bitpin: false,
    nobitex: false,
    abanteter: false
  }
};

/**
 * Default exchange settings
 */
export const DEFAULT_EXCHANGE_SETTINGS = DEFAULT_BOT_SETTINGS.exchanges;
