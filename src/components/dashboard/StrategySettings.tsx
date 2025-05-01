
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useArbitrageBot } from "@/context/ArbitrageBotContext";
import { Coins, Zap, Target } from "lucide-react";
import { 
  MEVSettings, 
  FlashLoanSettings, 
  SnipingSettings 
} from '@/services/tradingStrategies';

export const StrategySettings: React.FC = () => {
  const { botState, updateStrategySettings, executeStrategy } = useArbitrageBot();
  const [selectedCoin, setSelectedCoin] = useState<string>('bnb');

  // تنظیمات MEV
  const handleMEVChange = (field: keyof MEVSettings, value: any) => {
    const updatedSettings = {
      ...botState.strategyConfig.mev,
      [field]: field === 'active' ? value : Number(value)
    };
    updateStrategySettings('mev', updatedSettings);
  };

  // تنظیمات وام فلش
  const handleFlashLoanChange = (field: keyof FlashLoanSettings, value: any) => {
    const updatedSettings = {
      ...botState.strategyConfig.flashLoan,
      [field]: field === 'active' || field === 'protocol' ? value : Number(value)
    };
    updateStrategySettings('flashLoan', updatedSettings);
  };

  // تنظیمات اسنایپینگ
  const handleSnipingChange = (field: keyof SnipingSettings, value: any) => {
    const updatedSettings = {
      ...botState.strategyConfig.sniping,
      [field]: field === 'active' || field === 'autoApprove' ? value : Number(value)
    };
    updateStrategySettings('sniping', updatedSettings);
  };

  // اجرای استراتژی
  const handleExecuteStrategy = (strategyType: 'mev' | 'flashLoan' | 'sniping') => {
    executeStrategy(strategyType, selectedCoin as any);
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">استراتژی‌های معاملاتی پیشرفته</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>انتخاب ارز:</Label>
          <select 
            className="w-full p-2 mt-1 bg-crypto-dark-panel text-white border border-gray-700 rounded"
            value={selectedCoin}
            onChange={(e) => setSelectedCoin(e.target.value)}
          >
            <option value="bnb">Binance Coin (BNB)</option>
            <option value="ethereum">Ethereum (ETH)</option>
            <option value="solana">Solana (SOL)</option>
          </select>
        </div>

        <Tabs defaultValue="mev" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="mev" className="flex items-center">
              <Coins className="mr-1 h-4 w-4" /> MEV
            </TabsTrigger>
            <TabsTrigger value="flashLoan" className="flex items-center">
              <Zap className="mr-1 h-4 w-4" /> وام فلش
            </TabsTrigger>
            <TabsTrigger value="sniping" className="flex items-center">
              <Target className="mr-1 h-4 w-4" /> اسنایپینگ
            </TabsTrigger>
          </TabsList>
          
          {/* تنظیمات MEV */}
          <TabsContent value="mev" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="mev-active">فعال</Label>
              <Switch
                id="mev-active"
                checked={botState.strategyConfig.mev.active}
                onCheckedChange={(checked) => handleMEVChange('active', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="min-value">حداقل ارزش استخراجی (دلار)</Label>
              <Input
                id="min-value"
                type="number"
                min="0"
                step="1"
                value={botState.strategyConfig.mev.minValueExtraction}
                onChange={(e) => handleMEVChange('minValueExtraction', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-gas">حداکثر هزینه گاز (دلار)</Label>
              <Input
                id="max-gas"
                type="number"
                min="0"
                step="0.1"
                value={botState.strategyConfig.mev.maxGasFee}
                onChange={(e) => handleMEVChange('maxGasFee', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target-blocks">تعداد بلاک‌های هدف</Label>
              <Input
                id="target-blocks"
                type="number"
                min="1"
                step="1"
                value={botState.strategyConfig.mev.targetBlocks}
                onChange={(e) => handleMEVChange('targetBlocks', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <Button 
              onClick={() => handleExecuteStrategy('mev')}
              className="w-full mt-2"
              disabled={!botState.strategyConfig.mev.active}
            >
              <Coins className="mr-1 h-4 w-4" /> اجرای استراتژی MEV
            </Button>
          </TabsContent>
          
          {/* تنظیمات وام فلش */}
          <TabsContent value="flashLoan" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="flashloan-active">فعال</Label>
              <Switch
                id="flashloan-active"
                checked={botState.strategyConfig.flashLoan.active}
                onCheckedChange={(checked) => handleFlashLoanChange('active', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loan-amount">مقدار وام (دلار)</Label>
              <Input
                id="loan-amount"
                type="number"
                min="0"
                step="100"
                value={botState.strategyConfig.flashLoan.loanAmount}
                onChange={(e) => handleFlashLoanChange('loanAmount', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-fee">حداکثر کارمزد (%)</Label>
              <Input
                id="max-fee"
                type="number"
                min="0"
                step="0.01"
                max="1"
                value={botState.strategyConfig.flashLoan.maxFeePercentage}
                onChange={(e) => handleFlashLoanChange('maxFeePercentage', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="protocol">پروتکل</Label>
              <select
                id="protocol"
                value={botState.strategyConfig.flashLoan.protocol}
                onChange={(e) => handleFlashLoanChange('protocol', e.target.value)}
                className="w-full p-2 bg-crypto-dark-panel text-white border border-gray-700 rounded"
              >
                <option value="aave">Aave</option>
                <option value="dydx">dYdX</option>
                <option value="uniswap">Uniswap</option>
              </select>
            </div>
            
            <Button 
              onClick={() => handleExecuteStrategy('flashLoan')}
              className="w-full mt-2"
              disabled={!botState.strategyConfig.flashLoan.active}
            >
              <Zap className="mr-1 h-4 w-4" /> اجرای وام فلش
            </Button>
          </TabsContent>
          
          {/* تنظیمات اسنایپینگ */}
          <TabsContent value="sniping" className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sniping-active">فعال</Label>
              <Switch
                id="sniping-active"
                checked={botState.strategyConfig.sniping.active}
                onCheckedChange={(checked) => handleSnipingChange('active', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-slippage">حداکثر لغزش قیمت (%)</Label>
              <Input
                id="max-slippage"
                type="number"
                min="0"
                step="0.1"
                max="10"
                value={botState.strategyConfig.sniping.maxSlippagePercentage}
                onChange={(e) => handleSnipingChange('maxSlippagePercentage', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gas-multiplier">ضریب گاز</Label>
              <Input
                id="gas-multiplier"
                type="number"
                min="1"
                step="0.1"
                value={botState.strategyConfig.sniping.gasMultiplier}
                onChange={(e) => handleSnipingChange('gasMultiplier', e.target.value)}
                className="bg-crypto-dark-panel text-white border-gray-700"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-approve">تایید خودکار</Label>
              <Switch
                id="auto-approve"
                checked={botState.strategyConfig.sniping.autoApprove}
                onCheckedChange={(checked) => handleSnipingChange('autoApprove', checked)}
              />
            </div>
            
            <Button 
              onClick={() => handleExecuteStrategy('sniping')}
              className="w-full mt-2"
              disabled={!botState.strategyConfig.sniping.active}
            >
              <Target className="mr-1 h-4 w-4" /> اجرای اسنایپینگ
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
