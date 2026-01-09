/**
 * BeehivePay Integration - SDK Manager
 * 
 * Gerenciamento do SDK BeehivePay para tokenização e 3D Secure.
 */

import type { CardDataForSDK, Authenticate3DSParams, BeehivePayConfig } from './types';
import { getBeehivePublicKey, isTestMode } from './config';

// ============================================
// SDK STATUS
// ============================================

/**
 * Verifica se o SDK está disponível
 */
export function isSDKAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.BeehivePay;
}

/**
 * Aguarda o SDK estar disponível
 */
export function waitForSDK(timeoutMs: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    if (isSDKAvailable()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    const checkInterval = setInterval(() => {
      if (isSDKAvailable()) {
        clearInterval(checkInterval);
        resolve(true);
      } else if (Date.now() - startTime > timeoutMs) {
        clearInterval(checkInterval);
        resolve(false);
      }
    }, 100);
  });
}

// ============================================
// SDK INITIALIZATION
// ============================================

/**
 * Inicializa o SDK com as configurações
 */
export function initializeSDK(config?: Partial<BeehivePayConfig>): void {
  if (!isSDKAvailable()) {
    throw new Error('BeehivePay SDK não está disponível');
  }

  const publicKey = config?.publicKey ?? getBeehivePublicKey();
  const testMode = config?.testMode ?? isTestMode();

  if (!publicKey) {
    throw new Error('Chave pública do BeehivePay não configurada');
  }

  window.BeehivePay!.setPublicKey(publicKey);
  window.BeehivePay!.setTestMode(testMode);
}

// ============================================
// 3D SECURE
// ============================================

/**
 * Verifica se o 3D Secure está disponível
 */
export async function check3DSAvailability(): Promise<boolean> {
  if (!isSDKAvailable()) {
    return false;
  }

  try {
    return await window.BeehivePay!.is3DSAvailable();
  } catch (error) {
    console.error('Erro ao verificar disponibilidade 3DS:', error);
    return false;
  }
}

/**
 * Executa autenticação 3D Secure
 */
export async function authenticate3DS(params: Authenticate3DSParams): Promise<void> {
  if (!isSDKAvailable()) {
    throw new Error('BeehivePay SDK não está disponível');
  }

  console.log('Iniciando autenticação 3DS...');
  
  try {
    await window.BeehivePay!.authenticate3DS(params);
    console.log('Autenticação 3DS concluída com sucesso');
  } catch (error) {
    console.error('Erro na autenticação 3DS:', error);
    throw error;
  }
}

// ============================================
// TOKENIZAÇÃO
// ============================================

/**
 * Tokeniza os dados do cartão
 */
export async function tokenizeCard(cardData: CardDataForSDK): Promise<string> {
  if (!isSDKAvailable()) {
    throw new Error('BeehivePay SDK não está disponível');
  }

  try {
    const token = await window.BeehivePay!.encrypt(cardData);
    console.log('Token gerado com sucesso');
    return token;
  } catch (error) {
    console.error('Erro ao tokenizar cartão:', error);
    throw error;
  }
}

// ============================================
// PROCESSO COMPLETO
// ============================================

export interface ProcessCardPaymentParams {
  cardNumber: string;
  holderName: string;
  expMonth: string;
  expYear: string;
  cvv: string;
  installments: number;
  amountInCents: number;
}

/**
 * Processa pagamento com cartão (3DS + Tokenização)
 * 
 * Executa o fluxo completo:
 * 1. Inicializa o SDK
 * 2. Verifica disponibilidade 3DS
 * 3. Executa autenticação 3DS (se disponível)
 * 4. Tokeniza o cartão
 */
export async function processCardPayment(params: ProcessCardPaymentParams): Promise<string> {
  // 1. Inicializa SDK
  initializeSDK();

  // 2. Prepara dados do cartão
  const card: CardDataForSDK = {
    number: params.cardNumber.replace(/\s/g, ''),
    holderName: params.holderName,
    expMonth: parseInt(params.expMonth, 10),
    expYear: parseInt(`20${params.expYear}`, 10),
    cvv: params.cvv,
  };

  // 3. Verifica e executa 3DS se disponível
  const is3DSAvailable = await check3DSAvailability();
  
  if (is3DSAvailable) {
    await authenticate3DS({
      amount: params.amountInCents,
      currency: 'brl',
      installments: params.installments,
      card,
    });
  }

  // 4. Tokeniza cartão
  const token = await tokenizeCard(card);
  
  return token;
}
