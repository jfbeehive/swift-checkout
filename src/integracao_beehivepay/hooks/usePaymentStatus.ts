/**
 * BeehivePay Integration - Payment Status Hook
 * 
 * Hook React para polling de status de pagamento.
 */

import { useEffect, useCallback, useRef } from 'react';
import { checkTransactionStatus } from '../api';
import { PAYMENT_STATUS_POLL_INTERVAL } from '../config';

interface UsePaymentStatusOptions {
  transactionId?: string;
  enabled?: boolean;
  onPaid?: () => void;
  onError?: (error: Error) => void;
  pollInterval?: number;
}

/**
 * Hook para monitorar status de pagamento via polling
 * 
 * @example
 * ```tsx
 * usePaymentStatus({
 *   transactionId: 'txn_123',
 *   onPaid: () => {
 *     setStep('success');
 *   },
 * });
 * ```
 */
export function usePaymentStatus({
  transactionId,
  enabled = true,
  onPaid,
  onError,
  pollInterval = PAYMENT_STATUS_POLL_INTERVAL,
}: UsePaymentStatusOptions): void {
  const onPaidRef = useRef(onPaid);
  const onErrorRef = useRef(onError);

  // Keep callbacks up to date
  useEffect(() => {
    onPaidRef.current = onPaid;
    onErrorRef.current = onError;
  }, [onPaid, onError]);

  const checkStatus = useCallback(async () => {
    if (!transactionId) return;

    try {
      const data = await checkTransactionStatus(transactionId);
      
      if (data.status === 'paid') {
        onPaidRef.current?.();
        return true; // Stop polling
      }
    } catch (error) {
      console.error('Status poll error:', error);
      onErrorRef.current?.(error instanceof Error ? error : new Error('Unknown error'));
    }
    
    return false; // Continue polling
  }, [transactionId]);

  useEffect(() => {
    if (!transactionId || !enabled) return;

    const pollInterval_ = setInterval(async () => {
      const shouldStop = await checkStatus();
      if (shouldStop) {
        clearInterval(pollInterval_);
      }
    }, pollInterval);

    return () => clearInterval(pollInterval_);
  }, [transactionId, enabled, pollInterval, checkStatus]);
}

export default usePaymentStatus;
