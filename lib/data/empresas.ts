import { createClient } from "@/lib/supabase/server";

export interface EmpresaReal {
  id: string;
  nome: string;
  cnpj: string;
}

/**
 * Consultas reais no Postgres (Supabase), sempre com o cliente autenticado
 * da própria requisição — nunca uma chave elevada. O isolamento por tenant
 * aqui não é uma checagem em código: é a política de RLS da migração
 * `core_schema_multi_tenant` que decide, no banco, quais linhas voltam.
 * Um admin vê todas; um cliente só vê a(s) empresa(s) vinculada(s) a ele.
 */

export async function listarEmpresasReal(): Promise<EmpresaReal[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nome, cnpj")
    .order("nome");

  if (error) throw error;
  return data ?? [];
}

export async function getEmpresaRealPorId(empresaId: string): Promise<EmpresaReal | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("empresas")
    .select("id, nome, cnpj")
    .eq("id", empresaId)
    .maybeSingle();

  if (error) throw error;
  return data;
}
