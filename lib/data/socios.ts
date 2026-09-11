import { createClient } from "@/lib/supabase/server";

export interface SocioReal {
  id: string;
  nome: string;
  percentual: number;
}

/** Só o dono lê (política socios_select) — participação societária é sensível. */
export async function listarSociosReal(empresaId: string): Promise<SocioReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("socios")
    .select("id, nome, percentual")
    .eq("empresa_id", empresaId)
    .order("percentual", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((s) => ({ ...s, percentual: Number(s.percentual) }));
}
