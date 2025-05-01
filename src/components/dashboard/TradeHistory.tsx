
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

export const TradeHistory: React.FC = () => {
  const { botState } = useArbitrageBot();
  
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
  
  // Function to get status badge style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-crypto-profit/10 text-crypto-profit border-crypto-profit/30';
      case 'failed':
        return 'bg-crypto-loss/10 text-crypto-loss border-crypto-loss/30';
      case 'pending':
        return 'bg-crypto-neutral/10 text-crypto-neutral border-crypto-neutral/30';
      default:
        return 'bg-gray-700/10 text-gray-300 border-gray-700/30';
    }
  };
  
  // Format date and time
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Trade History</CardTitle>
      </CardHeader>
      <CardContent>
        {botState.trades.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            No trade history available yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-crypto-dark-panel/50">
                  <TableHead>Time</TableHead>
                  <TableHead>Coin</TableHead>
                  <TableHead>Buy Exchange</TableHead>
                  <TableHead>Sell Exchange</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {botState.trades.map((trade) => (
                  <TableRow key={trade.id} className="hover:bg-crypto-dark-panel/50">
                    <TableCell className="font-mono">{formatDateTime(trade.timestamp)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCoinStyle(trade.coin)}>
                        {trade.coin.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{trade.buyExchange}</TableCell>
                    <TableCell>{trade.sellExchange}</TableCell>
                    <TableCell>{trade.amount}</TableCell>
                    <TableCell className={trade.profit > 0 ? 'text-crypto-profit' : 'text-crypto-loss'}>
                      ${trade.profit.toFixed(2)} ({trade.profitPercentage.toFixed(2)}%)
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusStyle(trade.status)}>
                        {trade.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
