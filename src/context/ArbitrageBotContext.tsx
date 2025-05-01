
import React, { createContext, useContext, useState } from 'react';
import { MEVSettings, FlashLoanSettings, SnipingSettings } from '@/services/tradingStrategies';

// تعریف انواع داده برای کانتکست ربات آربیتراژ
interface ArbitrageBotContextType {
  botState: ArbitrageBotState;
  startBot: () => void;
  stopBot: () => void;
  updateConfig: (newConfig: BotConfig) => void;
  updateCoinSettings: (coin: string, settings: Partial<CoinSettings>) => void;
  updateStrategySettings: (strategyType: keyof StrategyConfig, settings: any) => void;
  executeStrategy: (strategyType: keyof StrategyConfig, coin: Coins) => void;
  updateExchangeSettings: (exchangeId: string, isActive: boolean) => void;
  manualScan: () => void;
}

export type Coins = 'bnb' | 'ethereum' | 'solana';

export interface ArbitrageBotState {
  isRunning: boolean;
  opportunities: ArbitrageOpportunity[];
  lastScan: string | null;
  config: BotConfig;
  strategyConfig: StrategyConfig;
  stats: BotStats;
  arbitrageData: any[];
  trades: Trade[];
  strategyResults: {
    mevResults: MEVResult[];
    flashLoanResults: FlashLoanResult[];
    snipingResults: SnipingResult[];
  };
}

export interface ArbitrageOpportunity {
  coin: string;
  buyExchange: string;
  buyPrice: number;
  sellExchange: string;
  sellPrice: number;
  percentageDifference: number;
  netProfit: number;
  grossProfit?: number;
  fees?: number;
  netProfitPercentage?: number;
  profitable?: boolean;
  timestamp?: string;
}

export interface BotConfig {
  coins: {
    bnb: CoinSettings;
    ethereum: CoinSettings;
    solana: CoinSettings;
    usdt: CoinSettings;
    usdc: CoinSettings;
    dai: CoinSettings;
    weth: CoinSettings;
    eth: CoinSettings;
    arb: CoinSettings;
    cake: CoinSettings;
    pepe: CoinSettings;
    meme: CoinSettings;
  };
  autoTrade: boolean;
  refreshInterval: number;
  exchanges: {
    [exchangeId: string]: boolean;
  };
}

export interface CoinSettings {
  activeCoin: boolean;
  maxTradesPerDay: number;
  minimumProfitPercentage: number;
  tradeAmount: number;
}

export interface StrategyConfig {
  mev: MEVSettings;
  flashLoan: FlashLoanSettings;
  sniping: SnipingSettings;
}

export interface BotStats {
  totalProfit: number;
  profitToday: number;
  successfulTrades: number;
  failedTrades: number;
  tradesExecutedToday: number;
}

export interface Trade {
  id: string;
  coin: string;
  buyExchange: string;
  sellExchange: string;
  buyPrice: number;
  sellPrice: number;
  amount: number;
  profit: number;
  profitPercentage: number;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  transactionHash?: string;
}

export interface MEVResult {
  status: 'completed' | 'failed';
  extractedValue: number;
  gasCost: number;
  netProfit: number;
  transactions: string[];
}

export interface FlashLoanResult {
  status: 'completed' | 'failed';
  loanAmount: number;
  protocol: string;
  fee: number;
  profit: number;
  trades: {
    exchange: string;
    type: string;
    price: number;
    amount: number;
  }[];
}

export interface SnipingResult {
  status: 'completed' | 'holding' | 'failed';
  targetToken: string;
  purchaseAmount: number;
  purchasePrice: number;
  sellPrice: number | null;
  profit: number | null;
  timeToSell: number | null;
}

// ایجاد کانتکست با مقادیر پیش‌فرض
const ArbitrageBotContext = createContext<ArbitrageBotContextType>({
  botState: {
    isRunning: false,
    opportunities: [],
    lastScan: null,
    arbitrageData: [],
    trades: [],
    config: {
      coins: {
        bnb: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 1.0,
        },
        ethereum: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        solana: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 5.0,
        },
        usdt: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        usdc: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        dai: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        weth: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        eth: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        arb: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 100,
        },
        cake: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 100,
        },
        pepe: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 1.0,
          tradeAmount: 1000000,
        },
        meme: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 1.0,
          tradeAmount: 1000000,
        }
      },
      autoTrade: false,
      refreshInterval: 10000,
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
    },
    strategyConfig: {
      mev: {
        active: false,
        minValueExtraction: 10,
        maxGasFee: 5,
        targetBlocks: 10,
        gasMultiplier: 1.5
      },
      flashLoan: {
        active: false,
        loanAmount: 10000,
        maxFeePercentage: 0.1,
        protocol: 'aave'
      },
      sniping: {
        active: false,
        maxSlippagePercentage: 1,
        gasMultiplier: 1.2,
        autoApprove: true
      }
    },
    stats: {
      totalProfit: 0,
      profitToday: 0,
      successfulTrades: 0,
      failedTrades: 0,
      tradesExecutedToday: 0
    },
    strategyResults: {
      mevResults: [],
      flashLoanResults: [],
      snipingResults: []
    }
  },
  startBot: () => {},
  stopBot: () => {},
  updateConfig: (newConfig: BotConfig) => {},
  updateCoinSettings: (coin: string, settings: Partial<CoinSettings>) => {},
  updateStrategySettings: (strategyType: keyof StrategyConfig, settings: any) => {},
  executeStrategy: (strategyType: keyof StrategyConfig, coin: Coins) => {},
  updateExchangeSettings: (exchangeId: string, isActive: boolean) => {},
  manualScan: () => {},
});

