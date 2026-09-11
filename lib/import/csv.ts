import Papa from "papaparse";
import { sugerirCategoria } from "./categorizacao";
import type { Categoria } from "@/data/categorias";

export interface LinhaImportada {
  /** Identificador só de UI, pra edição na tabela de conferência — não é o id do banco. */
  chave: string;
  data: string; // ISO yyyy-mm-dd
  descricao: string;
  categoria: Categoria | null;
  valor: number;
  /** Linha veio com algum campo que não deu pra interpretar com confiança. */
  comErro: boolean;
}

/** Aceita "1.234,56", "1234,56", "1234.56" e valores já negativos. */
function parseValorMonetario(bruto: string): number | null {
  const limpo = bruto.trim().replace(/[^\d,.-]/g, "");
  if (!limpo) return null;

  let normalizado = limpo;
  if (limpo.includes(",") && limpo.includes(".")) {
    // "1.234,56" -> ponto é milhar, vírgula é decimal
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (limpo.includes(",")) {
    normalizado = limpo.replace(",", ".");
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

/** Aceita "DD/MM/AAAA", "DD-MM-AAAA" e ISO "AAAA-MM-DD". */
function parseData(bruto: string): string | null {
  const texto = bruto.trim();

  const isoMatch = texto.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const brMatch = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (brMatch) {
    const [, dia, mes, ano] = brMatch;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  return null;
}

/**
 * Espera colunas (nome flexível, sem exigir cabeçalho exato): data,
 * descrição/histórico e valor. Categoria é opcional — quando ausente, tenta
 * sugerir por palavra-chave; a linha sempre precisa de confirmação humana
 * antes de virar lançamento de verdade (ver ImportarCsvForm).
 */
export function parseCsvLancamentos(conteudo: string): LinhaImportada[] {
  const { data } = Papa.parse<Record<string, string>>(conteudo, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const colunaData = ["data", "date"];
  const colunaDescricao = ["descricao", "descrição", "histórico", "historico", "descrição/histórico"];
  const colunaValor = ["valor", "value", "amount"];
  const colunaCategoria = ["categoria", "category"];

  function acharCampo(linha: Record<string, string>, candidatos: string[]): string {
    for (const chave of Object.keys(linha)) {
      if (candidatos.includes(chave)) return linha[chave] ?? "";
    }
    return "";
  }

  return data.map((linha, indice) => {
    const dataBruta = acharCampo(linha, colunaData);
    const descricao = acharCampo(linha, colunaDescricao).trim();
    const valorBruto = acharCampo(linha, colunaValor);
    const categoriaBruta = acharCampo(linha, colunaCategoria).trim();

    const dataIso = parseData(dataBruta);
    const valor = parseValorMonetario(valorBruto);
    const categoria = (categoriaBruta as Categoria) || sugerirCategoria(descricao);

    return {
      chave: `linha-${indice}`,
      data: dataIso ?? "",
      descricao,
      categoria: categoria || null,
      valor: valor ?? 0,
      comErro: !dataIso || valor === null || !descricao,
    };
  });
}
