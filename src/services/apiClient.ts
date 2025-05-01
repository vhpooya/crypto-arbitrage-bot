
/**
 * API Client - Main export module for all API services
 * This file serves as a single entry point for all API services
 */

// Export server status related functions
import { 
  checkServerHealth, 
  getServerAvailability 
} from './api/serverStatus';

// Export all service functions
import { 
  fetchTrades, 
  saveTrade 
} from './api/tradeService';

import { 
  fetchBotSettings, 
  saveBotSettings,
  fetchStrategySettings,
  saveStrategySettings
} from './api/botSettingsService';

import { 
  fetchExchangeSettings,
  saveExchangeSettings,
  getExchangeApiKeys,
  saveExchangeApiKeys
} from './api/exchangeService';

// Create ApiClient class to maintain backwards compatibility
export class ApiClient {
  // Server status
  static checkServerHealth = checkServerHealth;
  static get isServerAvailable() { return getServerAvailability(); }
  
  // Trades
  static fetchTrades = fetchTrades;
  static saveTrade = saveTrade;
  
  // Bot settings
  static fetchBotSettings = fetchBotSettings;
  static saveBotSettings = saveBotSettings;
  
  // Strategy settings
  static fetchStrategySettings = fetchStrategySettings;
  static saveStrategySettings = saveStrategySettings;
  
  // Exchange settings
  static fetchExchangeSettings = fetchExchangeSettings;
  static saveExchangeSettings = saveExchangeSettings;
  
  // Exchange API keys
  static getExchangeApiKeys = getExchangeApiKeys;
  static saveExchangeApiKeys = saveExchangeApiKeys;
  
  // Mock data generation - for backwards compatibility
  static getMockTrades = () => import('./api/mockData').then(m => m.generateMockTrades());
}

// Also export individual functions for direct imports
export {
  checkServerHealth,
  getServerAvailability as isServerAvailable,
  fetchTrades,
  saveTrade,
  fetchBotSettings,
  saveBotSettings,
  fetchStrategySettings,
  saveStrategySettings,
  fetchExchangeSettings,
  saveExchangeSettings,
  getExchangeApiKeys,
  saveExchangeApiKeys
};
