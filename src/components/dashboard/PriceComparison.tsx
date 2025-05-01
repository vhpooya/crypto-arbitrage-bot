
import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getExchanges } from '@/services/cryptoApi';

export const PriceComparison: React.FC = () => {
  const { botState } = useArbitrageBot();
  const { arbitrageData } = botState;
  const exchanges = getExchanges();
  
  // Get coin color
  const getCoinColor = (coin: string) => {
    switch (coin) {
      case 'bnb':
        return 'text-crypto-bnb';
      case 'ethereum':
        return 'text-crypto-ethereum';
      case 'solana':
        return 'text-crypto-solana';
      default:
        return 'text-white';
    }
  };
  
  if (arbitrageData.length === 0) {
    return (
      <Card className="bg-crypto-dark-card border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Price Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-gray-400">
            No price data available yet. Start the bot to see price comparisons across exchanges.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Price Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={arbitrageData[0].coin}>
          <TabsList className="mb-4">
            {arbitrageData.map(data => (
              <TabsTrigger key={data.coin} value={data.coin} className={getCoinColor(data.coin)}>
                {data.coin.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {arbitrageData.map(data => (
            <TabsContent key={data.coin} value={data.coin}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-crypto-dark-panel/50">
                      <TableHead>Exchange</TableHead>
                      <TableHead>Price (USD)</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Website</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.exchanges)
                      .sort(([_, a], [__, b]) => {
                        const priceA = (a as any).price || 0;
                        const priceB = (b as any).price || 0;
                        return priceA - priceB;
                      })
                      .map(([exchangeId, priceData]) => {
                        const exchange = exchanges.find(e => e.id === exchangeId);
                        const price = (priceData as any).price || 0;
                        const lastUpdated = (priceData as any).lastUpdated || new Date().toISOString();
                        return (
                          <TableRow key={exchangeId} className="hover:bg-crypto-dark-panel/50">
                            <TableCell>{exchange?.name || exchangeId}</TableCell>
                            <TableCell className="font-mono">
                              ${price.toFixed(6)}
                            </TableCell>
                            <TableCell className="text-sm text-gray-400">
                              {new Date(lastUpdated).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <a 
                                href={exchange?.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm"
                              >
                                Visit
                              </a>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
