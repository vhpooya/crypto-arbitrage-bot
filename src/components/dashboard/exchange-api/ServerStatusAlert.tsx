
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ServerStatusAlertProps {
  isServerAvailable: boolean | null;
}

export const ServerStatusAlert: React.FC<ServerStatusAlertProps> = ({ isServerAvailable }) => {
  if (isServerAvailable !== false) {
    return null;
  }
  
  return (
    <Alert variant="default" className="bg-amber-950 border-amber-800 mb-4">
      <AlertTitle>حالت آفلاین</AlertTitle>
      <AlertDescription>
        سرور در دسترس نیست. کلیدهای API در حافظه محلی مرورگر شما ذخیره می‌شوند.
      </AlertDescription>
    </Alert>
  );
};

export default ServerStatusAlert;
