
import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export const ControlPanel: React.FC = () => {
  const { botState, startBot, stopBot, updateConfig, manualScan } = useArbitrageBot();
  
  const handleAutoTradeChange = (checked: boolean) => {
    updateConfig({ ...botState.config, autoTrade: checked });
  };

  const handleStartBot = () => {
    startBot();
    toast({
      title: "ربات فعال شد",
      description: "ربات آربیتراژ در حال اجرا است و داده‌ها به روزرسانی می‌شوند",
    });
  };

  const handleStopBot = () => {
    stopBot();
    toast({
      title: "ربات متوقف شد",
      description: "ربات آربیتراژ متوقف شده است",
    });
  };

  const handleManualScan = () => {
    manualScan();
    toast({
      title: "اسکن دستی",
      description: "در حال اسکن فرصت‌های آربیتراژ...",
    });
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Control Panel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="bot-status" className="mr-2">Bot Status</Label>
            {botState.isRunning ? (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleStopBot}
                className="w-24"
              >
                <Pause className="mr-1 h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleStartBot}
                className="w-24 bg-crypto-profit hover:bg-crypto-profit/90"
              >
                <Play className="mr-1 h-4 w-4" /> Start
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-trade" className="mr-2">Auto Trading</Label>
            <Switch 
              id="auto-trade" 
              checked={botState.config.autoTrade} 
              onCheckedChange={handleAutoTradeChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="refresh-interval" className="mr-2">
              Refresh Interval: {botState.config.refreshInterval / 1000}s
            </Label>
            <select 
              id="refresh-interval"
              className="bg-crypto-dark-panel text-white border border-gray-700 rounded p-1 text-sm"
              value={botState.config.refreshInterval}
              onChange={(e) => updateConfig({ ...botState.config, refreshInterval: Number(e.target.value) })}
            >
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
            </select>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualScan}
            className="w-full mt-2 border-gray-700"
            disabled={botState.isRunning}
          >
            <RotateCw className="mr-1 h-4 w-4" /> Manual Scan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
