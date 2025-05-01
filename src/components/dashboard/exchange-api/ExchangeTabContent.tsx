
import React from 'react';
import { ExchangeDetailItem } from './ExchangeDetailItem';

interface ExchangeType {
  id: string;
  name: string;
  isActive: boolean;
}

interface ExchangeTabContentProps {
  exchanges: ExchangeType[];
  isServerAvailable: boolean | null;
}

export const ExchangeTabContent: React.FC<ExchangeTabContentProps> = ({ 
  exchanges,
  isServerAvailable 
}) => {
  return (
    <>
      {exchanges.map(exchange => (
        <ExchangeDetailItem 
          key={exchange.id} 
          exchange={exchange} 
          isServerAvailable={isServerAvailable} 
        />
      ))}
    </>
  );
};

export default ExchangeTabContent;
