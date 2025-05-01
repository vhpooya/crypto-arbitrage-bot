
import React, { useEffect, useState } from 'react';
import { checkServerHealth, getServerAvailability } from '@/services/api/serverStatus';
import { RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { toast } from '@/components/ui/use-toast';

export const ServerStatusIndicator = () => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkServerStatus = async () => {
    setChecking(true);
    try {
      const online = await checkServerHealth();
      
      // Only show notification if status has changed
      if (isOnline !== online && isOnline !== null) {
        if (online) {
          toast({
            title: "Server Connected",
            description: "Live data will be used for arbitrage operations",
            duration: 3000,
          });
        } else {
          toast({
            variant: "destructive",
            title: "Server Disconnected",
            description: "Simulated data will be used until reconnection",
            duration: 5000,
          });
        }
      }
      
      setIsOnline(online);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking server status:', error);
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkServerStatus();
    
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-full bg-crypto-dark-panel px-3 py-1">
            <div
              className={`h-2 w-2 rounded-full ${
                isOnline === null 
                  ? 'bg-gray-400' 
                  : isOnline 
                    ? 'bg-green-500' 
                    : 'bg-destructive'
              }`}
            />
            <span className="text-xs font-medium">
              {isOnline === null ? 'Checking...' : isOnline ? 'Server Online' : 'Offline Mode'}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                checkServerStatus();
                toast({
                  title: "Checking server status",
                  description: "Attempting to connect to backend server...",
                  duration: 2000,
                });
              }}
              className={`rounded-full p-1 text-gray-400 hover:text-white ${checking ? 'animate-spin' : ''}`}
              disabled={checking}
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {isOnline 
              ? 'Backend server is online. Using real-time data from exchanges.' 
              : 'Server is offline. Using simulated data until connection is restored.'}
          </p>
          {lastChecked && (
            <p className="text-xs text-gray-400">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ServerStatusIndicator;
