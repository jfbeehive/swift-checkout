/**
 * BeehivePay Integration - Formatters
 * 
 * Funções de formatação para exibição e entrada de dados.
 */

// ============================================
// CARTÃO DE CRÉDITO
// ============================================

/**
 * Formata número do cartão com espaços (0000 0000 0000 0000)
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Formata validade do cartão (MM/AA)
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Formata CVV (mantém apenas dígitos, max 4)
 */
export function formatCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

// ============================================
// CPF
// ============================================

/**
 * Formata CPF (000.000.000-00)
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// ============================================
// TELEFONE
// ============================================

/**
 * Formata telefone brasileiro ((00) 00000-0000)
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ============================================
// CEP
// ============================================

/**
 * Formata CEP (00000-000)
 */
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  
  if (digits.length <= 5) return digits;
  
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

// ============================================
// VALORES MONETÁRIOS
// ============================================

/**
 * Formata valor em Reais (R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata centavos para exibição
 */
export function formatCentsAsCurrency(cents: number): string {
  return formatCurrency(cents / 100);
}

// ============================================
// PARCELAMENTO
// ============================================

export interface InstallmentOption {
  value: number;
  label: string;
  installmentAmount: number;
  totalAmount: number;
  hasInterest: boolean;
}

/**
 * Gera opções de parcelamento
 */
export function generateInstallmentOptions(
  total: number,
  maxInstallments: number = 12,
  interestFreeInstallments: number = 3,
  interestRate: number = 0.0199
): InstallmentOption[] {
  const options: InstallmentOption[] = [];

  for (let i = 1; i <= maxInstallments; i++) {
    const hasInterest = i > interestFreeInstallments;
    const totalWithInterest = hasInterest 
      ? total * Math.pow(1 + interestRate, i) 
      : total;
    const installmentAmount = totalWithInterest / i;

    options.push({
      value: i,
      label: `${i}x de ${formatCurrency(installmentAmount)}${hasInterest ? ' (com juros)' : ' (sem juros)'}`,
      installmentAmount,
      totalAmount: totalWithInterest,
      hasInterest,
    });
  }

  return options;
}
