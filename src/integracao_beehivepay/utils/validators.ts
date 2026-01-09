/**
 * BeehivePay Integration - Validators
 * 
 * Funções de validação para dados de pagamento.
 */

import type { CreditCardData } from '../types';

// ============================================
// CARTÃO DE CRÉDITO
// ============================================

export interface CreditCardValidationErrors {
  cardNumber?: string;
  holderName?: string;
  expMonth?: string;
  expYear?: string;
  cvv?: string;
}

/**
 * Valida dados do cartão de crédito
 */
export function validateCreditCard(data: CreditCardData): CreditCardValidationErrors {
  const errors: CreditCardValidationErrors = {};

  // Número do cartão (13-19 dígitos)
  const cardDigits = data.cardNumber.replace(/\D/g, '');
  if (!cardDigits || cardDigits.length < 13 || cardDigits.length > 19) {
    errors.cardNumber = 'Número do cartão inválido';
  }

  // Nome no cartão
  if (!data.holderName.trim()) {
    errors.holderName = 'Nome no cartão é obrigatório';
  }

  // Mês de validade (01-12)
  const expMonth = parseInt(data.expMonth, 10);
  if (!data.expMonth || expMonth < 1 || expMonth > 12) {
    errors.expMonth = 'Mês inválido';
  }

  // Ano de validade (2 dígitos)
  if (!data.expYear || data.expYear.length !== 2) {
    errors.expYear = 'Ano inválido';
  }

  // CVV (3-4 dígitos)
  const cvvDigits = data.cvv.replace(/\D/g, '');
  if (!cvvDigits || cvvDigits.length < 3 || cvvDigits.length > 4) {
    errors.cvv = 'CVV inválido';
  }

  return errors;
}

/**
 * Verifica se não há erros de validação
 */
export function isCreditCardValid(data: CreditCardData): boolean {
  const errors = validateCreditCard(data);
  return Object.keys(errors).length === 0;
}

// ============================================
// ALGORITMO DE LUHN
// ============================================

/**
 * Valida número de cartão usando algoritmo de Luhn
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  
  if (digits.length < 13) return false;

  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

// ============================================
// DETECÇÃO DE BANDEIRA
// ============================================

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'unknown';

/**
 * Detecta a bandeira do cartão pelo número
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');

  if (!digits) return 'unknown';

  // Visa
  if (/^4/.test(digits)) return 'visa';

  // Mastercard
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';

  // Amex
  if (/^3[47]/.test(digits)) return 'amex';

  // Elo
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(digits)) return 'elo';

  // Hipercard
  if (/^(606282|3841)/.test(digits)) return 'hipercard';

  return 'unknown';
}

// ============================================
// CPF
// ============================================

/**
 * Valida CPF brasileiro
 */
export function validateCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(digits)) return false;

  // Valida dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i], 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i], 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[10], 10)) return false;

  return true;
}

// ============================================
// TELEFONE
// ============================================

/**
 * Valida telefone brasileiro (10-11 dígitos)
 */
export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
}

// ============================================
// CEP
// ============================================

/**
 * Valida CEP brasileiro (8 dígitos)
 */
export function validateCEP(cep: string): boolean {
  const digits = cep.replace(/\D/g, '');
  return digits.length === 8;
}
