
import React from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export const ArbitrageOpportunities: React.FC = () => {
  const { botState } = useArbitrageBot();
  const { opportunities } = botState;
  
  // Function to get style based on coin type
  const getCoinStyle = (coin: string) => {
    switch (coin) {
      case 'bnb':
        return 'bg-crypto-bnb/10 text-crypto-bnb border-crypto-bnb/30';
      case 'ethereum':
        return 'bg-crypto-ethereum/10 text-crypto-ethereum border-crypto-ethereum/30';
      case 'solana':
        return 'bg-crypto-solana/10 text-crypto-solana border-crypto-solana/30';
      default:
        return 'bg-gray-700/10 text-gray-300 border-gray-700/30';
    }
  };
  
  // Function to determine if opportunity is profitable based on settings
  const isProfitable = (coin: string, percentage: number) => {
    const minProfit = botState.config.coins[coin as keyof typeof botState.config.coins]?.minimumProfitPercentage || 0;
    return percentage >= minProfit;
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Arbitrage Opportunities</CardTitle>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No arbitrage opportunities detected yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-crypto-dark-panel/50">
                  <TableHead>Coin</TableHead>
                  <TableHead>Buy At</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Sell At</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Difference</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opportunities.map((opp, index) => {
                  const isProfit = isProfitable(opp.coin, opp.percentageDifference);
                  
                  return (
                    <TableRow 
                      key={index} 
                      className={`hover:bg-crypto-dark-panel/50 ${isProfit ? 'bg-crypto-profit/5' : ''}`}
                    >
                      <TableCell>
                        <Badge variant="outline" className={getCoinStyle(opp.coin)}>
                          {opp.coin.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{opp.buyExchange}</TableCell>
                      <TableCell>${opp.buyPrice.toFixed(6)}</TableCell>
                      <TableCell>{opp.sellExchange}</TableCell>
                      <TableCell>${opp.sellPrice.toFixed(6)}</TableCell>
                      <TableCell 
                        className={isProfit ? 'text-crypto-profit font-bold' : 'text-gray-400'}
                      >
                        {opp.percentageDifference.toFixed(3)}%
                      </TableCell>
                      <TableCell className={isProfit ? 'text-crypto-profit font-bold' : 'text-gray-400'}>
                        ${opp.netProfit.toFixed(6)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
