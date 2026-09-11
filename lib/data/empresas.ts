import { createClient } from "@/lib/supabase/server";

export interface EmpresaReal {
  id: string;
  nome: string;
  /** Null até o CNPJ real ser informado — nunca um valor inventado. */
  cnpj: string | null;
}

/**
 * Consulta real no Postgres (Supabase), sempre com o cliente autenticado da
 * própria requisição — nunca uma chave elevada. O isolamento por tenant aqui
 * não é uma checagem em código: é a política de RLS (`empresas_select`) que
 * decide, no banco, quais linhas voltam — um dono só vê a empresa a que está
 * vinculado em `usuarios_empresas`.
 */
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
