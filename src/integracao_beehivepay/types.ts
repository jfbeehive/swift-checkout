/**
 * BeehivePay Integration - Type Definitions
 * 
 * Este arquivo contém todas as definições de tipos para a integração
 * com a PSP BeehivePay (PIX, Boleto, Cartão de Crédito).
 */

// ============================================
// TIPOS DE PAGAMENTO
// ============================================

export type PaymentMethod = 'credit' | 'pix' | 'boleto';

// ============================================
// DADOS DO CARTÃO DE CRÉDITO
// ============================================

export interface CreditCardData {
  cardNumber: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: number;
}

export interface CardDataForSDK {
  number: string;
  holderName: string;
  expMonth: number;
  expYear: number;
  cvv: string;
}

// ============================================
// PARÂMETROS 3D SECURE
// ============================================

export interface Authenticate3DSParams {
  amount: number;      // Valor em centavos
  currency: string;    // Ex: "brl"
  installments: number;
  card: CardDataForSDK;
}

// ============================================
// DADOS DE RESPOSTA DE PAGAMENTO
// ============================================

export interface PixPaymentData {
  copyPaste: string;
  qrCodeBase64: string;
}

export interface BoletoPaymentData {
  digitableLine: string;
  pdfUrl: string;
  barcode: string;
}

export interface PaymentResponse {
  ok?: boolean;
  paymentMethod?: PaymentMethod;
  status: 'waiting_payment' | 'paid' | 'refused' | 'error' | 'processing';
  secureUrl: string;
  transactionId?: string;
  
  // Campos Pix (estrutura plana do webhook)
  qrCodeBase64?: string;
  copyPaste?: string;
  
  // Campos Boleto (estrutura plana do webhook)
  digitableLine?: string;
  pdfUrl?: string;
  barcode?: string;
  
  // Campos Cartão de Crédito
  authorizationCode?: string;
  message?: string;
  
  // Estrutura aninhada legada (para compatibilidade)
  pix?: PixPaymentData;
  boleto?: BoletoPaymentData;
}

// ============================================
// DADOS DO CHECKOUT
// ============================================

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;  // Formato: +55DDDNUMERO
  cpf: string;    // Apenas dígitos
}

export interface CheckoutAddress {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface CheckoutShipping {
  id: string;
  name: string;
  price: number;  // Em centavos
  estimatedDays: string;
}

export interface CheckoutItem {
  title: string;
  quantity: number;
  unitPrice: number;  // Em centavos
  tangible: boolean;
}

export interface CheckoutPayload {
  amount: number;           // Valor total em centavos
  paymentMethod: PaymentMethod;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  shipping: CheckoutShipping;
  items: CheckoutItem[];
  subtotal: number;         // Em centavos
  discount: number;         // Em centavos
  metadata?: Record<string, unknown>;
  
  // Campos específicos para cartão de crédito
  cardToken?: string;
  installments?: number;
}

// ============================================
// CONFIGURAÇÃO DO SDK
// ============================================

export interface BeehivePayConfig {
  publicKey: string;
  testMode: boolean;
}

// ============================================
// DECLARAÇÃO GLOBAL DO SDK
// ============================================

declare global {
  interface Window {
    BeehivePay?: {
      setPublicKey: (key: string) => void;
      setTestMode: (enabled: boolean) => void;
      is3DSAvailable: () => Promise<boolean>;
      authenticate3DS: (params: Authenticate3DSParams) => Promise<void>;
      encrypt: (cardData: CardDataForSDK) => Promise<string>;
    };
  }
}

export {};
