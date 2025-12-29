import { CheckCircle2, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  onNewOrder?: () => void;
}

export function SuccessScreen({ onNewOrder }: SuccessScreenProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-8 md:p-12 max-w-lg mx-auto text-center">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
          <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold text-foreground mb-3">
        Pagamento confirmado!
      </h2>
      
      <p className="text-muted-foreground mb-8">
        Seu pedido foi processado com sucesso. Você receberá um email com os detalhes e atualizações sobre a entrega.
      </p>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-8">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Confira sua caixa de entrada para o comprovante</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={onNewOrder} className="w-full gap-2">
          <Home className="h-4 w-4" />
          Voltar ao início
        </Button>
      </div>
    </div>
  );
}
