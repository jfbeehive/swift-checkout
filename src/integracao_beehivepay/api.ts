/**
 * BeehivePay Integration - API Client
 * 
 * Funções para comunicação com a API/Webhook do BeehivePay.
 */

import type { 
  CheckoutPayload, 
  PaymentResponse,
  PaymentMethod 
} from './types';
import { 
  BEEHIVE_WEBHOOK_URL, 
  BEEHIVE_STATUS_URL 
} from './config';

// ============================================
// CHECKOUT
// ============================================

/**
 * Envia dados de checkout para o webhook
 */
export async function submitCheckout(payload: CheckoutPayload): Promise<PaymentResponse> {
  const response = await fetch(BEEHIVE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Falha ao processar checkout: ${response.status}`);
  }

  let data: PaymentResponse;
  
  try {
    const rawData = await response.json();
    // Handle array response from webhook
    data = Array.isArray(rawData) ? rawData[0] : rawData;
  } catch {
    throw new Error('Resposta inválida do servidor');
  }

  return data;
}

// ============================================
// STATUS POLLING
// ============================================

/**
 * Consulta status de uma transação
 */
export async function checkTransactionStatus(transactionId: string): Promise<{ status: string }> {
  const response = await fetch(
    `${BEEHIVE_STATUS_URL}?transactionId=${transactionId}`
  );

  if (!response.ok) {
    throw new Error(`Erro ao consultar status: ${response.status}`);
  }

  return response.json();
}

// ============================================
// NORMALIZADORES
// ============================================

/**
 * Normaliza resposta de pagamento PIX
 */
export function normalizePixResponse(data: PaymentResponse): PaymentResponse {
  if (data.qrCodeBase64 || data.copyPaste) {
    return {
      ...data,
      pix: {
        qrCodeBase64: data.qrCodeBase64 || '',
        copyPaste: data.copyPaste || '',
      },
      status: data.status || 'waiting_payment',
      secureUrl: data.secureUrl || '',
    };
  }
  return data;
}

/**
 * Normaliza resposta de pagamento Boleto
 */
export function normalizeBoletoResponse(data: PaymentResponse): PaymentResponse {
  if (data.digitableLine) {
    return {
      ...data,
      boleto: {
        digitableLine: data.digitableLine,
        pdfUrl: data.pdfUrl || data.secureUrl || '',
        barcode: data.barcode || '',
      },
      status: data.status || 'waiting_payment',
      secureUrl: data.secureUrl || '',
    };
  }
  return data;
}

/**
 * Normaliza resposta de pagamento baseada no método
 */
export function normalizePaymentResponse(
  data: PaymentResponse, 
  paymentMethod: PaymentMethod
): PaymentResponse {
  switch (paymentMethod) {
    case 'pix':
      return normalizePixResponse(data);
    case 'boleto':
      return normalizeBoletoResponse(data);
    case 'credit':
      return { ...data, paymentMethod: 'credit' };
    default:
      return data;
  }
}

// ============================================
// VALIDADORES
// ============================================

/**
 * Valida resposta do checkout
 */
export function validateCheckoutResponse(data: PaymentResponse): boolean {
  return !!(data.ok || data.status || data.secureUrl);
}

/**
 * Valida resposta PIX
 */
export function validatePixResponse(data: PaymentResponse): boolean {
  return !!(data.pix?.qrCodeBase64);
}

/**
 * Valida resposta Boleto
 */
export function validateBoletoResponse(data: PaymentResponse): boolean {
  return !!(data.boleto?.digitableLine);
}
