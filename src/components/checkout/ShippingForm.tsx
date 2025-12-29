import { Truck, Check } from "lucide-react";
import type { ShippingOption } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface ShippingFormProps {
  options: ShippingOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function ShippingForm({ options, selectedId, onSelect }: ShippingFormProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <section className="bg-card rounded-lg p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Truck className="w-5 h-5 text-primary" />
        Escolha a transportadora
      </h2>
      
      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className={cn(
              "w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-200",
              selectedId === option.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                selectedId === option.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground"
              )}>
                {selectedId === option.id && (
                  <Check className="w-3 h-3 text-primary-foreground" />
                )}
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{option.name}</p>
                <p className="text-sm text-muted-foreground">{option.estimatedDays}</p>
              </div>
            </div>
            <span className={cn(
              "font-semibold",
              option.price === 0 ? "text-success" : "text-foreground"
            )}>
              {option.price === 0 ? "Grátis" : formatPrice(option.price)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
