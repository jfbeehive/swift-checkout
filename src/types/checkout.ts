export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
}

export interface ShippingOption {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  cpf: string;
}

export interface AddressData {
  cep: string;
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
}

export type PaymentMethod = 'credit' | 'pix' | 'boleto';

export type CheckoutStep = 'checkout' | 'payment' | 'success';

export interface PixPaymentData {
  copyPaste: string;
  qrCodeBase64: string;
}

export interface BoletoPaymentData {
  digitableLine: string;
  pdfUrl: string;
  barcode: string;
}

export interface CreditCardData {
  cardNumber: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: number;
}

export interface PaymentResponse {
  ok?: boolean;
  paymentMethod?: 'pix' | 'boleto' | 'credit';
  status: 'waiting_payment' | 'paid' | 'refused' | 'error' | 'processing';
  secureUrl: string;
  transactionId?: string;
  // Pix fields (flat structure from webhook)
  qrCodeBase64?: string;
  copyPaste?: string;
  // Boleto fields (flat structure from webhook)
  digitableLine?: string;
  pdfUrl?: string;
  barcode?: string;
  // Credit card fields
  authorizationCode?: string;
  message?: string;
  // Legacy nested structure (for backward compatibility)
  pix?: PixPaymentData;
  boleto?: BoletoPaymentData;
}

export interface OrderSummary {
  products: Product[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

// Beehive SDK global type declaration
declare global {
  interface Window {
    Beehive?: {
      createToken: (cardData: {
        card_number: string;
        card_holder_name: string;
        card_expiration_month: string;
        card_expiration_year: string;
        card_cvv: string;
      }) => Promise<{ card_token: string }>;
    };
  }
}
