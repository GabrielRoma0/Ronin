import Papa from "papaparse";

export interface ItemCardapioBasico {
  id: string;
  nome: string;
}

export interface LinhaVenda99 {
  /** Identificador só de UI, pra edição na tabela de conferência — não é o id do banco. */
  chave: string;
  itemNomeOriginal: string;
  /** null enquanto o dono não escolher a qual item do cardápio essa linha corresponde. */
  itemId: string | null;
  data: string; // ISO yyyy-mm-dd
  quantidade: number;
  valorTotal: number;
  comErro: boolean;
}

function normalizar(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function parseValorMonetario(bruto: string): number | null {
  const limpo = bruto.trim().replace(/[^\d,.-]/g, "");
  if (!limpo) return null;

  let normalizado = limpo;
  if (limpo.includes(",") && limpo.includes(".")) {
    normalizado = limpo.replace(/\./g, "").replace(",", ".");
  } else if (limpo.includes(",")) {
    normalizado = limpo.replace(",", ".");
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

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

const COLUNAS_ITEM = ["item", "produto", "nome do item", "prato", "descricao", "descrição", "name"];
const COLUNAS_QUANTIDADE = ["quantidade", "qtd", "qtde", "quantity", "qty"];
const COLUNAS_VALOR = ["valor total", "valor", "faturamento", "total", "amount", "value"];
const COLUNAS_DATA = ["data", "date", "dia"];

function acharCampo(linha: Record<string, string>, candidatos: string[]): string {
  for (const chave of Object.keys(linha)) {
    if (candidatos.includes(chave)) return linha[chave] ?? "";
  }
  return "";
}

/**
 * Formato de coluna não é garantido (cada exportação de plataforma de
 * delivery vem diferente) — por isso tenta reconhecer nomes de coluna
 * comuns em vez de exigir um layout fixo. `dataPadrao` cobre o caso comum
 * de o relatório não trazer coluna de data nenhuma (é um período só,
 * não por linha) — usa a data escolhida no formulário pra todas as linhas.
 */
export function parseCsvVendas99(
  conteudo: string,
  itensCardapio: ItemCardapioBasico[],
  dataPadrao: string,
): LinhaVenda99[] {
  const { data } = Papa.parse<Record<string, string>>(conteudo, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return data.map((linha, indice) => {
    const itemNomeOriginal = acharCampo(linha, COLUNAS_ITEM).trim();
    const quantidadeBruta = acharCampo(linha, COLUNAS_QUANTIDADE);
    const valorBruto = acharCampo(linha, COLUNAS_VALOR);
    const dataBruta = acharCampo(linha, COLUNAS_DATA);

    const quantidade = parseValorMonetario(quantidadeBruta) ?? 1;
    const valorTotal = parseValorMonetario(valorBruto);
    const dataIso = parseData(dataBruta) ?? dataPadrao;

    const nomeNormalizado = normalizar(itemNomeOriginal);
    const itemEncontrado = itensCardapio.find((i) => normalizar(i.nome) === nomeNormalizado);

    return {
      chave: `linha-${indice}`,
      itemNomeOriginal,
      itemId: itemEncontrado?.id ?? null,
      data: dataIso,
      quantidade,
      valorTotal: valorTotal ?? 0,
      comErro: !itemNomeOriginal || valorTotal === null || !dataIso,
    };
  });
}
