import { UserRound } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Perfil" subtitle="Administrá tus datos y preferencias de jugador." />
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <UserRound className="mb-4 size-10 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Perfil de jugador</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tus datos de onboarding y preferencias se gestionarán desde aquí.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
