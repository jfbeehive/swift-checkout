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

export interface OrderSummary {
  products: Product[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}
