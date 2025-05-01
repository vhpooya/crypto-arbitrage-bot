
import { CoinType, ArbitrageData, fetchArbitrageData, calculateArbitrageOpportunities, updateExchangeStatus, updateAllExchangesStatus, executeTrade } from './cryptoApi';
import { ApiClient } from './apiClient';
import { TradingStrategies, StrategiesConfig, MEVResult, FlashLoanResult, SnipingResult } from './tradingStrategies';

export type { CoinType };
import { toast } from "@/components/ui/use-toast";

export interface BotSettings {
  activeCoin: boolean;
  minimumProfitPercentage: number;
  tradeAmount: number;
  maxTradesPerDay: number;
}

export interface BotConfig {
  active: boolean;
  refreshInterval: number; // in milliseconds
  coins: {
    [key in CoinType]: BotSettings;
  };
  autoTrade: boolean;
  exchanges: {
    [exchangeId: string]: boolean;
  };
}

export interface Trade {
  id: string;
  coin: CoinType;
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

export interface BotState {
  config: BotConfig;
  isRunning: boolean;
  lastScan: string | null;
  arbitrageData: ArbitrageData[];
  opportunities: ReturnType<typeof calculateArbitrageOpportunities>;
  trades: Trade[];
  stats: {
    totalProfit: number;
    successfulTrades: number;
    failedTrades: number;
    profitToday: number;
    tradesExecutedToday: number;
  };
}

const initialConfig: BotConfig = {
  active: false,
  refreshInterval: 10000, // 10 seconds
  coins: {
    bnb: {
      activeCoin: true,
      minimumProfitPercentage: 0.5,
      tradeAmount: 1,
      maxTradesPerDay: 10
    },
    ethereum: {
      activeCoin: true,
      minimumProfitPercentage: 0.5,
      tradeAmount: 0.1,
      maxTradesPerDay: 10
    },
    solana: {
      activeCoin: true,
      minimumProfitPercentage: 0.5,
      tradeAmount: 5,
      maxTradesPerDay: 10
    },
    usdt: {
      activeCoin: false,
      minimumProfitPercentage: 0.2,
      tradeAmount: 1000,
      maxTradesPerDay: 10
    },
    usdc: {
      activeCoin: false,
      minimumProfitPercentage: 0.2,
      tradeAmount: 1000,
      maxTradesPerDay: 10
    },
    dai: {
      activeCoin: false,
      minimumProfitPercentage: 0.2,
      tradeAmount: 1000,
      maxTradesPerDay: 10
    },
    weth: {
      activeCoin: false,
      minimumProfitPercentage: 0.5,
      tradeAmount: 0.1,
      maxTradesPerDay: 10
    },
    eth: {
      activeCoin: false,
      minimumProfitPercentage: 0.5,
      tradeAmount: 0.1,
      maxTradesPerDay: 10
    },
    arb: {
      activeCoin: false,
      minimumProfitPercentage: 0.5,
      tradeAmount: 100,
      maxTradesPerDay: 10
    },
    cake: {
      activeCoin: false,
      minimumProfitPercentage: 0.5,
      tradeAmount: 100,
      maxTradesPerDay: 10
    },
    pepe: {
      activeCoin: false,
      minimumProfitPercentage: 1.0,
      tradeAmount: 1000000,
      maxTradesPerDay: 10
    },
    meme: {
      activeCoin: false,
      minimumProfitPercentage: 1.0,
      tradeAmount: 1000000,
      maxTradesPerDay: 10
    }
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
    okx: true
  }
};

const initialState: BotState = {
  config: initialConfig,
  isRunning: false,
  lastScan: null,
  arbitrageData: [],
  opportunities: [],
  trades: [],
  stats: {
    totalProfit: 0,
    successfulTrades: 0,
    failedTrades: 0,
    profitToday: 0,
    tradesExecutedToday: 0
  }
};

export class ArbitrageBot {
  private state: BotState = initialState;
  private scanInterval: number | null = null;
  private stateUpdateCallback: ((state: BotState) => void) | null = null;
  private strategyConfig: StrategiesConfig = TradingStrategies.defaultConfig;

  constructor() {
    this.state = { ...initialState };
    this.loadState();
  }

  public onStateUpdate(callback: (state: BotState) => void): void {
    this.stateUpdateCallback = callback;
  }

  private updateState(updater: (state: BotState) => void): void {
    updater(this.state);
    if (this.stateUpdateCallback) {
      this.stateUpdateCallback({ ...this.state });
    }
    this.saveSettingsToServer();
  }

  private async saveSettingsToServer(): Promise<void> {
    try {
      await ApiClient.saveBotSettings(this.state.config);
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات در سرور:', error);
    }
  }

