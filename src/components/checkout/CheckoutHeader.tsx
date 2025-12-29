import { Shield, Lock } from "lucide-react";
export function CheckoutHeader() {
  return <header className="gradient-header w-full py-4 px-4 md:px-8 border-secondary-foreground bg-[#143694]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="https://static.paybeehive.cloud/logo.png" alt="Loja do Juanzin" className="h-10 w-auto" />
          <span className="text-primary-foreground font-semibold text-lg hidden sm:block">
            Loja do Juanzin
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-primary-foreground/90">
          <Lock className="w-4 h-4" />
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:block">
            Pagamento 100% seguro
          </span>
          <span className="text-sm font-medium sm:hidden">
            Seguro
          </span>
        </div>
      </div>
    </header>;
}