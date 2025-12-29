import { useState, useCallback, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { PersonalDataForm } from "@/components/checkout/PersonalDataForm";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ShippingForm } from "@/components/checkout/ShippingForm";
import { PaymentForm } from "@/components/checkout/PaymentForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { OrderBump } from "@/components/checkout/OrderBump";
import { MobileOrderSummary } from "@/components/checkout/MobileOrderSummary";
import { PaymentScreen } from "@/components/checkout/PaymentScreen";
import { SuccessScreen } from "@/components/checkout/SuccessScreen";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type {
  CustomerData,
  AddressData,
  PaymentMethod,
  Product,
  ShippingOption,
  CheckoutStep,
  PaymentResponse,
  CreditCardData,
} from "@/types/checkout";

// Sample data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Tênis Running Pro Max",
    price: 249.9,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    quantity: 1,
  },
  {
    id: "2",
    name: "Mochila Esportiva Urban",
    price: 5.9,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    quantity: 1,
  },
];

const bumpProducts: Product[] = [
  {
    id: "bump-1",
    name: "Meias Performance Pack (3 pares)",
    price: 29.9,
    originalPrice: 49.9,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=200&h=200&fit=crop",
    quantity: 1,
  },
  {
    id: "bump-2",
    name: "Garrafa Térmica 750ml",
    price: 39.9,
    originalPrice: 59.9,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200&h=200&fit=crop",
    quantity: 1,
  },
  {
    id: "bump-3",
    name: "Protetor Solar Esportivo FPS 70",
    price: 34.9,
    originalPrice: 54.9,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
    quantity: 1,
  },
];

const shippingOptions: ShippingOption[] = [
  { id: "express", name: "Expresso", price: 24.9, estimatedDays: "1-2 dias úteis" },
  { id: "standard", name: "Padrão", price: 14.9, estimatedDays: "3-5 dias úteis" },
  { id: "economic", name: "Econômico", price: 0, estimatedDays: "7-10 dias úteis" },
];

