"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessao, type Role } from "@/lib/session";

export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { sessao, pronto } = useSessao();
  const router = useRouter();

  useEffect(() => {
    if (!pronto) return;
    if (!sessao || sessao.role !== role) router.replace("/");
  }, [pronto, sessao, role, router]);

  if (!pronto || !sessao || sessao.role !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-ink-400">
        Verificando sessão…
      </div>
    );
  }

  return <>{children}</>;
}
