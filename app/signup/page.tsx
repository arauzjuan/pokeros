"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";

import { Logo } from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function translateAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("already registered")) {
    return "Ya existe una cuenta con este correo.";
  }

  if (normalizedMessage.includes("password")) {
    return "La contraseña no cumple los requisitos de seguridad.";
  }

  if (normalizedMessage.includes("email")) {
    return "Ingresá un correo electrónico válido.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Demasiados intentos. Esperá unos minutos y volvé a probar.";
  }

  return "No pudimos crear la cuenta. Intentá nuevamente.";
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Ingresá tu correo electrónico.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: signupError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });

    if (signupError) {
      setError(translateAuthError(signupError.message));
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    setConfirmationSent(true);
    setIsSubmitting(false);
  }

  if (confirmationSent) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border/70 shadow-2xl shadow-black/20">
          <CardHeader className="items-center text-center">
            <CheckCircle2 className="mb-3 size-12 text-profit" aria-hidden="true" />
            <CardTitle className="text-2xl">Revisá tu correo</CardTitle>
            <CardDescription>
              Te enviamos un enlace a <strong className="text-foreground">{email.trim()}</strong> para confirmar tu cuenta y continuar con el onboarding.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="secondary" onClick={() => setConfirmationSent(false)}>
              Usar otro correo
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.68_0.16_250/0.12),transparent_38%)]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center" aria-label="Ir al inicio de PokerOS">
          <Logo />
        </Link>

        <Card className="border-border/70 shadow-2xl shadow-black/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Creá tu cuenta</CardTitle>
            <CardDescription>Empezá a gestionar tu carrera de póker con datos claros.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {error && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jugador@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className="pr-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Usá al menos 8 caracteres.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Ya tenés una cuenta?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
