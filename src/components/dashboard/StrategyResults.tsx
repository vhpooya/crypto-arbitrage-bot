
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useArbitrageBot } from "@/context/ArbitrageBotContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, DollarSign } from 'lucide-react';

export const StrategyResults: React.FC = () => {
  const { botState } = useArbitrageBot();
  const { mevResults, flashLoanResults, snipingResults } = botState.strategyResults;

  const renderMEVResults = () => {
    if (mevResults.length === 0) {
      return <p className="text-gray-500 text-center my-4">هنوز نتیجه‌ای برای MEV وجود ندارد</p>;
    }

    return (
      <div className="space-y-3">
        {mevResults.map((result, index) => (
          <Card key={index} className="bg-crypto-dark-panel border-gray-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <Badge 
                  variant={result.status === 'completed' ? 'default' : 'destructive'}
                  className={result.status === 'completed' ? 'bg-crypto-profit' : ''}
                >
                  {result.status === 'completed' ? 'موفق' : 'ناموفق'}
                </Badge>
                <span className="text-sm text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">ارزش استخراج شده:</span>
                <span>${result.extractedValue.toFixed(2)}</span>
                
                <span className="text-gray-400">هزینه گاز:</span>
                <span>${result.gasCost.toFixed(2)}</span>
                
                <span className="text-gray-400">سود خالص:</span>
                <span className={result.netProfit > 0 ? 'text-crypto-profit' : ''}>
                  ${result.netProfit.toFixed(2)}
                </span>
              </div>
              
              {result.transactions.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="text-gray-400">تراکنش‌ها:</span>
                  {result.transactions.map((tx, i) => (
                    <div key={i} className="text-blue-400 truncate">{tx}</div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderFlashLoanResults = () => {
    if (flashLoanResults.length === 0) {
      return <p className="text-gray-500 text-center my-4">هنوز نتیجه‌ای برای وام فلش وجود ندارد</p>;
    }

    return (
      <div className="space-y-3">
        {flashLoanResults.map((result, index) => (
          <Card key={index} className="bg-crypto-dark-panel border-gray-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <Badge 
                  variant={result.status === 'completed' ? 'default' : 'destructive'}
                  className={result.status === 'completed' ? 'bg-crypto-profit' : ''}
                >
                  {result.status === 'completed' ? 'موفق' : 'ناموفق'}
                </Badge>
                <span className="text-sm text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">مقدار وام:</span>
                <span>${result.loanAmount.toFixed(2)}</span>
                
                <span className="text-gray-400">پروتکل:</span>
                <span>{result.protocol}</span>
                
                <span className="text-gray-400">کارمزد:</span>
                <span>${result.fee.toFixed(2)}</span>
                
                <span className="text-gray-400">سود:</span>
                <span className={result.profit > 0 ? 'text-crypto-profit' : ''}>
                  ${result.profit.toFixed(2)}
                </span>
              </div>
              
              {result.trades.length > 0 && (
                <div className="mt-2 text-xs">
                  <span className="text-gray-400">معاملات:</span>
                  {result.trades.map((trade, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{trade.exchange} ({trade.type})</span>
                      <span>${trade.price.toFixed(2)} × {trade.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderSnipingResults = () => {
    if (snipingResults.length === 0) {
      return <p className="text-gray-500 text-center my-4">هنوز نتیجه‌ای برای اسنایپینگ وجود ندارد</p>;
    }

    return (
      <div className="space-y-3">
        {snipingResults.map((result, index) => (
          <Card key={index} className="bg-crypto-dark-panel border-gray-700">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-2">
                <Badge 
                  variant={
                    result.status === 'completed' ? 'default' : 
                    result.status === 'holding' ? 'outline' : 'destructive'
                  }
                  className={
                    result.status === 'completed' ? 'bg-crypto-profit' : 
                    result.status === 'holding' ? 'border-yellow-500 text-yellow-500' : ''
                  }
                >
                  {result.status === 'completed' ? 'فروخته شد' : 
                   result.status === 'holding' ? 'در حال نگهداری' : 'ناموفق'}
                </Badge>
                <span className="text-sm text-gray-400">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-400">توکن هدف:</span>
                <span>{result.targetToken}</span>
                
                <span className="text-gray-400">مقدار خرید:</span>
                <span>{result.purchaseAmount.toFixed(4)}</span>
                
                <span className="text-gray-400">قیمت خرید:</span>
                <span>${result.purchasePrice.toFixed(2)}</span>
                
                {result.sellPrice && (
                  <>
                    <span className="text-gray-400">قیمت فروش:</span>
                    <span>${result.sellPrice.toFixed(2)}</span>
                  </>
                )}
                
                {result.profit !== null && (
                  <>
                    <span className="text-gray-400">سود:</span>
                    <span className={result.profit > 0 ? 'text-crypto-profit' : ''}>
                      ${result.profit.toFixed(2)}
                    </span>
                  </>
                )}
                
                {result.timeToSell !== null && (
                  <>
                    <span className="text-gray-400">زمان نگهداری:</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(result.timeToSell / 60)}m {result.timeToSell % 60}s
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <DollarSign className="h-5 w-5 mr-1" />
          نتایج استراتژی‌های معاملاتی
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="mev" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="mev">MEV</TabsTrigger>
            <TabsTrigger value="flashLoan">وام فلش</TabsTrigger>
            <TabsTrigger value="sniping">اسنایپینگ</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[300px]">
            <TabsContent value="mev" className="space-y-3">
              {renderMEVResults()}
            </TabsContent>
            
            <TabsContent value="flashLoan" className="space-y-3">
              {renderFlashLoanResults()}
            </TabsContent>
            
            <TabsContent value="sniping" className="space-y-3">
              {renderSnipingResults()}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
