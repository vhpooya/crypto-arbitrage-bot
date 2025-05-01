
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const ProfitChart: React.FC = () => {
  const { botState } = useArbitrageBot();
  
  // Generate chart data from trades
  const chartData = useMemo(() => {
    // We'll group trades by hour for the chart
    const lastTrades = [...botState.trades]
      .filter(trade => trade.status === 'completed')
      .slice(0, 100); // Take up to last 100 trades
    
    if (lastTrades.length === 0) {
      return [];
    }
    
    // Group by hour
    const tradesByTime = lastTrades.reduce((acc: Record<string, any>, trade) => {
      const date = new Date(trade.timestamp);
      const hourKey = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      if (!acc[hourKey]) {
        acc[hourKey] = {
          time: hourKey,
          profit: 0,
          bnb: 0,
          ethereum: 0,
          solana: 0,
          trades: 0
        };
      }
      
      acc[hourKey].profit += trade.profit;
      acc[hourKey][trade.coin] += trade.profit;
      acc[hourKey].trades += 1;
      
      return acc;
    }, {});
    
    // Convert to array and sort by time
    return Object.values(tradesByTime).sort((a: any, b: any) => 
      a.time.localeCompare(b.time)
    );
  }, [botState.trades]);

  if (chartData.length === 0) {
    return (
      <Card className="bg-crypto-dark-card border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Profit Chart</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-gray-400">
            No trade data available yet. Start the bot and execute trades to see profit analytics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Profit Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="time" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e1e1e', 
                  borderColor: '#333',
                  color: 'white'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#16a34a" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
              <Line type="monotone" dataKey="bnb" stroke="#F3BA2F" />
              <Line type="monotone" dataKey="ethereum" stroke="#627EEA" />
              <Line type="monotone" dataKey="solana" stroke="#00FFA3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
