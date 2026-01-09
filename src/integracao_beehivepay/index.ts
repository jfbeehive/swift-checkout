/**
 * BeehivePay Integration
 * 
 * Integração completa com a PSP BeehivePay para processamento de pagamentos:
 * - PIX (QR Code e Copia e Cola)
 * - Boleto Bancário
 * - Cartão de Crédito (com 3D Secure)
 * 
 * @module integracao_beehivepay
 * 
 * @example
 * ```tsx
 * import { 
 *   processCardPayment, 
 *   submitCheckout,
 *   useBeehivePaySDK,
 *   formatCurrency 
 * } from '@/integracao_beehivepay';
 * 
 * // Verificar status do SDK
 * const { isReady } = useBeehivePaySDK();
 * 
 * // Processar pagamento com cartão
 * const token = await processCardPayment({
 *   cardNumber: '4111111111111111',
 *   holderName: 'JOAO SILVA',
 *   expMonth: '12',
 *   expYear: '25',
 *   cvv: '123',
 *   installments: 3,
 *   amountInCents: 10000
 * });
 * 
 * // Enviar checkout
 * const response = await submitCheckout(checkoutPayload);
 * ```
 */

// Types
export * from './types';

// Configuration
export * from './config';

// SDK Management
export {
  isSDKAvailable,
  waitForSDK,
  initializeSDK,
  check3DSAvailability,
  authenticate3DS,
  tokenizeCard,
  processCardPayment,
  type ProcessCardPaymentParams,
} from './sdk';

// API Client
export {
  submitCheckout,
  checkTransactionStatus,
  normalizePixResponse,
  normalizeBoletoResponse,
  normalizePaymentResponse,
  validateCheckoutResponse,
  validatePixResponse,
  validateBoletoResponse,
} from './api';

// Hooks
export * from './hooks';

// Utils
export * from './utils';
