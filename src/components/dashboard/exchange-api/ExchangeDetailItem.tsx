
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { getExchangeApiKeys, saveExchangeApiKeys } from '@/services/api/exchangeService';
import { useWallet } from '@/context/WalletContext';

interface ExchangeDetailItemProps {
  exchange: {
    id: string;
    name: string;
    isActive: boolean;
  };
  isServerAvailable: boolean | null;
}

export const ExchangeDetailItem: React.FC<ExchangeDetailItemProps> = ({
  exchange,
  isServerAvailable
}) => {
  const { isConnected } = useWallet();
  const [expanded, setExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleExpand = () => {
    if (!expanded) {
      setExpanded(true);
      loadApiKeys();
    } else {
      setExpanded(false);
    }
  };

  const loadApiKeys = async () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "خطای دسترسی",
        description: "برای مدیریت کلیدهای API، ابتدا کیف پول خود را متصل کنید",
      });
      return;
    }

    setLoading(true);
    
    try {
      const keys = await getExchangeApiKeys(exchange.id);
      
      if (keys) {
        setApiKey(keys.apiKey);
        setApiSecret(keys.apiSecret);
      } else {
        setApiKey('');
        setApiSecret('');
      }
    } catch (error) {
      console.error("خطا در بارگیری کلیدهای API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = async () => {
    if (!isConnected) {
      toast({
        variant: "destructive",
        title: "خطای دسترسی",
        description: "برای ذخیره کلیدهای API، ابتدا کیف پول خود را متصل کنید",
      });
      return;
    }

    if (!apiKey || !apiSecret) {
      toast({
        variant: "destructive",
        title: "خطای ورودی",
        description: "لطفاً هر دو کلید API و رمز مخفی را وارد کنید",
      });
      return;
    }

    setLoading(true);
    
    try {
      const success = await saveExchangeApiKeys(
        exchange.id,
        apiKey,
        apiSecret
      );
      
      if (success) {
        toast({
          title: "ذخیره موفق",
          description: `کلیدهای API برای ${exchange.id} با موفقیت ذخیره شد`,
        });
      }
    } catch (error) {
      console.error("خطا در ذخیره کلیدهای API:", error);
      toast({
        variant: "destructive",
        title: "خطا",
        description: "ذخیره کلیدهای API با مشکل مواجه شد",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleShowSecret = () => {
    setShowSecret(!showSecret);
  };

  return (
    <div className="border border-gray-700 rounded-md overflow-hidden mb-3">
      <div 
        className="flex items-center justify-between p-3 bg-crypto-dark-panel cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center">
          <div className="w-4 h-4 rounded-full bg-gray-600 mr-2 flex-shrink-0">
            <div className={`w-full h-full rounded-full ${exchange.isActive ? 'bg-green-500' : 'bg-gray-600'}`}></div>
          </div>
          <span>{exchange.name}</span>
        </div>
        <span className="text-xs text-gray-400">{expanded ? '▼' : '▶'}</span>
      </div>
      
      {expanded && (
        <div className="p-3 border-t border-gray-700 bg-crypto-dark-card">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`${exchange.id}-api-key`}>کلید API</Label>
              <Input
                id={`${exchange.id}-api-key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="کلید API خود را وارد کنید"
                className="bg-crypto-dark-panel border-gray-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`${exchange.id}-api-secret`}>رمز مخفی API</Label>
              <div className="relative">
                <Input
                  id={`${exchange.id}-api-secret`}
                  type={showSecret ? 'text' : 'password'}
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="رمز مخفی API خود را وارد کنید"
                  className="bg-crypto-dark-panel border-gray-700 pr-10"
                />
                <button
                  type="button"
                  onClick={toggleShowSecret}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={handleSaveApiKeys}
                disabled={loading}
                className="flex-1"
              >
                {loading ? <RefreshCw className="animate-spin h-4 w-4 mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                ذخیره کلیدها
              </Button>
              
              <Button 
                variant="outline" 
                onClick={loadApiKeys}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <Alert variant="default" className="bg-blue-950 border-blue-800 mt-4">
              <AlertTitle>نکات امنیتی</AlertTitle>
              <AlertDescription className="text-xs text-gray-300 mt-2">
                کلیدهای API باید دارای مجوز دسترسی به معاملات باشند. برای امنیت بیشتر، محدودیت IP را در صرافی خود فعال کنید.
                <br />
                {!isServerAvailable ? "در حال حاضر، کلیدها به صورت رمزگذاری شده در مرورگر شما ذخیره می‌شوند." : 
                  "کلیدها به صورت رمزگذاری شده در سرور ذخیره می‌شوند."}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeDetailItem;
