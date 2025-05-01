
import React, { useEffect, useState } from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircleDot, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiClient } from '@/services/apiClient';

export const BotStatus: React.FC = () => {
  const { botState } = useArbitrageBot();
  const { stats } = botState;
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);
  
  // Check server status and set a timer to simulate bot execution time
  useEffect(() => {
    const checkServerStatus = async () => {
      const status = await ApiClient.checkServerHealth();
      setIsServerAvailable(status);
    };
    
    checkServerStatus();
    
    // If the bot is running, increment execution time every second
    if (botState.isRunning) {
      const timer = setInterval(() => {
        setExecutionTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setExecutionTime(0);
    }
  }, [botState.isRunning]);
  
  // تبدیل تاریخ آخرین اسکن به فرمت قابل خواندن
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'هنوز اسکن نشده';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fa-IR');
  };
  
  // شمارش فرصت‌های سودآور
  const profitableOpportunities = botState.opportunities.filter(o => o.profitable).length;
  
  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Status</span>
            <div className="flex items-center">
              <span className={`text-lg font-bold ${botState.isRunning ? 'text-crypto-profit' : 'text-crypto-loss'}`}>
                {botState.isRunning ? 'Running' : 'Stopped'}
              </span>
              {botState.isRunning && (
                <CircleDot className="h-4 w-4 ml-1 animate-pulse text-green-500" />
              )}
            </div>
            {isServerAvailable === false && botState.isRunning && (
              <Badge variant="outline" className="text-amber-500 border-amber-500 mt-1 text-xs">Offline Mode</Badge>
            )}
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Total Profit</span>
            <span className="text-lg font-bold text-white">
              ${stats.totalProfit.toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Today's Profit</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-crypto-profit">
                ${stats.profitToday.toFixed(2)}
              </span>
              {stats.profitToday > 0 && <TrendingUp className="h-4 w-4 ml-1 text-crypto-profit" />}
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Trades Today</span>
            <span className="text-lg font-bold text-white">
              {stats.tradesExecutedToday} / {
                Object.values(botState.config.coins)
                  .filter(settings => settings.activeCoin)
                  .reduce((sum, settings) => sum + settings.maxTradesPerDay, 0)
              }
            </span>
          </div>

          {botState.isRunning && (
            <>
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Run Time</span>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span className="text-lg font-bold text-white">
                    {formatTime(executionTime)}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-sm text-gray-400">Last Scan</span>
                <span className="text-lg font-bold text-white">
                  {formatDate(botState.lastScan)}
                </span>
              </div>
              
              <div className="flex flex-col col-span-2">
                <span className="text-sm text-gray-400">Opportunities</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-white">
                    All: {botState.opportunities.length}
                  </Badge>
                  <Badge className="bg-crypto-profit">
                    Profitable: {profitableOpportunities}
                  </Badge>
                </div>
              </div>
            </>
          )}
          
          {isServerAvailable === false && (
            <div className="col-span-4 mt-2">
              <Alert variant="default" className="bg-amber-950/30 border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-xs ml-2">
                  Server connection unavailable. Running in offline mode with simulated data.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
