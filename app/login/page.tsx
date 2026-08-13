"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Logo } from "@/components/logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

function translateLoginError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("email not confirmed")
  ) {
    return "El correo o la contraseña son incorrectos, o la cuenta todavía no fue confirmada.";
  }

  if (normalizedMessage.includes("rate limit")) {
    return "Demasiados intentos. Esperá unos minutos y volvé a probar.";
  }

  return "No pudimos iniciar sesión. Intentá nuevamente.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Completá el correo electrónico y la contraseña.");
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (loginError) {
        setError(translateLoginError(loginError.message));
        setIsSubmitting(false);
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("El servicio de autenticación no está disponible. Intentá nuevamente más tarde.");
      setIsSubmitting(false);
    }
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
            <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
            <CardDescription>Ingresá para continuar gestionando tu carrera de póker.</CardDescription>
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
                    autoComplete="current-password"
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
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Iniciando sesión…" : "Iniciar sesión"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ¿Todavía no tenés una cuenta?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Crear cuenta
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
