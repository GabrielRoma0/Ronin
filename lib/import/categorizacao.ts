import { CATEGORIAS_DESPESA, CATEGORIAS_OUTRO, CATEGORIAS_RECEITA, type Categoria } from "@/data/categorias";

/**
 * Categorização automática por palavra-chave na descrição — só um primeiro
 * palpite. O usuário sempre confere e pode trocar antes de importar (ver
 * ImportarCsvForm), então uma regra imprecisa aqui nunca vira erro contábil
 * silencioso.
 */
const REGRAS: [Categoria, string[]][] = [
  ["Vendas", ["venda", "recebimento venda", "pix cliente", "maquininha", "cartao de credito", "cartao de debito"]],
  ["Receitas Financeiras", ["rendimento", "juros recebido"]],
  ["Compras de Mercadorias", ["fornecedor", "mercadoria", "distribuidora", "insumo", "ceasa"]],
  ["Pessoal", ["salario", "folha de pagamento", "funcionario", "pro-labore", "prolabore"]],
  ["Impostos e Taxas", ["imposto", "das ", "simples nacional", "inss", " gps ", "fgts"]],
  ["Despesas Financeiras e Bancárias", ["tarifa", "iof", "anuidade", "juros banco", "manutencao de conta"]],
  ["Materiais e Suprimentos", ["material de escritorio", "material de limpeza", "embalagem", "suprimento"]],
  ["Serviços Profissionais e Assinaturas", ["contabilidade", "assinatura", "mensalidade", "consultoria"]],
  ["Manutenção e Reparos", ["manutencao de equipamento", "conserto", "reparo"]],
  ["Combustível e Transporte", ["combustivel", "gasolina", "uber", "posto de gasolina"]],
  ["Seguros", ["seguro"]],
  ["Telefonia e Internet", ["telefone", "internet", "celular"]],
  ["Aluguel", ["aluguel", "locacao do espaco", "locacao comercial"]],
  ["Alimentação", ["restaurante", "lanche", "refeicao"]],
  ["Marketing", ["marketing", "anuncio", "propaganda", "publicidade", "impulsionamento"]],
  ["Frete", ["frete", "transportadora"]],
  ["Distribuição de Lucros", ["distribuicao de lucro"]],
  ["Despesas do Sócio", ["retirada socio", "retirada pessoal"]],
  ["Empréstimos Concedidos", ["emprestimo concedido"]],
  ["Empréstimos Recebidos", ["emprestimo recebido", "capital de giro"]],
  ["Aquisição de Equipamentos", ["compra de equipamento", "maquina industrial"]],
  ["Transferência entre Contas", ["transferencia entre conta", "ted mesma titularidade"]],
  ["Estorno de Valores", ["estorno de cobranca"]],
  ["Estorno de Vendas", ["estorno de venda"]],
];

function normaliza(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

/** Primeiro palpite de categoria a partir da descrição — ou null se nenhuma regra bateu. */
export function sugerirCategoria(descricao: string): Categoria | null {
  const texto = normaliza(descricao);
  for (const [categoria, palavras] of REGRAS) {
    if (palavras.some((palavra) => texto.includes(normaliza(palavra)))) return categoria;
  }
  return null;
}

export const TODAS_CATEGORIAS: Categoria[] = [
  ...CATEGORIAS_RECEITA,
  ...CATEGORIAS_DESPESA,
  ...CATEGORIAS_OUTRO,
];
