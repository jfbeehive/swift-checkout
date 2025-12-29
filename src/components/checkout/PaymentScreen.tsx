import { useState, useEffect } from "react";
import { Copy, ExternalLink, Download, ArrowLeft, QrCode, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { PaymentMethod, PaymentResponse } from "@/types/checkout";

interface PaymentScreenProps {
  paymentMethod: PaymentMethod;
  paymentData: PaymentResponse;
  onBack: () => void;
  onPaymentConfirmed: () => void;
}

export function PaymentScreen({ 
  paymentMethod, 
  paymentData, 
  onBack,
  onPaymentConfirmed 
}: PaymentScreenProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Polling for payment status
  useEffect(() => {
    if (!paymentData.transactionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://integration.paybeehive.cloud/webhook/checkout/status?transactionId=${paymentData.transactionId}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'paid') {
            clearInterval(pollInterval);
            onPaymentConfirmed();
          }
        }
      } catch (error) {
        console.error('Status poll error:', error);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [paymentData.transactionId, onPaymentConfirmed]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copiado!",
        description: "Código copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Por favor, copie manualmente.",
        variant: "destructive"
      });
    }
  };

  const openSecureUrl = () => {
    window.open(paymentData.secureUrl, '_blank');
  };

  if (paymentMethod === 'pix' && paymentData.pix) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <QrCode className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Pague com Pix</h2>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-lg border border-border">
            <img 
              src={paymentData.pix.qrCodeBase64} 
              alt="QR Code Pix" 
              className="w-48 h-48 md:w-56 md:h-56"
            />
          </div>
        </div>

        {/* Copy and Paste */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-foreground">
            Pix Copia e Cola
          </label>
          <textarea
            readOnly
            value={paymentData.pix.copyPaste}
            className="w-full h-24 p-3 text-sm bg-muted border border-border rounded-lg resize-none font-mono"
          />
          <Button 
            onClick={() => handleCopy(paymentData.pix!.copyPaste)}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar código"}
          </Button>
        </div>

        {/* Note */}
        <p className="text-sm text-muted-foreground text-center mb-6">
          Após o pagamento, esta tela será atualizada automaticamente.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={openSecureUrl} className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir link seguro
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  if (paymentMethod === 'boleto' && paymentData.boleto) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 md:p-8 max-w-lg mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Pague com Boleto</h2>
        </div>

        {/* Digitable Line */}
        <div className="space-y-3 mb-6">
          <label className="text-sm font-medium text-foreground">
            Linha digitável
          </label>
          <div className="p-3 bg-muted border border-border rounded-lg">
            <p className="text-sm font-mono break-all text-foreground">
              {paymentData.boleto.digitableLine}
            </p>
          </div>
          <Button 
            onClick={() => handleCopy(paymentData.boleto!.digitableLine)}
            variant="outline"
            className="w-full gap-2"
          >
            {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiado!" : "Copiar linha digitável"}
          </Button>
        </div>

        {/* Note */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <strong>Importante:</strong> O boleto pode levar até 1-2 dias úteis para ser compensado após o pagamento.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => window.open(paymentData.boleto!.pdfUrl, '_blank')} 
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            Baixar boleto (PDF)
          </Button>
          <Button onClick={openSecureUrl} variant="outline" className="w-full gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir link seguro
          </Button>
          <Button variant="ghost" onClick={onBack} className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
