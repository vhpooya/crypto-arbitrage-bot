
import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';

export const CoinSelector: React.FC = () => {
  const { botState, updateCoinSettings } = useArbitrageBot();
  const coinSettings = botState.config.coins;

  // Function to get icon and style based on coin type
  const getCoinDetails = (coin: string) => {
    switch (coin) {
      case 'bnb':
        return { 
          label: 'BNB', 
          color: 'text-crypto-bnb',
          icon: '₿' // Using symbol as placeholder
        };
      case 'ethereum':
        return { 
          label: 'Ethereum', 
          color: 'text-crypto-ethereum',
          icon: 'Ξ'
        };
      case 'solana':
        return { 
          label: 'Solana', 
          color: 'text-crypto-solana',
          icon: '◎'
        };
      default:
        return { 
          label: coin, 
          color: 'text-white',
          icon: '○'
        };
    }
  };

  const handleToggleCoin = (coin: string, checked: boolean) => {
    updateCoinSettings(coin as any, { activeCoin: checked });
  };

  const handleMinProfitChange = (coin: string, value: number[]) => {
    updateCoinSettings(coin as any, { minimumProfitPercentage: value[0] });
  };

  const handleTradeAmountChange = (coin: string, value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      updateCoinSettings(coin as any, { tradeAmount: amount });
    }
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Coins Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(coinSettings).map(([coin, settings]) => {
            const { label, color, icon } = getCoinDetails(coin);
            return (
              <div key={coin} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`coin-${coin}`} className={`flex items-center ${color} text-lg font-medium`}>
                    <span className="mr-2">{icon}</span> {label}
                  </Label>
                  <Switch 
                    id={`coin-${coin}`} 
                    checked={settings.activeCoin} 
                    onCheckedChange={(checked) => handleToggleCoin(coin, checked)}
                  />
                </div>
                
                {settings.activeCoin && (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <Label htmlFor={`min-profit-${coin}`} className="text-xs text-gray-400">
                          Min. Profit (%)
                        </Label>
                        <span className="text-xs">{settings.minimumProfitPercentage}%</span>
                      </div>
                      <Slider
                        id={`min-profit-${coin}`}
                        defaultValue={[settings.minimumProfitPercentage]}
                        max={5}
                        step={0.1}
                        onValueChange={(value) => handleMinProfitChange(coin, value)}
                        className="mt-2"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor={`trade-amount-${coin}`} className="text-xs text-gray-400">
                        Trade Amount
                      </Label>
                      <Input 
                        id={`trade-amount-${coin}`} 
                        type="number" 
                        value={settings.tradeAmount} 
                        onChange={(e) => handleTradeAmountChange(coin, e.target.value)}
                        className="bg-crypto-dark-panel border-gray-700 text-white"
                        min={0.01}
                        step={0.01}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
