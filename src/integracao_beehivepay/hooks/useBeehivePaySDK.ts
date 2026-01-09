/**
 * BeehivePay Integration - SDK Hook
 * 
 * Hook React para gerenciar o status do SDK BeehivePay.
 */

import { useState, useEffect } from 'react';
import { isSDKAvailable, waitForSDK } from '../sdk';

interface UseBeehivePaySDKReturn {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para monitorar o status do SDK BeehivePay
 * 
 * @example
 * ```tsx
 * const { isReady, isLoading, error } = useBeehivePaySDK();
 * 
 * if (isLoading) return <p>Carregando...</p>;
 * if (error) return <p>Erro: {error}</p>;
 * if (!isReady) return <p>SDK não disponível</p>;
 * ```
 */
export function useBeehivePaySDK(): UseBeehivePaySDKReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSDK = async () => {
      // Check immediately
      if (isSDKAvailable()) {
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      // Wait for SDK to load
      const available = await waitForSDK(5000);
      
      if (available) {
        setIsReady(true);
      } else {
        setError('BeehivePay SDK não carregou a tempo');
      }
      
      setIsLoading(false);
    };

    checkSDK();
  }, []);

  return { isReady, isLoading, error };
}

export default useBeehivePaySDK;
