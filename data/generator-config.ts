import type { Banco, Categoria } from "./categorias";

/**
 * Alocação por conta de cada categoria do fechamento de demonstração.
 *
 * Todos os valores e nomes aqui são fictícios/genéricos — nenhum número,
 * banco ou nome de cliente real. `totalCents` já vem com o sinal correto
 * (negativo para despesas e saídas em "Outros Movimentos"). Os dois
 * `totalCents` de uma categoria somam exatamente o valor consolidado —
 * a distribuição entre Banco A e Banco B é só uma alocação plausível para
 * ilustrar o produto (duas contas bancárias de uma mesma empresa).
 *
 * `count` é quantos lançamentos individuais essa fatia vira na aba de
 * Lançamentos daquela conta.
 */
export interface AlocacaoConta {
  conta: Banco;
  totalCents: number;
  count: number;
  descricoes: string[];
}

export interface AlocacaoCategoria {
  categoria: Categoria;
  contas: AlocacaoConta[];
}

export const ALOCACOES: AlocacaoCategoria[] = [
  // ---- Receitas ----
  {
    categoria: "Vendas",
    contas: [
      {
        conta: "Banco A",
        totalCents: 4_200_000,
        count: 4,
        descricoes: [
          "Venda balcão - Pix",
          "Venda direta - Pix cliente recorrente",
          "Venda avulsa - cartão de débito",
          "Venda por encomenda - Pix",
        ],
      },
      {
        conta: "Banco B",
        totalCents: 7_800_000,
        count: 4,
        descricoes: [
          "Recebimento de vendas - cartão",
          "Venda corporativa - boleto",
          "Repasse de plataforma de vendas",
          "Venda em evento - transferência",
        ],
      },
    ],
  },
  {
    categoria: "Receitas Financeiras",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: 5_000,
        count: 1,
        descricoes: ["Rendimento conta corrente"],
      },
    ],
  },
  {
    categoria: "Outras Receitas",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },

  // ---- Despesas ----
  {
    categoria: "Compras de Mercadorias",
    contas: [
      {
        conta: "Banco A",
        totalCents: -960_000,
        count: 3,
        descricoes: [
          "Compra de insumos - fornecedor local",
          "Compra de materiais para revenda",
          "Compra de produtos - fornecedor avulso",
        ],
      },
      {
        conta: "Banco B",
        totalCents: -3_840_000,
        count: 3,
        descricoes: [
          "Compra de mercadorias - fornecedor principal",
          "Compra de estoque - distribuidora",
          "Compra de embalagens - fornecedor",
        ],
      },
    ],
  },
  {
    categoria: "Pessoal",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -2_700_000,
        count: 2,
        descricoes: ["Pagamento de salário - funcionário 1", "Pagamento de salário - funcionário 2"],
      },
    ],
  },
  {
    categoria: "Impostos e Taxas",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -750_000,
        count: 2,
        descricoes: ["Guia de imposto - Simples Nacional", "Guia de contribuição - INSS"],
      },
    ],
  },
  {
    categoria: "Despesas Financeiras e Bancárias",
    contas: [
      {
        conta: "Banco A",
        totalCents: -54_000,
        count: 1,
        descricoes: ["Tarifa de manutenção de conta"],
      },
      {
        conta: "Banco B",
        totalCents: -126_000,
        count: 1,
        descricoes: ["Tarifa da maquininha de cartão"],
      },
    ],
  },
  {
    categoria: "Materiais e Suprimentos",
    contas: [
      {
        conta: "Banco A",
        totalCents: -360_000,
        count: 2,
        descricoes: ["Compra de material de escritório", "Compra de material de limpeza"],
      },
      {
        conta: "Banco B",
        totalCents: -540_000,
        count: 2,
        descricoes: ["Compra de embalagens para entrega", "Compra de suprimentos em atacado"],
      },
    ],
  },
  {
    categoria: "Serviços Profissionais e Assinaturas",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -120_000,
        count: 1,
        descricoes: ["Mensalidade de serviço de contabilidade"],
      },
    ],
  },
  {
    categoria: "Manutenção e Reparos",
    contas: [
      {
        conta: "Banco A",
        totalCents: -90_000,
        count: 1,
        descricoes: ["Manutenção de equipamento"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Combustível e Transporte",
    contas: [
      {
        conta: "Banco A",
        totalCents: -110_000,
        count: 2,
        descricoes: ["Combustível - veículo de entrega", "Aplicativo de transporte - deslocamento"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Seguros",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -85_000,
        count: 1,
        descricoes: ["Seguro empresarial mensal"],
      },
    ],
  },
  {
    categoria: "Telefonia e Internet",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -45_000,
        count: 1,
        descricoes: ["Conta de internet e telefone"],
      },
    ],
  },
  {
    categoria: "Aluguel",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -420_000,
        count: 1,
        descricoes: ["Aluguel do espaço comercial"],
      },
    ],
  },
  {
    categoria: "Alimentação",
    contas: [
      {
        conta: "Banco A",
        totalCents: -50_000,
        count: 2,
        descricoes: ["Refeição da equipe", "Lanche - reunião com fornecedor"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Marketing",
    contas: [
      {
        conta: "Banco A",
        totalCents: -95_000,
        count: 1,
        descricoes: ["Divulgação em redes sociais"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Frete",
    contas: [
      {
        conta: "Banco A",
        totalCents: -40_000,
        count: 1,
        descricoes: ["Frete de fornecedor"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Outras Despesas",
    contas: [
      {
        conta: "Banco A",
        totalCents: -35_000,
        count: 1,
        descricoes: ["Despesa diversa - itens variados"],
      },
      {
        conta: "Banco B",
        totalCents: -35_000,
        count: 1,
        descricoes: ["Despesa diversa - materiais de escritório"],
      },
    ],
  },

  // ---- Outros Movimentos (não entram no cálculo de receita/despesa) ----
  {
    categoria: "Distribuição de Lucros",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -1_800_000,
        count: 1,
        descricoes: ["Distribuição de lucros aos sócios"],
      },
    ],
  },
  {
    categoria: "Despesas do Sócio",
    contas: [
      {
        conta: "Banco A",
        totalCents: -30_000,
        count: 1,
        descricoes: ["Retirada pessoal do sócio"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Empréstimos Concedidos",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: -1_000_000,
        count: 1,
        descricoes: ["Empréstimo concedido a terceiro"],
      },
    ],
  },
  {
    categoria: "Empréstimos Recebidos",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: 800_000,
        count: 1,
        descricoes: ["Empréstimo recebido - capital de giro"],
      },
    ],
  },
  {
    categoria: "Aquisição de Equipamentos",
    contas: [
      {
        conta: "Banco A",
        totalCents: -120_000,
        count: 1,
        descricoes: ["Compra de equipamento"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Transferência entre Contas",
    contas: [
      {
        conta: "Banco A",
        totalCents: -90_000,
        count: 1,
        descricoes: ["Transferência para outra conta da empresa"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
  {
    categoria: "Estorno de Valores",
    contas: [
      { conta: "Banco A", totalCents: 0, count: 0, descricoes: [] },
      {
        conta: "Banco B",
        totalCents: 100_000,
        count: 1,
        descricoes: ["Estorno de cobrança indevida"],
      },
    ],
  },
  {
    categoria: "Estorno de Vendas",
    contas: [
      {
        conta: "Banco A",
        totalCents: -25_000,
        count: 1,
        descricoes: ["Estorno de venda - cliente"],
      },
      { conta: "Banco B", totalCents: 0, count: 0, descricoes: [] },
    ],
  },
];

/** Saldo em conta ao final do período de demonstração, em centavos. */
export const SALDO_FINAL_CENTS: Record<Banco, number> = {
  "Banco A": 220_000,
  "Banco B": 400_000,
};

export const SALDO_FINAL_CONSOLIDADO_CENTS = 620_000;

export const SEED_RNG = 20260801;
export const ANO_REFERENCIA = 2026;
export const MES_REFERENCIA = 8; // Agosto
export const DIAS_NO_MES_REFERENCIA = 31;
