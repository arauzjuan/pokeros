"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type BankrollMovementState = { error?: string };

export async function createBankrollMovement(
  _previousState: BankrollMovementState,
  formData: FormData,
): Promise<BankrollMovementState> {
  const type = String(formData.get("type") ?? "");
  const amount = Number(String(formData.get("amount") ?? "").replace(",", "."));
  const occurredAt = String(formData.get("occurredAt") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (type !== "deposit" && type !== "withdrawal") {
    return { error: "Seleccioná un tipo de movimiento válido." };
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) {
    return { error: "Ingresá un importe mayor que cero." };
  }

  const date = new Date(`${occurredAt}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occurredAt) || Number.isNaN(date.getTime()) || date > new Date()) {
    return { error: "Seleccioná una fecha válida que no esté en el futuro." };
  }
  if (notes.length > 500) return { error: "Las notas no pueden superar los 500 caracteres." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/bankroll");

  const { error } = await supabase.rpc("record_bankroll_movement", {
    p_type: type,
    p_amount: amount,
    p_occurred_at: occurredAt,
    p_notes: notes || null,
  });

  if (error?.message.includes("INSUFFICIENT_BANKROLL")) {
    return { error: "El retiro supera tu bankroll disponible." };
  }
  if (error?.message.includes("ACTIVE_BANKROLL_ACCOUNT_NOT_FOUND")) {
    return { error: "No encontramos una cuenta de bankroll activa." };
  }
  if (error) return { error: "No pudimos registrar el movimiento. Intentá nuevamente." };

  revalidatePath("/bankroll");
  revalidatePath("/dashboard");
  redirect(`/bankroll?created=${type}`);
}
