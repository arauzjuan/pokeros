import Link from "next/link";
import { Plus, Trophy } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const { created } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Torneos" subtitle="Registrá y consultá todos tus resultados.">
        <Button render={<Link href="/tournaments/new" />}>
          <Plus className="size-4" />
          Registrar torneo
        </Button>
      </PageHeader>
      {created === "1" && (
        <Alert role="status">
          <AlertDescription>El resultado se guardó y el bankroll se actualizó correctamente.</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <Trophy className="mb-4 size-10 text-primary" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Todavía no hay torneos registrados</h2>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tu historial aparecerá aquí cuando cargues tu primer resultado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
