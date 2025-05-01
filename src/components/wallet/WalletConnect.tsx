
import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { ethers } from 'ethers';
import { Wallet, WalletCards, RefreshCcw, UsersRound, AlertCircle } from 'lucide-react';
import { TOKEN_CONTRACTS, ERC20_ABI } from '@/services/cryptoApi';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const WalletConnect: React.FC = () => {
  const { accounts, selectedAccount, selectAccount, isConnected, connect, disconnect, provider, error } = useWallet();
  const { botState } = useArbitrageBot();
  const [balances, setBalances] = useState<{ symbol: string, balance: string, value: number }[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalBalanceUSD, setTotalBalanceUSD] = useState<number>(0);
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});

  const fetchTokenPrices = async () => {
    try {
      const activeCoins = Object.entries(botState.config.coins)
        .filter(([_, c]) => c.activeCoin)
        .map(([coin]) => coin);
      
      const priceMap: Record<string, number> = {};
      
      for (const coin of activeCoins) {
        const tokenConfig = TOKEN_CONTRACTS[coin];
        if (!tokenConfig) continue;
        
        // Try to fetch real prices from CoinGecko API
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
          const data = await response.json();
          
          if (data && data[coin] && data[coin].usd) {
            priceMap[tokenConfig.symbol] = data[coin].usd;
          }
        } catch (err) {
          console.error(`Error fetching ${coin} price:`, err);
          // Fallback default prices if API fails
          switch (coin) {
            case 'ethereum': priceMap[tokenConfig.symbol] = 3500; break;
            case 'bnb': priceMap[tokenConfig.symbol] = 580; break;
            case 'usdt': 
            case 'usdc':
            case 'dai': priceMap[tokenConfig.symbol] = 1; break;
            default: priceMap[tokenConfig.symbol] = 100;
          }
        }
      }
      
      setTokenPrices(priceMap);
      return priceMap;
    } catch (err) {
      console.error('Error fetching token prices:', err);
      return {};
    }
  };

  const fetchBalances = async () => {
    if (isConnected && provider && selectedAccount) {
      setIsRefreshing(true);
      try {
        const activeCoins = Object.entries(botState.config.coins)
          .filter(([_, c]) => c.activeCoin)
          .map(([coin]) => coin);
        
        // Fetch current prices first
        const prices = await fetchTokenPrices();
        
        const results: { symbol: string, balance: string, value: number }[] = [];
        let totalValue = 0;

        for (const coin of activeCoins) {
          try {
            const tokenConfig = TOKEN_CONTRACTS[coin];
            if (!tokenConfig) continue;

            if (coin === 'ethereum' || coin === 'bnb') {
              // Native balance on Ethereum/BSC
              const ethBalance = await provider.getBalance(selectedAccount);
              const formattedBalance = ethers.utils.formatUnits(ethBalance, tokenConfig.decimals);
              const balanceNum = parseFloat(formattedBalance);
              const usdValue = balanceNum * (prices[tokenConfig.symbol] || 0);
              
              results.push({ 
                symbol: tokenConfig.symbol, 
                balance: formattedBalance,
                value: usdValue
              });
              
              totalValue += usdValue;
            } else if (tokenConfig.address) {
              // Standard ERC20 token
              const erc20 = new ethers.Contract(tokenConfig.address, ERC20_ABI, provider);
              const tokenBalance: ethers.BigNumber = await erc20.balanceOf(selectedAccount);
              const formatted = ethers.utils.formatUnits(tokenBalance, tokenConfig.decimals);
              const balanceNum = parseFloat(formatted);
              const usdValue = balanceNum * (prices[tokenConfig.symbol] || 0);
              
              results.push({ 
                symbol: tokenConfig.symbol, 
                balance: formatted,
                value: usdValue
              });
              
              totalValue += usdValue;
            }
          } catch (err: any) {
            console.error(`Error fetching ${coin} balance:`, err);
            results.push({ 
              symbol: TOKEN_CONTRACTS[coin]?.symbol || coin, 
              balance: '0',
              value: 0
            });
          }
        }

        setBalances(results);
        setTotalBalanceUSD(totalValue);
      } catch (err: any) {
        console.error('Error fetching balances:', err);
        toast.error('خطا در دریافت موجودی کیف پول');
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setBalances([]);
      setTotalBalanceUSD(0);
    }
  };

  useEffect(() => {
    fetchBalances();
    // اگر کوین‌ها تغییر کردند هم باید دوباره لود بشه
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, provider, selectedAccount, botState.config.coins]);

  const handleConnect = async () => {
    try {
      await connect();
      toast.success('کیف پول با موفقیت متصل شد');
    } catch (err: any) {
      toast.error(err.message || 'خطا در اتصال به کیف پول');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setBalances([]);
    toast.success('کیف پول قطع شد');
  };

  const handleAccountChange = (address: string) => {
    selectAccount(address);
    toast.success('حساب کاربری تغییر کرد');
    fetchBalances();
  };

  const handleRefreshBalances = () => {
    fetchBalances();
    toast.success('در حال به‌روزرسانی موجودی کیف پول');
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // انتخاب آیکون مناسب براساس توکن
  const getTokenIcon = (symbol: string) => {
    switch (symbol) {
      case 'ETH':
        return <Wallet className="h-4 w-4 text-crypto-ethereum" />;
      case 'BNB':
        return <Wallet className="h-4 w-4 text-crypto-bnb" />;
      case 'USDT':
        return <Wallet className="h-4 w-4 text-green-400" />;
      case 'USDC':
        return <Wallet className="h-4 w-4 text-blue-400" />;
      case 'DAI':
        return <Wallet className="h-4 w-4 text-yellow-400" />;
      default:
        return <Wallet className="h-4 w-4 text-gray-300" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {isConnected ? (
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              {/* نمایش انتخاب حساب کاربری */}
              {accounts.length > 1 && (
                <div className="mb-2 w-full">
                  <Select 
                    value={selectedAccount || ''} 
                    onValueChange={handleAccountChange}
                  >
                    <SelectTrigger className="bg-crypto-dark-card border border-gray-800 text-sm">
                      <div className="flex items-center gap-2">
                        <UsersRound className="h-4 w-4" />
                        <SelectValue placeholder="انتخاب حساب کاربری" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-crypto-dark-card border border-gray-800">
                      {accounts.map((address) => (
                        <SelectItem key={address} value={address} className="text-white">
                          {shortenAddress(address)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex flex-col gap-1">
                {/* نمایش موجودی کل */}
                {totalBalanceUSD > 0 && (
                  <div className="px-4 py-2 bg-crypto-dark-panel border border-gray-700 rounded-md text-sm mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Total Balance:</span>
                      <span className="font-bold">${totalBalanceUSD.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                
                {/* نمایش همه توکن‌های فعال */}
                {balances.length > 0 ? (
                  balances.map((token) => (
                    <div key={token.symbol} className="flex items-center justify-between gap-2 px-4 py-2 bg-crypto-dark-card border border-gray-800 rounded-md text-sm w-full">
                      <div className="flex items-center gap-2">
                        {getTokenIcon(token.symbol)}
                        <span>{parseFloat(token.balance) > 0 ? parseFloat(token.balance).toFixed(4) : '0'} {token.symbol}</span>
                      </div>
                      <span className="text-xs text-gray-400">${token.value.toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <Alert className="bg-crypto-dark-card border-amber-800 text-sm p-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <AlertDescription className="text-xs ml-2">
                      No tokens found in wallet
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {selectedAccount ? shortenAddress(selectedAccount) : 'آدرس کیف پول در دسترس نیست'}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshBalances}
                disabled={isRefreshing}
                className="mt-2"
              >
                <RefreshCcw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                به‌روزرسانی موجودی
              </Button>
            </div>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDisconnect}
            >
              قطع اتصال
            </Button>
          </div>
        </div>
      ) : (
        <Button 
          variant="default"
          className="bg-gradient-to-r from-crypto-bnb to-crypto-ethereum"
          onClick={handleConnect}
        >
          <WalletCards className="h-4 w-4 mr-2" />
          اتصال به کیف پول
        </Button>
      )}
    </div>
  );
};
