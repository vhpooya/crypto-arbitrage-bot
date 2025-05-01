import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExchangeSelector } from './ExchangeSelector';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

export const Settings: React.FC = () => {
  const { botState, updateCoinSettings } = useArbitrageBot();
  
  const [envConfig, setEnvConfig] = React.useState({
    SQL_USER: '',
    SQL_PASSWORD: '',
    SQL_SERVER: '',
    SQL_DATABASE: '',
    PORT: '5000'
  });

  React.useEffect(() => {
    const savedConfig = localStorage.getItem('envConfig');
    if (savedConfig) {
      setEnvConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveEnvConfig = () => {
    localStorage.setItem('envConfig', JSON.stringify(envConfig));
    toast.success('تنظیمات با موفقیت ذخیره شد');
  };

  const handleMaxTradesChange = (coin: string, value: string) => {
    const maxTrades = parseInt(value);
    if (!isNaN(maxTrades) && maxTrades > 0) {
      updateCoinSettings(coin as any, { maxTradesPerDay: maxTrades });
    }
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">تنظیمات ربات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="trade-limits">
          <TabsList className="mb-4">
            <TabsTrigger value="trade-limits">محدودیت معاملات</TabsTrigger>
            <TabsTrigger value="exchanges">صرافی‌ها</TabsTrigger>
            <TabsTrigger value="statistics">آمار</TabsTrigger>
            <TabsTrigger value="env-config">تنظیمات ENV</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade-limits" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">محدودیت معاملات</h3>
              <div className="space-y-4">
                {Object.entries(botState.config.coins).map(([coin, settings]) => (
                  <div key={coin} className="space-y-2">
                    <Label htmlFor={`max-trades-${coin}`} className="text-sm">
                      حداکثر معاملات روزانه {coin.toUpperCase()}
                    </Label>
                    <Input 
                      id={`max-trades-${coin}`} 
                      type="number" 
                      value={settings.maxTradesPerDay} 
                      onChange={(e) => handleMaxTradesChange(coin, e.target.value)}
                      className="bg-crypto-dark-panel border-gray-700 text-white"
                      min={1}
                      max={100}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="exchanges">
            <ExchangeSelector />
          </TabsContent>
          
          <TabsContent value="statistics" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">آمار ربات</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">معاملات موفق</p>
                  <p className="text-xl font-bold">{botState.stats.successfulTrades}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">معاملات ناموفق</p>
                  <p className="text-xl font-bold">{botState.stats.failedTrades}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">سود کل</p>
                  <p className="text-xl font-bold text-crypto-profit">${botState.stats.totalProfit.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">نرخ موفقیت</p>
                  <p className="text-xl font-bold">
                    {botState.stats.successfulTrades + botState.stats.failedTrades > 0
                      ? ((botState.stats.successfulTrades / (botState.stats.successfulTrades + botState.stats.failedTrades)) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
              
              <Separator className="bg-gray-800 my-4" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">پاکسازی داده‌ها</h3>
                <p className="text-sm text-gray-400">
                  پاک کردن تمام تاریخچه معاملات و بازنشانی آمار. این عملیات قابل بازگشت نیست.
                </p>
                <Button variant="destructive">
                  بازنشانی تمام داده‌ها
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="env-config" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">تنظیمات Environment</h3>
              
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sql-user">SQL User</Label>
                  <Input
                    id="sql-user"
                    value={envConfig.SQL_USER}
                    onChange={(e) => setEnvConfig(prev => ({ ...prev, SQL_USER: e.target.value }))}
                    className="bg-crypto-dark-panel border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sql-password">SQL Password</Label>
                  <Input
                    id="sql-password"
                    type="password"
                    value={envConfig.SQL_PASSWORD}
                    onChange={(e) => setEnvConfig(prev => ({ ...prev, SQL_PASSWORD: e.target.value }))}
                    className="bg-crypto-dark-panel border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sql-server">SQL Server</Label>
                  <Input
                    id="sql-server"
                    value={envConfig.SQL_SERVER}
                    onChange={(e) => setEnvConfig(prev => ({ ...prev, SQL_SERVER: e.target.value }))}
                    className="bg-crypto-dark-panel border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sql-database">SQL Database</Label>
                  <Input
                    id="sql-database"
                    value={envConfig.SQL_DATABASE}
                    onChange={(e) => setEnvConfig(prev => ({ ...prev, SQL_DATABASE: e.target.value }))}
                    className="bg-crypto-dark-panel border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    value={envConfig.PORT}
                    onChange={(e) => setEnvConfig(prev => ({ ...prev, PORT: e.target.value }))}
                    className="bg-crypto-dark-panel border-gray-700"
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSaveEnvConfig}
                className="w-full mt-4"
              >
                <SettingsIcon className="mr-2 h-4 w-4" />
                ذخیره تنظیمات
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