  private async loadState(): Promise<void> {
    try {
      const config = await ApiClient.fetchBotSettings();
      if (config) {
        this.updateState(state => {
          state.config = config;
        });
      }

      const trades = await ApiClient.fetchTrades();

      let totalProfit = 0;
      let successfulTrades = 0;
      let failedTrades = 0;
      let profitToday = 0;
      let tradesExecutedToday = 0;

      const today = new Date().toISOString().split('T')[0];

      trades.forEach(trade => {
        if (trade.status === 'completed') {
          totalProfit += trade.profit;
          successfulTrades++;

          if (trade.timestamp.startsWith(today)) {
            profitToday += trade.profit;
            tradesExecutedToday++;
          }
        } else if (trade.status === 'failed') {
          failedTrades++;
        }
      });

      this.updateState(state => {
        state.trades = trades;
        state.stats = {
          totalProfit,
          successfulTrades,
          failedTrades,
          profitToday,
          tradesExecutedToday
        };
      });
    } catch (error) {
      console.error('خطا در بارگذاری وضعیت از سرور:', error);
    }
  }

  public async loadStrategySettings(): Promise<StrategiesConfig | null> {
    try {
      const strategyConfig = await ApiClient.fetchStrategySettings();
      if (strategyConfig) {
        this.strategyConfig = strategyConfig;
        return strategyConfig;
      }
      return null;
    } catch (error) {
      console.error('خطا در بارگذاری تنظیمات استراتژی‌ها:', error);
      return null;
    }
  }

  public async saveStrategySettings(config: StrategiesConfig): Promise<boolean> {
    try {
      this.strategyConfig = config;
      return await ApiClient.saveStrategySettings(config);
    } catch (error) {
      console.error('خطا در ذخیره تنظیمات استراتژی‌ها:', error);
      return false;
    }
  }

  public async executeStrategy(
    strategyType: 'mev' | 'flashLoan' | 'sniping',
    coin: CoinType,
    strategyConfig: StrategiesConfig
  ): Promise<MEVResult | FlashLoanResult | SnipingResult | null> {
    try {
      if (strategyType === 'mev') {
        return await TradingStrategies.executeMEVStrategy(coin, strategyConfig.mev);
      } else if (strategyType === 'flashLoan') {
        return await TradingStrategies.executeFlashLoanStrategy(coin, strategyConfig.flashLoan);
      } else if (strategyType === 'sniping') {
        return await TradingStrategies.executeSnipingStrategy(coin, strategyConfig.sniping);
      }
      return null;
    } catch (error) {
      console.error(`خطا در اجرای استراتژی ${strategyType}:`, error);
      toast({
        variant: "destructive",
        title: `خطای استراتژی ${strategyType}`,
        description: `اجرای استراتژی ${strategyType} با مشکل مواجه شد`,
      });
      return null;
    }
  }

  private getActiveCoins(): CoinType[] {
    return Object.entries(this.state.config.coins)
      .filter(([_, settings]) => settings.activeCoin)
      .map(([coin]) => coin as CoinType);
  }

  public start(): void {
    if (this.state.isRunning) {
      return;
    }

    this.updateState(state => {
      state.isRunning = true;
    });

    this.performScan();

    this.scanInterval = window.setInterval(
      () => this.performScan(),
      this.state.config.refreshInterval
    );

    toast({
      title: "شروع ربات",
      description: `نظارت بر ${this.getActiveCoins().join(', ')} برای فرصت‌های آربیتراژ`
    });
  }

  public stop(): void {
    if (!this.state.isRunning) {
      return;
    }

    if (this.scanInterval !== null) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }

    this.updateState(state => {
      state.isRunning = false;
    });

    toast({
      title: "توقف ربات",
      description: "نظارت بر آربیتراژ متوقف شده است"
    });
  }

  public updateConfig(config: Partial<BotConfig>): void {
    this.updateState(state => {
      state.config = { ...state.config, ...config };
    });

    if (config.refreshInterval && this.state.isRunning) {
      this.stop();
      this.start();
    }
  }

  public updateCoinSettings(coin: CoinType, settings: Partial<BotSettings>): void {
    this.updateState(state => {
      state.config.coins[coin] = { ...state.config.coins[coin], ...settings };
    });
  }

  public updateExchangeSettings(exchangeId: string, isActive: boolean): void {
    this.updateState(state => {
      state.config.exchanges = {
        ...state.config.exchanges,
        [exchangeId]: isActive
      };
    });
  }

  private async executeTrade(opportunity: (typeof this.state.opportunities)[0]): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tradesToday = this.state.trades.filter(trade => 
        trade.timestamp.startsWith(today) && 
        trade.coin === opportunity.coin
      ).length;
      
      const maxTradesPerDay = this.state.config.coins[opportunity.coin].maxTradesPerDay;
      
      if (tradesToday >= maxTradesPerDay) {
        console.log(`حداکثر معاملات روزانه (${maxTradesPerDay}) برای ${opportunity.coin} رسیده است`);
        return;
      }

      const tradeAmount = this.state.config.coins[opportunity.coin].tradeAmount;
      
      // اجرای معامله واقعی در صرافی اول (خرید)
      const buyExchangeId = opportunity.buyExchange.toLowerCase().replace(' ', '');
      const buyResult = await executeTrade(
        buyExchangeId,
        opportunity.coin,
        'buy',
        tradeAmount
      );
      
      if (!buyResult.success) {
        throw new Error(`خرید در ${opportunity.buyExchange} ناموفق بود: ${buyResult.error}`);
      }
      
