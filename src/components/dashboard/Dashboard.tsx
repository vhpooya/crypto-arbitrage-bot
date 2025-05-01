
import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { ControlPanel } from './ControlPanel';
import { ProfitChart } from './ProfitChart';
import { TradeHistory } from './TradeHistory';
import { CoinSelector } from './CoinSelector';
import { PriceComparison } from './PriceComparison';
import { ArbitrageOpportunities } from './ArbitrageOpportunities';
import { BotStatus } from './BotStatus';
import { Settings } from './Settings';
import { WalletConnect } from '../wallet/WalletConnect';
import { StrategySettings } from './StrategySettings';
import { StrategyResults } from './StrategyResults';
import { ExchangeApiSettings } from './exchange-api/ExchangeApiSettings';
import { ServerStatusIndicator } from './ServerStatusIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Dashboard: React.FC = () => {
  const { botState } = useArbitrageBot();

  return (
    <div className="w-full min-h-screen bg-crypto-dark text-white">
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="text-crypto-bnb mr-1">Crypto</span>
              <span className="text-crypto-ethereum mr-1">Arb</span>
              <span className="text-crypto-solana">Vision</span>
              <span className="ml-2 text-sm text-gray-400">Real-time Arbitrage Dashboard</span>
            </h1>
            <div className="ml-4">
              <ServerStatusIndicator />
            </div>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Top row */}
          <div className="col-span-12">
            <BotStatus />
          </div>

          {/* Control panel and coin selector */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <ControlPanel />
            <CoinSelector />
          </div>

          {/* Main content area with tabs */}
          <div className="col-span-12 lg:col-span-9">
            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList className="grid grid-cols-6 mb-4">
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="comparison">Price Comparison</TabsTrigger>
                <TabsTrigger value="history">Trade History</TabsTrigger>
                <TabsTrigger value="strategies">Advanced Strategies</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="api-settings">API Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="opportunities" className="space-y-4">
                <ProfitChart />
                <ArbitrageOpportunities />
              </TabsContent>
              
              <TabsContent value="comparison" className="space-y-4">
                <PriceComparison />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <TradeHistory />
              </TabsContent>
              
              <TabsContent value="strategies" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <StrategySettings />
                  <StrategyResults />
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Settings />
              </TabsContent>
              
              <TabsContent value="api-settings" className="space-y-4">
                <ExchangeApiSettings />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 p-4 mt-8">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} Crypto Arbitrage Vision | Real-time dashboard for cryptocurrency arbitrage
          <div className="mt-1">
            {botState.lastScan && (
              <span>Last scan: {new Date(botState.lastScan).toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

