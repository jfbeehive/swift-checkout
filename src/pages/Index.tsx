import { useState, useCallback } from "react";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { PersonalDataForm } from "@/components/checkout/PersonalDataForm";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderBump } from "@/components/checkout/OrderBump";
import { MobileOrderSummary } from "@/components/checkout/MobileOrderSummary";
import { useToast } from "@/hooks/use-toast";
import type { 
  CustomerData, 
  AddressData, 
  PaymentMethod, 
  Product, 
  ShippingOption 
} from "@/types/checkout";

// Sample data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Tênis Running Pro Max",
    price: 249.90,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    quantity: 1
  },
  {
    id: "2",
    name: "Mochila Esportiva Urban",
    price: 89.90,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    quantity: 1
  }
];

const bumpProducts: Product[] = [
  {
    id: "bump-1",
    name: "Meias Performance Pack (3 pares)",
    price: 29.90,
    originalPrice: 49.90,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=200&h=200&fit=crop",
    quantity: 1
  },
  {
    id: "bump-2",
    name: "Garrafa Térmica 750ml",
    price: 39.90,
    originalPrice: 59.90,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop",
    quantity: 1
  },
  {
    id: "bump-3",
    name: "Protetor Solar Esportivo FPS 70",
    price: 34.90,
    originalPrice: 54.90,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
    quantity: 1
  }
];

const shippingOptions: ShippingOption[] = [
  { id: "express", name: "Expresso", price: 24.90, estimatedDays: "1-2 dias úteis" },
  { id: "standard", name: "Padrão", price: 14.90, estimatedDays: "3-5 dias úteis" },
  { id: "economic", name: "Econômico", price: 0, estimatedDays: "7-10 dias úteis" }
];

export default function Index() {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Products state
  const [products, setProducts] = useState<Product[]>(initialProducts);
  
  // Form states
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    cpf: ""
  });
  
  const [addressData, setAddressData] = useState<AddressData>({
    cep: "",
    address: "",
    number: "",
    complement: ""
  });
  
  const [selectedShipping, setSelectedShipping] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  
  // Errors state
  const [customerErrors, setCustomerErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0;
  const discount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shippingCost - discount;

  // Handlers
  const handleCustomerChange = useCallback((field: keyof CustomerData, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    setCustomerErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const handleAddressChange = useCallback((field: keyof AddressData, value: string) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
    setAddressErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, quantity: Math.max(1, p.quantity + delta) }
        : p
    ));
  }, []);

  const handleRemoveProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  const handleAddBumpProduct = useCallback((product: Product) => {
    setProducts(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + product.quantity }
            : p
        );
      }
      return [...prev, product];
    });
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu pedido.`,
    });
  }, [toast]);

  const validateForm = () => {
    let isValid = true;
    const newCustomerErrors: Partial<Record<keyof CustomerData, string>> = {};
    const newAddressErrors: Partial<Record<keyof AddressData, string>> = {};

    // Customer validation
    if (!customerData.name.trim()) {
      newCustomerErrors.name = "Nome é obrigatório";
      isValid = false;
    }
    if (!customerData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newCustomerErrors.email = "Email inválido";
      isValid = false;
    }
    if (!customerData.phone.trim() || customerData.phone.replace(/\D/g, '').length < 10) {
      newCustomerErrors.phone = "Telefone inválido";
      isValid = false;
    }
    if (!customerData.cpf.trim() || customerData.cpf.replace(/\D/g, '').length !== 11) {
      newCustomerErrors.cpf = "CPF inválido";
      isValid = false;
    }

    // Address validation
    if (!addressData.cep.trim() || addressData.cep.replace(/\D/g, '').length !== 8) {
      newAddressErrors.cep = "CEP inválido";
      isValid = false;
    }
    if (!addressData.address.trim()) {
      newAddressErrors.address = "Endereço é obrigatório";
      isValid = false;
    }
    if (!addressData.number.trim()) {
      newAddressErrors.number = "Número é obrigatório";
      isValid = false;
    }

    setCustomerErrors(newCustomerErrors);
    setAddressErrors(newAddressErrors);
    return isValid;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare checkout data
      const checkoutData = {
        customer: customerData,
        address: addressData,
        shipping: {
          optionId: selectedShipping,
          ...shippingOptions.find(s => s.id === selectedShipping)
        },
        payment: {
          method: paymentMethod
        },
        order: {
          products: products,
          subtotal,
          shippingCost,
          discount,
          total
        },
        timestamp: new Date().toISOString()
      };

      // Send to webhook
      const response = await fetch('https://integration.paybeehive.cloud/webhook/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData)
      });

      if (!response.ok) {
        throw new Error('Falha ao processar checkout');
      }

      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá um email com os detalhes do seu pedido.",
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Erro ao processar pedido",
        description: "Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Summary component to reuse in mobile and desktop
  const SummaryContent = (
    <>
      <OrderSummary
        products={products}
        subtotal={subtotal}
        shipping={shippingCost}
        discount={discount}
        total={total}
        isProcessing={isProcessing}
        onQuantityChange={handleQuantityChange}
        onRemove={handleRemoveProduct}
        onCheckout={handleCheckout}
      />
      <OrderBump
        products={bumpProducts}
        onAddToCart={handleAddBumpProduct}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />
      
      {/* Mobile order summary */}
      <MobileOrderSummary products={products} total={total}>
        {SummaryContent}
      </MobileOrderSummary>
      
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column - Form */}
          <div className="flex-1 lg:w-[70%] space-y-6">
            <PersonalDataForm
              data={customerData}
              errors={customerErrors}
              onChange={handleCustomerChange}
            />
            <AddressForm
              data={addressData}
              errors={addressErrors}
              onChange={handleAddressChange}
            />
            <ShippingForm
              options={shippingOptions}
              selectedId={selectedShipping}
              onSelect={setSelectedShipping}
            />
            <PaymentForm
              selectedMethod={paymentMethod}
              onMethodChange={setPaymentMethod}
            />
          </div>
          
          {/* Right column - Summary (desktop only) */}
          <aside className="hidden lg:block lg:w-[30%] space-y-4 lg:sticky lg:top-6 lg:self-start">
            {SummaryContent}
          </aside>
        </div>
      </main>
    </div>
  );
}