      // اجرای معامله واقعی در صرافی دوم (فروش)
      const sellExchangeId = opportunity.sellExchange.toLowerCase().replace(' ', '');
      const sellResult = await executeTrade(
        sellExchangeId,
        opportunity.coin,
        'sell',
        tradeAmount
      );
      
      if (!sellResult.success) {
        throw new Error(`فروش در ${opportunity.sellExchange} ناموفق بود: ${sellResult.error}`);
      }
      
      // محاسبه سود واقعی
      const profitAmount = opportunity.netProfit * tradeAmount;
      
      const newTrade: Omit<Trade, 'id'> = {
        coin: opportunity.coin,
        buyExchange: opportunity.buyExchange,
        sellExchange: opportunity.sellExchange,
        buyPrice: opportunity.buyPrice,
        sellPrice: opportunity.sellPrice,
        amount: tradeAmount,
        profit: profitAmount,
        profitPercentage: opportunity.netProfitPercentage,
        status: 'completed',
        timestamp: new Date().toISOString(),
        transactionHash: buyResult.transactionId || undefined
      };
      
      const result = await ApiClient.saveTrade(newTrade);
      
      if (result) {
        const trade: Trade = {
          ...newTrade,
          id: result.id
        };
        
        this.updateState(state => {
          state.trades.unshift(trade);
          state.stats.successfulTrades += 1;
          state.stats.totalProfit += profitAmount;
          state.stats.profitToday += profitAmount;
          state.stats.tradesExecutedToday += 1;
        });
        
        toast({
          title: "معامله انجام شد",
          description: `سود: $${profitAmount.toFixed(2)} (${opportunity.netProfitPercentage}%) برای ${opportunity.coin}`,
        });
      }
    } catch (error) {
      console.error('خطا در اجرای معامله:', error);
      
      const failedTrade: Omit<Trade, 'id'> = {
        coin: opportunity.coin,
        buyExchange: opportunity.buyExchange,
        sellExchange: opportunity.sellExchange,
        buyPrice: opportunity.buyPrice,
        sellPrice: opportunity.sellPrice,
        amount: this.state.config.coins[opportunity.coin].tradeAmount,
        profit: 0,
        profitPercentage: opportunity.netProfitPercentage,
        status: 'failed',
        timestamp: new Date().toISOString()
      };
      
      const result = await ApiClient.saveTrade(failedTrade);
      
      if (result) {
        const trade: Trade = {
          ...failedTrade,
          id: result.id
        };
        
        this.updateState(state => {
          state.trades.unshift(trade);
          state.stats.failedTrades += 1;
        });
      }
      
      toast({
        variant: "destructive",
        title: "معامله ناموفق",
        description: `اجرای معامله ${opportunity.coin} ناموفق بود: ${error instanceof Error ? error.message : 'خطای نامشخص'}`,
      });
    }
  }

  private resetDailyStats(): void {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      this.updateState(state => {
        state.stats.profitToday = 0;
        state.stats.tradesExecutedToday = 0;
      });
    }
  }

  private async performScan(): Promise<void> {
    try {
      const activeCoins = this.getActiveCoins();
      
      if (activeCoins.length === 0) {
        console.log("هیچ ارز فعالی برای اسکن وجود ندارد");
        return;
      }
      
      updateAllExchangesStatus(this.state.config.exchanges);
      
      // دریافت داده‌های آربیتراژ واقعی از صرافی‌ها
      const arbitrageData = await fetchArbitrageData(activeCoins);
      
      // محاسبه فرصت‌های سودآور واقعی با احتساب کارمزدها
      const opportunities = calculateArbitrageOpportunities(arbitrageData);
      
      // فیلتر کردن فرصت‌های سودآور بر اساس حداقل سود تعیین شده
      const profitableOpportunities = opportunities.filter(opportunity => {
        const minProfit = this.state.config.coins[opportunity.coin].minimumProfitPercentage;
        return opportunity.netProfitPercentage >= minProfit && opportunity.profitable;
      });
      
      if (this.state.config.autoTrade) {
        for (const opportunity of profitableOpportunities) {
          await this.executeTrade(opportunity);
        }
      }
      
      this.updateState(state => {
        state.arbitrageData = arbitrageData;
        state.opportunities = opportunities;
        state.lastScan = new Date().toISOString();
      });
      
      this.resetDailyStats();
      
    } catch (error) {
      console.error("خطا در هنگام اسکن آربیتراژ:", error);
      toast({
        variant: "destructive",
        title: "خطای اسکن",
        description: "اسکن آربیتراژ ناموفق بود",
      });
    }
  }

  public getState(): BotState {
    return { ...this.state };
  }

  public async manualScan(): Promise<void> {
    await this.performScan();
    
    const profitableOpportunities = this.state.opportunities.filter(opp => opp.profitable);
    
    toast({
      title: "اسکن دستی کامل شد",
      description: `${this.state.opportunities.length} فرصت یافت شد، ${profitableOpportunities.length} فرصت سودآور`
    });
  }
}

export const arbitrageBot = new ArbitrageBot();
