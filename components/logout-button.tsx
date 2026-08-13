"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
      setIsSigningOut(false);
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleSignOut}
      disabled={isSigningOut}
      aria-label="Cerrar sesión"
      title="Cerrar sesión"
    >
      {isSigningOut ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <LogOut className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}
