import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function NewTournamentPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Registrar torneo" subtitle="Cargá un nuevo resultado en PokerOS." />
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          El formulario de registro se incorpora en el próximo paso del proyecto.
        </CardContent>
      </Card>
    </div>
  );
}
