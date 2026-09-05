import { EMPRESAS, getPeriodo, type Empresa } from "./seed";

/**
 * Camada de acesso a dados. Regra inegociável (ver CLAUDE.md): toda consulta
 * exige um `empresaId` explícito — nunca um índice global ou "primeira
 * empresa da lista". Isso vale mesmo havendo hoje uma única empresa mock:
 * o objetivo é que adicionar uma segunda empresa no futuro não exija tocar
 * nesta regra.
 */

/** Uso exclusivo da Visão Admin (lista todas as empresas clientes). */
export function listarEmpresasAdmin(): Empresa[] {
  return EMPRESAS;
}

/** Busca por id explícito. Nunca aceita índice nem retorna "a primeira". */
export function getEmpresaPorId(empresaId: string): Empresa | undefined {
  return EMPRESAS.find((e) => e.id === empresaId);
}

export interface ResumoAdminLinha {
  empresaId: string;
  nome: string;
  resultadoFinal: number;
  emQueda: boolean;
}

/** Uso exclusivo da Visão Admin: um resumo por empresa, para a listagem. */
export function listarResumoAdmin(): ResumoAdminLinha[] {
  return EMPRESAS.map((empresa) => {
    const periodo = getPeriodo(empresa.id);
    const resultadoFinal = periodo?.indicadores.resultadoFinal ?? 0;
    return {
      empresaId: empresa.id,
      nome: empresa.nome,
      resultadoFinal,
      emQueda: resultadoFinal < 0,
    };
  });
}
