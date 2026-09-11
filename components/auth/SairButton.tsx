"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SairButton() {
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function handleSignOut() {
    setSaindo(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    // A própria página protegida redireciona pra "/" ao perceber, no
    // servidor, que não há mais sessão — refresh() é o que dispara isso.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={saindo}
      className="rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-paper-200 transition-colors hover:border-brass-600 hover:text-brass-300 disabled:opacity-60"
    >
      {saindo ? "Saindo…" : "Sair"}
    </button>
  );
}
