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

export interface PaymentResponse {
  status: 'waiting_payment' | 'paid' | 'refused' | 'error';
  secureUrl: string;
  transactionId?: string;
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
