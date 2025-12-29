import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2 } from "lucide-react";
import type { AddressData } from "@/types/checkout";
import { useState } from "react";

interface AddressFormProps {
  data: AddressData;
  errors: Partial<Record<keyof AddressData, string>>;
  onChange: (field: keyof AddressData, value: string) => void;
}

export function AddressForm({ data, errors, onChange }: AddressFormProps) {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value.slice(0, 9);
  };

  const handleCepBlur = async () => {
    const cepNumbers = data.cep.replace(/\D/g, '');
    if (cepNumbers.length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
        const result = await response.json();
        if (!result.erro) {
          onChange('address', result.logradouro || '');
        }
      } catch (error) {
        console.error('Error fetching CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  return (
    <section className="bg-card rounded-lg p-6 shadow-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Endereço de entrega
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cep" className="text-sm font-medium">
            CEP
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="cep"
              placeholder="00000-000"
              value={data.cep}
              onChange={(e) => onChange('cep', formatCEP(e.target.value))}
              onBlur={handleCepBlur}
              error={!!errors.cep}
              className="pl-10"
            />
            {isLoadingCep && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
            )}
          </div>
          {errors.cep && (
            <p className="text-sm text-destructive">{errors.cep}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Endereço
          </Label>
          <Input
            id="address"
            placeholder="Rua, Avenida..."
            value={data.address}
            onChange={(e) => onChange('address', e.target.value)}
            error={!!errors.address}
          />
          {errors.address && (
            <p className="text-sm text-destructive">{errors.address}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="number" className="text-sm font-medium">
              Número
            </Label>
            <Input
              id="number"
              placeholder="123"
              value={data.number}
              onChange={(e) => onChange('number', e.target.value)}
              error={!!errors.number}
            />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement" className="text-sm font-medium">
              Complemento <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="complement"
              placeholder="Apto, Bloco..."
              value={data.complement}
              onChange={(e) => onChange('complement', e.target.value)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
