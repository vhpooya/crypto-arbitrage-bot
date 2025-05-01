
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getIranianExchanges, getInternationalExchanges } from '@/services/cryptoApi';
import { checkServerHealth } from '@/services/api/serverStatus';
import { toast } from "@/components/ui/use-toast";
import { ExchangeTabContent } from './ExchangeTabContent';
import { ServerStatusAlert } from './ServerStatusAlert';

export const ExchangeApiSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('international');
  const internationalExchanges = getInternationalExchanges();
  const iranianExchanges = getIranianExchanges();
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const serverAvailable = await checkServerHealth();
        setIsServerAvailable(serverAvailable);
        
        if (!serverAvailable) {
          console.log("سرور در دسترس نیست، از داده موقت استفاده می‌شود");
          toast({
            title: "اطلاعیه",
            description: "سرور در دسترس نیست. کلیدهای API در حافظه محلی ذخیره خواهند شد.",
          });
        } else {
          console.log("سرور در دسترس است");
          toast({
            title: "اطلاعیه",
            description: "اتصال به سرور برقرار است.",
          });
        }
      } catch (error) {
        setIsServerAvailable(false);
        console.log("خطا در بررسی وضعیت سرور:", error);
      }
    };
    
    checkServerStatus();
  }, []);

  return (
    <Card className="bg-crypto-dark-card border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">تنظیمات API صرافی‌ها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400 mb-4">
          برای استفاده از قابلیت‌های معاملاتی خودکار، کلیدهای API صرافی‌های خود را وارد کنید.
          {!isServerAvailable ? " این کلیدها به صورت رمزنگاری شده در مرورگر شما ذخیره می‌شوند." : 
           " این کلیدها به صورت رمزنگاری شده در سرور ذخیره می‌شوند."}
        </p>

        <ServerStatusAlert isServerAvailable={isServerAvailable} />

        <Tabs defaultValue="international" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="international">صرافی‌های بین‌المللی</TabsTrigger>
            <TabsTrigger value="iranian">صرافی‌های ایرانی</TabsTrigger>
          </TabsList>

          <TabsContent value="international" className="mt-0">
            <ExchangeTabContent 
              exchanges={internationalExchanges}
              isServerAvailable={isServerAvailable}
            />
          </TabsContent>

          <TabsContent value="iranian" className="mt-0">
            <ExchangeTabContent 
              exchanges={iranianExchanges}
              isServerAvailable={isServerAvailable}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExchangeApiSettings;