// هوک برای استفاده از کانتکست ربات آربیتراژ
export const useArbitrageBot = () => useContext(ArbitrageBotContext);

// کامپوننت Provider ربات آربیتراژ
export const ArbitrageBotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [botState, setBotState] = useState<ArbitrageBotState>({
    isRunning: false,
    opportunities: [],
    lastScan: null,
    arbitrageData: [],
    trades: [],
    config: {
      coins: {
        bnb: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 1.0,
        },
        ethereum: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        solana: {
          activeCoin: true,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 5.0,
        },
        usdt: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        usdc: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        dai: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.2,
          tradeAmount: 1000,
        },
        weth: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        eth: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 0.1,
        },
        arb: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 100,
        },
        cake: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 0.5,
          tradeAmount: 100,
        },
        pepe: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 1.0,
          tradeAmount: 1000000,
        },
        meme: {
          activeCoin: false,
          maxTradesPerDay: 10,
          minimumProfitPercentage: 1.0,
          tradeAmount: 1000000,
        }
      },
      autoTrade: false,
      refreshInterval: 10000,
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
    },
    strategyConfig: {
      mev: {
        active: false,
        minValueExtraction: 10,
        maxGasFee: 5,
        targetBlocks: 10,
        gasMultiplier: 1.5
      },
      flashLoan: {
        active: false,
        loanAmount: 10000,
        maxFeePercentage: 0.1,
        protocol: 'aave'
      },
      sniping: {
        active: false,
        maxSlippagePercentage: 1,
        gasMultiplier: 1.2,
        autoApprove: true
      }
    },
    stats: {
      totalProfit: 0,
      profitToday: 0,
      successfulTrades: 0,
      failedTrades: 0,
      tradesExecutedToday: 0
    },
    strategyResults: {
      mevResults: [],
      flashLoanResults: [],
      snipingResults: []
    }
  });

  // توابع برای به‌روزرسانی وضعیت ربات
  const startBot = () => {
    setBotState(prevState => ({ ...prevState, isRunning: true }));
    
    // اجرای اسکن اولیه بلافاصله بعد از شروع ربات
    setTimeout(() => {
      manualScan();
    }, 500);
  };

  const stopBot = () => {
    setBotState(prevState => ({ ...prevState, isRunning: false }));
  };

  const updateConfig = (newConfig: BotConfig) => {
    setBotState(prevState => ({ ...prevState, config: newConfig }));
  };

  const updateCoinSettings = (coin: string, settings: Partial<CoinSettings>) => {
    setBotState(prevState => ({
      ...prevState,
      config: {
        ...prevState.config,
        coins: {
          ...prevState.config.coins,
          [coin]: {
            ...prevState.config.coins[coin as keyof typeof prevState.config.coins],
            ...settings
          }
        }
      }
    }));
  };

  const updateStrategySettings = (strategyType: keyof StrategyConfig, settings: any) => {
    setBotState(prevState => ({
      ...prevState,
      strategyConfig: {
        ...prevState.strategyConfig,
        [strategyType]: {
          ...prevState.strategyConfig[strategyType],
          ...settings
        }
      }
    }));
  };

  const executeStrategy = (strategyType: keyof StrategyConfig, coin: Coins) => {
    console.log(`Executing ${strategyType} strategy for ${coin}`);
    // Logic to execute the strategy will be added here
  };
  
  const updateExchangeSettings = (exchangeId: string, isActive: boolean) => {
    console.log(`Updating exchange ${exchangeId} to ${isActive ? 'active' : 'inactive'}`);
    
    // ذخیره وضعیت صرافی در botState
    setBotState(prevState => ({
      ...prevState,
      config: {
        ...prevState.config,
        exchanges: {
          ...prevState.config.exchanges,
          [exchangeId]: isActive
        }
      }
    }));
  };
  
  const manualScan = () => {
    console.log('Performing manual scan');
    
    // شبیه‌سازی اسکن برای پیدا کردن فرصت‌های آربیتراژ
    const mockOpportunities = [
      {
        coin: 'bnb',
        buyExchange: 'Binance',
        buyPrice: 570.25,
        sellExchange: 'Kraken',
        sellPrice: 575.50,
        percentageDifference: 0.92,
        grossProfit: 5.25,
        fees: 1.14,
        netProfit: 4.11,
        netProfitPercentage: 0.72,
        profitable: true,
        timestamp: new Date().toISOString()
      },
      {
        coin: 'ethereum',
        buyExchange: 'Coinbase',
        buyPrice: 3250.75,
        sellExchange: 'OKX',
        sellPrice: 3268.25,
        percentageDifference: 0.54,
        grossProfit: 17.50,
        fees: 6.82,
        netProfit: 10.68,
        netProfitPercentage: 0.33,
        profitable: false,
        timestamp: new Date().toISOString()
      },
      {
        coin: 'solana',
        buyExchange: 'KuCoin',
        buyPrice: 142.50,
        sellExchange: 'Binance',
        sellPrice: 144.75,
        percentageDifference: 1.58,
        grossProfit: 2.25,
        fees: 0.43,
        netProfit: 1.82,
        netProfitPercentage: 1.28,
        profitable: true,
        timestamp: new Date().toISOString()
      }
    ];
    
    // به‌روزرسانی وضعیت با داده‌های شبیه‌سازی شده
    setBotState(prevState => ({
      ...prevState,
      opportunities: mockOpportunities,
      lastScan: new Date().toISOString()
    }));
  };

  return (
    <ArbitrageBotContext.Provider
      value={{
        botState,
        startBot,
        stopBot,
        updateConfig,
        updateCoinSettings,
        updateStrategySettings,
        executeStrategy,
        updateExchangeSettings,
        manualScan
      }}
    >
      {children}
    </ArbitrageBotContext.Provider>
  );
};
