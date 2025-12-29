import { CreditCard, QrCode, FileText, Check } from "lucide-react";
import type { PaymentMethod } from "@/types/checkout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
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

export function PaymentForm({ selectedMethod, onMethodChange }: PaymentFormProps) {
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
        {selectedMethod === 'credit' && <CreditCardForm />}
        {selectedMethod === 'pix' && <PixForm />}
        {selectedMethod === 'boleto' && <BoletoForm />}
      </div>
    </section>
  );
}

function CreditCardForm() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="cardNumber" className="text-sm font-medium">
          Número do cartão
        </Label>
        <Input
          id="cardNumber"
          placeholder="0000 0000 0000 0000"
          maxLength={19}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cardName" className="text-sm font-medium">
          Nome no cartão
        </Label>
        <Input
          id="cardName"
          placeholder="Como está impresso no cartão"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardExpiry" className="text-sm font-medium">
            Validade
          </Label>
          <Input
            id="cardExpiry"
            placeholder="MM/AA"
            maxLength={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cardCvv" className="text-sm font-medium">
            CVV
          </Label>
          <Input
            id="cardCvv"
            placeholder="123"
            maxLength={4}
            type="password"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="installments" className="text-sm font-medium">
          Parcelas
        </Label>
        <select
          id="installments"
          className="flex h-11 w-full rounded-lg border border-input bg-card px-4 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 transition-all duration-200 md:text-sm"
        >
          <option value="1">1x de R$ 299,90 (sem juros)</option>
          <option value="2">2x de R$ 149,95 (sem juros)</option>
          <option value="3">3x de R$ 99,97 (sem juros)</option>
          <option value="6">6x de R$ 54,98 (com juros)</option>
          <option value="12">12x de R$ 29,49 (com juros)</option>
        </select>
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
