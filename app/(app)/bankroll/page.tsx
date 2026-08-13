import { ArrowDownToLine, ArrowUpFromLine, Landmark, Trophy, Wallet } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";

type TransactionType = "initial" | "tournament_result" | "deposit" | "withdrawal" | "adjustment";

type TransactionRow = {
  id: string;
  transaction_type: TransactionType;
  amount: number | string;
  currency: string;
  occurred_at: string;
  description: string | null;
};

const transactionLabels: Record<TransactionType, string> = {
  initial: "Inicial",
  tournament_result: "Resultado",
  deposit: "Depósito",
  withdrawal: "Retiro",
  adjustment: "Ajuste",
};

function formatMoney(value: number, currency: string, sign = false) {
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Math.abs(value));

  if (value < 0) return `−${formatted}`;
  return sign && value > 0 ? `+${formatted}` : formatted;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function BankrollPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("default_currency").single();
  const currency = profile?.default_currency ?? "USD";

  const [{ data: currentBankroll, error: balanceError }, { data: accounts, error: accountsError }] =
    await Promise.all([
      supabase.rpc("current_bankroll"),
      supabase.from("bankroll_accounts").select("id").eq("currency", currency).eq("is_active", true),
    ]);

  const accountIds = (accounts ?? []).map((account) => account.id);
  const transactionQuery = supabase
    .from("bankroll_transactions")
    .select("id, transaction_type, amount, currency, occurred_at, description")
    .eq("currency", currency)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });

  const { data, error: transactionsError } = accountIds.length
    ? await transactionQuery.in("account_id", accountIds)
    : { data: [], error: null };
  const transactions = (data ?? []) as TransactionRow[];

  const totalFor = (type: TransactionType) =>
    transactions
      .filter((transaction) => transaction.transaction_type === type)
      .reduce((total, transaction) => total + Number(transaction.amount), 0);

  const initial = totalFor("initial");
  const pokerProfit = totalFor("tournament_result");
  const deposits = totalFor("deposit");
  const withdrawals = totalFor("withdrawal");
  const current = Number(currentBankroll ?? 0);
  const hasError = Boolean(balanceError || accountsError || transactionsError);

  const metrics = [
    { label: "Bankroll actual", value: current, icon: Wallet, accent: true },
    { label: "Bankroll inicial", value: initial, icon: Landmark },
    { label: "Profit de póker", value: pokerProfit, icon: Trophy, signed: true },
    { label: "Depósitos", value: deposits, icon: ArrowDownToLine },
    { label: "Retiros", value: Math.abs(withdrawals), icon: ArrowUpFromLine },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Bankroll" subtitle={`Tu capital y movimientos en ${currency}.`} />

      {hasError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>No pudimos cargar todo tu bankroll. Intentá nuevamente.</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(({ label, value, icon: Icon, accent, signed }) => (
          <Card key={label} className={accent ? "border-primary/40 bg-primary/5" : undefined}>
            <CardContent>
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
                <Icon className="size-4" aria-hidden="true" />
              </div>
              <p
                className={`mt-3 font-mono text-2xl font-semibold tabular-nums ${
                  signed && value < 0
                    ? "text-destructive"
                    : signed && value > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : ""
                }`}
              >
                {formatMoney(value, currency, signed)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-semibold">Historial de movimientos</h2>
          <p className="text-sm text-muted-foreground">Cada cambio que compone tu bankroll actual.</p>
        </div>

        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
              <Wallet className="mb-4 size-9 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">Todavía no hay movimientos</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                El bankroll inicial y tus resultados aparecerán aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden py-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead className="pr-6 text-right">Importe</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const amount = Number(transaction.amount);

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="pl-6 text-muted-foreground">
                        {formatDate(transaction.occurred_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{transactionLabels[transaction.transaction_type]}</Badge>
                      </TableCell>
                      <TableCell className="max-w-72 truncate">
                        {transaction.description ?? "Movimiento de bankroll"}
                      </TableCell>
                      <TableCell
                        className={`pr-6 text-right font-mono font-semibold tabular-nums ${
                          amount < 0
                            ? "text-destructive"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatMoney(amount, transaction.currency, true)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
