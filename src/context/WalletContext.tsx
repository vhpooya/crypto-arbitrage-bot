
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import { toast } from '@/components/ui/use-toast';

interface WalletContextType {
  accounts: string[]; 
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
  selectedAccount: string | null;
  selectAccount: (address: string) => void;
}

const WalletContext = createContext<WalletContextType>({
  accounts: [],
  provider: null,
  signer: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  error: null,
  selectedAccount: null,
  selectAccount: () => {},
});

export const useWallet = () => useContext(WalletContext);

const providerOptions = {};

// یک مرجع پایدار از web3Modal ایجاد می‌کنیم
let web3ModalInstance: Web3Modal | null = null;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [web3Provider, setWeb3Provider] = useState<any>(null);

  const isConnected = accounts.length > 0;

  // ایجاد web3Modal فقط یکبار در اولین رندر
  useEffect(() => {
    if (typeof window !== 'undefined' && !web3ModalInstance) {
      try {
        web3ModalInstance = new Web3Modal({
          cacheProvider: true,
          providerOptions,
          theme: "dark",
        });
      } catch (err) {
        console.error("Error initializing Web3Modal:", err);
      }
    }
  }, []);
  
  // تابع انتخاب آدرس والت
  const selectAccount = (address: string) => {
    if (accounts.includes(address)) {
      setSelectedAccount(address);
      
      // آپدیت سینگر برای آدرس انتخاب شده
      if (provider) {
        try {
          const newSigner = provider.getSigner(address);
          setSigner(newSigner);
        } catch (err) {
          console.error("Error updating signer with selected account:", err);
        }
      }
    }
  };
  
  const setupListeners = (instance: any) => {
    if (!instance) return;
    
    // حذف event listeners قبلی برای جلوگیری از تکرار
    instance.removeAllListeners?.("accountsChanged");
    instance.removeAllListeners?.("chainChanged");
    instance.removeAllListeners?.("disconnect");
    
    // اضافه کردن event listeners جدید
    instance.on("accountsChanged", async (newAccounts: string[]) => {
      console.log("MetaMask accounts changed:", newAccounts);
      if (newAccounts.length > 0) {
        setAccounts(newAccounts);
        
        // اگر حساب انتخابی در حساب‌های جدید نباشد، حساب اول را انتخاب کنید
        if (!newAccounts.includes(selectedAccount || '')) {
          setSelectedAccount(newAccounts[0]);
        }
        
        // دریافت مجدد provider و signer با آدرس جدید
        if (provider) {
          try {
            const signer = provider.getSigner(selectedAccount || newAccounts[0]);
            setSigner(signer);
          } catch (err) {
            console.error("Error updating signer after accounts changed:", err);
          }
        }
      } else {
        // اگر آرایه حساب‌ها خالی باشد، کاربر احتمالاً قطع شده است
        disconnect();
      }
    });

    instance.on("chainChanged", async (newChainId: string) => {
      console.log("MetaMask chain changed:", newChainId);
      // تبدیل به عدد اگر به صورت hex باشد
      setChainId(parseInt(newChainId, 16));
      
      // دریافت مجدد provider و signer با شبکه جدید
      if (provider && selectedAccount) {
        try {
          const signer = provider.getSigner(selectedAccount);
          setSigner(signer);
        } catch (err) {
          console.error("Error updating signer after chain changed:", err);
        }
      }
    });

    instance.on("disconnect", (error: { code: number; message: string }) => {
      console.log("MetaMask disconnected:", error);
      disconnect();
    });
  };

  const connect = async () => {
    try {
      setError(null);
      
      if (!web3ModalInstance) {
        try {
          web3ModalInstance = new Web3Modal({
            cacheProvider: true,
            providerOptions,
            theme: "dark",
          });
        } catch (err) {
          console.error("Error initializing Web3Modal:", err);
          throw new Error("خطا در راه‌اندازی Web3Modal");
        }
      }
      
      const instance = await web3ModalInstance.connect();
      setWeb3Provider(instance);
      
      try {
        const provider = new ethers.providers.Web3Provider(instance);
        const network = await provider.getNetwork();
        const accounts = await provider.listAccounts();
        
        setProvider(provider);
        setAccounts(accounts);
        
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
          const signer = provider.getSigner(accounts[0]);
          setSigner(signer);
        }
        
        setChainId(network.chainId);

        // تنظیم event listeners
        setupListeners(instance);
      } catch (err) {
        console.error("Error setting up provider or accounts:", err);
        throw new Error("خطا در راه‌اندازی ارتباط با کیف پول");
      }
    } catch (err: any) {
      if (err.message === "User Rejected") {
        setError("اتصال به کیف پول توسط کاربر لغو شد");
      } else {
        setError(err.message || "خطا در اتصال به کیف پول");
      }
      console.error("خطا در اتصال به کیف پول:", err);
      throw err;
    }
  };

  const disconnect = () => {
    if (web3ModalInstance) {
      web3ModalInstance.clearCachedProvider();
    }
    
    // پاک کردن همه eventListeners
    if (web3Provider) {
      web3Provider.removeAllListeners?.("accountsChanged");
      web3Provider.removeAllListeners?.("chainChanged");
      web3Provider.removeAllListeners?.("disconnect");
    }
    
    setWeb3Provider(null);
    setAccounts([]);
    setSelectedAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  };

  // اتصال خودکار با مدیریت خطا بهتر
  useEffect(() => {
    if (web3ModalInstance && web3ModalInstance.cachedProvider) {
      connect().catch(err => {
        console.error("Error auto connecting to wallet:", err);
        // پاک کردن ارائه‌دهنده کش شده اگر اتصال خودکار با خطا مواجه شد
        web3ModalInstance?.clearCachedProvider();
      });
    }
  // فقط یکبار در زمان mount اجرا شود
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WalletContext.Provider
      value={{
        accounts,
        provider,
        signer,
        chainId,
        isConnected,
        connect,
        disconnect,
        error,
        selectedAccount,
        selectAccount
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
