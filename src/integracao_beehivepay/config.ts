/**
 * BeehivePay Integration - Configuration
 * 
 * Configurações e constantes para a integração com BeehivePay.
 */

// ============================================
// ENDPOINTS
// ============================================

/**
 * URL base do webhook para processamento de checkout
 */
export const BEEHIVE_WEBHOOK_URL = 'https://integration.paybeehive.cloud/webhook/checkout';

/**
 * URL para consulta de status de transação
 */
export const BEEHIVE_STATUS_URL = 'https://integration.paybeehive.cloud/webhook/checkout/status';

/**
 * URL do SDK JavaScript
 */
export const BEEHIVE_SDK_URL = 'https://api.conta.paybeehive.com.br/v1/js';

// ============================================
// CONFIGURAÇÕES PADRÃO
// ============================================

/**
 * Intervalo de polling para verificação de status (em ms)
 */
export const PAYMENT_STATUS_POLL_INTERVAL = 5000;

/**
 * Taxa de juros para parcelamento (após 3x)
 */
export const INSTALLMENT_INTEREST_RATE = 0.0199; // 1.99% ao mês

/**
 * Número mínimo de parcelas sem juros
 */
export const INTEREST_FREE_INSTALLMENTS = 3;

/**
 * Número máximo de parcelas
 */
export const MAX_INSTALLMENTS = 12;

/**
 * Desconto para pagamento via PIX (5%)
 */
export const PIX_DISCOUNT_RATE = 0.05;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtém a chave pública do BeehivePay das variáveis de ambiente
 */
export function getBeehivePublicKey(): string | undefined {
  return import.meta.env.VITE_BEEHIVE_PUBLIC_KEY;
}

/**
 * Verifica se está em modo de teste baseado na chave pública
 */
export function isTestMode(): boolean {
  const key = getBeehivePublicKey();
  return key?.startsWith('pk_test_') ?? false;
}

/**
 * Converte valor para centavos
 */
export function toCents(value: number): number {
  return Math.round(value * 100);
}

/**
 * Converte centavos para valor
 */
export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Formata telefone para o padrão da API (+55DDDNUMERO)
 */
export function formatPhoneForAPI(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `+55${digits}`;
}

/**
 * Remove formatação do CPF (apenas dígitos)
 */
export function formatCPFForAPI(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Remove formatação do CEP (apenas dígitos)
 */
export function formatCEPForAPI(cep: string): string {
  return cep.replace(/\D/g, '');
}
