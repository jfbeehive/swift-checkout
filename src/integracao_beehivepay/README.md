# Integração BeehivePay

Integração completa com a PSP BeehivePay para processamento de pagamentos no Brasil.

## Métodos de Pagamento Suportados

- **PIX** - Pagamento instantâneo com QR Code
- **Boleto Bancário** - Compensação em até 3 dias úteis
- **Cartão de Crédito** - Parcelamento em até 12x com 3D Secure

## Estrutura de Arquivos

```
integracao_beehivepay/
├── index.ts           # Exportação centralizada
├── types.ts           # Definições de tipos TypeScript
├── config.ts          # Configurações e constantes
├── sdk.ts             # Gerenciamento do SDK BeehivePay
├── api.ts             # Cliente da API/Webhook
├── hooks/
│   ├── index.ts
│   ├── useBeehivePaySDK.ts    # Status do SDK
│   └── usePaymentStatus.ts    # Polling de status
├── utils/
│   ├── index.ts
│   ├── validators.ts   # Validação de dados
│   └── formatters.ts   # Formatação de exibição
└── README.md
```

## Configuração

### 1. Variáveis de Ambiente

```env
VITE_BEEHIVE_PUBLIC_KEY=pk_live_xxxxxxxx
```

Para ambiente de teste, use a chave com prefixo `pk_test_`.

### 2. Script do SDK

O SDK é carregado via script no `index.html`:

```html
<script 
  src="https://api.conta.paybeehive.com.br/v1/js" 
  id="beehive-sdk"
></script>
```

## Uso Básico

### Verificar Status do SDK

```tsx
import { useBeehivePaySDK } from '@/integracao_beehivepay';

function PaymentComponent() {
  const { isReady, isLoading, error } = useBeehivePaySDK();

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {error}</p>;
  if (!isReady) return <p>SDK não disponível</p>;

  return <div>Pronto para pagamento</div>;
}
```

### Processar Pagamento com Cartão

```tsx
import { processCardPayment, submitCheckout, toCents } from '@/integracao_beehivepay';

async function handlePayment() {
  // 1. Tokenizar cartão (inclui 3DS automaticamente)
  const token = await processCardPayment({
    cardNumber: '4111111111111111',
    holderName: 'JOAO SILVA',
    expMonth: '12',
    expYear: '25',
    cvv: '123',
    installments: 3,
    amountInCents: toCents(100.00)
  });

  // 2. Enviar checkout
  const response = await submitCheckout({
    amount: toCents(100.00),
    paymentMethod: 'credit',
    cardToken: token,
    installments: 3,
    customer: { ... },
    address: { ... },
    shipping: { ... },
    items: [ ... ],
    subtotal: toCents(100.00),
    discount: 0
  });
}
```

### Monitorar Status de Pagamento

```tsx
import { usePaymentStatus } from '@/integracao_beehivepay';

function PaymentScreen({ transactionId, onSuccess }) {
  usePaymentStatus({
    transactionId,
    onPaid: onSuccess,
    onError: (error) => console.error(error)
  });

  return <div>Aguardando pagamento...</div>;
}
```

## Fluxo de 3D Secure

O 3D Secure é executado automaticamente quando disponível:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│  SDK 3DS    │────▶│   Banco     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │  1. Dados Card    │                   │
       │──────────────────▶│                   │
       │                   │  2. Auth Request  │
       │                   │──────────────────▶│
       │                   │                   │
       │  3. Modal Auth    │◀──────────────────│
       │◀──────────────────│                   │
       │                   │                   │
       │  4. User Auth     │                   │
       │──────────────────▶│  5. Confirm       │
       │                   │──────────────────▶│
       │                   │                   │
       │  6. Token         │◀──────────────────│
       │◀──────────────────│                   │
└──────────────────────────────────────────────────────┘
```

## Validação de Dados

```tsx
import { 
  validateCreditCard, 
  validateCPF, 
  validatePhone,
  detectCardBrand 
} from '@/integracao_beehivepay';

// Validar cartão
const errors = validateCreditCard(cardData);
if (Object.keys(errors).length > 0) {
  // Mostrar erros
}

// Validar CPF
if (!validateCPF('123.456.789-00')) {
  // CPF inválido
}

// Detectar bandeira
const brand = detectCardBrand('4111111111111111'); // 'visa'
```

## Formatação de Dados

```tsx
import { 
  formatCardNumber,
  formatCPF,
  formatPhone,
  formatCurrency,
  generateInstallmentOptions 
} from '@/integracao_beehivepay';

// Formatação de exibição
formatCardNumber('4111111111111111');  // '4111 1111 1111 1111'
formatCPF('12345678900');              // '123.456.789-00'
formatPhone('11999998888');            // '(11) 99999-8888'
formatCurrency(1234.56);               // 'R$ 1.234,56'

// Gerar opções de parcelamento
const options = generateInstallmentOptions(1000);
// [{ value: 1, label: '1x de R$ 1.000,00 (sem juros)', ... }, ...]
```

## Webhook Response

### PIX

```json
{
  "ok": true,
  "status": "waiting_payment",
  "transactionId": "txn_123",
  "qrCodeBase64": "data:image/png;base64,...",
  "copyPaste": "00020126...",
  "secureUrl": "https://..."
}
```

### Boleto

```json
{
  "ok": true,
  "status": "waiting_payment",
  "transactionId": "txn_123",
  "digitableLine": "23793.38128...",
  "pdfUrl": "https://...",
  "barcode": "23793381280000...",
  "secureUrl": "https://..."
}
```

### Cartão de Crédito

```json
{
  "ok": true,
  "status": "paid",
  "transactionId": "txn_123",
  "authorizationCode": "123456",
  "secureUrl": "https://..."
}
```

## Códigos de Erro

| Código | Descrição | Ação Recomendada |
|--------|-----------|------------------|
| `card_declined` | Cartão recusado | Verificar dados ou usar outro cartão |
| `insufficient_funds` | Saldo insuficiente | Usar outro cartão |
| `3ds_failed` | Falha na autenticação 3DS | Tentar novamente |
| `invalid_card` | Cartão inválido | Verificar dados |
| `expired_card` | Cartão expirado | Usar outro cartão |

## Ambiente de Teste

Para usar em modo de teste:

1. Configure a chave pública de teste:
   ```env
   VITE_BEEHIVE_PUBLIC_KEY=pk_test_xxxxxxxx
   ```

2. O SDK detectará automaticamente o modo pelo prefixo da chave.

## Suporte

- Documentação: https://docs.paybeehive.com
- Suporte: suporte@paybeehive.com
