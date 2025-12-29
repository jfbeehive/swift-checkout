import { Gift, Minus, Plus, Check } from "lucide-react";
import type { Product } from "@/types/checkout";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrderBumpProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function OrderBump({ products, onAddToCart }: OrderBumpProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    products.reduce((acc, p) => ({ ...acc, [p.id]: 1 }), {})
  );
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart({
      ...product,
      quantity: quantities[product.id] || 1
    });
    setAddedItems(prev => new Set([...prev, product.id]));
    setTimeout(() => {
      setAddedItems(prev => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
  };

  const calculateDiscount = (originalPrice: number, price: number) => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  return (
    <section className="bg-card rounded-lg p-6 shadow-sm border border-border mt-4">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        Recomendados para você
      </h2>
      
      <div className="space-y-4">
        {products.map((product) => {
          const isAdded = addedItems.has(product.id);
          const discount = product.originalPrice 
            ? calculateDiscount(product.originalPrice, product.price)
            : 0;

          return (
            <div 
              key={product.id} 
              className="flex gap-3 p-3 bg-muted/50 rounded-lg border border-border/50 transition-all hover:border-primary/30"
            >
              <div className="w-20 h-20 bg-card rounded-lg overflow-hidden flex-shrink-0 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
                    -{discount}%
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-primary font-bold">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="text-muted-foreground text-sm line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, -1)}
                      disabled={quantities[product.id] <= 1}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-card disabled:opacity-50 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-6 text-center">
                      {quantities[product.id]}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, 1)}
                      className="w-6 h-6 rounded border border-border flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <Button
                    variant={isAdded ? "success" : "bump"}
                    size="sm"
                    onClick={() => handleAddToCart(product)}
                    disabled={isAdded}
                    className={cn(
                      "ml-auto text-xs",
                      isAdded && "bg-success text-success-foreground"
                    )}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        Adicionado
                      </>
                    ) : (
                      'Adicionar'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
