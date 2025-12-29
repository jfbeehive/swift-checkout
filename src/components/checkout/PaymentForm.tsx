import { CreditCard, QrCode, FileText, Check } from "lucide-react";
import type { PaymentMethod, CreditCardData } from "@/types/checkout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  creditCardData?: CreditCardData;
  onCreditCardChange?: (data: CreditCardData) => void;
  creditCardErrors?: Partial<Record<keyof CreditCardData, string>>;
  total?: number;
}

const paymentMethods = [
  {
    id: 'credit' as PaymentMethod,
    name: 'Cartão de crédito',
    icon: CreditCard,
    description: 'Parcele em até 12x'
  },
  {
    id: 'pix' as PaymentMethod,
    name: 'Pix',
    icon: QrCode,
    description: 'Aprovação imediata'
  },
  {
    id: 'boleto' as PaymentMethod,
    name: 'Boleto',
    icon: FileText,
    description: '3 dias úteis para compensar'
  }
];

export function PaymentForm({ 
  selectedMethod, 
  onMethodChange, 
  creditCardData, 
  onCreditCardChange,
  creditCardErrors,
  total = 0
}: PaymentFormProps) {
  return (
    <section className="bg-card rounded-lg p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        Selecione a forma de pagamento
      </h2>
      
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onMethodChange(method.id)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200",
                selectedMethod === method.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                selectedMethod === method.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}>
                {selectedMethod === method.id && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <Icon className={cn(
                "w-6 h-6 flex-shrink-0",
                selectedMethod === method.id ? "text-primary" : "text-muted-foreground"
              )} />
              <div className="text-left">
                <p className="font-medium text-foreground">{method.name}</p>
                <p className="text-sm text-muted-foreground">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Dynamic payment form based on selected method */}
      <div className="border-t border-border pt-6">
        {selectedMethod === 'credit' && creditCardData && onCreditCardChange && (
          <CreditCardForm 
            data={creditCardData} 
            onChange={onCreditCardChange} 
            errors={creditCardErrors}
            total={total}
          />
        )}
        {selectedMethod === 'pix' && <PixForm />}
        {selectedMethod === 'boleto' && <BoletoForm />}
      </div>
    </section>
  );
}

interface CreditCardFormProps {
  data: CreditCardData;
  onChange: (data: CreditCardData) => void;
  errors?: Partial<Record<keyof CreditCardData, string>>;
  total: number;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

function CreditCardForm({ data, onChange, errors, total }: CreditCardFormProps) {
  const handleChange = (updates: Partial<CreditCardData>) => {
    onChange({ ...data, ...updates });
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Generate installment options
  const installmentOptions = [];
  for (let i = 1; i <= 12; i++) {
    const installmentValue = total / i;
    const hasInterest = i > 3;
    const interestRate = hasInterest ? 0.0199 : 0; // 1.99% per month after 3x
    const totalWithInterest = hasInterest ? total * Math.pow(1 + interestRate, i) : total;
    const installmentWithInterest = totalWithInterest / i;
    
    installmentOptions.push({
      value: i,
      label: `${i}x de ${formatPrice(installmentWithInterest)}${hasInterest ? ' (com juros)' : ' (sem juros)'}`
    });
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-sm font-medium">
          Número do cartão
        </Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          value={formatCardNumber(data.cardNumber)}
          onChange={(e) => handleChange({ cardNumber: e.target.value.replace(/\D/g, "") })}
          maxLength={19}
          className={cn(errors?.cardNumber && "border-destructive")}
        />
        {errors?.cardNumber && (
          <p className="text-sm text-destructive">{errors.cardNumber}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="holderName" className="text-sm font-medium">
          Nome no cartão
        </Label>
        <Input
          id="holderName"
          placeholder="Como está impresso no cartão"
          value={data.holderName}
          onChange={(e) => handleChange({ holderName: e.target.value.toUpperCase() })}
          className={cn(errors?.holderName && "border-destructive")}
        />
        {errors?.holderName && (
          <p className="text-sm text-destructive">{errors.holderName}</p>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardExpiry" className="text-sm font-medium">
            Validade
          </Label>
          <Input
            id="cardExpiry"
            placeholder="MM/AA"
            value={formatExpiry(`${data.expMonth}${data.expYear}`)}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              handleChange({ 
                expMonth: digits.slice(0, 2), 
                expYear: digits.slice(2, 4) 
              });
            }}
            maxLength={5}
            className={cn((errors?.expMonth || errors?.expYear) && "border-destructive")}
          />
          {(errors?.expMonth || errors?.expYear) && (
            <p className="text-sm text-destructive">{errors.expMonth || errors.expYear}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv" className="text-sm font-medium">
            CVV
          </Label>
          <Input
            id="cvv"
            placeholder="123"
            value={data.cvv}
            onChange={(e) => handleChange({ cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
            maxLength={4}
            type="password"
            className={cn(errors?.cvv && "border-destructive")}
          />
          {errors?.cvv && (
            <p className="text-sm text-destructive">{errors.cvv}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="installments" className="text-sm font-medium">
            Parcelas
          </Label>
          <select
            id="installments"
            value={data.installments}
            onChange={(e) => handleChange({ installments: parseInt(e.target.value) })}
            className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all duration-200 md:text-sm"
          >
            {installmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function PixForm() {
  return (
    <div className="space-y-4 animate-fade-in text-center py-4">
      <div className="w-48 h-48 mx-auto bg-muted rounded-lg flex items-center justify-center">
        <QrCode className="w-24 h-24 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">
        O QR Code será gerado após confirmar o pedido
      </p>
      <div className="bg-success/10 text-success rounded-lg p-3 text-sm font-medium">
        5% de desconto no Pix
      </div>
    </div>
  );
}

function BoletoForm() {
  return (
    <div className="space-y-4 animate-fade-in text-center py-4">
      <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
      <p className="text-muted-foreground">
        O boleto será gerado após confirmar o pedido
      </p>
      <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
        Prazo de compensação: 3 dias úteis
      </div>
    </div>
  );
}
