import { ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types/checkout";
import { cn } from "@/lib/utils";

interface MobileOrderSummaryProps {
  products: Product[];
  total: number;
  children: React.ReactNode;
}

export function MobileOrderSummary({ products, total, children }: MobileOrderSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="lg:hidden bg-card border-b border-border sticky top-0 z-10">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <span className="font-medium text-foreground">
            {isExpanded ? 'Ocultar resumo' : 'Ver resumo do pedido'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary">{formatPrice(total)}</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <div className={cn(
        "overflow-hidden transition-all duration-300",
        isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="px-4 pb-4">
          {children}
        </div>
      </div>
    </div>
  );
}