export default function Index() {
  const { toast } = useToast();

  // Step state machine
  const [step, setStep] = useState<CheckoutStep>("checkout");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentResponse | null>(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Debug BeehivePay SDK loading
  useEffect(() => {
    const checkSdk = () => {
      const isReady = !!window.BeehivePay;
      console.log("BeehivePay SDK status:", isReady);
      if (isReady) {
        setSdkReady(true);
      }
    };

    // Check immediately
    checkSdk();

    // Check again after delays (script might be loading)
    const t1 = setTimeout(checkSdk, 1000);
    const t2 = setTimeout(checkSdk, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Products state
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Form states
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  });

  const [addressData, setAddressData] = useState<AddressData>({
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [selectedShipping, setSelectedShipping] = useState<string>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pix");

  // Credit card state
  const [creditCardData, setCreditCardData] = useState<CreditCardData>({
    cardNumber: "",
    holderName: "",
    expMonth: "",
    expYear: "",
    cvv: "",
    installments: 1,
  });

  // Errors state
  const [customerErrors, setCustomerErrors] = useState<Partial<Record<keyof CustomerData, string>>>({});
  const [addressErrors, setAddressErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [creditCardErrors, setCreditCardErrors] = useState<Partial<Record<keyof CreditCardData, string>>>({});

  // Calculations
  const subtotal = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shippingCost = shippingOptions.find((s) => s.id === selectedShipping)?.price || 0;
  const discount = paymentMethod === "pix" ? subtotal * 0.05 : 0;
  const total = subtotal + shippingCost - discount;

  // Handlers
  const handleCustomerChange = useCallback((field: keyof CustomerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
    setCustomerErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleAddressChange = useCallback((field: keyof AddressData, value: string) => {
    setAddressData((prev) => ({ ...prev, [field]: value }));
    setAddressErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const handleCreditCardChange = useCallback((data: CreditCardData) => {
    setCreditCardData(data);
    setCreditCardErrors({});
  }, []);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p)),
    );
  }, []);

  const handleRemoveProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const handleAddBumpProduct = useCallback(
    (product: Product) => {
      setProducts((prev) => {
        const existing = prev.find((p) => p.id === product.id);
        if (existing) {
          return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p));
        }
        return [...prev, product];
      });
      toast({
        title: "Produto adicionado!",
        description: `${product.name} foi adicionado ao seu pedido.`,
      });
    },
    [toast],
  );

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
    if (!customerData.phone.trim() || customerData.phone.replace(/\D/g, "").length < 10) {
      newCustomerErrors.phone = "Telefone inválido";
      isValid = false;
    }
    if (!customerData.cpf.trim() || customerData.cpf.replace(/\D/g, "").length !== 11) {
      newCustomerErrors.cpf = "CPF inválido";
      isValid = false;
    }

    // Address validation
    if (!addressData.cep.trim() || addressData.cep.replace(/\D/g, "").length !== 8) {
      newAddressErrors.cep = "CEP inválido";
      isValid = false;
    }
    if (!addressData.address.trim()) {
      newAddressErrors.address = "Endereço é obrigatório";
      isValid = false;
    }
    if (!addressData.city.trim()) {
      newAddressErrors.city = "Cidade é obrigatória";
      isValid = false;
    }
    if (!addressData.state.trim() || addressData.state.length !== 2) {
      newAddressErrors.state = "Estado inválido";
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

  const validateCreditCard = (): boolean => {
    let isValid = true;
    const errors: Partial<Record<keyof CreditCardData, string>> = {};

    if (!creditCardData.cardNumber || creditCardData.cardNumber.length < 13) {
      errors.cardNumber = "Número do cartão inválido";
      isValid = false;
    }
    if (!creditCardData.holderName.trim()) {
      errors.holderName = "Nome no cartão é obrigatório";
      isValid = false;
    }
    if (!creditCardData.expMonth || parseInt(creditCardData.expMonth) < 1 || parseInt(creditCardData.expMonth) > 12) {
      errors.expMonth = "Mês inválido";
      isValid = false;
    }
    if (!creditCardData.expYear || creditCardData.expYear.length !== 2) {
      errors.expYear = "Ano inválido";
      isValid = false;
    }
    if (!creditCardData.cvv || creditCardData.cvv.length < 3) {
      errors.cvv = "CVV inválido";
      isValid = false;
    }

    setCreditCardErrors(errors);
    return isValid;
  };

  const tokenizeCard = async (): Promise<string | null> => {
    if (!window.BeehivePay) {
      toast({
        title: "Erro",
        description: "SDK de pagamento não disponível. Recarregue a página.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // Configure SDK with production key
      const beehivePublicKey = import.meta.env.VITE_BEEHIVE_PUBLIC_KEY;
      
      if (!beehivePublicKey) {
        toast({
          title: "Erro de configuração",
          description: "Chave do BeehivePay não configurada.",
          variant: "destructive",
        });
        return null;
      }
      
      window.BeehivePay.setPublicKey(beehivePublicKey);
      window.BeehivePay.setTestMode(false);

      // Prepare card data
      const card = {
        number: creditCardData.cardNumber.replace(/\s/g, ""),
        holderName: creditCardData.holderName,
        expMonth: parseInt(creditCardData.expMonth, 10),
        expYear: parseInt(`20${creditCardData.expYear}`, 10),
        cvv: creditCardData.cvv,
      };

      // Check if 3DS is available
      const is3DSAvailable = await window.BeehivePay.is3DSAvailable();
      console.log("3DS disponível:", is3DSAvailable);

      // If 3DS is enabled, perform authentication
      if (is3DSAvailable) {
        console.log("Iniciando autenticação 3DS...");
        
        // Calculate total amount in cents
        const selectedShippingOption = shippingOptions.find(s => s.id === selectedShipping);
        const shippingPrice = selectedShippingOption?.price || 0;
        const amountInCents = Math.round((subtotal + shippingPrice - discount) * 100);
        
        await window.BeehivePay.authenticate3DS({
          amount: amountInCents,
          currency: "brl",
          installments: creditCardData.installments,
          card,
        });
        
        console.log("Autenticação 3DS concluída com sucesso");
      }

      // Tokenize after authentication (or directly if 3DS not available)
      const token = await window.BeehivePay.encrypt(card);
      console.log("Token gerado com sucesso");

      return token;
    } catch (error) {
      console.error("Erro no processo de pagamento:", error);
      
      // Specific message for 3DS failure
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      if (errorMessage.toLowerCase().includes("3ds") || errorMessage.toLowerCase().includes("autenticação")) {
        toast({
          title: "Falha na autenticação",
          description: "A autenticação 3D Secure falhou. Por favor, tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao processar cartão",
          description: "Verifique os dados do cartão e tente novamente.",
          variant: "destructive",
        });
      }
      
      return null;
    }
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Validate credit card if selected
    if (paymentMethod === "credit" && !validateCreditCard()) {
      toast({
        title: "Erro no cartão",
        description: "Por favor, verifique os dados do cartão.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Prepare checkout data in the required format
      const selectedShippingOption = shippingOptions.find((s) => s.id === selectedShipping);
      
      let cardToken: string | undefined;
      
      // Tokenize card if credit payment
      if (paymentMethod === "credit") {
        const token = await tokenizeCard();
        if (!token) {
          setIsProcessing(false);
          return;
        }
        cardToken = token;
      }

      const checkoutData: Record<string, unknown> = {
        amount: Math.round(total * 100), // Convert to cents
        paymentMethod: paymentMethod,
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: `+55${customerData.phone.replace(/\D/g, "")}`,
          cpf: customerData.cpf.replace(/\D/g, ""),
        },
        address: {
          cep: addressData.cep.replace(/\D/g, ""),
          street: addressData.address,
          number: addressData.number,
          complement: addressData.complement || "",
          neighborhood: addressData.neighborhood || "",
          city: addressData.city,
          state: addressData.state,
        },
        shipping: {
          id: selectedShipping,
          name: selectedShippingOption?.name || "",
          price: Math.round((selectedShippingOption?.price || 0) * 100),
          estimatedDays: selectedShippingOption?.estimatedDays || "",
        },
        items: products.map((p) => ({
          title: p.name,
          quantity: p.quantity,
          unitPrice: Math.round(p.price * 100),
          tangible: true,
        })),
        subtotal: Math.round(subtotal * 100),
        discount: Math.round(discount * 100),
        metadata: { source: "lovable" },
      };

      // Add credit card specific fields
      if (paymentMethod === "credit" && cardToken) {
        checkoutData.cardToken = cardToken;
        checkoutData.installments = creditCardData.installments;
      }

      // Send to webhook
      const response = await fetch("https://integration.paybeehive.cloud/webhook/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!response.ok) {
        throw new Error("Falha ao processar checkout");
      }

      let data: PaymentResponse;
      try {
        const rawData = await response.json();
        // Handle array response from webhook
        data = Array.isArray(rawData) ? rawData[0] : rawData;
      } catch {
        throw new Error("Resposta inválida do servidor");
      }

      // Validate response has required fields
      if (!data.ok && !data.status && !data.secureUrl) {
        throw new Error("Resposta inválida do servidor");
      }

      // Normalize pix data (webhook returns flat structure)
      if (paymentMethod === "pix" && (data.qrCodeBase64 || data.copyPaste)) {
        data.pix = {
          qrCodeBase64: data.qrCodeBase64 || "",
          copyPaste: data.copyPaste || "",
        };
        data.status = data.status || "waiting_payment";
        data.secureUrl = data.secureUrl || "";
      }

      // Normalize boleto data
      if (paymentMethod === "boleto" && data.digitableLine) {
        data.boleto = {
          digitableLine: data.digitableLine,
          pdfUrl: data.pdfUrl || data.secureUrl || "",
          barcode: data.barcode || "",
        };
        data.status = data.status || "waiting_payment";
        data.secureUrl = data.secureUrl || "";
      }

      // Handle credit card response
      if (paymentMethod === "credit") {
        data.paymentMethod = "credit";
        // Credit card payments can be immediately paid, refused, or processing
        if (data.status === "paid") {
          setPaymentData(data);
          setStep("success");
          return;
        } else if (data.status === "refused") {
          throw new Error(data.message || "Pagamento recusado. Verifique os dados do cartão.");
        }
        // For processing status, show payment screen
      }

      // Final validation for pix/boleto
      if (paymentMethod === "pix" && !data.pix?.qrCodeBase64) {
        throw new Error("Dados do Pix não encontrados");
      }

      if (paymentMethod === "boleto" && !data.boleto?.digitableLine) {
        throw new Error("Dados do boleto não encontrados");
      }

      setPaymentData(data);
      setStep("payment");
    } catch (error) {
      console.error("Checkout error:", error);
      setError(error instanceof Error ? error.message : "Erro ao processar pedido");
      toast({
        title: "Erro ao processar pedido",
        description: error instanceof Error ? error.message : "Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    setStep("checkout");
    setError(null);
  };

  const handlePaymentConfirmed = () => {
    setStep("success");
  };

  const handleNewOrder = () => {
    setStep("checkout");
    setPaymentData(null);
    setError(null);
    setProducts(initialProducts);
    setCustomerData({ name: "", email: "", phone: "", cpf: "" });
    setAddressData({ cep: "", address: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
    setCreditCardData({ cardNumber: "", holderName: "", expMonth: "", expYear: "", cvv: "", installments: 1 });
    setSelectedShipping("standard");
    setPaymentMethod("pix");
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
      <OrderBump products={bumpProducts} onAddToCart={handleAddBumpProduct} />
    </>
  );

  // Render based on step
  if (step === "payment" && paymentData) {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <PaymentScreen
            paymentMethod={paymentMethod}
            paymentData={paymentData}
            onBack={handleBack}
            onPaymentConfirmed={handlePaymentConfirmed}
          />
        </main>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background">
        <CheckoutHeader />
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <SuccessScreen onNewOrder={handleNewOrder} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CheckoutHeader />

      {/* Error banner */}
      {error && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-destructive hover:text-destructive"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {/* Mobile order summary */}
      <MobileOrderSummary products={products} total={total}>
        {SummaryContent}
      </MobileOrderSummary>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left column - Form */}
          <div className="flex-1 lg:w-[70%] space-y-6">
            <PersonalDataForm data={customerData} errors={customerErrors} onChange={handleCustomerChange} />
            <AddressForm data={addressData} errors={addressErrors} onChange={handleAddressChange} />
            <ShippingForm options={shippingOptions} selectedId={selectedShipping} onSelect={setSelectedShipping} />
            <PaymentForm 
              selectedMethod={paymentMethod} 
              onMethodChange={setPaymentMethod}
              creditCardData={creditCardData}
              onCreditCardChange={handleCreditCardChange}
              creditCardErrors={creditCardErrors}
              total={total}
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
