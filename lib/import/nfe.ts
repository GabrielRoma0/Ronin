import type { LinhaImportada } from "./csv";

export interface NotaFiscalExtraida {
  numero: string | null;
  dataEmissao: string | null; // ISO yyyy-mm-dd
  emitenteNome: string | null;
  emitenteCnpj: string | null;
  destinatarioCnpj: string | null;
  valorTotal: number | null;
  erro: string | null;
}

function nomeLocal(tag: string): string {
  return tag.includes(":") ? tag.split(":").pop()! : tag;
}

/** Busca em profundidade por nome de tag, ignorando namespace (a NF-e usa `xmlns` do portal fiscal). */
function buscarTag(raiz: Element | null, nome: string): Element | null {
  if (!raiz) return null;
  if (nomeLocal(raiz.tagName).toLowerCase() === nome.toLowerCase()) return raiz;
  const todos = raiz.getElementsByTagName("*");
  for (const el of Array.from(todos)) {
    if (nomeLocal(el.tagName).toLowerCase() === nome.toLowerCase()) return el;
  }
  return null;
}

function texto(el: Element | null): string | null {
  const valor = el?.textContent?.trim();
  return valor ? valor : null;
}

/**
 * Lê o XML oficial da NF-e (schema público da SEFAZ, modelo 55) — nada de
 * IA aqui, é extração estruturada e exata. Roda no navegador (DOMParser),
 * igual ao parser de CSV: o arquivo nunca sai do dispositivo antes da
 * conferência humana.
 */
export function parseNotaFiscalXml(xmlTexto: string): NotaFiscalExtraida {
  const vazio: NotaFiscalExtraida = {
    numero: null,
    dataEmissao: null,
    emitenteNome: null,
    emitenteCnpj: null,
    destinatarioCnpj: null,
    valorTotal: null,
    erro: null,
  };

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(xmlTexto, "application/xml");
  } catch {
    return { ...vazio, erro: "Não foi possível ler este arquivo como XML." };
  }

  if (doc.getElementsByTagName("parsererror").length > 0) {
    return { ...vazio, erro: "XML inválido ou corrompido." };
  }

  const infNFe = buscarTag(doc.documentElement, "infNFe");
  if (!infNFe) {
    return { ...vazio, erro: "Não encontrei a estrutura de NF-e (infNFe) neste arquivo." };
  }

  const ide = buscarTag(infNFe, "ide");
  const emit = buscarTag(infNFe, "emit");
  const dest = buscarTag(infNFe, "dest");
  const total = buscarTag(infNFe, "ICMSTot");

  const numero = texto(buscarTag(ide, "nNF"));
  const dhEmi = texto(buscarTag(ide, "dhEmi")) ?? texto(buscarTag(ide, "dEmi"));
  const dataEmissao = dhEmi ? dhEmi.slice(0, 10) : null;
  const emitenteNome = texto(buscarTag(emit, "xNome"));
  const emitenteCnpj = texto(buscarTag(emit, "CNPJ"));
  const destinatarioCnpj = texto(buscarTag(dest, "CNPJ"));
  const valorTotalTexto = texto(buscarTag(total, "vNF"));
  const valorTotal = valorTotalTexto ? Number(valorTotalTexto) : null;

  let erro: string | null = null;
  if (!valorTotal) erro = "Não encontrei o valor total (vNF) na nota.";
  else if (!dataEmissao) erro = "Não encontrei a data de emissão na nota.";

  return { numero, dataEmissao, emitenteNome, emitenteCnpj, destinatarioCnpj, valorTotal, erro };
}

/**
 * Converte a nota extraída numa linha da tela de conferência. Compara o
 * CNPJ emitente com o CNPJ da própria empresa: nota emitida por ela é
 * venda (entrada, receita); nota de terceiro é compra (saída, despesa).
 * A categoria sugerida é só um palpite — sempre editável na revisão.
 */
export function notaParaLinha(
  nota: NotaFiscalExtraida,
  chave: string,
  cnpjEmpresa: string,
): LinhaImportada {
  const cnpjSoDigitos = (c: string | null) => (c ?? "").replace(/\D/g, "");
  const ehVenda = cnpjSoDigitos(nota.emitenteCnpj) === cnpjSoDigitos(cnpjEmpresa);

  const valorAbsoluto = nota.valorTotal ?? 0;
  const valor = ehVenda ? valorAbsoluto : -valorAbsoluto;

  const descricao = nota.emitenteNome
    ? `NF-e nº ${nota.numero ?? "?"} - ${nota.emitenteNome}`
    : `NF-e nº ${nota.numero ?? "?"}`;

  return {
    chave,
    data: nota.dataEmissao ?? "",
    descricao,
    categoria: ehVenda ? "Vendas" : "Compras de Mercadorias",
    valor,
    comErro: Boolean(nota.erro) || !nota.dataEmissao || !nota.valorTotal,
  };
}
