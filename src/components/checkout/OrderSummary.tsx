import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types/checkout";
import { Button } from "@/components/ui/button";

interface OrderSummaryProps {
  products: Product[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  isProcessing: boolean;
  onQuantityChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export function OrderSummary({
  products,
  subtotal,
  shipping,
  discount,
  total,
  isProcessing,
  onQuantityChange,
  onRemove,
  onCheckout
}: OrderSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <section className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <ShoppingBag className="w-5 h-5 text-primary" />
        Resumo do pedido
      </h2>
      
      <div className="space-y-4 mb-6">
        {products.map((product) => (
          <div key={product.id} className="flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
            <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
              <p className="text-primary font-semibold">{formatPrice(product.price)}</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => onQuantityChange(product.id, -1)}
                  disabled={product.quantity <= 1}
                  className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-medium w-6 text-center">{product.quantity}</span>
                <button
                  type="button"
                  onClick={() => onQuantityChange(product.id, 1)}
                  className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(product.id)}
                  className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 py-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Frete</span>
          <span className={shipping === 0 ? "text-success font-medium" : "font-medium"}>
            {shipping === 0 ? "Grátis" : formatPrice(shipping)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desconto</span>
            <span className="text-success font-medium">-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center py-4 border-t border-border mb-4">
        <span className="text-lg font-semibold text-foreground">Total</span>
        <span className="text-2xl font-bold text-pricing-total">{formatPrice(total)}</span>
      </div>

      <Button
        variant="checkout"
        size="xl"
        className="w-full"
        onClick={onCheckout}
        disabled={isProcessing || products.length === 0}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          'Finalizar compra'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center mt-4">
        Ao finalizar, você concorda com os termos de uso
      </p>
    </section>
  );
}
