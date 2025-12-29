import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, FileText } from "lucide-react";
import type { CustomerData } from "@/types/checkout";

interface PersonalDataFormProps {
  data: CustomerData;
  errors: Partial<Record<keyof CustomerData, string>>;
  onChange: (field: keyof CustomerData, value: string) => void;
}

export function PersonalDataForm({ data, errors, onChange }: PersonalDataFormProps) {
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value.slice(0, 15);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return value.slice(0, 14);
  };

  return (
    <section className="bg-card rounded-lg p-6 shadow-sm animate-fade-in">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <User className="w-5 h-5 text-primary" />
        Dados pessoais
      </h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Nome completo
          </Label>
          <Input
            id="name"
            placeholder="Digite seu nome completo"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            error={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={data.email}
              onChange={(e) => onChange('email', e.target.value)}
              error={!!errors.email}
              className="pl-10"
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={data.phone}
                onChange={(e) => onChange('phone', formatPhone(e.target.value))}
                error={!!errors.phone}
                className="pl-10"
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf" className="text-sm font-medium">
              CPF
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={(e) => onChange('cpf', formatCPF(e.target.value))}
                error={!!errors.cpf}
                className="pl-10"
              />
            </div>
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
