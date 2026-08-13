import { Wallet } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function BankrollPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bankroll" subtitle="Controlá tu capital y todos sus movimientos." />
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <Wallet className="mb-4 size-10 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Tu bankroll está configurado</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            El detalle de cuentas y movimientos estará disponible en esta sección.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
