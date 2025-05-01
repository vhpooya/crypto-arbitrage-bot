
import React, { useState, useEffect } from 'react';
import { useArbitrageBot } from '@/context/ArbitrageBotContext';
import { getExchanges, getIranianExchanges, getInternationalExchanges, updateExchangeStatus } from '@/services/cryptoApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ApiClient } from '@/services/apiClient';

export const ExchangeSelector: React.FC = () => {
  const { botState, updateExchangeSettings } = useArbitrageBot();
  const [activeTab, setActiveTab] = useState('international');
  const [internationalExchanges, setInternationalExchanges] = useState(getInternationalExchanges());
  const [iranianExchanges, setIranianExchanges] = useState(getIranianExchanges());

  // بارگیری وضعیت فعال/غیرفعال صرافی‌ها در هنگام بارگذاری کامپوننت
  useEffect(() => {
    const loadExchangesStatus = async () => {
      try {
        const exchangeSettings = await ApiClient.fetchExchangeSettings();
        if (exchangeSettings) {
          // به‌روزرسانی وضعیت صرافی‌ها با استفاده از داده‌های دریافتی
          updateAllExchangesStatus(exchangeSettings);
        }
      } catch (error) {
        console.error("خطا در بارگیری وضعیت صرافی‌ها:", error);
      }
    };

    loadExchangesStatus();
  }, []);

  // تابع برای به‌روزرسانی وضعیت تمام صرافی‌ها
  const updateAllExchangesStatus = (exchangeSettings: Record<string, boolean>) => {
    const updatedInternational = internationalExchanges.map(exchange => ({
      ...exchange,
      isActive: exchangeSettings[exchange.id] !== undefined ? exchangeSettings[exchange.id] : exchange.isActive
    }));
    
    const updatedIranian = iranianExchanges.map(exchange => ({
      ...exchange,
      isActive: exchangeSettings[exchange.id] !== undefined ? exchangeSettings[exchange.id] : exchange.isActive
    }));
    
    setInternationalExchanges(updatedInternational);
    setIranianExchanges(updatedIranian);
  };

  const handleExchangeToggle = async (exchangeId: string, isActive: boolean) => {
    // به‌روزرسانی وضعیت صرافی در سرویس
    updateExchangeStatus(exchangeId, isActive);
    
    // ذخیره وضعیت در سرور/localStorage
    await ApiClient.saveExchangeSettings(exchangeId, isActive);
    
    // به‌روزرسانی کانتکست بات آربیتراژ
    updateExchangeSettings(exchangeId, isActive);
    
    // به‌روزرسانی state محلی
    if (activeTab === 'international') {
      const updatedExchanges = internationalExchanges.map(exchange => 
        exchange.id === exchangeId ? { ...exchange, isActive } : exchange
      );
      setInternationalExchanges(updatedExchanges);
    } else {
      const updatedExchanges = iranianExchanges.map(exchange => 
        exchange.id === exchangeId ? { ...exchange, isActive } : exchange
      );
      setIranianExchanges(updatedExchanges);
    }
    
    // نمایش پیام به کاربر
    toast({
      title: isActive ? "صرافی فعال شد" : "صرافی غیرفعال شد",
      description: `صرافی ${getExchanges().find(ex => ex.id === exchangeId)?.name} ${isActive ? 'فعال' : 'غیرفعال'} شد.`,
    });
  };

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">انتخاب صرافی‌ها</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-400 mb-4">
            صرافی‌های مورد نظر خود را برای بررسی فرصت‌های آربیتراژ انتخاب کنید.
          </p>
          
          <Tabs defaultValue="international" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="international">صرافی‌های بین‌المللی</TabsTrigger>
              <TabsTrigger value="iranian">صرافی‌های ایرانی</TabsTrigger>
            </TabsList>

            <TabsContent value="international" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internationalExchanges.map((exchange) => (
                  <div key={exchange.id} className="flex items-center justify-between p-3 rounded-lg bg-crypto-dark-panel">
                    <div className="flex flex-col">
                      <Label htmlFor={`exchange-${exchange.id}`} className="text-base font-medium">
                        {exchange.name}
                      </Label>
                      <a 
                        href={exchange.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {exchange.url.replace('https://', '').replace('www.', '').split('/')[0]}
                      </a>
                    </div>
                    <Switch
                      id={`exchange-${exchange.id}`}
                      checked={exchange.isActive}
                      onCheckedChange={(checked) => handleExchangeToggle(exchange.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="iranian" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {iranianExchanges.map((exchange) => (
                  <div key={exchange.id} className="flex items-center justify-between p-3 rounded-lg bg-crypto-dark-panel">
                    <div className="flex flex-col">
                      <Label htmlFor={`exchange-${exchange.id}`} className="text-base font-medium">
                        {exchange.name}
                      </Label>
                      <a 
                        href={exchange.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        {exchange.url.replace('https://', '').replace('www.', '').split('/')[0]}
                      </a>
                    </div>
                    <Switch
                      id={`exchange-${exchange.id}`}
                      checked={exchange.isActive}
                      onCheckedChange={(checked) => handleExchangeToggle(exchange.id, checked)}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};
